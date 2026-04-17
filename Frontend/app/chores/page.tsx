"use client";

import RotationAlert from "../../components/chores/NextChoreAlert";
import AddChoreCard from "../../components/chores/AddChoreCard";
import ChoreColumn from "../../components/chores/ChoreColumn";
import { useState, useEffect, useRef } from "react";
import * as api from "../../lib/apiClient";
import type { Chore } from "../../components/chores/ChoreCard";
import { notifyPointsUpdated, resolveActiveMembership } from "@/lib/activeMembership";

/**
 * returns how many whole days remain until `dueDate`
 * negative values mean the chore is overdue
 * 0 means due today (less than 24 h away)
 */
function computeDaysLeft(dueDate: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffMs = new Date(dueDate).getTime() - Date.now();
  // ceil keeps "23h 59m left" from rounding down to 0 days
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
    // use the real due date when we have one — fall back to undefined
    // so the card skips the label rather than showing something made up
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
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [undoToast, setUndoToast] = useState<{
    assignmentId: number;
    choreId: string;
    choreTitle: string;
    action: "complete" | "skip";
    pointsAwarded: number;
  } | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // refs let the unmount cleanup read the latest values without getting caught by stale closures
  const pendingActionRef = useRef<{
    assignmentId: number;
    choreId: string;
    action: "complete" | "skip";
    pointsAwarded: number;
    assignedUserId: number;
    previousAssignments: api.ChoreAssignmentBackend[];
    previousChores: Chore[];
  } | null>(null);
  const groupMembersRef = useRef<api.GroupMemberBackend[]>([]);

  const [nextChoreTitle, setNextChoreTitle] = useState("No chores assigned");
  const [nextChoreDueText, setNextChoreDueText] = useState("You're all caught up.");
  const [nextChoreAssignee, setNextChoreAssignee] = useState("");

  const loadChoresAndAssignments = async () => {
    setLoading(true);
    setError("");

    try {
      const context = await resolveActiveMembership();
      const group = context.activeGroup;
      const membersInGroup = context.membersInActiveGroup;
      const userId = context.currentUser.id;
      setCurrentUserId(userId);

      const [chores, allAssignments, users] = await Promise.all([
        api.fetchChores(group.id),
        api.fetchChoreAssignments(),
        api.fetchUsers(),
      ]);

      // build a lookup of each chore's earliest pending due date across all group members —
      // this is what drives the "X days left" label on each card
      const groupChoreIdSet = new Set(chores.map((c) => Number(c.id)));
      const groupUserIdSet = new Set(
        membersInGroup.map((m) => m.user_id)
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

      // track each chore's current status so every card reflects
      // what's actually in the backend, not just the current user's view
      const choreUserStatusMap = new Map<number, string>();
      for (const assignment of allAssignments) {
        if (groupChoreIdSet.has(Number(assignment.chore_id))) {
          choreUserStatusMap.set(Number(assignment.chore_id), assignment.status);
        }
      }

      // include every chore in the group, not just the ones assigned to the current user
      const mapped = chores.map((chore) =>
        mapBackendChoreToUI(
          chore,
          choreEarliestDueMap.get(Number(chore.id)),
          choreUserStatusMap.get(Number(chore.id))
        )
      );
      setAllChores(mapped);
      setAssignments(allAssignments);
      setGroupMembers(membersInGroup);
      setUsers(users);
      setCurrentGroupId(group.id);

      // hang onto the current user's member record so we can read and update
      // their points total when a chore is completed
      const member = membersInGroup.find((m) => m.user_id === userId) ?? null;
      setCurrentMember(member);

      // filter down to active assignments for everyone in the group —
      // reuses the id sets already built above
      // we look at all roommates here so overdue chores from anyone
      // show up in the right order in the next chore alert
      const userAssignments = allAssignments
        .filter((assignment) => groupUserIdSet.has(assignment.assigned_to))
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

  // keep the ref in sync so the unmount cleanup always has the latest member list
  useEffect(() => {
    groupMembersRef.current = groupMembers;
  }, [groupMembers]);

  // on unmount, cancel the undo timer and flush any pending action to the backend —
  // this ensures navigating away doesn't leave things in a half-written state
  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      const action = pendingActionRef.current;
      if (action) {
        const status = action.action === "complete" ? "completed" : "skipped";
        api.updateChoreAssignment(action.assignmentId, status);
        if (action.action === "complete" && action.pointsAwarded > 0) {
          const member = groupMembersRef.current.find(
            (m) => m.user_id === action.assignedUserId
          );
          if (member) {
            api.updateGroupMember(member.id, {
              points: member.points + action.pointsAwarded,
            });
          }
        }
        pendingActionRef.current = null;
      }
    };
  }, []);

  // writes the deferred action to the backend — called once the undo window closes
  const commitPendingAction = async () => {
    const action = pendingActionRef.current;
    if (!action) return;
    pendingActionRef.current = null;

    const status = action.action === "complete" ? "completed" : "skipped";
    await api.updateChoreAssignment(action.assignmentId, status);

    if (action.action === "complete" && action.pointsAwarded > 0) {
      const member = groupMembers.find((m) => m.user_id === action.assignedUserId);
      if (member) {
        const updatedMember = await api.updateGroupMember(member.id, {
          points: member.points + action.pointsAwarded,
        });
        if (updatedMember && currentUserId !== null && member.user_id === currentUserId) {
          setCurrentMember(updatedMember);
          notifyPointsUpdated(Number(updatedMember.points ?? 0));
        }
      }
    }
  };

  const scheduleCommit = () => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(async () => {
      setUndoToast(null);
      await commitPendingAction();
      await loadChoresAndAssignments();
    }, 10000);
  };

  // cancels the timer and snaps state back to before the action —
  // since we haven't written to the backend yet, there's nothing to undo there
  const handleUndo = () => {
    if (!undoToast || !pendingActionRef.current) return;
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    const pendingAction = pendingActionRef.current;

    if (
      pendingAction.action === "complete" &&
      currentUserId !== null &&
      pendingAction.assignedUserId === currentUserId &&
      currentMember
    ) {
      notifyPointsUpdated(Number(currentMember.points ?? 0));
    }

    const { previousAssignments, previousChores } = pendingActionRef.current;
    setAssignments(previousAssignments);
    setAllChores(previousChores);
    pendingActionRef.current = null;
    setUndoToast(null);
  };

  const dismissUndoToast = async () => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    await commitPendingAction();
    setUndoToast(null);
    await loadChoresAndAssignments();
  };

  const handleChoreComplete = async (choreId: string) => {
    const assignment = assignments.find(
      (a) =>
        Number(a.chore_id) === Number(choreId) &&
        a.status.toLowerCase() !== "completed"
    );

    if (!assignment) {
      setError("Could not find the chore assignment to complete.");
      return;
    }

    const completedChore = allChores.find((c) => c.id === choreId);
    const pointsAwarded = completedChore?.points ?? 0;

    // stash the action details in a ref so the deferred write and unmount cleanup can both reach it
    pendingActionRef.current = {
      assignmentId: assignment.id,
      choreId,
      action: "complete",
      pointsAwarded,
      assignedUserId: assignment.assigned_to,
      previousAssignments: assignments,
      previousChores: allChores,
    };

    // update the UI immediately — the backend write is still pending
    const optimisticAssignment = {
      ...assignment,
      status: "completed",
      completed_at: new Date().toISOString(),
    };
    setAssignments(assignments.map((a) => (a.id === assignment.id ? optimisticAssignment : a)));
    setAllChores(allChores.map((chore) =>
      chore.id === choreId ? { ...chore, status: "complete" } : chore
    ));

    setUndoToast({
      assignmentId: assignment.id,
      choreId,
      choreTitle: completedChore?.title ?? "Chore",
      action: "complete",
      pointsAwarded,
    });

    if (
      currentMember &&
      currentUserId !== null &&
      assignment.assigned_to === currentUserId &&
      pointsAwarded > 0
    ) {
      notifyPointsUpdated(Number(currentMember.points + pointsAwarded));
    }

    scheduleCommit();
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

    const skippedChore = allChores.find((c) => c.id === choreId);

    // same pattern as complete — stash in ref so both the timer and unmount can finalize it
    pendingActionRef.current = {
      assignmentId: assignment.id,
      choreId,
      action: "skip",
      pointsAwarded: 0,
      assignedUserId: assignment.assigned_to,
      previousAssignments: assignments,
      previousChores: allChores,
    };

    // update the UI immediately — the backend write is still pending
    const optimisticAssignment = { ...assignment, status: "skipped" };
    setAssignments(assignments.map((a) => (a.id === assignment.id ? optimisticAssignment : a)));
    setAllChores(allChores.map((chore) =>
      chore.id === choreId ? { ...chore, status: "skipped" } : chore
    ));

    setUndoToast({
      assignmentId: assignment.id,
      choreId,
      choreTitle: skippedChore?.title ?? "Chore",
      action: "skip",
      pointsAwarded: 0,
    });
    scheduleCommit();
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
      {/* floating toast that gives the user a chance to undo before the write goes through */}
      {undoToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-on-surface text-surface px-5 py-3.5 rounded-2xl shadow-xl animate-fade-in">
          <span className="material-symbols-outlined text-base">
            {undoToast.action === "complete" ? "check_circle" : "block"}
          </span>
          <span className="text-sm font-medium">
            <span className="font-bold">{undoToast.choreTitle}</span>
            {undoToast.action === "complete" ? " marked complete" : " skipped"}
          </span>
          <button
            onClick={handleUndo}
            className="ml-2 text-sm font-bold underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            Undo
          </button>
          <button
            onClick={dismissUndoToast}
            className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}
    </>
  );
}