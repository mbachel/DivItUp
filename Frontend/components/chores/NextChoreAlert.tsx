"use client";

interface RotationAlertProps {
  choreTitle: string;
  dueText: string;
  assigneeName?: string;
}

export default function RotationAlert({
  choreTitle,
  dueText,
  assigneeName,
}: RotationAlertProps) {
  return (
    <div className="bg-white rounded-2xl p-8 border border-outline-variant/40 flex-1">
      <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-3">
        Next Upcoming Chore
      </p>

      <h2 className="text-3xl font-extrabold text-on-surface font-headline mb-3">
        <span className="text-primary">{choreTitle}</span>
      </h2>

      <p className="text-outline font-medium">
        {assigneeName ? `Assigned to ${assigneeName}. ` : ""}
        {dueText}
      </p>
    </div>
  );
}