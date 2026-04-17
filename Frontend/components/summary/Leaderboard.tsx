"use client";

export interface Leader {
  id: string;
  name: string;
  subtitle: string;
  points: number;
  isCurrentUser?: boolean;
}

interface DivItUpLeadersProps {
  leaders: Leader[];
}

// Standard competition ranking: 1, 1, 3 (ties share the same rank,
// next rank skips ahead by the number of tied entries).
// Within the same rank, page.tsx already sorted alphabetically.
function computeRank(leaders: Leader[], index: number): number {
  const points = leaders[index].points;
  return leaders.filter((l) => l.points > points).length + 1;
}

export default function Leaderboard({ leaders }: DivItUpLeadersProps) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-extrabold text-on-surface font-headline">
          Group Leaderboard
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {leaders.map((leader, i) => {
          const rank = computeRank(leaders, i);

          return (
            <div
              key={leader.id}
              className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                leader.isCurrentUser
                  ? "bg-primary-container text-on-primary-container"
                  : "bg-white border border-outline-variant/40 hover:border-outline-variant"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-bold w-4 text-center ${
                    leader.isCurrentUser ? "text-white/60" : "text-outline"
                  }`}
                >
                  {rank}
                </span>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    leader.isCurrentUser
                      ? "bg-white/20 text-white"
                      : "bg-surface-container text-on-surface"
                  }`}
                >
                  {leader.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
              </div>

              <div className="flex-1">
                <p
                  className={`font-bold text-sm ${
                    leader.isCurrentUser ? "text-white" : "text-on-surface"
                  }`}
                >
                  {leader.name}
                </p>
                <p
                  className={`text-xs ${
                    leader.isCurrentUser ? "text-white/60" : "text-outline"
                  }`}
                >
                  {leader.subtitle}
                </p>
              </div>

              <div className="text-right">
                <p
                  className={`text-xl font-extrabold font-headline ${
                    leader.isCurrentUser ? "text-white" : "text-secondary"
                  }`}
                >
                  {leader.points}
                </p>
                <p
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    leader.isCurrentUser ? "text-white/60" : "text-outline"
                  }`}
                >
                  Points
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}