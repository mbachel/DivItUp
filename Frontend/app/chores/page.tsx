"use client";

import TopBar from "@/components/TopBar";
import SideNav from "../../components/SideNav";
import BottomNav from "../../components/BottomNav";
import RotationAlert from "../../components/chores/RotationAlert";
import StreakCard from "../../components/chores/StreakCard";
import ChoreColumn from "../../components/chores/ChoreColumn";
import EpicTaskCard from "../../components/chores/EpicTaskCard";
import GroupGoalCard from "../../components/chores/GroupGoalCard";
import { useState, useEffect } from "react";
import * as api from "../../lib/apiClient";
import type { Chore } from "../../components/chores/ChoreCard";

// TODO: Replace with actual auth context/hook
const CURRENT_GROUP_ID = 1;

/**
 * Convert backend ChoreBackend to UI Chore type.
 * Backend provides: id, group_id, title, frequency
 * UI needs: id, title, points, dueLabel, assignee, status, (optional: daysLeft)
 */
function mapBackendChoreToUI(backendChore: api.ChoreBackend): Chore {
  // Map frequency to reasonable points
  const pointsMap: Record<string, number> = {
    daily: 50,
    weekly: 150,
    monthly: 300,
    one_time: 100,
  };

  return {
    id: String(backendChore.id),
    title: backendChore.title,
    points: pointsMap[backendChore.frequency] || 100,
    dueLabel:
      backendChore.frequency === "daily"
        ? "Due Today"
        : backendChore.frequency === "weekly"
          ? "Due This Week"
          : "Due This Month",
    assignee: "Unassigned", // TODO: get assignee from ChoreAssignment
    status: "pending", // TODO: get status from ChoreAssignment
    daysLeft: 1, // TODO: calculate from due date
  };
}

export default function ChoresPage() {
  const [allChores, setAllChores] = useState<Chore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============ Load chores on mount ============
  useEffect(() => {
    const loadChores = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await api.fetchChores(CURRENT_GROUP_ID);
        const mapped = data.map(mapBackendChoreToUI);
        setAllChores(mapped);
      } catch (err) {
        setError("Failed to load chores. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadChores();
  }, []);

  // ============ Group chores by frequency ============
  const dailyChores = allChores.filter(
    (c) => c.dueLabel === "Due Today"
  );
  const weeklyChores = allChores.filter(
    (c) => c.dueLabel === "Due This Week"
  );
  const monthlyChores = allChores.filter(
    (c) => c.dueLabel === "Due This Month"
  );

  if (loading) {
    return (
      <div className="bg-surface text-on-surface min-h-screen">
        <SideNav />
        <main className="md:ml-64 min-h-screen pb-24 md:pb-0">
          <TopBar />
          <div className="p-6 md:p-8 text-center text-outline">
            Loading chores...
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <SideNav />
      <main className="md:ml-64 min-h-screen pb-24 md:pb-0">
        <TopBar />

        <div className="p-6 md:p-8 space-y-8">

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

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
              taskCount={dailyChores.length}
              chores={dailyChores}
            />

            {/* Weekly column */}
            <ChoreColumn
              title="Weekly"
              taskCount={weeklyChores.length}
              chores={weeklyChores}
            />

            {/* Monthly column */}
            <ChoreColumn
              title="Monthly"
              taskCount={monthlyChores.length}
              chores={monthlyChores}
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
