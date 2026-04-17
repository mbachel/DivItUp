"use client";

import { useCallback, useEffect, useState } from "react";
import HouseHarmonyCard from "../../components/summary/HouseHarmonyCard";
import StatsPanel from "../../components/summary/StatsPanel";
import Leaderboard from "../../components/summary/Leaderboard";
import UtilitiesTracker from "../../components/summary/UtilitiesTracker";
import type { Leader } from "../../components/summary/Leaderboard";
import type { Utility } from "../../components/summary/UtilitiesTracker";
import * as api from "../../lib/apiClient";

const CURRENT_GROUP_INVITE_CODE = "MAPLE26MOD";
const TRACKED_UTILITY_CATEGORY = "utilities";

const HARMONY_METRICS = [
  { label: "Chore Speed", value: "Fast", color: "#00606e", barColor: "#00606e", barWidth: "80%" },
  { label: "Debt Settling", value: "Instant", color: "#632ce5", barColor: "#632ce5", barWidth: "95%" },
  { label: "Communication", value: "Active", color: "#844800", barColor: "#844800", barWidth: "65%" },
  { label: "Mood Pulse", value: "Peaceful", color: "#ba1a1a", barColor: "#ba1a1a", barWidth: "55%" },
];

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

  const loadSummaryData = useCallback(async () => {
    try {
      const group = await api.fetchGroupByInviteCode(CURRENT_GROUP_INVITE_CODE);

      if (!group) {
        console.error(`Group with invite code ${CURRENT_GROUP_INVITE_CODE} not found`);
        setTotalExpenses(0);
        setCurrentStreak(0);
        setLeaders([]);
        setUtilities([]);
        return;
      }

      setCurrentStreak(Number(group.streak ?? 0));

      const [expenses, groupMembers, users] = await Promise.all([
        api.fetchExpenses(group.id),
        api.fetchGroupMembers(),
        api.fetchUsers(),
      ]);

      const summedTotal = expenses.reduce((sum, expense) => {
        return sum + Number(expense.total_amount ?? 0);
      }, 0);

      setTotalExpenses(summedTotal);

      const membersInGroup = groupMembers.filter(
        (member) => member.group_id === group.id
      );

      const groupUserIds = new Set(membersInGroup.map((member) => member.user_id));

      const roleByUserId = new Map(
        membersInGroup.map((member) => [member.user_id, member.role])
      );

      // Points live on group_members, not on users
      const pointsByUserId = new Map(
        membersInGroup.map((member) => [member.user_id, member.points])
      );

      const mappedLeaders: Leader[] = users
        .filter((user) => groupUserIds.has(user.id))
        .map((user) => ({
          id: String(user.id),
          name: user.full_name,
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
    } catch (error) {
      console.error("Failed to load summary data:", error);
      setTotalExpenses(0);
      setCurrentStreak(0);
      setLeaders([]);
      setUtilities([]);
    }
  }, []);

  useEffect(() => {
    loadSummaryData();
  }, [loadSummaryData]);

  return (
    <>
      <div className="flex gap-5 items-stretch">
        <HouseHarmonyCard
          score={85}
          percentChange={12}
          metrics={HARMONY_METRICS}
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