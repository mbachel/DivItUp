"use client";

import { useState } from "react";

export interface Expense {
  id: string;
  store: string;
  category: string;
  categoryType: "grocery" | "internet" | "subscription" | "household" | "rent" | "other";
  date: string;
  amount: number;
  splitMethod: string;
  splitDetail?: string;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  grocery:      { bg: "bg-amber-100",   text: "text-amber-800",   icon: "shopping_basket" },
  internet:     { bg: "bg-purple-100",  text: "text-purple-800",  icon: "wifi" },
  subscription: { bg: "bg-blue-100",    text: "text-blue-800",    icon: "play_circle" },
  household:    { bg: "bg-teal-100",    text: "text-teal-800",    icon: "home" },
  rent:         { bg: "bg-red-100",     text: "text-red-800",     icon: "key" },
  other:        { bg: "bg-gray-100",    text: "text-gray-700",    icon: "receipt" },
};

const SPLIT_BADGE: Record<string, { bg: string; text: string }> = {
  "Evenly Split (4)": { bg: "bg-teal-50",   text: "text-teal-700" },
  "By Percentage":    { bg: "bg-purple-50", text: "text-purple-700" },
  "Specific Items":   { bg: "bg-amber-50",  text: "text-amber-700" },
  "Evenly":           { bg: "bg-teal-50",   text: "text-teal-700" },
};

const FILTERS = ["All Items", "Groceries", "Household", "Subscriptions", "Utilities"];

const MOCK_EXPENSES: Expense[] = [
  { id: "1", store: "Whole Foods - Groceries", category: "GROCERY",      categoryType: "grocery",      date: "Oct 24, 2023", amount: 54.20, splitMethod: "Evenly Split (4)" },
  { id: "2", store: "Comcast Internet",        category: "INTERNET",     categoryType: "internet",     date: "Oct 20, 2023", amount: 89.99, splitMethod: "By Percentage" },
  { id: "3", store: "Netflix Premium",         category: "SUBSCRIPTION", categoryType: "subscription", date: "Oct 18, 2023", amount: 19.99, splitMethod: "Specific Items" },
  { id: "4", store: "Trader Joe's",            category: "GROCERY",      categoryType: "grocery",      date: "Oct 15, 2023", amount: 38.45, splitMethod: "Evenly Split (4)" },
  { id: "5", store: "Pacific Gas & Electric",  category: "UTILITIES",    categoryType: "household",    date: "Oct 12, 2023", amount: 112.00, splitMethod: "By Percentage" },
];

interface ExpenseTableProps {
  additionalExpenses?: Expense[];
}

export default function ExpenseTable({ additionalExpenses = [] }: ExpenseTableProps) {
  const [activeFilter, setActiveFilter] = useState("All Items");
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);

  const allExpenses = [...additionalExpenses, ...expenses];

  const filtered = activeFilter === "All Items"
    ? allExpenses
    : allExpenses.filter((e) =>
        activeFilter === "Groceries"     ? e.categoryType === "grocery" :
        activeFilter === "Household"     ? e.categoryType === "household" :
        activeFilter === "Subscriptions" ? e.categoryType === "subscription" :
        activeFilter === "Utilities"     ? e.categoryType === "household" : true
      );
      {/*Adding comments for clarity*/}
  return (
    <div>
      {/* Header + filters */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-on-surface font-headline">
          Detected Scanned Items
        </h2>
        <div className="flex gap-2">
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
        {/* Table header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1.5fr_auto] px-6 py-3 border-b border-outline-variant/30">
          {["Item & Category", "Date", "Price", "Split Method", "Action"].map((h) => (
            <span key={h} className="text-[10px] font-bold uppercase tracking-widest text-outline">
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
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
                {/* Item & category */}
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

                {/* Date */}
                <span className="text-sm text-outline">{expense.date}</span>

                {/* Price */}
                <span className="text-base font-extrabold text-on-surface">
                  ${expense.amount.toFixed(2)}
                </span>

                {/* Split badge */}
                <span className={`inline-flex text-xs font-bold px-3 py-1.5 rounded-full w-fit ${splitStyle.bg} ${splitStyle.text}`}>
                  {expense.splitMethod}
                </span>

                {/* Edit */}
                <button className="p-2 hover:bg-surface-container rounded-full transition-colors">
                  <span className="material-symbols-outlined text-outline text-base">edit</span>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
