"use client";

interface EpicTaskCardProps {
  title: string;
  value: number;
  participants: string[];
  extraCount?: number;
  onJoin?: () => void;
}

export default function EpicTaskCard({
  title,
  value,
  participants,
  extraCount = 0,
  onJoin,
}: EpicTaskCardProps) {
    {/* Adding Comments for Clarity */}
  return (
    <div className="bg-white rounded-2xl border-2 border-tertiary/40 overflow-hidden">
      {/* Epic banner */}
      <div className="bg-tertiary px-4 py-2 flex items-center justify-between">
        <span className="text-white text-[10px] font-bold uppercase tracking-widest">
          Epic Task
        </span>
        <div className="text-right">
          <p className="text-[9px] text-white/70 uppercase tracking-wider">Value</p>
          <p className="text-tertiary-fixed font-extrabold text-lg leading-none">{value}</p>
        </div>
      </div>

      {/* Task content */}
      <div className="p-5">
        <h3 className="text-xl font-extrabold text-on-surface font-headline mb-5">
          {title}
        </h3>

        {/* Participants + join */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {participants.slice(0, 3).map((p, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container text-xs font-bold flex items-center justify-center border-2 border-white"
                style={{ marginLeft: i > 0 ? "-8px" : "0" }}
              >
                {p.slice(0, 2).toUpperCase()}
              </div>
            ))}
            {extraCount > 0 && (
              <div
                className="w-8 h-8 rounded-full bg-surface-container text-outline text-xs font-bold flex items-center justify-center border-2 border-white"
                style={{ marginLeft: "-8px" }}
              >
                +{extraCount}
              </div>
            )}
          </div>
          <button
            onClick={onJoin}
            className="bg-on-surface text-surface px-5 py-2.5 rounded-full font-bold text-sm hover:bg-on-surface/80 transition-all active:scale-95"
          >
            Join Task
          </button>
        </div>
      </div>
    </div>
  );
}
