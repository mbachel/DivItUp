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

const HARMONY_METRICS = [
  { label: "Chore Speed", value: "Fast", color: "#00606e", barColor: "#00606e", barWidth: "80%" },
  { label: "Debt Settling", value: "Instant", color: "#632ce5", barColor: "#632ce5", barWidth: "95%" },
  { label: "Communication", value: "Active", color: "#844800", barColor: "#844800", barWidth: "65%" },
  { label: "Mood Pulse", value: "Peaceful", color: "#ba1a1a", barColor: "#ba1a1a", barWidth: "55%" },
];

const LEADERS: Leader[] = [
  { id: "1", name: "Maya Singh", subtitle: "Top Chore Contributor", points: 840, isCurrentUser: false },
  { id: "2", name: "Jordan Lee", subtitle: "Grocery Guru", points: 720, isCurrentUser: false },
  { id: "3", name: "Alex Rivera (You)", subtitle: "Bill Splitting Ace", points: 695, isCurrentUser: true },
];

const UTILITIES: Utility[] = [
  {
    id: "1",
    name: "Electricity",
    subtitle: "Due in 4 days",
    amount: 142.1,
    trend: 5,
    icon: "bolt",
    iconBg: "#dbeafe",
    iconColor: "#1d4ed8",
  },
  {
    id: "2",
    name: "Fiber Internet",
    subtitle: "Paid Auto",
    amount: 79.99,
    trend: undefined,
    icon: "wifi",
    iconBg: "#ede9fe",
    iconColor: "#7c3aed",
  },
  {
    id: "3",
    name: "Water",
    subtitle: "Monthly avg",
    amount: 45.3,
    trend: -12,
    icon: "water_drop",
    iconBg: "#dbeafe",
    iconColor: "#0369a1",
  },
  {
    id: "4",
    name: "Subs Bundle",
    subtitle: "Netflix + Spotify",
    amount: 28.99,
    trend: undefined,
    icon: "subscriptions",
    iconBg: "#fef3c7",
    iconColor: "#b45309",
  },
];

export default function SummaryPage() {
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);

  const loadSummaryData = useCallback(async () => {
    try {
      const group = await api.fetchGroupByInviteCode(CURRENT_GROUP_INVITE_CODE);

      if (!group) {
        console.error(`Group with invite code ${CURRENT_GROUP_INVITE_CODE} not found`);
        setTotalExpenses(0);
        setCurrentStreak(0);
        return;
      }

      setCurrentStreak(Number(group.streak ?? 0));

      const expenses = await api.fetchExpenses(group.id);

      const summedTotal = expenses.reduce((sum, expense) => {
        return sum + Number(expense.total_amount ?? 0);
      }, 0);

      setTotalExpenses(summedTotal);
    } catch (error) {
      console.error("Failed to load summary data:", error);
      setTotalExpenses(0);
      setCurrentStreak(0);
    }
  }, []);

  useEffect(() => {
    loadSummaryData();
  }, [loadSummaryData]);

  return (
    <>
      {/* Top row: harmony card + stats panel */}
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

      {/* Bottom row: leaders + utilities */}
      <div className="flex gap-6 items-start">
        <Leaderboard
          leaders={LEADERS}
        />
        <UtilitiesTracker utilities={UTILITIES} />
      </div>
    </>
  );
}