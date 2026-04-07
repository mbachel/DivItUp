"use client";

interface Metric {
  label: string;
  value: string;
  color: string;
  barColor: string;
  barWidth: string;
}

interface HouseHarmonyCardProps {
  score: number;
  percentChange: number;
  metrics: Metric[];
}

export default function HouseHarmonyCard({
  score,
  percentChange,
  metrics,
}: HouseHarmonyCardProps) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
    {/* Adding Comments for Clarity */}
  return (
    <div className="bg-white rounded-2xl p-8 border border-outline-variant/40 flex-1">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-4xl font-extrabold text-on-surface font-headline mb-2">
            House Harmony
          </h2>
          <p className="text-outline font-medium max-w-xs">
            Your household is vibrating at a high frequency. Split speeds are optimal!
          </p>
        </div>
        <div className="bg-secondary-fixed text-on-secondary-fixed px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap">
          +{percentChange}% from last month
        </div>
      </div>

      {/* Score ring + metrics */}
      <div className="flex items-center gap-10">
        {/* SVG ring */}
        <div className="relative flex-shrink-0">
          <svg width="130" height="130" viewBox="0 0 130 130">
            {/* Background ring */}
            <circle
              cx="65" cy="65" r="54"
              fill="none"
              stroke="#e8deff"
              strokeWidth="10"
            />
            {/* Progress ring */}
            <circle
              cx="65" cy="65" r="54"
              fill="none"
              stroke="#7c4dff"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 65 65)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold text-on-surface font-headline">{score}</span>
            <span className="text-xs font-bold text-outline uppercase tracking-widest">Score</span>
          </div>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-x-10 gap-y-5 flex-1">
          {metrics.map((m) => (
            <div key={m.label}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-1">
                {m.label}
              </p>
              <p className="font-extrabold text-lg mb-2" style={{ color: m.color }}>
                {m.value}
              </p>
              <div className="h-1.5 bg-surface-container rounded-full overflow-hidden w-full">
                <div
                  className="h-full rounded-full"
                  style={{ width: m.barWidth, backgroundColor: m.barColor }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
