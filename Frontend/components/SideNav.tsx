"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/expenses", label: "Expenses", icon: "receipt_long" },
  { href: "/chores", label: "Chores", icon: "assignment_turned_in" },
  { href: "/summary", label: "Group Summary", icon: "group" },
];

export default function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col h-full w-64 fixed left-0 top-0 py-8 gap-4 bg-[#f6fafb] z-50">
      <div className="px-6 mb-8">
        <h1 className="text-2xl font-extrabold text-[#00606e] font-headline">
          Divvy
        </h1>
        <p className="text-xs font-medium text-outline">The Roommate Management System</p>
      </div>

      <nav className="flex flex-col gap-2 flex-grow">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 py-3 px-4 mx-2 rounded-xl transition-all hover:translate-x-1 ${
                isActive
                  ? "bg-[#007B8C] text-white shadow-lg shadow-[#007B8C]/20"
                  : "text-[#bdc8cb] hover:text-[#007B8C] hover:bg-[#007B8C]/5"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className={isActive ? "font-semibold" : "font-medium"}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 mt-auto">
        <button className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-black rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/10 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-lg">add</span>
          Quick Add Expense
        </button>
      </div>
    </aside>
  );
}
