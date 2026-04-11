"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/expenses", label: "Expenses", icon: "receipt_long" },
  { href: "/chores", label: "Chores", icon: "assignment_turned_in" },
  { href: "/summary", label: "Summary", icon: "group" },
];

export default function BottomNav() {
  const pathname = usePathname();
  {/*Adding comments for clarity*/}
  return (
    <>
      {/* Bottom Nav Bar */}
      <nav className="md:hidden glass-nav fixed bottom-0 left-0 right-0 py-3 px-6 flex justify-between items-center z-50 rounded-t-3xl ambient-depth">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 ${
                isActive ? "text-primary" : "text-outline"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={
                  isActive
                    ? {
                        fontVariationSettings:
                          "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                      }
                    : undefined
                }
              >
                {item.icon}
              </span>
              <span
                className={`text-[10px] ${
                  isActive ? "font-bold" : "font-medium"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
