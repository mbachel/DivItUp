"use client";

import { useEffect, useMemo, useState } from "react";
import LockedAlert from "@/components/LockedAlert";
import FinancialOverview from "@/components/FinancialOverview";
import ChoresCard from "@/components/ChoresCard";
import ActivityFeed from "@/components/ActivityFeed";
import {
  fetchChores,
  fetchChoreAssignments,
  fetchGroupMembers,
  fetchUsers,
} from "@/lib/apiClient";
import { balanceEntries, recentActivities } from "@/lib/mockData";

// TODO: Replace these with actual auth/session values later
const CURRENT_GROUP_ID = 1;
const CURRENT_USER_ID = 1;

type DashboardChoreEntry = {
  timeLabel: string;
  choreName: string;
  assignee: string;
  assigneeAvatar: string;
  isCurrentUser: boolean;
  isPriority?: boolean;
};

export default function DashboardPage() {
  const [isRestricted, setIsRestricted] = useState(false);
  const [todayChores, setTodayChores] = useState<DashboardChoreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);

        const [groupMembers, chores, assignments, users] = await Promise.all([
          fetchGroupMembers(),
          fetchChores(CURRENT_GROUP_ID),
          fetchChoreAssignments(),
          fetchUsers(),
        ]);

        // Only show locked alert if this user's group_members row is restricted
        const currentGroupMember = groupMembers.find(
          (member) =>
            member.group_id === CURRENT_GROUP_ID &&
            member.user_id === CURRENT_USER_ID
        );

        setIsRestricted(Boolean(currentGroupMember?.is_restricted));

        const groupChoreIds = new Set(chores.map((chore) => chore.id));
        const today = new Date().toISOString().slice(0, 10);

        const dueTodayAssignments = assignments.filter((assignment) => {
          const dueDate = assignment.due_date.slice(0, 10);
          return (
            groupChoreIds.has(assignment.chore_id) &&
            dueDate === today &&
            assignment.status !== "completed"
          );
        });

        const mappedTodayChores: DashboardChoreEntry[] = dueTodayAssignments.map(
          (assignment, index) => {
            const matchingChore = chores.find(
              (chore) => chore.id === assignment.chore_id
            );

            const matchingUser = users.find(
              (user) => user.id === assignment.assigned_to
            );

            return {
              timeLabel: "Due Today",
              choreName: matchingChore?.title ?? "Unnamed Chore",
              assignee: matchingUser?.full_name ?? "Unknown User",
              assigneeAvatar: "/Mogistan.jpg",
              isCurrentUser: assignment.assigned_to === CURRENT_USER_ID,
              isPriority: index === 0,
            };
          }
        );

        setTodayChores(mappedTodayChores);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        setIsRestricted(false);
        setTodayChores([]);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const choresToDisplay = useMemo(() => {
    if (todayChores.length > 0) {
      return todayChores;
    }

    return [
      {
        timeLabel: "No chores due today",
        choreName: "Nothing is due today",
        assignee: "All caught up",
        assigneeAvatar: "/Mogistan.jpg",
        isCurrentUser: false,
        isPriority: true,
      },
    ];
  }, [todayChores]);

  return (
    <>
      {isRestricted && (
        <LockedAlert
          message="Locked: Complete your tasks!"
          description="You cannot add expenses until you complete your assigned chore due today."
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <FinancialOverview totalDebt={452.2} entries={balanceEntries} />

        <ChoresCard
          chores={loading ? [] : choresToDisplay}
          onCompleteTask={() => console.log("Complete task")}
        />

        <ActivityFeed
          activities={recentActivities}
          onViewAll={() => console.log("View all")}
        />
      </div>
    </>
  );
}