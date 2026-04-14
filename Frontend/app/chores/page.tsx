"use client";

import TopBar from "@/components/TopBar";
import SideNav from "../../components/SideNav";
import BottomNav from "../../components/BottomNav";
import RotationAlert from "../../components/chores/RotationAlert";
import StreakCard from "../../components/chores/StreakCard";
import ChoreColumn from "../../components/chores/ChoreColumn";
import EpicTaskCard from "../../components/chores/EpicTaskCard";
import GroupGoalCard from "../../components/chores/GroupGoalCard";
import type { Chore } from "../../components/chores/ChoreCard";

const DAILY_CHORES: Chore[] = [
  { id: "d1", title: "Wash Dinner Dishes",   points: 50,  dueLabel: "Due Today", assignee: "Me",   status: "pending" },
  { id: "d2", title: "Water Indoor Plants",  points: 30,  dueLabel: "Due Today", assignee: "Me",   status: "pending" },
];

const WEEKLY_CHORES: Chore[] = [
  { id: "w1", title: "Vacuum Living Room",   points: 200, dueLabel: "2 Days Left", daysLeft: 2, assignee: "Me",   status: "pending" },
  { id: "w2", title: "Clean Glass Windows",  points: 150, dueLabel: "4 Days Left", daysLeft: 4, assignee: "Emma", status: "inprogress" },
];

const MONTHLY_CHORES: Chore[] = [
  { id: "m1", title: "Replace Air Filters",  points: 100, dueLabel: "12 Days Left", daysLeft: 12, assignee: "Me", status: "pending" },
];

export default function ChoresPage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <SideNav />
         {/* Adding Comments for Clarity */}
      <main className="md:ml-64 min-h-screen pb-24 md:pb-0">
        {/* Top bar */}
        <TopBar />

        <div className="p-6 md:p-8 space-y-8">

          {/* Rotation alert + streak row */}
          <div className="flex gap-5 items-stretch">
            <RotationAlert
              nextPerson="Emma"
              nextChore="Dishwasher"
              rotationDay="Monday"
              rotationTime="8:00 AM"
            />
            <StreakCard streakDays={14} cycle={4} totalCycles={12} />
          </div>

          {/* Three-column chore board + right sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_280px] gap-6 items-start">

            {/* Daily column */}
            <ChoreColumn
              title="Daily"
              taskCount={DAILY_CHORES.length}
              chores={DAILY_CHORES}
            />

            {/* Weekly column */}
            <ChoreColumn
              title="Weekly"
              taskCount={WEEKLY_CHORES.length}
              chores={WEEKLY_CHORES}
            />

            {/* Monthly column */}
            <ChoreColumn
              title="Monthly"
              taskCount={MONTHLY_CHORES.length}
              chores={MONTHLY_CHORES}
            />

            {/* Right sidebar */}
            <div className="flex flex-col gap-4">
              <EpicTaskCard
                title="Deep Clean Kitchen Appliances"
                value={850}
                participants={["Me", "Sarah", "Alex"]}
                extraCount={2}
                onJoin={() => console.log("Joined epic task")}
              />
              <GroupGoalCard
                goalName="Perfect Week"
                daysComplete={6}
                totalDays={7}
              />
            </div>
          </div>

        </div>
      </main>

      <BottomNav />
    </div>
  );
}
