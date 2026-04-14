"use client";

import { useState } from "react";
import * as api from "../../lib/apiClient";

export interface BackendExpense {
  id: number;
  group_id: number;
  paid_by: number;
  receipt_id: number | null;
  title: string;
  total_amount: number | string;
  split_type: string;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  grocery:      { bg: "bg-amber-100",  text: "text-amber-800",  icon: "shopping_basket" },
  internet:     { bg: "bg-purple-100", text: "text-purple-800", icon: "wifi" },
  subscription: { bg: "bg-blue-100",   text: "text-blue-800",   icon: "play_circle" },
  household:    { bg: "bg-teal-100",   text: "text-teal-800",   icon: "home" },
  rent:         { bg: "bg-red-100",    text: "text-red-800",    icon: "key" },
  other:        { bg: "bg-gray-100",   text: "text-gray-700",   icon: "receipt" },
};

const SPLIT_DISPLAY: Record<string, { bg: string; text: string; label: string }> = {
  equal:  { bg: "bg-teal-50",   text: "text-teal-700",   label: "Evenly Split" },
  custom: { bg: "bg-purple-50", text: "text-purple-700", label: "Custom Split" },
};

const FILTERS = ["All Items", "Recent", "By Split Type"];

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
  onRefresh?: () => void;
}

export default function ExpenseTable({ expenses = [], onRefresh }: ExpenseTableProps) {
  const [activeFilter, setActiveFilter] = useState("All Items");
  const [editingExpense, setEditingExpense] = useState<BackendExpense | null>(null);
  const [localExpenses, setLocalExpenses] = useState<BackendExpense[]>([]);

  const allExpenses = [...localExpenses, ...expenses];

  const filtered = activeFilter === "All Items"
    ? allExpenses
    : activeFilter === "Recent"
      ? [...allExpenses].sort((a, b) => b.id - a.id)
      : allExpenses;

  const handleSave = async (updated: BackendExpense) => {
    await api.updateExpense(updated.id, {
      title: updated.title,
      total_amount: Number(updated.total_amount),
      split_type: updated.split_type,
    });
    setLocalExpenses((prev) =>
      prev.map((e) => e.id === updated.id ? updated : e)
    );
    setEditingExpense(null);
    onRefresh?.();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Delete this expense?")) {
      await api.deleteExpense(id);
      setLocalExpenses((prev) => prev.filter((e) => e.id !== id));
      setEditingExpense(null);
      onRefresh?.();
    }
  };

  return (
    <div>
      {/* Header + filters */}
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_auto] px-6 py-3 border-b border-outline-variant/30">
          {["Description", "Amount", "Split Type", "ID", "Action"].map((h) => (
            <span key={h} className="text-[10px] font-bold uppercase tracking-widest text-outline">
              {h}
            </span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-outline text-sm">No expenses yet</div>
        ) : (
          filtered.map((expense, i) => {
            const categoryType = inferCategoryType(expense.title);
            const style = CATEGORY_STYLES[categoryType] ?? CATEGORY_STYLES.other;
            const splitStyle = SPLIT_DISPLAY[expense.split_type] ?? SPLIT_DISPLAY.equal;
            const amount = Number(expense.total_amount || 0);
            return (
              <div
                key={expense.id}
                className={`grid grid-cols-[2fr_1fr_1.5fr_1fr_auto] px-6 py-4 items-center hover:bg-surface-container-low transition-colors ${
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
                    <p className="font-bold text-sm text-on-surface">{expense.title}</p>
                    <p className="text-[10px] text-outline">
                      Paid by user #{expense.paid_by}
                      {expense.receipt_id ? ` · receipt #${expense.receipt_id}` : ""}
                    </p>
                  </div>
                </div>

                <span className="text-base font-extrabold text-on-surface">
                  ${amount.toFixed(2)}
                </span>

                <span className={`inline-flex text-xs font-bold px-3 py-1.5 rounded-full w-fit ${splitStyle.bg} ${splitStyle.text}`}>
                  {splitStyle.label}
                </span>

                <span className="text-xs text-outline">#{expense.id}</span>

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
              <button
                onClick={() => handleDelete(editingExpense.id)}
                className="flex-1 py-3 rounded-full bg-red-100 text-red-700 text-sm font-bold hover:bg-red-200 transition-all active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}