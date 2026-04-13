"use client";

import { useState, useEffect, useRef } from "react";

export interface Expense {
  id: string;
  store: string;
  category: string;
  categoryType: "grocery" | "internet" | "subscription" | "household" | "rent" | "other";
  date: string;
  amount: number;
  splitMethod: string;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  grocery:      { bg: "bg-amber-100",  text: "text-amber-800",  icon: "shopping_basket" },
  internet:     { bg: "bg-purple-100", text: "text-purple-800", icon: "wifi" },
  subscription: { bg: "bg-blue-100",   text: "text-blue-800",   icon: "play_circle" },
  household:    { bg: "bg-teal-100",   text: "text-teal-800",   icon: "home" },
  rent:         { bg: "bg-red-100",    text: "text-red-800",    icon: "key" },
  other:        { bg: "bg-gray-100",   text: "text-gray-700",   icon: "receipt" },
};

const SPLIT_BADGE: Record<string, { bg: string; text: string }> = {
  "Evenly Split (4)": { bg: "bg-teal-50",   text: "text-teal-700" },
  "By Percentage":    { bg: "bg-purple-50", text: "text-purple-700" },
  "Specific Items":   { bg: "bg-amber-50",  text: "text-amber-700" },
  "Evenly":           { bg: "bg-teal-50",   text: "text-teal-700" },
};

const FILTERS = ["All Items", "Groceries", "Household", "Subscriptions", "Utilities", "Other"];

const CATEGORY_OPTIONS: { label: string; value: Expense["categoryType"] }[] = [
  { label: "Grocery",      value: "grocery" },
  { label: "Internet",     value: "internet" },
  { label: "Subscription", value: "subscription" },
  { label: "Household",    value: "household" },
  { label: "Rent",         value: "rent" },
  { label: "Other",        value: "other" },
];

const SPLIT_OPTIONS = ["Evenly", "Evenly Split (4)", "By Percentage", "Specific Items"];

const MOCK_EXPENSES: Expense[] = [
  { id: "1", store: "Whole Foods - Groceries", category: "GROCERY",      categoryType: "grocery",      date: "Oct 24, 2023", amount: 54.20,  splitMethod: "Evenly Split (4)" },
  { id: "2", store: "Comcast Internet",        category: "INTERNET",     categoryType: "internet",     date: "Oct 20, 2023", amount: 89.99,  splitMethod: "By Percentage" },
  { id: "3", store: "Netflix Premium",         category: "SUBSCRIPTION", categoryType: "subscription", date: "Oct 18, 2023", amount: 19.99,  splitMethod: "Specific Items" },
  { id: "4", store: "Trader Joe's",            category: "GROCERY",      categoryType: "grocery",      date: "Oct 15, 2023", amount: 38.45,  splitMethod: "Evenly Split (4)" },
  { id: "5", store: "Pacific Gas & Electric",  category: "UTILITIES",    categoryType: "household",    date: "Oct 12, 2023", amount: 112.00, splitMethod: "By Percentage" },
];

interface ExpenseTableProps {
  additionalExpenses?: Expense[];
}

