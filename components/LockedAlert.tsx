"use client";

interface LockedAlertProps {
  message: string;
  description: string;
  actionLabel: string;
  onAction?: () => void;
}

export default function LockedAlert({
  message,
  description,
  actionLabel,
  onAction,
}: LockedAlertProps) {
  return (
    <section className="relative overflow-hidden rounded-xl bg-tertiary-fixed text-on-tertiary-fixed p-8 flex flex-col md:flex-row items-center gap-6">
      {/* Background lock icon */}
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <span className="material-symbols-outlined text-9xl">lock</span>
      </div>

      {/* Warning icon */}
      <div className="bg-white/40 p-4 rounded-full">
        <span className="material-symbols-outlined text-3xl">warning</span>
      </div>

      {/* Text content */}
      <div className="flex-grow text-center md:text-left z-10">
        <h3 className="text-xl font-bold mb-1 font-headline">{message}</h3>
        <p className="font-medium opacity-90">{description}</p>
      </div>

      {/* CTA Button */}
      <button
        onClick={onAction}
        className="bg-on-tertiary-fixed text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform z-10"
      >
        {actionLabel}
      </button>
    </section>
  );
}
