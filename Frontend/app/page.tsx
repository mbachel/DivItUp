"use client";

import { useEffect, useMemo, useState } from "react";
import LockedAlert from "@/components/LockedAlert";
import WhoIsNext from "@/components/WhoIsNext";
import SettlementHealth from "@/components/SettlementHealth";
import {
  fetchChores,
  fetchChoreAssignments,
  fetchUsers,
  fetchExpenses,
  fetchExpenseSplits,
  fetchPayments,
} from "@/lib/apiClient";
import { resolveActiveMembership } from "@/lib/activeMembership";

type DashboardChoreEntry = {
  timeLabel: string;
  choreName: string;
  assignee: string;
  isCurrentUser: boolean;
  isPriority?: boolean;
};

type RecentPayment = {
  id: number;
  payerName: string;
  payeeName: string;
  amount: number;
  paidAt: string;
};

type SettlementData = {
  totalOutstanding: number;
  totalSettled: number;
  openSplits: number;
  settledThisWeek: number;
  recentPayments: RecentPayment[];
};

export default function DashboardPage() {
  const [isRestricted, setIsRestricted] = useState(false);
  const [upcomingChores, setUpcomingChores] = useState<DashboardChoreEntry[]>([]);
  const [settlement, setSettlement] = useState<SettlementData>({
    totalOutstanding: 0,
    totalSettled: 0,
    openSplits: 0,
    settledThisWeek: 0,
    recentPayments: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);

        const context = await resolveActiveMembership();
        const currentGroupId = context.activeGroup.id;
        const currentUserId = context.currentUser.id;

        const [chores, assignments, users, expenses, splits, payments] =
          await Promise.all([
            fetchChores(currentGroupId),
            fetchChoreAssignments(),
            fetchUsers(),
            fetchExpenses(currentGroupId),
            fetchExpenseSplits(),
            fetchPayments().catch(() => []),
          ]);

        // ── Restricted check ──────────────────────────────────────
        setIsRestricted(Boolean(context.activeMembership?.is_restricted));

        // ── Chores ────────────────────────────────────────────────
        const groupChoreIds = new Set(chores.map((c) => c.id));

        const upcomingAssignments = assignments
          .filter(
            (a) => groupChoreIds.has(a.chore_id) && a.status === "pending"
          )
          .sort(
            (a, b) =>
              new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
          )
          .slice(0, 4);

        const mapped: DashboardChoreEntry[] = upcomingAssignments.map(
          (assignment, index) => {
            const matchingChore = chores.find((c) => c.id === assignment.chore_id);
            const matchingUser = users.find((u) => u.id === assignment.assigned_to);

            const due = new Date(assignment.due_date);
            const today = new Date();
            const diff = Math.ceil(
              (due.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0)) / 86400000
            );

            const timeLabel =
              diff === 0 ? "TODAY"
              : diff === 1 ? "TOMORROW"
              : diff < 0 ? `OVERDUE BY ${Math.abs(diff)} DAYS`
              : `IN ${diff} DAYS`;

            return {
              timeLabel,
              choreName: matchingChore?.title ?? "Unnamed Chore",
              assignee: matchingUser?.full_name ?? "Unknown User",
              isCurrentUser: assignment.assigned_to === currentUserId,
              isPriority: index === 0,
            };
          }
        );
        setUpcomingChores(mapped);

        // ── Settlement Health ─────────────────────────────────────
        const groupExpenseIds = new Set(expenses.map((e) => e.id));
        const groupSplits = splits.filter((s) =>
          groupExpenseIds.has(s.expense_id)
        );

        // Number() wrapping required — FastAPI DECIMAL columns serialize as strings
        const totalOutstanding = groupSplits
          .filter((s) => !s.is_settled)
          .reduce((sum, s) => sum + Number(s.amount_owed), 0);

        const totalSettled = groupSplits
          .filter((s) => s.is_settled)
          .reduce((sum, s) => sum + Number(s.amount_owed), 0);

        const openSplits = groupSplits.filter((s) => !s.is_settled).length;

        const groupSplitIds = new Set(groupSplits.map((s) => s.id));
        const groupPayments = payments.filter((p) =>
          groupSplitIds.has(p.expense_split_id)
        );

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const settledThisWeek = groupPayments.filter(
          (p) => new Date(p.paid_at) >= oneWeekAgo
        ).length;

        const recentPayments: RecentPayment[] = groupPayments
          .sort(
            (a, b) =>
              new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime()
          )
          .slice(0, 5)
          .map((p) => {
            const payer = users.find((u) => u.id === p.payer_id);
            const payee = users.find((u) => u.id === p.payee_id);
            return {
              id: p.id,
              payerName: payer?.full_name ?? "Unknown",
              payeeName: payee?.full_name ?? "Unknown",
              amount: Number(p.amount),
              paidAt: p.paid_at,
            };
          });

        setSettlement({
          totalOutstanding,
          totalSettled,
          openSplits,
          settledThisWeek,
          recentPayments,
        });
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const choresToDisplay = useMemo(() => {
    if (upcomingChores.length > 0) return upcomingChores;
    return [
      {
        timeLabel: "ALL DONE",
        choreName: "No upcoming chores",
        assignee: "All caught up!",
        isCurrentUser: false,
        isPriority: false,
      },
    ];
  }, [upcomingChores]);

  return (
    <>
      {isRestricted && (
        <LockedAlert
          message="Locked: Complete your tasks!"
          description="You cannot add expenses until you complete your assigned chore due today."
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <SettlementHealth
          totalOutstanding={settlement.totalOutstanding}
          totalSettled={settlement.totalSettled}
          openSplits={settlement.openSplits}
          settledThisWeek={settlement.settledThisWeek}
          recentPayments={settlement.recentPayments}
        />

        <WhoIsNext chores={loading ? [] : choresToDisplay} />
      </div>
    </>
  );
}