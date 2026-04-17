"use client";

import { useEffect, useState } from "react";
import * as api from "../../lib/apiClient";

export interface BackendExpense {
  id: number;
  group_id: number;
  paid_by: number;
  receipt_id: number | null;
  title: string;
  total_amount: number;
  split_type: string;
  category: string | null;
}

interface ExpenseSplitRow {
  id: number;
  expense_id: number;
  user_id: number;
  amount_owed: number;
  is_settled: boolean;
}

interface GroupMemberOption {
  userId: number;
  label: string;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  grocery:       { bg: "bg-amber-100",  text: "text-amber-800",  icon: "shopping_basket" },
  groceries:     { bg: "bg-amber-100",  text: "text-amber-800",  icon: "shopping_basket" },
  internet:      { bg: "bg-purple-100", text: "text-purple-800", icon: "wifi" },
  utilities:     { bg: "bg-teal-100",   text: "text-teal-800",   icon: "bolt" },
  household:     { bg: "bg-teal-100",   text: "text-teal-800",   icon: "home" },
  subscription:  { bg: "bg-blue-100",   text: "text-blue-800",   icon: "play_circle" },
  rent:          { bg: "bg-red-100",    text: "text-red-800",    icon: "key" },
  other:         { bg: "bg-gray-100",   text: "text-gray-700",   icon: "receipt" },
};

const SPLIT_DISPLAY: Record<string, { bg: string; text: string; label: string }> = {
  equal:  { bg: "bg-teal-50",   text: "text-teal-700",   label: "Evenly Split" },
  custom: { bg: "bg-purple-50", text: "text-purple-700", label: "Custom Split" },
};

const PAYMENT_STATUS_DISPLAY = {
  unpaid: {
    badgeBg: "bg-slate-100",
    badgeText: "text-slate-700",
    label: "Unpaid",
  },
  partial: {
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-800",
    label: "Partially Paid",
  },
  paid: {
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-800",
    label: "Paid",
  },
} as const;

const TABLE_GRID_COLUMNS = "grid-cols-[minmax(260px,2.5fr)_minmax(140px,1.2fr)_minmax(120px,1fr)_minmax(240px,1.8fr)_80px_56px]";

const FILTERS = ["All Items", "Recent", "By Split Type", "Category"];

function inferCategoryType(title: string): keyof typeof CATEGORY_STYLES {
  const lower = title.toLowerCase();
  if (lower.includes("grocery") || lower.includes("whole foods") || lower.includes("trader")) return "grocery";
  if (lower.includes("internet") || lower.includes("comcast")) return "internet";
  if (lower.includes("netflix") || lower.includes("subscription")) return "subscription";
  if (lower.includes("gas") || lower.includes("electric") || lower.includes("utilities")) return "household";
  if (lower.includes("rent")) return "rent";
  return "other";
}

interface ExpenseTableProps {
  expenses: BackendExpense[];
  splitMembersByExpense?: Record<number, string[]>;
  splitRowsByExpense?: Record<number, ExpenseSplitRow[]>;
  groupMemberOptions?: GroupMemberOption[];
  onRefresh?: () => void;
}

function toCents(amount: number): number {
  return Math.round(amount * 100);
}

function toDollars(cents: number): number {
  return Number((cents / 100).toFixed(2));
}

function buildEqualSplits(totalAmount: number, userIds: number[]): Record<number, number> {
  const totalCents = toCents(totalAmount);
  const base = Math.floor(totalCents / userIds.length);
  let remainder = totalCents % userIds.length;
  const amountsByUserId: Record<number, number> = {};

  for (const userId of userIds) {
    const cents = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) {
      remainder -= 1;
    }
    amountsByUserId[userId] = toDollars(cents);
  }

  return amountsByUserId;
}

