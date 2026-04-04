"use client";

import { useState } from "react";

const CATEGORIES = ["Rent", "Groceries", "Utilities", "Internet", "Subscription", "Transport", "Household", "Other"];
const SPLIT_METHODS = ["Evenly", "%", "Itemized"];

interface ManualEntryFormProps {
  onAdd?: (expense: {
    name: string;
    amount: number;
    category: string;
    splitMethod: string;
  }) => void;
}

export default function ManualEntryForm({ onAdd }: ManualEntryFormProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Rent");
  const [splitMethod, setSplitMethod] = useState("Evenly");

  const handleSubmit = () => {
    if (!name || !amount) return;
    onAdd?.({
      name,
      amount: parseFloat(amount),
      category,
      splitMethod,
    });
    setName("");
    setAmount("");
  };
  {/*Adding comments for clarity*/}
  return (
    <div className="bg-white rounded-2xl p-6 border border-outline-variant/40 h-full">
      <h3 className="font-bold text-lg text-on-surface mb-1 font-headline">Manual Entry</h3>
      <p className="text-sm text-outline mb-5">For utilities, rent, or simple logs.</p>

      {/* Expense name */}
      <div className="mb-4">
        <label className="text-[10px] font-bold uppercase tracking-widest text-outline block mb-2">
          Expense Name
        </label>
        <input
          type="text"
          placeholder="e.g. Monthly Rent"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      {/* Amount + Category */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-outline block mb-2">
            Amount
          </label>
          <input
            type="number"
            placeholder="$0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-outline block mb-2">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Split method */}
      <div className="mb-6">
        <label className="text-[10px] font-bold uppercase tracking-widest text-outline block mb-2">
          Split Method
        </label>
        <div className="flex gap-2">
          {SPLIT_METHODS.map((method) => (
            <button
              key={method}
              onClick={() => setSplitMethod(method)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                splitMethod === method
                  ? "bg-primary text-white"
                  : "bg-surface-container-low text-outline hover:bg-surface-container-high"
              }`}
            >
              {method}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!name || !amount}
        className="w-full bg-secondary text-white py-4 rounded-full font-bold text-sm hover:bg-secondary-container transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
      >
        Add Manual Expense
      </button>
    </div>
  );
}
