"use client";

interface GroupGoalCardProps {
  goalName: string;
  daysComplete: number;
  totalDays: number;
}

export default function GroupGoalCard({
  goalName,
  daysComplete,
  totalDays,
}: GroupGoalCardProps) {
  const progress = Math.round((daysComplete / totalDays) * 100);

  return (
    <div className="bg-primary-container rounded-2xl p-6 text-on-primary-container">
      <div className="flex items-center gap-3 mb-4">
        <span className="material-symbols-outlined text-2xl text-tertiary-fixed-dim"
          style={{ fontVariationSettings: "'FILL' 1" }}>
          emoji_events
        </span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
            Group Goal
          </p>
          <p className="font-extrabold text-lg text-white font-headline">{goalName}</p>
        </div>
      </div>

      {/* animated progress bar showing how many days the group has completed */}
      <div className="w-full bg-white/20 rounded-full h-3 mb-3 overflow-hidden">
        <div
          className="h-full bg-white rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-xs text-white/70 font-medium text-right">
        {daysComplete}/{totalDays} Days Complete
      </p>
    </div>
  );
}