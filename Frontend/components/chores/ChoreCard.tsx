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
  status: "pending" | "inprogress" | "complete";
}

interface ChoreCardProps {
  chore: Chore;
  onComplete?: (id: string) => Promise<void>;
}

export default function ChoreCard({ chore, onComplete }: ChoreCardProps) {
  const [completing, setCompleting] = useState(false);
  const [done, setDone] = useState(chore.status === "complete");

  const handleComplete = async () => {
    if (done) return;
    setCompleting(true);
    try {
      await onComplete?.(chore.id);
      setDone(true);
    } finally {
      setCompleting(false);
    }
  };
  {/* Adding Comments for Clarity */}
  return (
    <div
      className={`bg-white rounded-2xl p-5 border transition-all ${
        done
          ? "border-primary/30 bg-primary/5"
          : "border-outline-variant/40 hover:border-outline-variant"
      }`}
    >
      {/* Top row: points badge + due label */}
      <div className="flex items-center justify-between mb-4">
        <span
          className={`text-[10px] font-bold px-3 py-1.5 rounded-full ${
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
            ? `${chore.daysLeft} Days Left`
            : chore.dueLabel}
        </span>
      </div>

      {/* Chore title */}
      <h3
        className={`text-lg font-bold font-headline mb-5 ${
          done ? "line-through text-outline" : "text-on-surface"
        }`}
      >
        {chore.title}
      </h3>

      {/* Bottom row: assignee + complete button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-xs font-bold text-on-primary-container">
            {chore.assignee.slice(0, 2).toUpperCase()}
          </div>
          {chore.status === "inprogress" && (
            <span className="text-xs font-bold text-outline uppercase tracking-wider">
              {chore.assignee}
            </span>
          )}
        </div>

        {/* Complete button / spinner */}
        {done ? (
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <span className="material-symbols-outlined text-base">check_circle</span>
            Done
          </div>
        ) : completing ? (
          <div className="w-10 h-10 rounded-full border-4 border-secondary/30 border-t-secondary animate-spin" />
        ) : (
          <button
            onClick={handleComplete}
            className="flex items-center gap-2 bg-surface-container-low text-on-surface px-4 py-2 rounded-full text-sm font-bold hover:bg-primary hover:text-white transition-all"
          >
            <span className="material-symbols-outlined text-base">check_circle</span>
            Complete
          </button>
        )}
      </div>
    </div>
  );
}
