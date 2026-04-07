"use client";

import SideNav from "../../components/SideNav";
import BottomNav from "../../components/BottomNav";
import HouseHarmonyCard from "../../components/summary/HouseHarmonyCard";
import StatsPanel from "../../components/summary/StatsPanel";
import HearthLeaders from "../../components/summary/Leaders";
import UtilitiesTracker from "../../components/summary/UtilitiesTracker";
import type { Leader } from "../../components/summary/Leaders";
import type { Utility } from "../../components/summary/UtilitiesTracker";

const HARMONY_METRICS = [
  { label: "Chore Speed",    value: "Fast",     color: "#00606e", barColor: "#00606e", barWidth: "80%" },
  { label: "Debt Settling",  value: "Instant",  color: "#632ce5", barColor: "#632ce5", barWidth: "95%" },
  { label: "Communication",  value: "Active",   color: "#844800", barColor: "#844800", barWidth: "65%" },
  { label: "Mood Pulse",     value: "Peaceful", color: "#ba1a1a", barColor: "#ba1a1a", barWidth: "55%" },
];

const LEADERS: Leader[] = [
  { id: "1", name: "Maya Singh",       subtitle: "Top Chore Contributor", points: 840, isCurrentUser: false },
  { id: "2", name: "Jordan Lee",       subtitle: "Grocery Guru",          points: 720, isCurrentUser: false },
  { id: "3", name: "Alex Rivera (You)", subtitle: "Bill Splitting Ace",   points: 695, isCurrentUser: true  },
];

const UTILITIES: Utility[] = [
  {
    id: "1", name: "Electricity",   subtitle: "Due in 4 days",
    amount: 142.10, trend: 5,
    icon: "bolt",        iconBg: "#dbeafe", iconColor: "#1d4ed8",
  },
  {
    id: "2", name: "Fiber Internet", subtitle: "Paid Auto",
    amount: 79.99,  trend: undefined,
    icon: "wifi",        iconBg: "#ede9fe", iconColor: "#7c3aed",
  },
  {
    id: "3", name: "Water",          subtitle: "Monthly avg",
    amount: 45.30,  trend: -12,
    icon: "water_drop",  iconBg: "#dbeafe", iconColor: "#0369a1",
  },
  {
    id: "4", name: "Subs Bundle",    subtitle: "Netflix + Spotify",
    amount: 28.99,  trend: undefined,
    icon: "subscriptions", iconBg: "#fef3c7", iconColor: "#b45309",
  },
];

export default function SummaryPage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <SideNav />

      <main className="md:ml-64 min-h-screen pb-24 md:pb-0">
        {/* Top bar */}
        <header className="flex justify-between items-center px-6 py-4 bg-surface sticky top-0 z-40 border-b border-outline-variant/20">
          <div className="md:hidden">
            <span className="text-xl font-extrabold text-[#00606e] font-headline">H&amp;H</span>
          </div>

          <h1 className="hidden md:block text-2xl font-extrabold text-on-surface font-headline">
            Group Summary
          </h1>

          <div className="flex items-center gap-4">
            {/* Wallet */}
            <div className="flex items-center gap-2 bg-surface-container-low px-3 py-2 rounded-full">
              <span className="material-symbols-outlined text-outline text-base">
                account_balance_wallet
              </span>
            </div>
            {/* Points */}
            <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-2 rounded-full">
              <span
                className="material-symbols-outlined text-amber-500 text-base"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                stars
              </span>
            </div>
            {/* User info */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-on-surface">Alex Rivera</p>
                <p className="text-xs text-outline">1,240 Hearth Points</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                AR
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-8 space-y-8">

          {/* Top row: harmony card + stats panel */}
          <div className="flex gap-5 items-stretch">
            <HouseHarmonyCard
              score={85}
              percentChange={12}
              metrics={HARMONY_METRICS}
            />
            <StatsPanel
              totalExpenses={2480.00}
              choresDoneOnTime={42}
            />
          </div>

          {/* Bottom row: leaders + utilities */}
          <div className="flex gap-6 items-start">
            <HearthLeaders
              leaders={LEADERS}
              onViewHistory={() => console.log("View history")}
            />
            <UtilitiesTracker utilities={UTILITIES} />
          </div>

        </div>
      </main>

      <BottomNav />
    </div>
  );
}
