"use client";

import UserAvatar from "@/components/UserAvatar";

export interface Leader {
  id: string;
  name: string;
  username: string;
  subtitle: string;
  points: number;
  isCurrentUser?: boolean;
}

interface DivItUpLeadersProps {
  leaders: Leader[];
}

// dense ranking so ties don't cause gaps — 750, 700, 700, 600 becomes 1, 2, 2, 3
// page.tsx handles the alphabetical sort within the same tier before this runs
function computeRank(leaders: Leader[], index: number): number {
  const points = leaders[index].points;
  const uniqueHigherTiers = new Set(
    leaders.filter((l) => l.points > points).map((l) => l.points)
  );
  return uniqueHigherTiers.size + 1;
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
                <UserAvatar
                  username={leader.username}
                  fullName={leader.name}
                  size={40}
                  className={leader.isCurrentUser ? "ring-2 ring-white/25" : ""}
                  fallbackClassName="text-sm"
                  alt={`${leader.name} profile`}
                />
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