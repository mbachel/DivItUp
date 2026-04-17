"use client";

import ReceiptUploader from "../../components/expenses/ReceiptUploader";
import ManualEntryForm from "../../components/expenses/ManualEntryForm";
import ExpenseTable from "../../components/expenses/ExpenseTable";
import type { BackendExpense } from "../../components/expenses/ExpenseTable";
import { useState, useEffect, useCallback } from "react";
import * as api from "../../lib/apiClient";
import type { ScannedReceipt } from "../../components/expenses/ReceiptUploader";
import { resolveActiveMembership } from "@/lib/activeMembership";

const BACKEND_CATEGORIES = new Set([
  "rent",
  "groceries",
  "utilities",
  "subscription",
  "other",
]);

interface SplitInput {
  userId: number;
  amountOwed: number;
}

function toCents(amount: number): number {
  return Math.round(amount * 100);
}

function toDollars(cents: number): number {
  return Number((cents / 100).toFixed(2));
}

function splitCentsEvenly(totalAmount: number, userIds: number[]): SplitInput[] {
  if (userIds.length === 0) {
    return [];
  }

  const totalCents = toCents(totalAmount);
  const base = Math.floor(totalCents / userIds.length);
  let remainder = totalCents % userIds.length;

  return userIds.map((userId) => {
    const cents = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) {
      remainder -= 1;
    }
    return { userId, amountOwed: toDollars(cents) };
  });
}

