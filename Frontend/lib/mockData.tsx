// Mock data for the DivItUp dashboard

export const balanceEntries = [
  {
    id: "sarah",
    name: "Sarah Jenkins",
    avatar:"",
    description: "Owes you for Internet",
    amount: 45.0,
    isOwed: true,
  },
  {
    id: "alex",
    name: "Alex Chen",
    avatar:"",
    description: "You owe for Groceries",
    amount: 12.5,
    isOwed: false,
  },
];

export const upcomingChores = [
  {
    timeLabel: "Today",
    choreName: "Trash & Recycling",
    assignee: "You",
    assigneeAvatar:"",
    isCurrentUser: true,
    isPriority: true,
  },
  {
    timeLabel: "Tomorrow",
    choreName: "Kitchen Deep Clean",
    assignee: "Sarah",
    assigneeAvatar:"",
    isCurrentUser: false,
    isPriority: false,
  },
];

export const leaderboardMembers = [
  {
    id: "you",
    name: "You",
    avatar:"",
    level: 12,
    levelTitle: "Habitual",
    points: 1240,
    pointsToday: 12,
    progressPercent: 85,
    accentColor: "#00606e",
    borderColor: "#00606e",
  },
  {
    id: "sarah",
    name: "Sarah",
    avatar:"",
    level: 10,
    levelTitle: "Scout",
    points: 980,
    pointsToday: 0,
    progressPercent: 62,
    accentColor: "#632ce5",
    borderColor: "#632ce5",
  },
  {
    id: "alex",
    name: "Alex",
    avatar:"",
    level: 11,
    levelTitle: "Builder",
    points: 1105,
    pointsToday: 50,
    progressPercent: 78,
    accentColor: "#844800",
    borderColor: "#844800",
  },
];

export const recentActivities = [
  {
    id: "1",
    type: "expense" as const,
    description: (
      <>
        Alex added an expense{" "}
        <span className="text-outline font-medium">for Grocery Store</span>
      </>
    ),
    timestamp: "2 hours ago",
    amount: "$34.20",
    tag: "Household Fund",
    icon: "shopping_bag",
    iconBgColor: "rgba(0, 96, 110, 0.1)",
    iconColor: "#00606e",
  },
  {
    id: "2",
    type: "chore" as const,
    description: (
      <>
        Sarah completed{" "}
        <span className="text-secondary">Vacuuming Living Room</span>
      </>
    ),
    timestamp: "Yesterday",
    amount: "+25 XP",
    avatar:"",
    icon: "task_alt",
    iconBgColor: "rgba(99, 44, 229, 0.1)",
    iconColor: "#632ce5",
  },
  {
    id: "3",
    type: "payment" as const,
    description: (
      <>
        You settled a payment{" "}
        <span className="text-outline font-medium">with Alex</span>
      </>
    ),
    timestamp: "2 days ago",
    amount: "$15.00",
    trailingIcon: "verified",
    icon: "payments",
    iconBgColor: "rgba(132, 72, 0, 0.1)",
    iconColor: "#844800",
  },
];
