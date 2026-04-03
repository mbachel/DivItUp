import Image from "next/image";

interface ActivityItem {
  id: string;
  type: "expense" | "chore" | "payment";
  description: React.ReactNode;
  timestamp: string;
  amount?: string;
  amountColor?: string;
  tag?: string;
  avatar?: string;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  trailingIcon?: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  onViewAll?: () => void;
}

export default function ActivityFeed({
  activities,
  onViewAll,
}: ActivityFeedProps) {
  return (
    <div className="md:col-span-12 bg-surface-container-lowest rounded-xl p-8 ambient-depth">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold font-headline">Recent Activity</h3>
        <button
          onClick={onViewAll}
          className="text-sm font-bold text-primary hover:underline"
        >
          View All
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center gap-4 p-4 hover:bg-surface-container-low rounded-xl transition-colors"
          >
            {/* Icon */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: activity.iconBgColor,
                color: activity.iconColor,
              }}
            >
              <span className="material-symbols-outlined text-xl">
                {activity.icon}
              </span>
            </div>

            {/* Content */}
            <div className="flex-grow">
              <p className="text-sm font-bold">{activity.description}</p>
              <p className="text-xs text-outline">
                {activity.timestamp}
                {activity.amount && (
                  <>
                    {" "}
                    •{" "}
                    <span
                      className="font-bold"
                      style={{ color: activity.iconColor }}
                    >
                      {activity.amount}
                    </span>
                  </>
                )}
              </p>
            </div>

            {/* Trailing element */}
            <div className="hidden sm:block flex-shrink-0">
              {activity.tag && (
                <span className="text-xs font-bold bg-surface-container px-2 py-1 rounded">
                  {activity.tag}
                </span>
              )}
              {activity.avatar && (
                <div className="w-6 h-6 rounded-full overflow-hidden">
                  <Image
                    src={activity.avatar}
                    alt="user"
                    width={24}
                    height={24}
                    className="object-cover"
                  />
                </div>
              )}
              {activity.trailingIcon && (
                <span className="material-symbols-outlined text-outline">
                  {activity.trailingIcon}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