function normalizeExpenseCategory(input?: string | null): string {
  if (!input) {
    return "other";
  }

  const normalized = input.trim().toLowerCase();

  if (normalized === "grocery") {
    return "groceries";
  }

  if (BACKEND_CATEGORIES.has(normalized)) {
    return normalized;
  }

  return "other";
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<BackendExpense[]>([]);
  const [currentGroupId, setCurrentGroupId] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [groupMemberUserIds, setGroupMemberUserIds] = useState<number[]>([]);
  const [splitMembersByExpense, setSplitMembersByExpense] = useState<Record<number, string[]>>({});
  const [splitRowsByExpense, setSplitRowsByExpense] = useState<
    Record<number, api.ExpenseSplitBackend[]>
  >({});
  const [groupMemberOptions, setGroupMemberOptions] = useState<
    { userId: number; label: string }[]
  >([]);
  const [manualSplitMembers, setManualSplitMembers] = useState<
    { userId: number; label: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const createExpenseWithSplits = useCallback(
    async (payload: api.ExpenseCreatePayload, splits: SplitInput[]) => {
      if (splits.length === 0) {
        throw new Error("No split members available for this expense.");
      }

      const createdExpense = await api.createExpense(payload);
      if (!createdExpense) {
        throw new Error("Failed to create expense.");
      }

      try {
        const createdSplits = await Promise.all(
          splits.map((split) =>
            api.createExpenseSplit({
              expense_id: createdExpense.id,
              user_id: split.userId,
              amount_owed: split.amountOwed,
              is_settled: false,
            })
          )
        );

        if (createdSplits.some((split) => split === null)) {
          throw new Error("Failed to create expense split entries.");
        }

        return createdExpense;
      } catch (splitError) {
        await api.deleteExpense(createdExpense.id);
        throw splitError;
      }
    },
    []
  );

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const context = await resolveActiveMembership();
      const group = context.activeGroup;
      const allMembersInGroup = context.membersInActiveGroup;

      setCurrentGroupId(group.id);
      setCurrentUserId(context.currentUser.id);

      const [data, allUsers, allExpenseSplits] = await Promise.all([
        api.fetchExpenses(group.id),
        api.fetchUsers(),
        api.fetchExpenseSplits(),
      ]);

      const membersInGroup = allMembersInGroup.filter(
        (member) => member.user_id !== context.currentUser.id
      );
      const userById = new Map(allUsers.map((user) => [user.id, user]));
      const expenseIdSet = new Set(data.map((expense) => expense.id));
      const splitMap: Record<number, string[]> = {};
      const splitRowsMap: Record<number, api.ExpenseSplitBackend[]> = {};

      for (const split of allExpenseSplits) {
        if (!expenseIdSet.has(split.expense_id)) {
          continue;
        }

        if (!splitRowsMap[split.expense_id]) {
          splitRowsMap[split.expense_id] = [];
        }
        splitRowsMap[split.expense_id].push(split);

        if (!splitMap[split.expense_id]) {
          splitMap[split.expense_id] = [];
        }

        const label = userById.get(split.user_id)?.full_name ?? `User #${split.user_id}`;
        splitMap[split.expense_id].push(label);
      }

      for (const expenseId of Object.keys(splitMap)) {
        splitMap[Number(expenseId)] = [...new Set(splitMap[Number(expenseId)])].sort((a, b) =>
          a.localeCompare(b)
        );
      }

      setGroupMemberUserIds(membersInGroup.map((member) => member.user_id));
      setGroupMemberOptions(
        allMembersInGroup.map((member) => ({
          userId: member.user_id,
          label: userById.get(member.user_id)?.full_name ?? `User #${member.user_id}`,
        }))
      );
      setManualSplitMembers(
        membersInGroup.map((member) => ({
          userId: member.user_id,
          label: userById.get(member.user_id)?.full_name ?? `User #${member.user_id}`,
        }))
      );
      setSplitMembersByExpense(splitMap);
      setSplitRowsByExpense(splitRowsMap);
      setExpenses(data);
    } catch (err) {
      setError("Failed to load expenses. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const handleManualAdd = async (expense: {
    name: string;
    amount: number;
    category: string;
    splitType: "equal" | "custom";
    splits: SplitInput[];
  }) => {
    if (!currentGroupId || !currentUserId) {
      setError("Your account context is not loaded yet.");
      return;
    }

    try {
      const payload: api.ExpenseCreatePayload = {
        group_id: currentGroupId,
        paid_by: currentUserId,
        title: expense.name,
        total_amount: expense.amount,
        split_type: expense.splitType,
        receipt_id: null,
        category: expense.category,
      };

      const created = await createExpenseWithSplits(payload, expense.splits);

      if (created) {
        await loadExpenses();
        setError("");
      } else {
        setError("Failed to create expense. Please try again.");
      }
    } catch (err) {
      setError("Error creating expense");
      console.error(err);
    }
  };

  const handleScan = useCallback(async (receipt: ScannedReceipt, receiptId: number) => {
    if (!currentGroupId || !currentUserId) {
      setError("Your account context is not loaded yet.");
      return;
    }

    try {
      const payload: api.ExpenseCreatePayload = {
        group_id: currentGroupId,
        paid_by: currentUserId,
        title: receipt.storeName || "Scanned Receipt",
        total_amount: receipt.totalAmount,
        split_type: "equal",
        receipt_id: receiptId,
        category: normalizeExpenseCategory(receipt.category),
      };

      const splits = splitCentsEvenly(receipt.totalAmount, groupMemberUserIds);

      const created = await createExpenseWithSplits(payload, splits);

      if (created) {
        await loadExpenses();
        setError("");
      } else {
        setError("Failed to create expense from receipt. Please try again.");
      }
    } catch (err) {
      setError("Error creating expense from receipt");
      console.error(err);
    }
  }, [createExpenseWithSplits, currentGroupId, currentUserId, groupMemberUserIds]);

  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-on-surface font-headline tracking-tight mb-2">
            Receipt Intelligence
          </h1>
          <p className="text-outline font-medium max-w-lg">
            Upload a receipt and let our vision engine categorize and split
                the bill for your household automatically.
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            <ReceiptUploader
              onScan={handleScan}
              groupId={currentGroupId ?? 0}
              userId={currentUserId ?? 0}
            />
            <ManualEntryForm onAdd={handleManualAdd} members={manualSplitMembers} />
          </div>

          {loading ? (
            <div className="text-center py-12 text-outline">Loading expenses...</div>
          ) : (
            <ExpenseTable
              expenses={expenses}
              splitMembersByExpense={splitMembersByExpense}
              splitRowsByExpense={splitRowsByExpense}
              groupMemberOptions={groupMemberOptions}
              onRefresh={loadExpenses}
            />
          )}
    </>
  );
}