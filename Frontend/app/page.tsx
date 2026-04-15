"use client";

import LockedAlert from "@/components/LockedAlert";
import FinancialOverview from "@/components/FinancialOverview";
import ChoresCard from "@/components/ChoresCard";
import LeaderboardCard from "@/components/LeaderboardCard";
import ActivityFeed from "@/components/ActivityFeed";
import {
  balanceEntries,
  upcomingChores,
  leaderboardMembers,
  recentActivities,
} from "@/lib/mockData";
{/* Adding comments for more clarity */}
export default function DashboardPage() {
  return (
    <>
      {/* Locked Alert */}
      <LockedAlert
        message="Locked: Complete your tasks!"
        description="You cannot add expenses until you complete the recycling chore today."
      />

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Financial Overview */}
        <FinancialOverview
          totalDebt={452.2}
          entries={balanceEntries}
        />

            {/* Chores Card */}
            <ChoresCard
              chores={upcomingChores}
              onCompleteTask={() => console.log("Complete task")}
            />

            {/* Leaderboard */}
            <LeaderboardCard
              members={leaderboardMembers}
              streakMultiplier={2}
              onInviteRoommate={() => console.log("Invite roommate")}
            />

            {/* Activity Feed */}
            <ActivityFeed
              activities={recentActivities}
              onViewAll={() => console.log("View all")}
            />
          </div>
    </>
  );
}
