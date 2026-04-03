"use client";

interface LockedAlertProps {
  message: string;
  description: string;
}

export default function LockedAlert({ message, description }: LockedAlertProps) {
  return (
    <section className="rounded-xl bg-tertiary-fixed text-on-tertiary-fixed p-8 flex flex-col md:flex-row items-center gap-6">
      <div className="bg-white/40 p-4 rounded-full">
        <span className="material-symbols-outlined text-3xl">warning</span>
      </div>
      <div className="flex-grow text-center md:text-left">
        <h3 className="text-xl font-bold mb-1 font-headline">{message}</h3>
        <p className="font-medium opacity-90">{description}</p>
      </div>
    </section>
  );
}