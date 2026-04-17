"use client";

import RotationAlert from "../../components/chores/NextChoreAlert";
import AddChoreCard from "../../components/chores/AddChoreCard";
import ChoreColumn from "../../components/chores/ChoreColumn";
import { useState, useEffect } from "react";
import * as api from "../../lib/apiClient";
import type { Chore } from "../../components/chores/ChoreCard";

const CURRENT_GROUP_INVITE_CODE = "MAPLE26MOD";
const CURRENT_USER_ID = 1002;

/**
 * Returns how many whole days remain until `dueDate`.
 * Negative values mean the chore is overdue.
 * 0 means due today (less than 24 h away).
 */
function computeDaysLeft(dueDate: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffMs = new Date(dueDate).getTime() - Date.now();
  // ceil so that "23 h 59 m left" shows as 1 day, not 0
  return Math.ceil(diffMs / msPerDay);
}

function mapBackendChoreToUI(
  backendChore: api.ChoreBackend,
  dueDate?: string,
  assignmentStatus?: string
): Chore {
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
          : backendChore.frequency === "one_time"
            ? "One Time"
            : "Due This Month",
    assignee: "Unassigned",
    status:
      assignmentStatus === "completed"
        ? "complete"
        : assignmentStatus === "skipped"
          ? "skipped"
          : "pending",
    // Use the real due date from the assignment when available; fall
    // back to undefined so ChoreCard omits the label rather than
    // showing a stale/fake number.
    daysLeft: dueDate !== undefined ? computeDaysLeft(dueDate) : undefined,
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
  const [currentMember, setCurrentMember] = useState<api.GroupMemberBackend | null>(null);
  const [groupMembers, setGroupMembers] = useState<api.GroupMemberBackend[]>([]);
  const [users, setUsers] = useState<api.UserBackend[]>([]);
  const [currentGroupId, setCurrentGroupId] = useState<number | null>(null);

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

      // Build a map of chore_id → earliest non-completed due date across
      // all members of this group.  This drives the "X days left" label
      // on each ChoreCard regardless of which specific user is assigned.
      const groupChoreIdSet = new Set(chores.map((c) => Number(c.id)));
      const groupUserIdSet = new Set(
        groupMembers
          .filter((m) => m.group_id === group.id)
          .map((m) => m.user_id)
      );

      const choreEarliestDueMap = new Map<number, string>();
      for (const assignment of allAssignments) {
        if (
          !groupChoreIdSet.has(Number(assignment.chore_id)) ||
          !groupUserIdSet.has(assignment.assigned_to) ||
          assignment.status.toLowerCase() === "completed"
        ) {
          continue;
        }

        const choreId = Number(assignment.chore_id);
        const existing = choreEarliestDueMap.get(choreId);

        if (
          existing === undefined ||
          new Date(assignment.due_date).getTime() < new Date(existing).getTime()
        ) {
          choreEarliestDueMap.set(choreId, assignment.due_date);
        }
      }

      // Map chore_id → assignment status for all group chores so every
      // card reflects the real backend state regardless of who is assigned.
      const choreUserStatusMap = new Map<number, string>();
      for (const assignment of allAssignments) {
        if (groupChoreIdSet.has(Number(assignment.chore_id))) {
          choreUserStatusMap.set(Number(assignment.chore_id), assignment.status);
        }
      }

      // Show all chores in the group, not just the current user's
      const mapped = chores.map((chore) =>
        mapBackendChoreToUI(
          chore,
          choreEarliestDueMap.get(Number(chore.id)),
          choreUserStatusMap.get(Number(chore.id))
        )
      );
      setAllChores(mapped);
      setAssignments(allAssignments);
      setGroupMembers(groupMembers.filter((m) => m.group_id === group.id));
      setUsers(users);
      setCurrentGroupId(group.id);

      // Store the current user's group member record so handleChoreComplete
      // can read their current points total and award new ones.
      const member = groupMembers.find(
        (m) => m.group_id === group.id && m.user_id === CURRENT_USER_ID
      ) ?? null;
      setCurrentMember(member);

      // Narrow to assignments for the current user within this group
      // (reuse the sets already built above for the due-date map).
      const userAssignments = allAssignments
        .filter((assignment) => groupUserIdSet.has(assignment.assigned_to))
        .filter((assignment) => assignment.assigned_to === CURRENT_USER_ID)
        .filter((assignment) => groupChoreIdSet.has(Number(assignment.chore_id)))
        .filter((assignment) =>
          assignment.status.toLowerCase() !== "completed" &&
          assignment.status.toLowerCase() !== "skipped"
        );

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

        // Award points — look up the chore's point value and add it to
        // the current user's group_members points total.
        const completedChore = allChores.find((c) => c.id === choreId);
        if (completedChore && currentMember) {
          const newPoints = (currentMember.points ?? 0) + completedChore.points;
          const updatedMember = await api.updateGroupMember(currentMember.id, {
            points: newPoints,
          });
          // Keep local currentMember in sync so rapid completions accumulate
          // correctly without waiting for the full reload.
          if (updatedMember) setCurrentMember(updatedMember);
        }

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

  const handleChoreSkip = async (choreId: string) => {
    const assignment = assignments.find(
      (a) =>
        Number(a.chore_id) === Number(choreId) &&
        a.status.toLowerCase() !== "completed" &&
        a.status.toLowerCase() !== "skipped"
    );

    if (!assignment) {
      setError("Could not find the chore assignment to skip.");
      return;
    }

    try {
      const updated = await api.updateChoreAssignment(assignment.id, "skipped");

      if (updated) {
        setAssignments(
          assignments.map((a) => (a.id === assignment.id ? updated : a))
        );
        setAllChores(
          allChores.map((chore) =>
            chore.id === choreId ? { ...chore, status: "skipped" } : chore
          )
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await loadChoresAndAssignments();
      } else {
        setError("Failed to skip chore. Please try again.");
      }
    } catch (err) {
      setError("Error skipping chore.");
      console.error(err);
    }
  };

  const dailyChores = allChores.filter((c) => c.dueLabel === "Due Today");
  const weeklyChores = allChores.filter((c) => c.dueLabel === "Due This Week");
  const monthlyChores = allChores.filter((c) => c.dueLabel === "Due This Month");
  const oneTimeChores = allChores.filter((c) => c.dueLabel === "One Time");

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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_1fr_260px] gap-4 items-start">
        <ChoreColumn
          title="Daily"
          taskCount={dailyChores.length}
          chores={dailyChores}
          onComplete={handleChoreComplete}
          onSkip={handleChoreSkip}
        />

        <ChoreColumn
          title="Weekly"
          taskCount={weeklyChores.length}
          chores={weeklyChores}
          onComplete={handleChoreComplete}
          onSkip={handleChoreSkip}
        />

        <ChoreColumn
          title="Monthly"
          taskCount={monthlyChores.length}
          chores={monthlyChores}
          onComplete={handleChoreComplete}
          onSkip={handleChoreSkip}
        />

        <ChoreColumn
          title="One Time"
          taskCount={oneTimeChores.length}
          chores={oneTimeChores}
          onComplete={handleChoreComplete}
          onSkip={handleChoreSkip}
        />

        <div className="flex flex-col gap-4">
          {currentGroupId !== null && (
            <AddChoreCard
              groupId={currentGroupId}
              groupMembers={groupMembers}
              users={users}
              onChoreAdded={loadChoresAndAssignments}
              onCreateChore={(title: string, frequency: string) =>
                api.createChore({ group_id: currentGroupId, title, frequency })
              }
              onCreateAssignment={(choreId: number, assignedTo: number, dueDate: string, status: string) =>
                api.createChoreAssignment({
                  chore_id: choreId,
                  assigned_to: assignedTo,
                  due_date: dueDate,
                  status,
                  completed_at: null,
                })
              }
            />
          )}
        </div>
      </div>
    </>
  );
}