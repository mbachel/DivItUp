// Mock data for the Hearth & Habit dashboard
// Replace these with real API calls as your backend grows

export const balanceEntries = [
  {
    id: "sarah",
    name: "Sarah Jenkins",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBjIiDecBmVJWT3GvWBqwHkOP5JvvQv8p7s7tdNlv6mvfNz27Gn6jJUpoYQDGd2N2XsCkAMyF_ya2rKZfamgLFujn3iImi8JpOQL8ronTCRD-uNU51T-_pweLKXx1gSDA5MpmMF6wx5zYKihvEkaUNjAIVbRtG2_Ux0O-YXX8VORMa4L2WN8Df97IJBK4U-WIy-vubW7Ko8QESH39oTlJehccJbZq-wHYJduhHySWTvHKS7CAC5gApgHjOwMW9luBnQdDAIsBySqw",
    description: "Owes you for Internet",
    amount: 45.0,
    isOwed: true,
  },
  {
    id: "alex",
    name: "Alex Chen",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDM0u-fgrryyLO5_cEDKOLgOlGCCbF8d28XhdeCo0wPIwJ87_19ehyb4xQ01-bcqssKyE5-3oW5Pg42-KYqX5IcVKlr8dGXE_qcf33ylVktIE_UnJIwbl_qCpTvnS8GoHY9Nc8ovssCOKelPVQSxgGvdwkjwSmI2FC4MRIXWxB11mz7T3MfulbVMoSr4JJOMOWzloMVn8hVAuk_FR_zrHMESCmwegx0DXweyIrLW0Q6Rg3an1VmLH6KdK_yQ37vbYWZzWL3WOoSoQ",
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
    assigneeAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCnplXIz0_tSl07I4qGTMViLY5Gt9YbCtlvHUqEAhfr-8ZkebMgEUZZ4-SCwggSee3-OpkT01JadhT1RHlKZSKBVAnlgeNGDvIP4dqXkO3BaU_bgwppYXYGxHeYAA3Zgm98zpPXCU6Mrsq44qQckD1v5VV96-ZKJdC_YBujGNI6CUpCiCrfrLAZUMAF1f5FFuGI7wkKbuEdqcX9dxNPcZVIUIqFmD6wMVXBzPXLt-5kxaC3nwSp-QS8tkc3r2e-ZreaHreZwiqQvw",
    isCurrentUser: true,
    isPriority: true,
  },
  {
    timeLabel: "Tomorrow",
    choreName: "Kitchen Deep Clean",
    assignee: "Sarah",
    assigneeAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCdUZzcznwEGqZlEWj_JyIMrGe7eT6iOhgTwJSzZik0ll7n8BoHaYzy6sQxhu1OdFCsT8kVpxGXeYZFj00xzlULXRIKPvY1txxBEJ7r72N0bnfjFZgLk2HLHGTz5hyLFXxMdYXBP_BuMosBnnYRMx999UdZJHT-d9DShxqAansc1P6nzUbJfjewdb11VeqHkFbBa2BkSRZeR3fqvnwGqrUUyQyDpwkqW8puA9SnQZDXHseXUEPyqhAJevSHyaxn_HzQxyxvAg",
    isCurrentUser: false,
    isPriority: false,
  },
];

export const leaderboardMembers = [
  {
    id: "you",
    name: "You",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDRdGYNwREWR5HJBjzqVzEr5kn_RbHQClCA6ooecjTO3hE0nsGbUga13DFPU0f9ptz4axkpTd0vYvwF831XAn-JEKiP44bdxmOa_fCeGLYyFTf3y2BHUtUvgagF1w3SZSMhIrhZ5i0hjNDZDahGLxNFxiv-lXNLprR-fQjk-r3twne_vF4hGZRAFTrVSmHzSOmyU02acJrjaP5xQHruk697Q5DaKdzOSguthZuq_FHu3F108TGNhFWxVRolfKFXSDoexCHP5sveLg",
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
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAeqz0ouJag_hen2QmuY58tn-YNTNgxTwCkJ3lFYJvxXduUiCVT820Jme1q3syESPmPbAHPOGi6af0Np68mqRfJkhqGHuVZSRgKfgyPEJHtReuyWVfaeCxgxfSHSn8AWF6b5bg47mStUPExMilvry8VITZ1A1lBGXt-XDNqKInr4Q0xVVDcCZbFe28dmEQy2sU6qgkNZjwsc86cKv9dekK7ufZsi42Dond6K8TWIRXA1lrwrfIanlzNOienAKqmyyyTJDybY8dQnQ",
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
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDzvw8xGhaJR78NBT2wUywEOvjVIgIbnaf0_Ik39fx7JQgl7Vpv61NV4m7CHbGpLIhvQLHzMGYymEtUMeb5pmJ56VWERjw1iw-MSkU4vDHrLv6q5p-AxHXeAnwTDxk3dN86AcydUm-S88E8i7lH8cP0AuqItUN7kiSrszoqCZKBpo6qOROixL8rfQDHDwiBQwGDSIFvxAtulMmBb0ykujbUl-WFE0TLIt-6tlvXfAn4yeRwYG27ZLAaGmXJmjRmz7YBInnTwN4Slw",
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
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBDwNEM-tv2ZoXrSpzEp0XsSJf_yzB_3eDC_KjbemdKlBpddIhYU_OLl2KopkVCvIajTYG_FVXUGaTOuA8m_N8xBPwSLqc5gjbcAhd6iE24RVZkED3YLeik2Hm5ljdj0MfauO_x4m347m2ocAiouboiLufslL80fAla6t253d8-rRK6HNF_Qw7ct8stR8tEoYUJtm5wBcrCX79wOz_hXuuosNArbcA-GHulUn-6HXhNLPIgIdaL2h34unom2xH_2R8QnWir2u2kkA",
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
