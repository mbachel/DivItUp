"use client";

import SideNav from "../../components/SideNav";
import BottomNav from "../../components/BottomNav";
import ReceiptUploader from "../../components/expenses/ReceiptUploader";
import ManualEntryForm from "../../components/expenses/ManualEntryForm";
import ExpenseTable from "../../components/expenses/ExpenseTable";
import { useState } from "react";
import type { Expense } from "../../components/expenses/ExpenseTable";
import type { ScannedReceipt } from "../../components/expenses/ReceiptUploader";

function mapCategory(category: string): Expense["categoryType"] {
  const map: Record<string, Expense["categoryType"]> = {
    food:          "grocery",
    groceries:     "grocery",
    restaurant:    "grocery",
    telecom:       "internet",
    software:      "subscription",
    energy:        "household",
    accommodation: "household",
    transport:     "other",
    gasoline:      "other",
    miscellaneous: "other",
  };
  return map[category.toLowerCase()] ?? "other";
}

export default function ExpensesPage() {
  const [newExpenses, setNewExpenses] = useState<Expense[]>([]);
  const [totalBalance] = useState(1240.50);

  const handleManualAdd = (expense: {
    name: string;
    amount: number;
    category: string;
    splitMethod: string;
  }) => {
    const newEntry: Expense = {
      id: Date.now().toString(),
      store: expense.name,
      category: expense.category.toUpperCase(),
      categoryType: expense.category.toLowerCase() as Expense["categoryType"],
      date: new Date().toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric"
      }),
      amount: expense.amount,
      splitMethod: expense.splitMethod,
    };
    setNewExpenses((prev) => [newEntry, ...prev]);
  };

  const handleScan = (receipt: ScannedReceipt) => {
    const newEntry: Expense = {
      id: Date.now().toString(),
      store: receipt.storeName,
      category: (receipt.subcategory ?? receipt.category).toUpperCase(),
      categoryType: mapCategory(receipt.category),
      date: receipt.date ?? new Date().toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric"
      }),
      amount: receipt.totalAmount,
      splitMethod: "Evenly",
    };
    setNewExpenses((prev) => [newEntry, ...prev]);
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <SideNav />
        {/* Adding Comments for Clarity */}
      <main className="md:ml-64 min-h-screen pb-24 md:pb-0">
        {/* Top bar */}
        <header className="flex justify-between items-center px-6 py-4 bg-surface sticky top-0 z-40 border-b border-outline-variant/20">
          {/* Mobile logo */}
          <div className="md:hidden">
            <span className="text-xl font-extrabold text-[#00606e] font-headline">H&amp;H</span>
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center gap-3 bg-surface-container-low px-4 py-2.5 rounded-full flex-1 max-w-md">
            <span className="material-symbols-outlined text-outline text-lg">search</span>
            <input
              type="text"
              placeholder="Search house expenses..."
              className="bg-transparent text-sm text-on-surface placeholder:text-outline focus:outline-none w-full"
            />
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-full">
              <span className="material-symbols-outlined text-[#007B8C] text-base">account_balance_wallet</span>
              <span className="text-sm font-bold text-[#007B8C]">${totalBalance.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-low px-3 py-2 rounded-full">
              <span className="material-symbols-outlined text-[#007B8C] text-base" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
              ME
            </div>
          </div>
        </header>

        {/* Page body */}
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

          {/* Two-column upload + manual entry */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            <ReceiptUploader onScan={handleScan} />
            <ManualEntryForm onAdd={handleManualAdd} />
          </div>

          {/* Expense table */}
          <ExpenseTable additionalExpenses={newExpenses} />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
