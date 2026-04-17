"use client";

import { useCallback, useEffect, useState } from "react";
import HouseHarmonyCard, {
  type ChoreDistributionSlice,
  type ChorePulseItem,
} from "../../components/summary/HouseHarmonyCard";
import StatsPanel from "../../components/summary/StatsPanel";
import Leaderboard from "../../components/summary/Leaderboard";
import UtilitiesTracker from "../../components/summary/UtilitiesTracker";
import type { Leader } from "../../components/summary/Leaderboard";
import type { Utility } from "../../components/summary/UtilitiesTracker";
import * as api from "../../lib/apiClient";
import { resolveActiveMembership } from "@/lib/activeMembership";

const TRACKED_UTILITY_CATEGORY = "utilities";
const DUE_SOON_WINDOW_DAYS = 3;
const DISTRIBUTION_COLORS = [
  "#0f766e",
  "#1d4ed8",
  "#7c3aed",
  "#db2777",
  "#b45309",
  "#059669",
  "#7f1d1d",
];

interface ChorePulseSummary {
  overdueCount: number;
  dueSoonCount: number;
  completionRate: number;
  completedCount: number;
  totalCount: number;
  monthLabel: string;
  urgentItems: ChorePulseItem[];
  distribution: ChoreDistributionSlice[];
}

function getMonthLabel(now: Date) {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const startText = `${monthStart.toLocaleString("en-US", { month: "short" })} ${monthStart.getDate()}`;
  const endText = `${monthEnd.toLocaleString("en-US", { month: "short" })} ${monthEnd.getDate()}`;

  return `${startText} - ${endText}`;
}

function formatCategoryName(category: string | null | undefined) {
  if (!category) return "Utility";
  return category.charAt(0).toUpperCase() + category.slice(1);
}

function getUtilityVisual(category: string | null | undefined) {
  const normalized = (category || "").toLowerCase();

  switch (normalized) {
    case "water":
      return {
        icon: "water_drop",
        iconBg: "#dbeafe",
        iconColor: "#0369a1",
      };
    case "electricity":
    case "gas":
    case "utilities":
    default:
      return {
        icon: "bolt",
        iconBg: "#dbeafe",
        iconColor: "#1d4ed8",
      };
  }
}

