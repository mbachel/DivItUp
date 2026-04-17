"use client";

import { useState } from "react";

export interface Chore {
  id: string;
  title: string;
  points: number;
  dueLabel: string;
  daysLeft?: number;
  assignee: string;
  assigneeAvatar?: string;
  status: "pending" | "inprogress" | "complete" | "skipped";
}

interface ChoreCardProps {
  chore: Chore;
  onComplete?: (id: string) => Promise<void>;
  onSkip?: (id: string) => Promise<void>;
}

export default function ChoreCard({ chore, onComplete, onSkip }: ChoreCardProps) {
  const [completing, setCompleting] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [done, setDone] = useState(chore.status === "complete");
  const [skipped, setSkipped] = useState(chore.status === "skipped");

  const handleComplete = async () => {
    if (done || skipped) return;
    setCompleting(true);
    try {
      await onComplete?.(chore.id);
      setDone(true);
    } finally {
      setCompleting(false);
    }
  };

  const handleSkip = async () => {
    if (done || skipped) return;
    setSkipping(true);
    try {
      await onSkip?.(chore.id);
      setSkipped(true);
    } finally {
      setSkipping(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl p-3 border transition-all ${
        done
          ? "border-primary/30 bg-primary/5"
          : skipped
            ? "border-outline-variant/30 bg-surface-container-low/50"
            : "border-outline-variant/40 hover:border-outline-variant"
      }`}
    >
      {/* Top row: points badge + due label */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-[10px] font-bold px-2 py-1 rounded-full leading-tight ${
            chore.status === "inprogress"
              ? "bg-secondary text-white"
              : "bg-primary/10 text-primary"
          }`}
        >
          {chore.status === "inprogress"
            ? "IN PROGRESS"
            : `+${chore.points} POINTS`}
        </span>
        <span className="text-xs font-semibold text-outline">
          {chore.daysLeft !== undefined
            ? chore.daysLeft <= 0
              ? `Overdue by ${Math.abs(chore.daysLeft)} day${Math.abs(chore.daysLeft) === 1 ? "" : "s"}`
              : `${chore.daysLeft} Days Left`
            : chore.dueLabel}
        </span>
      </div>

      {/* Chore title */}
      <h3
        className={`text-sm font-bold font-headline mb-3 ${
          done
            ? "line-through text-outline"
            : skipped
              ? "line-through text-outline/50"
              : "text-on-surface"
        }`}
      >
        {chore.title}
      </h3>

      {/* Bottom row: assignee + skip + complete buttons */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {/* Avatar */}
          <div className="w-7 h-7 rounded-full bg-primary-container flex items-center justify-center text-[10px] font-bold text-on-primary-container">
            {chore.assignee.slice(0, 2).toUpperCase()}
          </div>
          {chore.status === "inprogress" && (
            <span className="text-xs font-bold text-outline uppercase tracking-wider">
              {chore.assignee}
            </span>
          )}
        </div>

        {/* Action buttons */}
        {done ? (
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <span className="material-symbols-outlined text-base">check_circle</span>
            Done
          </div>
        ) : skipped ? (
          <div className="flex items-center gap-2 text-outline font-bold text-sm">
            <span className="material-symbols-outlined text-base">block</span>
            Skipped
          </div>
        ) : completing || skipping ? (
          <div className="w-10 h-10 rounded-full border-4 border-secondary/30 border-t-secondary animate-spin" />
        ) : (
          <div className="flex flex-col gap-1.5 items-end">
            <button
              onClick={handleSkip}
              className="flex items-center gap-1 bg-surface-container-low text-outline px-2.5 py-1.5 rounded-full text-xs font-bold hover:bg-outline/10 transition-all"
            >
              <span className="material-symbols-outlined text-sm">block</span>
              Skip
            </button>
            <button
              onClick={handleComplete}
              className="flex items-center gap-1 bg-surface-container-low text-on-surface px-2.5 py-1.5 rounded-full text-xs font-bold hover:bg-primary hover:text-white transition-all"
            >
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Complete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}