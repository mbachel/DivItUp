"use client";

import SideNav from "../../components/SideNav";
import BottomNav from "../../components/BottomNav";
import ReceiptUploader from "../../components/expenses/ReceiptUploader";
import ManualEntryForm from "../../components/expenses/ManualEntryForm";
import ExpenseTable from "../../components/expenses/ExpenseTable";
import type { BackendExpense } from "../../components/expenses/ExpenseTable";
import TopBar from "../../components/TopBar";
import { useState, useEffect, useCallback } from "react";
import * as api from "../../lib/apiClient";
import type { ScannedReceipt } from "../../components/expenses/ReceiptUploader";

const CURRENT_USER_ID = 1;
const CURRENT_GROUP_ID = 1;

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<BackendExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.fetchExpenses(CURRENT_GROUP_ID);
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
    splitMethod: string;
  }) => {
    try {
      const payload: api.ExpenseCreatePayload = {
        group_id: CURRENT_GROUP_ID,
        paid_by: CURRENT_USER_ID,
        title: expense.name,
        total_amount: expense.amount,
        split_type: "equal",
        receipt_id: null,
      };
      const created = await api.createExpense(payload);
      if (created) {
        setExpenses((prev) => [created, ...prev]);
        setError("");
      } else {
        setError("Failed to create expense. Please try again.");
      }
    } catch (err) {
      setError("Error creating expense");
      console.error(err);
    }
  };

  const handleScan = async (receipt: ScannedReceipt, receiptId: number) => {
    try {
      const payload: api.ExpenseCreatePayload = {
        group_id: CURRENT_GROUP_ID,
        paid_by: CURRENT_USER_ID,
        title: receipt.storeName,
        total_amount: receipt.totalAmount,
        split_type: "equal",
        receipt_id: receiptId,
      };
      const created = await api.createExpense(payload);
      if (created) {
        setExpenses((prev) => [created, ...prev]);
        setError("");
      } else {
        setError("Failed to create expense from receipt. Please try again.");
      }
    } catch (err) {
      setError("Error creating expense from receipt");
      console.error(err);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <SideNav />
      <main className="md:ml-64 min-h-screen pb-24 md:pb-0">
        <TopBar />

        <div className="p-6 md:p-10 space-y-10">
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
            <div className="hidden md:block text-right">
              <p className="text-5xl font-extrabold text-secondary">84%</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-outline mt-1">
                Accuracy Rate
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
              groupId={CURRENT_GROUP_ID}
              userId={CURRENT_USER_ID}
            />
            <ManualEntryForm onAdd={handleManualAdd} />
          </div>

          {loading ? (
            <div className="text-center py-12 text-outline">Loading expenses...</div>
          ) : (
            <ExpenseTable expenses={expenses} onRefresh={loadExpenses} />
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}