export default function ExpenseTable({ additionalExpenses = [] }: ExpenseTableProps) {
  const [activeFilter, setActiveFilter] = useState("All Items");
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [extraExpenses, setExtraExpenses] = useState<Expense[]>([]);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const prevAdditionalRef = useRef<Expense[]>([]);

  useEffect(() => {
    const newOnes = additionalExpenses.filter(
      (a) => !prevAdditionalRef.current.find((p) => p.id === a.id)
    );
    if (newOnes.length > 0) {
      setExtraExpenses((prev) => [...newOnes, ...prev]);
      prevAdditionalRef.current = additionalExpenses;
    }
  }, [additionalExpenses]);

  const allExpenses = [...extraExpenses, ...expenses];

  const filtered = activeFilter === "All Items"
    ? allExpenses
    : allExpenses.filter((e) =>
        activeFilter === "Groceries"     ? e.categoryType === "grocery" :
        activeFilter === "Household"     ? e.categoryType === "household" :
        activeFilter === "Subscriptions" ? e.categoryType === "subscription" :
        activeFilter === "Utilities"     ? e.categoryType === "household" :
        activeFilter === "Other"         ? e.categoryType === "other" : true
      );

  const handleSave = (updated: Expense) => {
    const catLabel = CATEGORY_OPTIONS.find(c => c.value === updated.categoryType)?.label.toUpperCase() ?? updated.category;
    const withLabel = { ...updated, category: catLabel };

    const inMock = expenses.find((e) => e.id === updated.id);
    if (inMock) {
      setExpenses((prev) => prev.map((e) => e.id === updated.id ? withLabel : e));
    } else {
      setExtraExpenses((prev) => prev.map((e) => e.id === updated.id ? withLabel : e));
    }
    setEditingExpense(null);
  };

  return (
    <div>
      {/* Header + filters */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-on-surface font-headline">
          Detected Scanned Items
        </h2>
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_1fr_1.5fr_auto] px-6 py-3 border-b border-outline-variant/30">
          {["Item & Category", "Date", "Price", "Split Method", "Action"].map((h) => (
            <span key={h} className="text-[10px] font-bold uppercase tracking-widest text-outline">
              {h}
            </span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-outline text-sm">No expenses yet</div>
        ) : (
          filtered.map((expense, i) => {
            const style = CATEGORY_STYLES[expense.categoryType] ?? CATEGORY_STYLES.other;
            const splitStyle = SPLIT_BADGE[expense.splitMethod] ?? { bg: "bg-gray-50", text: "text-gray-700" };
            return (
              <div
                key={expense.id}
                className={`grid grid-cols-[2fr_1fr_1fr_1.5fr_auto] px-6 py-4 items-center hover:bg-surface-container-low transition-colors ${
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
                    <p className="font-bold text-sm text-on-surface">{expense.store}</p>
                    <p className={`text-[10px] font-bold tracking-wider ${style.text}`}>
                      {expense.category}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-outline">{expense.date}</span>
                <span className="text-base font-extrabold text-on-surface">
                  ${expense.amount.toFixed(2)}
                </span>
                <span className={`inline-flex text-xs font-bold px-3 py-1.5 rounded-full w-fit ${splitStyle.bg} ${splitStyle.text}`}>
                  {expense.splitMethod}
                </span>
                <button
                  onClick={() => setEditingExpense({ ...expense })}
                  className="p-2 hover:bg-surface-container rounded-full transition-colors"
                >
                  <span className="material-symbols-outlined text-outline text-base">edit</span>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Modal */}
      {editingExpense && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold font-headline">Edit Expense</h3>
              <button
                onClick={() => setEditingExpense(null)}
                className="p-2 hover:bg-surface-container rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-outline">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-outline block mb-2">
                  Item Name
                </label>
                <input
                  type="text"
                  value={editingExpense.store}
                  onChange={(e) => setEditingExpense({ ...editingExpense, store: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-outline block mb-2">
                  Category
                </label>
                <select
                  value={editingExpense.categoryType}
                  onChange={(e) => setEditingExpense({
                    ...editingExpense,
                    categoryType: e.target.value as Expense["categoryType"],
                  })}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-outline block mb-2">
                    Date
                  </label>
                  <input
                    type="text"
                    value={editingExpense.date}
                    onChange={(e) => setEditingExpense({ ...editingExpense, date: e.target.value })}
                    placeholder="e.g. Oct 24, 2023"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-outline block mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    value={editingExpense.amount}
                    onChange={(e) => setEditingExpense({ ...editingExpense, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-outline block mb-2">
                  Split Method
                </label>
                <select
                  value={editingExpense.splitMethod}
                  onChange={(e) => setEditingExpense({ ...editingExpense, splitMethod: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                >
                  {SPLIT_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingExpense(null)}
                className="flex-1 py-3 rounded-full border border-outline-variant text-sm font-bold text-outline hover:bg-surface-container transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave(editingExpense)}
                className="flex-1 py-3 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary-container transition-all active:scale-95"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
