import Image from "next/image";

interface ChoreEntry {
  timeLabel: string;
  choreName: string;
  assignee: string;
  assigneeAvatar: string;
  isCurrentUser: boolean;
  isPriority?: boolean;
}

interface ChoresCardProps {
  chores: ChoreEntry[];
  onCompleteTask?: () => void;
}

export default function ChoresCard({ chores, onCompleteTask }: ChoresCardProps) {
  return (
    <div className="md:col-span-5 lg:col-span-4 bg-primary-container text-on-primary-container rounded-xl p-8 ambient-depth flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold font-headline">Who&apos;s next?</h3>
        <span className="material-symbols-outlined text-black/50">
          assignment_ind
        </span>
      </div>

      <div className="flex-grow space-y-8">
        {chores.map((chore, index) => (
          <div
            key={index}
            className={`relative pl-8 border-l-2 ${
              index === 0 ? "border-white/20" : "border-white/10"
            }`}
          >
            {/* Priority indicator dot */}
            {chore.isPriority && (
              <div className="absolute -left-3 top-0 w-6 h-6 bg-secondary-fixed text-on-secondary-fixed rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-xs">
                  priority_high
                </span>
              </div>
            )}

            <p
              className={`text-sm font-bold uppercase tracking-widest mb-2 ${
                index === 0 ? "opacity-70" : "opacity-50"
              }`}
            >
              {chore.timeLabel}
            </p>
            <h4
              className={`text-lg font-bold leading-tight ${
                index === 0 ? "" : "opacity-80"
              } font-headline`}
            >
              {chore.choreName}
            </h4>

            <div className="flex items-center gap-2 mt-3">
              <div
                className={`w-6 h-6 rounded-full overflow-hidden border-2 border-primary-container ${
                  index !== 0 ? "opacity-60" : ""
                }`}
              >
                <Image
                  src={chore.assigneeAvatar}
                  alt={chore.assignee}
                  width={24}
                  height={24}
                  className="object-cover"
                />
              </div>
              <span
                className={`text-sm font-medium ${
                  index !== 0 ? "opacity-60" : ""
                }`}
              >
                {chore.isCurrentUser ? "It's your turn" : chore.assignee}
              </span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onCompleteTask}
        className="mt-8 w-full bg-white text-primary font-bold py-3 rounded-full hover:bg-secondary-fixed transition-colors"
      >
        Complete Task
      </button>
    </div>
  );
}
