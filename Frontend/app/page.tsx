"use client";

import { useEffect, useMemo, useState } from "react";
import LockedAlert from "@/components/LockedAlert";
import FinancialOverview from "@/components/FinancialOverview";
import WhoIsNext from "@/components/WhoIsNext";
import ActivityFeed from "@/components/ActivityFeed";
import {
  fetchChores,
  fetchChoreAssignments,
  fetchGroupMembers,
  fetchUsers,
} from "@/lib/apiClient";
import { balanceEntries, recentActivities } from "@/lib/mockData";

// TODO: Replace these with actual auth/session values later
const CURRENT_GROUP_ID = 2002;
const CURRENT_USER_ID = 1002;

type DashboardChoreEntry = {
  timeLabel: string;
  choreName: string;
  assignee: string;
  isCurrentUser: boolean;
  isPriority?: boolean;
};

export default function DashboardPage() {
  const [isRestricted, setIsRestricted] = useState(false);
  const [upcomingChores, setUpcomingChores] = useState<DashboardChoreEntry[]>([]);
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

        const currentGroupMember = groupMembers.find(
          (member) =>
            member.group_id === CURRENT_GROUP_ID &&
            member.user_id === CURRENT_USER_ID
        );

        setIsRestricted(Boolean(currentGroupMember?.is_restricted));

        const groupChoreIds = new Set(chores.map((chore) => chore.id));

        // next upcoming pending chores for the group, sorted by due date
        const upcomingAssignments = assignments
          .filter(
            (assignment) =>
              groupChoreIds.has(assignment.chore_id) &&
              assignment.status === "pending"
          )
          .sort(
            (a, b) =>
              new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
          )
          .slice(0, 4);

        const mapped: DashboardChoreEntry[] = upcomingAssignments.map(
          (assignment, index) => {
            const matchingChore = chores.find(
              (c) => c.id === assignment.chore_id
            );
            const matchingUser = users.find(
              (u) => u.id === assignment.assigned_to
            );

            const due = new Date(assignment.due_date);
            const today = new Date();
            const diff = Math.ceil(
              (due.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0)) /
                86400000
            );

            const timeLabel =
              diff === 0
                ? "TODAY"
                : diff === 1
                  ? "TOMORROW"
                  : diff < 0
                    ? `OVERDUE BY ${Math.abs(diff)} DAYS`
                    : `IN ${diff} DAYS`;

            return {
              timeLabel,
              choreName: matchingChore?.title ?? "Unnamed Chore",
              assignee: matchingUser?.full_name ?? "Unknown User",
              isCurrentUser: assignment.assigned_to === CURRENT_USER_ID,
              isPriority: index === 0,
            };
          }
        );

        setUpcomingChores(mapped);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        setIsRestricted(false);
        setUpcomingChores([]);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const choresToDisplay = useMemo(() => {
    if (upcomingChores.length > 0) {
      return upcomingChores;
    }

    return [
      {
        timeLabel: "ALL DONE",
        choreName: "No upcoming chores",
        assignee: "All caught up!",
        isCurrentUser: false,
        isPriority: false,
      },
    ];
  }, [upcomingChores]);

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

        <WhoIsNext chores={loading ? [] : choresToDisplay} />

        <ActivityFeed
          activities={recentActivities}
          onViewAll={() => console.log("View all")}
        />
      </div>
    </>
  );
}