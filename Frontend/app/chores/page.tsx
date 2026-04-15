"use client";

import RotationAlert from "../../components/chores/RotationAlert";
import StreakCard from "../../components/chores/StreakCard";
import ChoreColumn from "../../components/chores/ChoreColumn";
import GroupGoalCard from "../../components/chores/GroupGoalCard";
import { useState, useEffect } from "react";
import * as api from "../../lib/apiClient";
import type { Chore } from "../../components/chores/ChoreCard";

const CURRENT_GROUP_INVITE_CODE = "MAPLE26MOD";

/**
 * Convert backend ChoreBackend to UI Chore type.
 * Backend provides: id, group_id, title, frequency
 * UI needs: id, title, points, dueLabel, assignee, status, (optional: daysLeft)
 */
function mapBackendChoreToUI(backendChore: api.ChoreBackend): Chore {
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
    assignee: "Unassigned",
    status: "pending",
    daysLeft: 1,
  };
}

export default function ChoresPage() {
  const [allChores, setAllChores] = useState<Chore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadChores = async () => {
      setLoading(true);
      setError("");

      try {
        const group = await api.fetchGroupByInviteCode(CURRENT_GROUP_INVITE_CODE);

        if (!group) {
          throw new Error(
            `Group with invite code ${CURRENT_GROUP_INVITE_CODE} not found`
          );
        }

        const data = await api.fetchChores(group.id);
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

  const dailyChores = allChores.filter((c) => c.dueLabel === "Due Today");
  const weeklyChores = allChores.filter((c) => c.dueLabel === "Due This Week");
  const monthlyChores = allChores.filter((c) => c.dueLabel === "Due This Month");

  if (loading) {
    return (
      <div className="text-center text-outline">
        Loading chores...
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-5 items-stretch">
        <RotationAlert
          nextPerson="Emma"
          nextChore="Dishwasher"
          rotationDay="Monday"
          rotationTime="8:00 AM"
        />
        <StreakCard streakDays={14} cycle={4} totalCycles={12} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_280px] gap-6 items-start">
        <ChoreColumn
          title="Daily"
              taskCount={dailyChores.length}
              chores={dailyChores}
            />

            <ChoreColumn
              title="Weekly"
              taskCount={weeklyChores.length}
              chores={weeklyChores}
            />

            <ChoreColumn
              title="Monthly"
              taskCount={monthlyChores.length}
              chores={monthlyChores}
            />

            <div className="flex flex-col gap-4">
              <GroupGoalCard
                goalName="Perfect Week"
                daysComplete={6}
                totalDays={7}
              />
            </div>
      </div>
    </>
  );
}