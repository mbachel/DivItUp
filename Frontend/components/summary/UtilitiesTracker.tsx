"use client";

export interface Utility {
  id: string;
  name: string;
  subtitle: string;
  amount: number;
  trend?: number;
  icon: string;
  iconBg: string;
  iconColor: string;
}

interface UtilitiesTrackerProps {
  utilities: Utility[];
}

export default function UtilitiesTracker({ utilities }: UtilitiesTrackerProps) {
  return (
    <div className="flex-1 min-w-0">
      <div className="mb-5">
        <h2 className="text-2xl font-extrabold text-on-surface font-headline">
          Utilities Tracker
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {utilities.length > 0 ? (
          utilities.map((u) => (
            <div
              key={u.id}
              className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/30 hover:border-outline-variant transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: u.iconBg }}
                >
                  <span
                    className="material-symbols-outlined text-lg"
                    style={{ color: u.iconColor }}
                  >
                    {u.icon}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-sm text-on-surface">{u.name}</p>
                  <p className="text-xs text-outline">{u.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xl font-extrabold text-on-surface font-headline">
                  ${u.amount.toFixed(2)}
                </p>
                {u.trend !== undefined ? (
                  <div
                    className={`flex items-center gap-1 text-xs font-bold ${
                      u.trend > 0 ? "text-error" : "text-primary"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {u.trend > 0 ? "trending_up" : "trending_down"}
                    </span>
                    {Math.abs(u.trend)}%
                  </div>
                ) : (
                  <span className="text-xs font-bold text-outline">— Fixed</span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 bg-surface-container-low rounded-2xl p-6 border border-outline-variant/30">
            <p className="text-sm font-medium text-on-surface">
              No utility expenses found yet.
            </p>
            <p className="text-xs text-outline mt-1">
              Add utility-related expenses like rent, internet, water, or electricity to see them here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}