"use client";

interface StatsPanelProps {
  totalExpenses: number;
  choresDoneOnTime: number;
}

export default function StatsPanel({ totalExpenses, choresDoneOnTime }: StatsPanelProps) {
  return (
    <div className="flex flex-col gap-4 w-72 flex-shrink-0">
      {/* Total shared expenses */}
      <div className="bg-primary-container text-on-primary-container rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-xl">
              account_balance_wallet
            </span>
          </div>
          <span className="text-xs font-bold bg-white/20 text-white px-3 py-1 rounded-full uppercase tracking-wider">
            This Month
          </span>
        </div>
        <p className="text-4xl font-extrabold text-white font-headline mb-1">
          ${totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
        <p className="text-sm text-white/70 font-medium">Total Shared Expenses</p>
      </div>

      {/* Live chores on time */}
      <div className="bg-tertiary-fixed rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-white/50 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-on-tertiary-fixed text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}>
              task_alt
            </span>
          </div>
          <span className="text-xs font-bold bg-white/50 text-on-tertiary-fixed px-3 py-1 rounded-full uppercase tracking-wider">
            Live Streak
          </span>
        </div>
        <p className="text-5xl font-extrabold text-on-tertiary-fixed font-headline mb-1">
          {choresDoneOnTime}
        </p>
        <p className="text-sm text-on-tertiary-fixed/70 font-medium">Chores Completed on Time</p>
      </div>
    </div>
  );
}
