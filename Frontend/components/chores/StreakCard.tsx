"use client";

interface StreakCardProps {
  streakDays: number;
  cycle: number;
  totalCycles: number;
}

export default function StreakCard({ streakDays, cycle, totalCycles }: StreakCardProps) {
  return (
    <div className="bg-secondary-fixed/40 rounded-2xl p-6 flex flex-col gap-4 min-w-[200px]">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 bg-white/60 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-secondary text-xl">autorenew</span>
        </div>
        <span className="text-xs font-bold bg-white/60 text-on-surface px-3 py-1 rounded-full">
          Cycle {cycle}/{totalCycles}
        </span>
      </div>
      <div>
        <p className="text-sm font-semibold text-on-surface/70 mb-1">Global Streak</p>
        <p className="text-4xl font-extrabold text-on-surface font-headline">
          {streakDays} Days
        </p>
      </div>
    </div>
  );
}