function getPaymentStatus(splitRows: ExpenseSplitRow[]): {
  state: "unpaid" | "partial" | "paid";
  settledCount: number;
  totalCount: number;
} {
  if (splitRows.length === 0) {
    return { state: "unpaid", settledCount: 0, totalCount: 0 };
  }

  const settledCount = splitRows.filter((row) => row.is_settled).length;

  if (settledCount === 0) {
    return { state: "unpaid", settledCount, totalCount: splitRows.length };
  }

  if (settledCount === splitRows.length) {
    return { state: "paid", settledCount, totalCount: splitRows.length };
  }

  return { state: "partial", settledCount, totalCount: splitRows.length };
}

export default function ExpenseTable({
  expenses = [],
  splitMembersByExpense = {},
  splitRowsByExpense = {},
  groupMemberOptions = [],
  onRefresh,
}: ExpenseTableProps) {
  const [activeFilter, setActiveFilter] = useState("All Items");
  const [editingExpense, setEditingExpense] = useState<BackendExpense | null>(null);
  const [hiddenExpenseIds, setHiddenExpenseIds] = useState<number[]>([]);
  const [editingSplitUserIds, setEditingSplitUserIds] = useState<number[]>([]);
  const [settledByUserId, setSettledByUserId] = useState<Record<number, boolean>>({});
  const [customSplitAmounts, setCustomSplitAmounts] = useState<Record<number, string>>({});
  const [editError, setEditError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setHiddenExpenseIds((prev) => prev.filter((id) => expenses.some((expense) => expense.id === id)));
  }, [expenses]);

  const allExpenses = expenses.filter((expense) => !hiddenExpenseIds.includes(expense.id));

  const filtered =
  activeFilter === "All Items"
    ? allExpenses
    : activeFilter === "Recent"
      ? [...allExpenses].sort((a, b) => b.id - a.id)
      : activeFilter === "By Split Type"
        ? [...allExpenses].sort((a, b) => a.split_type.localeCompare(b.split_type))
        : activeFilter === "Category"
          ? [...allExpenses].sort((a, b) =>
              (a.category || "zzzz").localeCompare(b.category || "zzzz")
            )
          : allExpenses;

  const startEditing = (expense: BackendExpense) => {
    const rows = splitRowsByExpense[expense.id] || [];
    const selectedIds = rows.map((row) => row.user_id);
    const customAmounts: Record<number, string> = {};
    const settledMap: Record<number, boolean> = {};

    for (const row of rows) {
      customAmounts[row.user_id] = Number(row.amount_owed).toFixed(2);
      settledMap[row.user_id] = row.is_settled;
    }

    setEditingExpense({ ...expense });
    setEditingSplitUserIds(selectedIds);
    setSettledByUserId(settledMap);
    setCustomSplitAmounts(customAmounts);
    setEditError("");
    setShowDeleteConfirm(false);
  };

  const toggleSplitUser = (userId: number) => {
    setEditingSplitUserIds((prev) => {
      const exists = prev.includes(userId);

      if (exists) {
        return prev.filter((id) => id !== userId);
      }

      setSettledByUserId((current) => ({
        ...current,
        [userId]: current[userId] ?? false,
      }));

      return [...prev, userId];
    });
  };

  const handleSave = async (updated: BackendExpense) => {
    setEditError("");

    const selectedUserIds = [...editingSplitUserIds].sort((a, b) => a - b);
    if (selectedUserIds.length === 0) {
      setEditError("Select at least one member to split this expense with.");
      return;
    }

    let amountsByUserId: Record<number, number> = {};

    if (updated.split_type === "equal") {
      amountsByUserId = buildEqualSplits(Number(updated.total_amount), selectedUserIds);
    } else {
      const parsedCents = selectedUserIds.map((userId) => {
        const value = Number(customSplitAmounts[userId] ?? "");
        return { userId, value, cents: toCents(value) };
      });

      if (parsedCents.some((entry) => Number.isNaN(entry.value) || entry.value < 0)) {
        setEditError("Custom split amounts must be valid non-negative values.");
        return;
      }

      const totalCents = toCents(Number(updated.total_amount));
      const customTotal = parsedCents.reduce((sum, entry) => sum + entry.cents, 0);

      if (customTotal !== totalCents) {
        setEditError("Custom split amounts must add up to the total expense amount.");
        return;
      }

      amountsByUserId = parsedCents.reduce<Record<number, number>>((acc, entry) => {
        acc[entry.userId] = toDollars(entry.cents);
        return acc;
      }, {});
    }

    const existingRows = splitRowsByExpense[updated.id] || [];

    const updatedExpense = await api.updateExpense(updated.id, {
      title: updated.title,
      total_amount: Number(updated.total_amount),
      split_type: updated.split_type,
    });

    if (!updatedExpense) {
      setEditError("Failed to update expense details.");
      return;
    }

    const existingByUserId = new Map(existingRows.map((row) => [row.user_id, row]));

    const upserted = await Promise.all(
      selectedUserIds.map(async (userId) => {
        const existing = existingByUserId.get(userId);
        const targetAmount = amountsByUserId[userId];

        if (existing) {
          const currentAmount = toDollars(toCents(Number(existing.amount_owed)));
          const updatePayload: Partial<{
            amount_owed: number;
            is_settled: boolean;
          }> = {
            amount_owed: targetAmount,
            is_settled: settledByUserId[userId] ?? false,
          };

          if (currentAmount !== targetAmount && updatePayload.is_settled === undefined) {
            updatePayload.is_settled = false;
          }

          return await api.updateExpenseSplit(existing.id, updatePayload);
        }

        return await api.createExpenseSplit({
          expense_id: updated.id,
          user_id: userId,
          amount_owed: targetAmount,
          is_settled: settledByUserId[userId] ?? false,
        });
      })
    );

    if (upserted.some((row) => row === null)) {
      setEditError("Failed to save updated split recipients. Please try again.");
      return;
    }

    const selectedSet = new Set(selectedUserIds);
    const removedRows = existingRows.filter((row) => !selectedSet.has(row.user_id));
    const removed = await Promise.all(
      removedRows.map((row) => api.deleteExpenseSplit(row.id))
    );

    if (removed.some((ok) => !ok)) {
      setEditError("Failed to remove one or more previous split recipients.");
      return;
    }

    setEditingExpense(null);
    setShowDeleteConfirm(false);
    onRefresh?.();
  };

  const handleDelete = async (expense: BackendExpense) => {
    setEditError("");
    setIsDeleting(true);

    try {
      const splitRows = splitRowsByExpense[expense.id] || [];
      const deletedSplits = await Promise.all(
        splitRows.map((row) => api.deleteExpenseSplit(row.id))
      );

      if (deletedSplits.some((ok) => !ok)) {
        setEditError(
          "Unable to delete one or more split records. This expense may have linked payments."
        );
        return;
      }

      const deletedExpense = await api.deleteExpense(expense.id);
      if (!deletedExpense) {
        setEditError("Failed to delete expense. Please try again.");
        return;
      }

      setHiddenExpenseIds((prev) => [...prev, expense.id]);
      setEditingExpense(null);
      setShowDeleteConfirm(false);
      onRefresh?.();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* top row with section title and quick filter chips */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-on-surface font-headline">Expenses</h2>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeFilter === f
                  ? "bg-on-surface text-surface"
                  : "bg-surface-container text-outline hover:bg-surface-container-high"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* main expense list with category, amount, and split details */}
      <div className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden">
        <div className={`grid ${TABLE_GRID_COLUMNS} px-6 py-3 border-b border-outline-variant/30 items-center`}>
          {["Description", "Category", "Amount", "Split Type", "ID", "Action"].map((h, index) => (
            <span
              key={h}
              className={`text-[10px] font-bold uppercase tracking-widest text-outline whitespace-nowrap ${
                index === 5 ? "text-center" : ""
              }`}
            >
              {h}
            </span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-outline text-sm">No expenses yet</div>
        ) : (
          filtered.map((expense, i) => {
            const categoryType = ((expense.category || "other").toLowerCase() as keyof typeof CATEGORY_STYLES);
            const style = CATEGORY_STYLES[categoryType] ?? CATEGORY_STYLES.other;
            const splitStyle = SPLIT_DISPLAY[expense.split_type] ?? SPLIT_DISPLAY.equal;
            const paymentStatus = getPaymentStatus(splitRowsByExpense[expense.id] || []);
            const paymentStyle = PAYMENT_STATUS_DISPLAY[paymentStatus.state];
            const amount = Number(expense.total_amount || 0);
            return (
              <div
                key={expense.id}
                className={`grid ${TABLE_GRID_COLUMNS} px-6 py-4 items-center transition-colors ${
                  paymentStatus.state === "paid"
                    ? "bg-slate-50/80"
                    : "hover:bg-surface-container-low"
                } ${
                  i !== filtered.length - 1 ? "border-b border-outline-variant/20" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full ${style.bg} flex items-center justify-center flex-shrink-0`}>
                    <span className={`material-symbols-outlined text-lg ${style.text}`}>
                      {style.icon}
                    </span>
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${paymentStatus.state === "paid" ? "text-slate-500 line-through" : "text-on-surface"}`}>
                      {expense.title}
                    </p>
                    <p className={`text-[10px] ${paymentStatus.state === "paid" ? "text-slate-400" : "text-outline"}`}>
                      Paid by user #{expense.paid_by}
                      {expense.receipt_id ? ` · receipt #${expense.receipt_id}` : ""}
                    </p>
                  </div>
                </div>

                <span className={`inline-flex text-xs font-bold px-3 py-1.5 rounded-full w-fit ${style.bg} ${style.text}`}>
                  {expense.category || "Uncategorized"}
                </span>

                <span className={`text-base font-extrabold ${paymentStatus.state === "paid" ? "text-slate-500 line-through" : "text-on-surface"}`}>
                  ${amount.toFixed(2)}
                </span>

                <div>
                  <span className={`inline-flex text-xs font-bold px-3 py-1.5 rounded-full w-fit ${splitStyle.bg} ${splitStyle.text}`}>
                    {splitStyle.label}
                  </span>
                  <span className={`inline-flex text-[10px] font-bold px-2.5 py-1 rounded-full w-fit mt-1.5 ${paymentStyle.badgeBg} ${paymentStyle.badgeText}`}>
                    {paymentStyle.label}
                    {paymentStatus.state !== "unpaid" && paymentStatus.totalCount > 0
                      ? ` (${paymentStatus.settledCount}/${paymentStatus.totalCount})`
                      : ""}
                  </span>
                  <p
                    className={`mt-1 text-[10px] truncate ${paymentStatus.state === "paid" ? "text-slate-400" : "text-outline"}`}
                    title={(splitMembersByExpense[expense.id] || []).join(", ")}
                  >
                    Split between: {(splitMembersByExpense[expense.id] || []).length > 0
                      ? (splitMembersByExpense[expense.id] || []).join(", ")
                      : "-"}
                  </p>
                </div>

                <span className="text-xs text-outline">#{expense.id}</span>

                <div className="flex justify-center">
                  <button
                    onClick={() => startEditing(expense)}
                    className="p-2 hover:bg-surface-container rounded-full transition-colors"
                  >
                    <span className="material-symbols-outlined text-outline text-base">edit</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* inline modal for updating or removing a selected expense */}
      {editingExpense && (
        <div className="fixed inset-0 bg-black/40 z-50 overflow-y-auto">
          <div className="min-h-full flex items-start sm:items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold font-headline">Edit Expense</h3>
              <button
                onClick={() => {
                  setEditingExpense(null);
                  setShowDeleteConfirm(false);
                }}
                className="p-2 hover:bg-surface-container rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-outline">close</span>
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-outline block mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={editingExpense.title}
                  onChange={(e) => setEditingExpense({ ...editingExpense, title: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-outline block mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  value={Number(editingExpense.total_amount)}
                  onChange={(e) => setEditingExpense({ ...editingExpense, total_amount: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-outline block mb-2">
                  Split Type
                </label>
                <select
                  value={editingExpense.split_type}
                  onChange={(e) => setEditingExpense({ ...editingExpense, split_type: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                >
                  <option value="equal">Equal Split</option>
                  <option value="custom">Custom Split</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-outline block mb-2">
                  Split Between
                </label>
                <div className="flex flex-wrap gap-2">
                  {groupMemberOptions
                    .filter((member) => member.userId !== editingExpense.paid_by)
                    .map((member) => {
                      const selected = editingSplitUserIds.includes(member.userId);
                      return (
                        <button
                          key={member.userId}
                          type="button"
                          onClick={() => toggleSplitUser(member.userId)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                            selected
                              ? "bg-primary text-white border-primary"
                              : "bg-surface-container-low text-outline border-outline-variant hover:bg-surface-container-high"
                          }`}
                        >
                          {member.label}
                        </button>
                      );
                    })}
                </div>
              </div>

              {editingExpense.split_type === "custom" && editingSplitUserIds.length > 0 && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-outline block mb-2">
                    Custom Amounts
                  </label>
                  <div className="space-y-2">
                    {editingSplitUserIds
                      .slice()
                      .sort((a, b) => a - b)
                      .map((userId) => {
                        const label =
                          groupMemberOptions.find((option) => option.userId === userId)?.label ||
                          `User #${userId}`;
                        return (
                          <div key={userId} className="grid grid-cols-[1fr_120px] items-center gap-3">
                            <span className="text-sm text-on-surface">{label}</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={customSplitAmounts[userId] ?? ""}
                              onChange={(e) =>
                                setCustomSplitAmounts((prev) => ({
                                  ...prev,
                                  [userId]: e.target.value,
                                }))
                              }
                              className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                              placeholder="0.00"
                            />
                          </div>
                        );
                      })}
                  </div>
                  <p className="mt-1 text-[11px] text-outline">Custom amounts must add up to total.</p>
                </div>
              )}

              {editingSplitUserIds.length > 0 && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-outline block mb-2">
                    Payment Status
                  </label>
                  <div className="space-y-2">
                    {editingSplitUserIds
                      .slice()
                      .sort((a, b) => a - b)
                      .map((userId) => {
                        const label =
                          groupMemberOptions.find((option) => option.userId === userId)?.label ||
                          `User #${userId}`;
                        const isSettled = settledByUserId[userId] ?? false;

                        return (
                          <div key={userId} className="grid grid-cols-[1fr_auto] items-center gap-3">
                            <span className="text-sm text-on-surface">{label}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setSettledByUserId((prev) => ({
                                  ...prev,
                                  [userId]: !isSettled,
                                }))
                              }
                              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                isSettled
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                  : "bg-slate-100 text-slate-700 border-slate-300"
                              }`}
                            >
                              {isSettled ? "Paid" : "Unpaid"}
                            </button>
                          </div>
                        );
                      })}
                  </div>
                  <p className="mt-1 text-[11px] text-outline">
                    Any group member can update who has paid their share.
                  </p>
                </div>
              )}

              {editError && <p className="text-xs text-error">{editError}</p>}

              {showDeleteConfirm && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-3">
                  <p className="text-sm font-semibold text-red-700">Delete this expense?</p>
                  <p className="text-xs text-red-600 mt-1">
                    This action removes the expense and its split records. It cannot be undone.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 py-2 rounded-full border border-red-200 text-xs font-bold text-red-700 hover:bg-red-100 transition-all"
                    >
                      Keep Expense
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(editingExpense)}
                      disabled={isDeleting}
                      className="flex-1 py-2 rounded-full bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeleting ? "Deleting..." : "Delete Permanently"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setEditingExpense(null);
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 py-3 rounded-full border border-outline-variant text-sm font-bold text-outline hover:bg-surface-container transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave(editingExpense)}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary-container transition-all active:scale-95"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm((prev) => !prev)}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-full bg-red-100 text-red-700 text-sm font-bold hover:bg-red-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {showDeleteConfirm ? "Hide Delete" : "Delete"}
              </button>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}