import Image from "next/image";

interface LeaderboardMember {
  id: string;
  name: string;
  avatar: string;
  level: number;
  levelTitle: string;
  points: number;
  pointsToday: number;
  progressPercent: number;
  accentColor: string;
  borderColor: string;
}

interface LeaderboardCardProps {
  members: LeaderboardMember[];
  streakMultiplier?: number;
  onInviteRoommate?: () => void;
}

export default function LeaderboardCard({
  members,
  streakMultiplier = 2,
  onInviteRoommate,
}: LeaderboardCardProps) {
  return (
    <div className="md:col-span-12 bg-surface-container-low rounded-xl p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-on-surface font-headline">
            The DivItUp Standings
          </h3>
          <p className="text-outline font-medium">
            Weekly contributions and bonus points
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-sm font-bold px-3 py-1 bg-secondary-fixed text-on-secondary-fixed rounded-lg">
            <span className="material-symbols-outlined text-sm">
              auto_awesome
            </span>
            {streakMultiplier}x Streak Active
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {members.map((member) => (
          <div
            key={member.id}
            className={`bg-surface-container-lowest p-6 rounded-xl border-b-4`}
            style={{ borderColor: member.accentColor }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <Image
                  src={member.avatar}
                  alt={member.name}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-bold">{member.name}</p>
                <p className="text-xs text-outline">
                  Level {member.level} {member.levelTitle}
                </p>
              </div>
            </div>

            <div className="flex items-end justify-between">
              <span
                className="text-3xl font-extrabold font-headline"
                style={{ color: member.accentColor }}
              >
                {member.points.toLocaleString()}
              </span>
              <span
                className="text-xs font-bold px-2 py-1 rounded"
                style={{
                  color: member.accentColor,
                  backgroundColor: `${member.accentColor}1a`,
                }}
              >
                +{member.pointsToday} today
              </span>
            </div>

            <div className="mt-4 w-full bg-surface-container h-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${member.progressPercent}%`,
                  backgroundColor: member.accentColor,
                }}
              />
            </div>
          </div>
        ))}

        {/* Invite Roommate Placeholder */}
        <button
          onClick={onInviteRoommate}
          className="bg-surface-container-low border-2 border-dashed border-outline-variant p-6 rounded-xl flex flex-col items-center justify-center text-center opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <span className="material-symbols-outlined text-4xl mb-2">
            person_add
          </span>
          <p className="font-bold">Invite Roommate</p>
        </button>
      </div>
    </div>
  );
}
