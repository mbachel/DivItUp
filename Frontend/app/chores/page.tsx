"use client";

import RotationAlert from "../../components/chores/NextChoreAlert";
import StreakCard from "../../components/chores/StreakCard";
import ChoreColumn from "../../components/chores/ChoreColumn";
import GroupGoalCard from "../../components/chores/GroupGoalCard";
import { useState, useEffect } from "react";
import * as api from "../../lib/apiClient";
import type { Chore } from "../../components/chores/ChoreCard";

const CURRENT_GROUP_INVITE_CODE = "MAPLE26MOD";
const CURRENT_USER_ID = 1002;

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

function formatDueText(dueDate: string): string {
  const due = new Date(dueDate);
  const now = new Date();

  const isPast = due.getTime() < now.getTime();

  const timeText = due.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  const dateText = due.toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  if (isPast) {
    return `Overdue since ${dateText} at ${timeText}`;
  }

  const sameDay = due.toDateString() === now.toDateString();

  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = due.toDateString() === tomorrow.toDateString();

  if (sameDay) return `Due today at ${timeText}`;
  if (isTomorrow) return `Due tomorrow at ${timeText}`;

  return `Due ${dateText} at ${timeText}`;
}

export default function ChoresPage() {
  const [allChores, setAllChores] = useState<Chore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assignments, setAssignments] = useState<api.ChoreAssignmentBackend[]>([]);

  const [nextChoreTitle, setNextChoreTitle] = useState("No chores assigned");
  const [nextChoreDueText, setNextChoreDueText] = useState("You're all caught up.");
  const [nextChoreAssignee, setNextChoreAssignee] = useState("");

  const loadChoresAndAssignments = async () => {
    setLoading(true);
    setError("");

    try {
      const group = await api.fetchGroupByInviteCode(CURRENT_GROUP_INVITE_CODE);

      if (!group) {
        throw new Error(
          `Group with invite code ${CURRENT_GROUP_INVITE_CODE} not found`
        );
      }

      const [chores, allAssignments, groupMembers, users] = await Promise.all([
        api.fetchChores(group.id),
        api.fetchChoreAssignments(),
        api.fetchGroupMembers(),
        api.fetchUsers(),
      ]);

      const mapped = chores.map(mapBackendChoreToUI);
      setAllChores(mapped);
      setAssignments(allAssignments);

      const groupUserIds = new Set(
        groupMembers
          .filter((member) => member.group_id === group.id)
          .map((member) => member.user_id)
      );

      const groupChoreIds = new Set(
        chores.map((chore) => Number(chore.id))
      );

      const userAssignments = allAssignments
        .filter((assignment) => groupUserIds.has(assignment.assigned_to))
        .filter((assignment) => assignment.assigned_to === CURRENT_USER_ID)
        .filter((assignment) => groupChoreIds.has(Number(assignment.chore_id)))
        .filter((assignment) => assignment.status.toLowerCase() !== "completed");

      const overdueAssignments = userAssignments
        .filter((assignment) => new Date(assignment.due_date).getTime() < Date.now())
        .sort(
          (a, b) =>
            new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        );

      const upcomingAssignments = userAssignments
        .filter((assignment) => new Date(assignment.due_date).getTime() >= Date.now())
        .sort(
          (a, b) =>
            new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        );

      const nextAssignment = overdueAssignments[0] ?? upcomingAssignments[0];

      if (nextAssignment) {
        const matchingChore = chores.find(
          (chore) => Number(chore.id) === Number(nextAssignment.chore_id)
        );

        const matchingUser = users.find(
          (user) => user.id === nextAssignment.assigned_to
        );

        setNextChoreTitle(matchingChore?.title ?? "Upcoming chore");
        setNextChoreDueText(formatDueText(nextAssignment.due_date));
        setNextChoreAssignee(
          matchingUser?.full_name ?? matchingUser?.username ?? ""
        );
      } else {
        setNextChoreTitle("No chores assigned");
        setNextChoreDueText("You're all caught up.");
        setNextChoreAssignee("");
      }
    } catch (err) {
      setError("Failed to load chores. Please try again.");
      console.error(err);
      setNextChoreTitle("Unable to load next chore");
      setNextChoreDueText("Please try refreshing the page.");
      setNextChoreAssignee("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChoresAndAssignments();
  }, []);

  const handleChoreComplete = async (choreId: string) => {
    // Find the assignment for this chore for the current user
    const assignment = assignments.find(
      (a) =>
        Number(a.chore_id) === Number(choreId) &&
        a.assigned_to === CURRENT_USER_ID &&
        a.status.toLowerCase() !== "completed"
    );

    if (!assignment) {
      setError("Could not find the chore assignment to complete.");
      return;
    }

    try {
      const updated = await api.updateChoreAssignment(assignment.id, "completed");

      if (updated) {
        // Update local state immediately so the chore stays visible with done state
        setAssignments(
          assignments.map((a) => (a.id === assignment.id ? updated : a))
        );

        // Update the chore's status to "complete" to show strikethrough
        setAllChores(
          allChores.map((chore) =>
            chore.id === choreId ? { ...chore, status: "complete" } : chore
          )
        );

        // Wait for animation to complete
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Then reload to clean up and update next chore alert
        await loadChoresAndAssignments();
      } else {
        setError("Failed to mark chore as complete. Please try again.");
      }
    } catch (err) {
      setError("Error completing chore.");
      console.error(err);
    }
  };

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
          choreTitle={nextChoreTitle}
          dueText={nextChoreDueText}
          assigneeName={nextChoreAssignee}
        />
        <StreakCard streakDays={14} cycle={4} totalCycles={12} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_280px] gap-6 items-start">
        <ChoreColumn
          title="Daily"
          taskCount={dailyChores.length}
          chores={dailyChores}
          onComplete={handleChoreComplete}
        />

        <ChoreColumn
          title="Weekly"
          taskCount={weeklyChores.length}
          chores={weeklyChores}
          onComplete={handleChoreComplete}
        />

        <ChoreColumn
          title="Monthly"
          taskCount={monthlyChores.length}
          chores={monthlyChores}
          onComplete={handleChoreComplete}
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