"use client";

import { useState } from "react";
import type { GroupMemberBackend, UserBackend } from "../../lib/apiClient";

interface AddChoreCardProps {
  groupId: number;
  groupMembers: GroupMemberBackend[];
  users: UserBackend[];
  onChoreAdded: () => Promise<void>;
  onCreateChore: (title: string, frequency: string) => Promise<{ id: number } | null>;
  onCreateAssignment: (
    choreId: number,
    assignedTo: number,
    dueDate: string,
    status: string
  ) => Promise<unknown>;
}

const FREQUENCIES = [
  { value: "daily",    label: "Daily",    points: 50  },
  { value: "weekly",   label: "Weekly",   points: 150 },
  { value: "monthly",  label: "Monthly",  points: 300 },
  { value: "one_time", label: "One Time", points: 100 },
];

const STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "overdue", label: "Overdue" },
];

export default function AddChoreCard({
  groupId,
  groupMembers,
  users,
  onChoreAdded,
  onCreateChore,
  onCreateAssignment,
}: AddChoreCardProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // local state for each form field
  const [title, setTitle]         = useState("");
  const [frequency, setFrequency] = useState("weekly");
  const [assignedTo, setAssignedTo] = useState<number | "">(
    groupMembers[0]?.user_id ?? ""
  );
  const [dueDate, setDueDate]     = useState("");
  const [status, setStatus]       = useState("pending");

  const selectedFreq = FREQUENCIES.find((f) => f.value === frequency);

  const handleSubmit = async () => {
    if (!title.trim())    { setError("Please enter a chore title."); return; }
    if (!dueDate)         { setError("Please pick a due date."); return; }
    if (assignedTo === "") { setError("Please select an assignee."); return; }

    setError("");
    setSubmitting(true);

    try {
      // kick off the chore creation first, then we'll attach the assignment
      const chore = await onCreateChore(title.trim(), frequency);
      if (!chore) throw new Error("Failed to create chore.");

      // link the new chore to the selected member with a due date and status
      const assignment = await onCreateAssignment(
        chore.id,
        Number(assignedTo),
        new Date(dueDate).toISOString(),
        status
      );
      if (!assignment) throw new Error("Failed to create assignment.");

      // clear everything out so the form is ready for another entry
      setTitle("");
      setFrequency("weekly");
      setAssignedTo(groupMembers[0]?.user_id ?? "");
      setDueDate("");
      setStatus("pending");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);

      await onChoreAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const getUserName = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    return user?.full_name ?? user?.username ?? `User ${userId}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-outline-variant/40 overflow-hidden">
      {/* toggle button is always shown — clicking it opens or closes the form */}
      <button
        onClick={() => { setOpen((o) => !o); setError(""); }}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-container-low transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-base">add_task</span>
          </div>
          <span className="font-bold text-on-surface font-headline">Add Chore</span>
        </div>
        <span
          className={`material-symbols-outlined text-outline text-base transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </button>

      {/* the actual form body, only rendered when the panel is open */}
      {open && (
        <div className="px-5 pb-5 flex flex-col gap-4 border-t border-outline-variant/30">

          {/* chore name the user types in */}
          <div className="flex flex-col gap-1.5 pt-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-outline">
              Chore Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Take out trash"
              className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* how often this chore repeats — each option also shows how many points it's worth */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-outline">
              Frequency
            </label>
            <div className="grid grid-cols-2 gap-2">
              {FREQUENCIES.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFrequency(f.value)}
                  className={`rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                    frequency === f.value
                      ? "bg-primary text-white shadow-sm"
                      : "bg-surface-container-low text-on-surface hover:bg-primary/10"
                  }`}
                >
                  {f.label}
                  <span className="block text-[9px] font-medium opacity-70 mt-0.5">
                    +{f.points} pts
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* dropdown to pick which group member gets this chore */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-outline">
              Assign To
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(Number(e.target.value))}
              className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
            >
              {groupMembers.map((m) => (
                <option key={m.user_id} value={m.user_id}>
                  {getUserName(m.user_id)}
                </option>
              ))}
            </select>
          </div>

          {/* when this needs to be done by */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-outline">
              Due Date
            </label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* initial status of the assignment */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-outline">
              Status
            </label>
            <div className="flex gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStatus(s.value)}
                  className={`flex-1 rounded-xl px-2 py-2 text-xs font-bold transition-all ${
                    status === s.value
                      ? "bg-secondary text-white shadow-sm"
                      : "bg-surface-container-low text-on-surface hover:bg-secondary/10"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* show a friendly error message if something went wrong */}
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          {/* submit button switches to a spinner while saving, then a success state */}
          <button
            onClick={handleSubmit}
            disabled={submitting || success}
            className={`w-full rounded-xl py-3 text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              success
                ? "bg-primary/10 text-primary"
                : "bg-primary text-white hover:bg-primary/90 disabled:opacity-60"
            }`}
          >
            {submitting ? (
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : success ? (
              <>
                <span className="material-symbols-outlined text-base">check_circle</span>
                Chore Added!
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">add</span>
                Add Chore
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}