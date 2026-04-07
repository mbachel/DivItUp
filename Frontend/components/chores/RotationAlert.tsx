"use client";

interface RotationAlertProps {
  nextPerson: string;
  nextChore: string;
  rotationDay: string;
  rotationTime: string;
}

export default function RotationAlert({
  nextPerson,
  nextChore,
  rotationDay,
  rotationTime,
}: RotationAlertProps) {
  return (
    <div className="bg-white rounded-2xl p-8 border border-outline-variant/40 flex-1">
      <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-3">
        Rotation Alert
      </p>
      <h2 className="text-3xl font-extrabold text-on-surface font-headline mb-3">
        Next Week:{" "}
        <span className="text-secondary">{nextPerson}</span>{" "}
        rotates to{" "}
        <span className="text-primary">{nextChore}</span>
      </h2>
      <p className="text-outline font-medium">
        The household wheel turns every {rotationDay} at {rotationTime}.
        <br />
        Prepare to swap roles!
      </p>
    </div>
  );
}
