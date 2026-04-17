"use client";

import ChoreCard, { type Chore } from "./ChoreCard";

interface ChoreColumnProps {
  title: string;
  taskCount: number;
  chores: Chore[];
  accentColor?: string;
  onComplete?: (id: string) => Promise<void>;
  onSkip?: (id: string) => Promise<void>;
}

const ACCENT_COLORS: Record<string, string> = {
  Daily:    "bg-primary",
  Weekly:   "bg-secondary",
  Monthly:  "bg-tertiary",
  "One Time": "bg-outline",
};

export default function ChoreColumn({
  title,
  taskCount,
  chores,
  onComplete,
  onSkip,
}: ChoreColumnProps) {
  const dot = ACCENT_COLORS[title] ?? "bg-outline";

  return (
    <div className="flex flex-col gap-4 flex-1 min-w-0">
      {/* column title, task count, and a colored dot for the frequency type */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-on-surface font-headline">{title}</h2>
        <span className="text-sm text-outline font-medium">/ {taskCount} Tasks</span>
        <div className={`w-2.5 h-2.5 rounded-full ml-auto ${dot}`} />
      </div>

      {/* stack of chore cards — empty when no chores exist for this frequency */}
      <div className="flex flex-col gap-3">
        {chores.map((chore) => (
          <ChoreCard key={chore.id} chore={chore} onComplete={onComplete} onSkip={onSkip} />
        ))}
      </div>
    </div>
  );
}