export default function SummaryPage() {
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [utilities, setUtilities] = useState<Utility[]>([]);
  const [chorePulse, setChorePulse] = useState<ChorePulseSummary>({
    overdueCount: 0,
    dueSoonCount: 0,
    completionRate: 0,
    completedCount: 0,
    totalCount: 0,
    monthLabel: getMonthLabel(new Date()),
    urgentItems: [],
    distribution: [],
  });

  const loadSummaryData = useCallback(async () => {
    try {
      const context = await resolveActiveMembership();
      const group = context.activeGroup;
      const membersInGroup = context.membersInActiveGroup;

      setCurrentStreak(Number(group.streak ?? 0));

      const [expenses, users, chores, assignments] = await Promise.all([
        api.fetchExpenses(group.id),
        api.fetchUsers(),
        api.fetchChores(group.id),
        api.fetchChoreAssignments(),
      ]);

      const summedTotal = expenses.reduce((sum, expense) => {
        return sum + Number(expense.total_amount ?? 0);
      }, 0);

      setTotalExpenses(summedTotal);

      const groupUserIds = new Set(membersInGroup.map((member) => member.user_id));

      const roleByUserId = new Map(
        membersInGroup.map((member) => [member.user_id, member.role])
      );

      // points are stored on group_members rows, not on the users table
      const pointsByUserId = new Map(
        membersInGroup.map((member) => [member.user_id, member.points])
      );

      const mappedLeaders: Leader[] = users
        .filter((user) => groupUserIds.has(user.id))
        .map((user) => ({
          id: String(user.id),
          name: user.full_name,
          username: user.username,
          subtitle: roleByUserId.get(user.id) === "admin" ? "Admin" : "Member",
          points: Number(pointsByUserId.get(user.id) ?? 0),
        }))
        .sort((a, b) =>
          b.points !== a.points
            ? b.points - a.points
            : a.name.localeCompare(b.name) // alphabetical tiebreaker
        );

      setLeaders(mappedLeaders);

      const mappedUtilities: Utility[] = expenses
        .filter(
          (expense) =>
            Number(expense.group_id) === Number(group.id) &&
            String(expense.category || "").toLowerCase() === TRACKED_UTILITY_CATEGORY
        )
        .sort((a, b) => Number(b.id) - Number(a.id))
        .slice(0, 4)
        .map((expense) => {
          const visual = getUtilityVisual(expense.category);

          return {
            id: String(expense.id),
            name: expense.title || formatCategoryName(expense.category),
            subtitle: formatCategoryName(expense.category),
            amount: Number(expense.total_amount ?? 0),
            trend: undefined,
            icon: visual.icon,
            iconBg: visual.iconBg,
            iconColor: visual.iconColor,
          };
        });

      setUtilities(mappedUtilities);

      const groupChoreIds = new Set(
        chores
          .filter((chore) => Number(chore.group_id) === Number(group.id))
          .map((chore) => chore.id)
      );

      const choreTitleById = new Map(chores.map((chore) => [chore.id, chore.title]));
      const userNameById = new Map(users.map((user) => [user.id, user.full_name]));

      const groupAssignments = assignments.filter((assignment) =>
        groupChoreIds.has(assignment.chore_id)
      );

      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dueSoonEnd = new Date(startOfToday);
      dueSoonEnd.setDate(dueSoonEnd.getDate() + DUE_SOON_WINDOW_DAYS);

      const overdueItems: ChorePulseItem[] = [];
      const dueSoonItems: ChorePulseItem[] = [];

      groupAssignments.forEach((assignment) => {
        const dueDate = new Date(assignment.due_date);
        if (Number.isNaN(dueDate.getTime())) {
          return;
        }

        const isCompleted = assignment.status === "completed";
        const isOverdue =
          assignment.status === "overdue" ||
          (!isCompleted && dueDate < startOfToday);

        const item: ChorePulseItem = {
          id: String(assignment.id),
          title: choreTitleById.get(assignment.chore_id) || `Chore #${assignment.chore_id}`,
          assignee: userNameById.get(assignment.assigned_to) || `User #${assignment.assigned_to}`,
          dueDate: assignment.due_date,
          type: isOverdue ? "overdue" : "due_soon",
        };

        if (isOverdue) {
          overdueItems.push(item);
          return;
        }

        if (!isCompleted && dueDate >= startOfToday && dueDate <= dueSoonEnd) {
          dueSoonItems.push(item);
        }
      });

      overdueItems.sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );
      dueSoonItems.sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );

      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEndExclusive = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const monthAssignments = groupAssignments.filter((assignment) => {
        const dueDate = new Date(assignment.due_date);
        return dueDate >= monthStart && dueDate < monthEndExclusive;
      });

      const completedCount = monthAssignments.filter(
        (assignment) => assignment.status === "completed"
      ).length;
      const totalCount = monthAssignments.length;
      const completionRate =
        totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      const distributionSource =
        monthAssignments.length > 0 ? monthAssignments : groupAssignments;
      const assignmentCountByUser = new Map<number, number>();

      distributionSource.forEach((assignment) => {
        assignmentCountByUser.set(
          assignment.assigned_to,
          (assignmentCountByUser.get(assignment.assigned_to) || 0) + 1
        );
      });

      const distribution: ChoreDistributionSlice[] = Array.from(
        assignmentCountByUser.entries()
      )
        .sort((a, b) => b[1] - a[1])
        .map(([userId, count], index) => ({
          memberName: userNameById.get(userId) || `User #${userId}`,
          count,
          color: DISTRIBUTION_COLORS[index % DISTRIBUTION_COLORS.length],
        }));

      setChorePulse({
        overdueCount: overdueItems.length,
        dueSoonCount: dueSoonItems.length,
        completionRate,
        completedCount,
        totalCount,
        monthLabel: getMonthLabel(now),
        urgentItems: [...overdueItems, ...dueSoonItems],
        distribution,
      });
    } catch (error) {
      console.error("Failed to load summary data:", error);
      setTotalExpenses(0);
      setCurrentStreak(0);
      setLeaders([]);
      setUtilities([]);
      setChorePulse({
        overdueCount: 0,
        dueSoonCount: 0,
        completionRate: 0,
        completedCount: 0,
        totalCount: 0,
        monthLabel: getMonthLabel(new Date()),
        urgentItems: [],
        distribution: [],
      });
    }
  }, []);

  useEffect(() => {
    loadSummaryData();
  }, [loadSummaryData]);

  return (
    <>
      <div className="flex gap-5 items-stretch">
        <HouseHarmonyCard
          overdueCount={chorePulse.overdueCount}
          dueSoonCount={chorePulse.dueSoonCount}
          completionRate={chorePulse.completionRate}
          completedCount={chorePulse.completedCount}
          totalCount={chorePulse.totalCount}
          monthLabel={chorePulse.monthLabel}
          urgentItems={chorePulse.urgentItems}
          distribution={chorePulse.distribution}
        />
        <StatsPanel
          totalExpenses={totalExpenses}
          choresDoneOnTime={currentStreak}
        />
      </div>

      <div className="flex gap-6 items-start">
        <Leaderboard leaders={leaders} />
        <UtilitiesTracker utilities={utilities} />
      </div>
    </>
  );
}