"use client";

import SideNav from "../../components/SideNav";
import BottomNav from "../../components/BottomNav";
import ReceiptUploader from "../../components/expenses/ReceiptUploader";
import ManualEntryForm from "../../components/expenses/ManualEntryForm";
import ExpenseTable from "../../components/expenses/ExpenseTable";
import TopBar from "../../components/TopBar";
import { useState, useEffect } from "react";
import * as api from "../../lib/apiClient";
import type { ScannedReceipt } from "../../components/expenses/ReceiptUploader";

// TODO: Replace with actual auth context/hook to get current user and group
const CURRENT_USER_ID = 1;
const CURRENT_GROUP_ID = 1;

export interface BackendExpense {
  id: number;
  group_id: number;
  paid_by: number;
  receipt_id: number | null;
  title: string;
  total_amount: number;
  split_type: string;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<BackendExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalBalance] = useState(1240.5);

  // ============ Load expenses on mount ============
  useEffect(() => {
    const loadExpenses = async () => {
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
    };
    loadExpenses();
  }, []);

  // ============ Handle manual expense submission ============
  const handleManualAdd = async (expense: {
    name: string;
    amount: number;
    category: string;
    splitMethod: string;
  }) => {
    try {
      // Map frontend form data to backend payload
      const payload: api.ExpenseCreatePayload = {
        group_id: CURRENT_GROUP_ID,
        paid_by: CURRENT_USER_ID,
        title: expense.name,
        total_amount: expense.amount,
        split_type: "equal", // Default to equal split
        receipt_id: null,
      };

      // POST to backend
      const created = await api.createExpense(payload);
      if (created) {
        // Add to local list
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

  // ============ Handle receipt scan completion ============
  const handleScan = async (receipt: ScannedReceipt, receiptId: number) => {
    try {
      // Receipt already created in ReceiptUploader, now create an expense from it
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

          {/* Hero header */}
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

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Two-column upload + manual entry */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            <ReceiptUploader
              onScan={handleScan}
              groupId={CURRENT_GROUP_ID}
              userId={CURRENT_USER_ID}
            />
            <ManualEntryForm onAdd={handleManualAdd} />
          </div>

          {/* Expense table */}
          {loading ? (
            <div className="text-center py-12 text-outline">Loading expenses...</div>
          ) : (
            <ExpenseTable expenses={expenses} />
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
