"use client";

import { useEffect, useMemo, useState } from "react";

const CATEGORY_OPTIONS = [
  { value: "rent", label: "Rent" },
  { value: "groceries", label: "Groceries" },
  { value: "utilities", label: "Utilities" },
  { value: "subscription", label: "Subscription" },
  { value: "other", label: "Other" },
];
const SPLIT_METHODS = ["Evenly", "%", "Itemized"];

type SplitMethod = "Evenly" | "%" | "Itemized";

export interface SplitMemberOption {
  userId: number;
  label: string;
}

interface ExpenseSplitInput {
  userId: number;
  amountOwed: number;
}

interface ManualEntryFormProps {
  members: SplitMemberOption[];
  onAdd?: (expense: {
    name: string;
    amount: number;
    category: string;
    splitType: "equal" | "custom";
    splits: ExpenseSplitInput[];
  }) => void;
}

function toCents(amount: number): number {
  return Math.round(amount * 100);
}

function toDollars(cents: number): number {
  return Number((cents / 100).toFixed(2));
}

function splitCentsEvenly(totalCents: number, userIds: number[]): ExpenseSplitInput[] {
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

export default function ManualEntryForm({ members, onAdd }: ManualEntryFormProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0].value);
  const [splitMethod, setSplitMethod] = useState<SplitMethod>("Evenly");
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [percentShares, setPercentShares] = useState<Record<number, string>>({});
  const [itemizedShares, setItemizedShares] = useState<Record<number, string>>({});
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setSelectedMembers(members.map((member) => member.userId));
  }, [members]);

  const selectedMemberSet = useMemo(() => new Set(selectedMembers), [selectedMembers]);
  const selectedMemberLabels = useMemo(
    () => members
      .filter((member) => selectedMemberSet.has(member.userId))
      .map((member) => member.label),
    [members, selectedMemberSet]
  );

  const normalizedAmountPreview = useMemo(() => {
    const amountValue = Number(amount);
    if (Number.isNaN(amountValue) || amountValue <= 0) {
      return null;
    }
    return toDollars(toCents(amountValue));
  }, [amount]);

  const toggleMember = (userId: number) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const validateAndBuildCustomPercentSplits = (
    totalCents: number,
    userIds: number[]
  ): ExpenseSplitInput[] | null => {
    const parsed = userIds.map((userId) => {
      const raw = percentShares[userId] ?? "";
      const value = Number(raw);
      return { userId, value };
    });

    if (parsed.some((entry) => Number.isNaN(entry.value) || entry.value < 0)) {
      setErrorMessage("Percent split requires non-negative values for all selected members.");
      return null;
    }

    const totalPercent = parsed.reduce((sum, entry) => sum + entry.value, 0);
    if (Math.abs(totalPercent - 100) > 0.01) {
      setErrorMessage("Percent split must add up to exactly 100%.");
      return null;
    }

    const weighted = parsed.map((entry) => {
      const exact = (totalCents * entry.value) / 100;
      const floored = Math.floor(exact);
      return {
        userId: entry.userId,
        floored,
        fraction: exact - floored,
      };
    });

    const flooredTotal = weighted.reduce((sum, entry) => sum + entry.floored, 0);
    let remaining = totalCents - flooredTotal;

    weighted.sort((a, b) => b.fraction - a.fraction);

    const centsByUser = new Map<number, number>(
      weighted.map((entry) => [entry.userId, entry.floored])
    );

    for (let i = 0; i < weighted.length && remaining > 0; i += 1) {
      const targetUserId = weighted[i].userId;
      const current = centsByUser.get(targetUserId) ?? 0;
      centsByUser.set(targetUserId, current + 1);
      remaining -= 1;
    }

    return userIds.map((userId) => ({
      userId,
      amountOwed: toDollars(centsByUser.get(userId) ?? 0),
    }));
  };

  const validateAndBuildItemizedSplits = (
    totalCents: number,
    userIds: number[]
  ): ExpenseSplitInput[] | null => {
    const splits = userIds.map((userId) => {
      const raw = itemizedShares[userId] ?? "";
      const amountValue = Number(raw);
      return {
        userId,
        amountValue,
      };
    });

    if (splits.some((entry) => Number.isNaN(entry.amountValue) || entry.amountValue < 0)) {
      setErrorMessage("Itemized split requires non-negative amounts for all selected members.");
      return null;
    }

    const totalItemizedCents = splits.reduce((sum, entry) => sum + toCents(entry.amountValue), 0);
    if (totalItemizedCents !== totalCents) {
      setErrorMessage("Itemized split must add up to the full expense amount.");
      return null;
    }

    return splits.map((entry) => ({
      userId: entry.userId,
      amountOwed: toDollars(toCents(entry.amountValue)),
    }));
  };

  const handleSubmit = () => {
    setErrorMessage("");

    if (!name || !amount) {
      return;
    }

    const amountValue = Number(amount);
    if (Number.isNaN(amountValue) || amountValue <= 0) {
      setErrorMessage("Amount must be greater than zero.");
      return;
    }

    const normalizedAmount = toDollars(toCents(amountValue));

    const userIds = [...selectedMembers].sort((a, b) => a - b);
    if (userIds.length === 0) {
      setErrorMessage("Select at least one member to split this expense.");
      return;
    }

    const totalCents = toCents(normalizedAmount);
    let splits: ExpenseSplitInput[] | null = null;

    if (splitMethod === "Evenly") {
      splits = splitCentsEvenly(totalCents, userIds);
    } else if (splitMethod === "%") {
      splits = validateAndBuildCustomPercentSplits(totalCents, userIds);
    } else {
      splits = validateAndBuildItemizedSplits(totalCents, userIds);
    }

    if (!splits) {
      return;
    }

    onAdd?.({
      name,
      amount: normalizedAmount,
      category,
      splitType: splitMethod === "Evenly" ? "equal" : "custom",
      splits,
    });

    setName("");
    setAmount("");
    setErrorMessage("");
  };

  // keep manual entry fast for recurring household costs
  return (
    <div className="bg-white rounded-2xl p-6 border border-outline-variant/40 h-full">
      <h3 className="font-bold text-lg text-on-surface mb-1 font-headline">Manual Entry</h3>
      <p className="text-sm text-outline mb-5">For utilities, rent, or simple logs.</p>

      {/* basic description field for the expense */}
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

      {/* amount and category are captured side by side for quicker input */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-outline block mb-2">
            Amount
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            placeholder="$0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}
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
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* split method toggles how this expense is distributed */}
      <div className="mb-6">
        <label className="text-[10px] font-bold uppercase tracking-widest text-outline block mb-2">
          Split Method
        </label>
        <div className="flex gap-2">
          {SPLIT_METHODS.map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => setSplitMethod(method as SplitMethod)}
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

      <div className="mb-6">
        <label className="text-[10px] font-bold uppercase tracking-widest text-outline block mb-2">
          Split With
        </label>

        {members.length === 0 ? (
          <p className="text-xs text-outline">No other members found in this group.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {members.map((member) => {
              const selected = selectedMemberSet.has(member.userId);
              return (
                <button
                  key={member.userId}
                  type="button"
                  onClick={() => toggleMember(member.userId)}
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
        )}
      </div>

      {splitMethod === "%" && selectedMembers.length > 0 && (
        <div className="mb-6 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Percent Shares</p>
          {members
            .filter((member) => selectedMemberSet.has(member.userId))
            .map((member) => (
              <div key={member.userId} className="grid grid-cols-[1fr_90px] items-center gap-3">
                <span className="text-sm text-on-surface">{member.label}</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={percentShares[member.userId] ?? ""}
                  onChange={(e) =>
                    setPercentShares((prev) => ({ ...prev, [member.userId]: e.target.value }))
                  }
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  placeholder="0"
                />
              </div>
            ))}
          <p className="text-[11px] text-outline">Total must equal 100%.</p>
        </div>
      )}

      {splitMethod === "Itemized" && selectedMembers.length > 0 && (
        <div className="mb-6 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Itemized Amounts</p>
          {members
            .filter((member) => selectedMemberSet.has(member.userId))
            .map((member) => (
              <div key={member.userId} className="grid grid-cols-[1fr_110px] items-center gap-3">
                <span className="text-sm text-on-surface">{member.label}</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={itemizedShares[member.userId] ?? ""}
                  onChange={(e) =>
                    setItemizedShares((prev) => ({ ...prev, [member.userId]: e.target.value }))
                  }
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  placeholder="0.00"
                />
              </div>
            ))}
          <p className="text-[11px] text-outline">Total itemized amount must equal the expense total.</p>
        </div>
      )}

      {errorMessage && (
        <p className="text-xs text-error mb-4">{errorMessage}</p>
      )}

      {normalizedAmountPreview !== null && selectedMemberLabels.length > 0 && (
        <div className="mb-4 rounded-xl border border-outline-variant/60 bg-surface-container-low px-3 py-2">
          <p className="text-[11px] font-semibold text-on-surface">
            Confirm: {name || "Untitled expense"} · ${normalizedAmountPreview.toFixed(2)} · {splitMethod}
          </p>
          <p className="text-[11px] text-outline truncate" title={selectedMemberLabels.join(", ")}>
            Split between: {selectedMemberLabels.join(", ")}
          </p>
        </div>
      )}

      {/* final action button to add the entry */}
      <button
        onClick={handleSubmit}
        disabled={!name || !amount || members.length === 0}
        className="w-full bg-secondary text-white py-4 rounded-full font-bold text-sm hover:bg-secondary-container transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
      >
        Add Manual Expense
      </button>
    </div>
  );
}
