"use client";

export interface ChorePulseItem {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  type: "overdue" | "due_soon";
}

export interface ChoreDistributionSlice {
  memberName: string;
  count: number;
  color: string;
}

interface HouseHarmonyCardProps {
  overdueCount: number;
  dueSoonCount: number;
  completionRate: number;
  completedCount: number;
  totalCount: number;
  monthLabel: string;
  urgentItems: ChorePulseItem[];
  distribution: ChoreDistributionSlice[];
}

function buildConicGradient(distribution: ChoreDistributionSlice[]) {
  const total = distribution.reduce((sum, segment) => sum + segment.count, 0);
  if (total <= 0) {
    return "conic-gradient(#e5e7eb 0% 100%)";
  }

  let cursor = 0;
  const stops = distribution.map((segment) => {
    const start = cursor;
    const end = cursor + (segment.count / total) * 100;
    cursor = end;
    return `${segment.color} ${start.toFixed(2)}% ${end.toFixed(2)}%`;
  });

  return `conic-gradient(${stops.join(", ")})`;
}

function formatDueDate(isoDate: string) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function HouseHarmonyCard({
  overdueCount,
  dueSoonCount,
  completionRate,
  completedCount,
  totalCount,
  monthLabel,
  urgentItems,
  distribution,
}: HouseHarmonyCardProps) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (completionRate / 100) * circumference;

  const totalDistribution = distribution.reduce((sum, segment) => sum + segment.count, 0);
  const pieBackground = buildConicGradient(distribution);

  return (
    <div className="bg-white rounded-2xl p-8 border border-outline-variant/40 flex-1">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-4xl font-extrabold text-on-surface font-headline mb-2">
            Chore Pulse
          </h2>
          <p className="text-outline font-medium max-w-xl">
            Snapshot of chore pressure: what is overdue, what is due soon, monthly completion pace, and who is carrying the load.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap">
            {overdueCount} Overdue
          </span>
          <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap">
            {dueSoonCount} Due Soon
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-surface-container-low rounded-2xl border border-outline-variant/30 p-5 flex items-center gap-6">
          <div className="relative flex-shrink-0">
            <svg width="130" height="130" viewBox="0 0 130 130">
              <circle
                cx="65"
                cy="65"
                r="54"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="10"
              />
              <circle
                cx="65"
                cy="65"
                r="54"
                fill="none"
                stroke="#0f766e"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform="rotate(-90 65 65)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-on-surface font-headline">
                {completionRate}%
              </span>
              <span className="text-[10px] font-bold text-outline uppercase tracking-widest">
                Complete
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-outline mb-1">
              Completion Rate
            </p>
            <p className="text-2xl font-extrabold text-on-surface font-headline mb-1">
              {completedCount}/{totalCount}
            </p>
            <p className="text-sm text-outline">{monthLabel || "Current month"}</p>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-2xl border border-outline-variant/30 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-outline mb-3">
            Chore Distribution
          </p>

          {totalDistribution > 0 ? (
            <>
              <div className="flex items-center gap-5">
                <div
                  className="w-36 h-36 rounded-full border border-outline-variant/30 flex-shrink-0"
                  style={{ background: pieBackground }}
                  aria-label="Chore distribution pie chart"
                />

                <div className="space-y-2">
                  {distribution.slice(0, 5).map((segment) => {
                    const pct = (segment.count / totalDistribution) * 100;
                    return (
                      <div key={segment.memberName} className="flex items-center gap-2 text-sm">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: segment.color }}
                        />
                        <span className="text-on-surface font-semibold">{segment.memberName}</span>
                        <span className="text-outline">{segment.count} ({pct.toFixed(0)}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-outline">No assignments available yet to build distribution.</p>
          )}
        </div>
      </div>

      <div className="bg-surface-container-low rounded-2xl border border-outline-variant/30 p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-widest text-outline">
            Overdue and Due Soon
          </p>
          <p className="text-xs text-outline">Top {Math.min(urgentItems.length, 6)} items</p>
        </div>

        {urgentItems.length > 0 ? (
          <div className="space-y-2">
            {urgentItems.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-white rounded-xl border border-outline-variant/25 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate">{item.title}</p>
                  <p className="text-xs text-outline truncate">Assigned to {item.assignee}</p>
                </div>

                <div className="flex items-center gap-2 ml-3">
                  <span className="text-xs text-outline whitespace-nowrap">{formatDueDate(item.dueDate)}</span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full whitespace-nowrap ${
                      item.type === "overdue"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {item.type === "overdue" ? "Overdue" : "Due Soon"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-outline">No overdue or due-soon chores right now.</p>
        )}
      </div>
    </div>
  );
}
