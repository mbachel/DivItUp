"use client";

import SideNav from "@/components/SideNav";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
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

export default function DashboardPage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen">
      {/* Sidebar */}
      <SideNav />

      {/* Main content */}
      <main className="md:ml-64 min-h-screen pb-24 md:pb-0">
        {/* Top bar */}
        <TopBar />

        {/* Page body */}
        <div className="p-6 md:p-10 space-y-10">
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
        </div>
      </main>

      {/* Mobile navigation */}
      <BottomNav />
    </div>
  );
}
