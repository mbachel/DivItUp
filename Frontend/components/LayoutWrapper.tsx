"use client";

import { usePathname } from "next/navigation";
import SideNav from "@/components/SideNav";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // The login page doesn't use the sidebar/topbar layout
  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <SideNav />
      <main className="md:ml-64 min-h-screen pb-24 md:pb-0">
        <TopBar />
        <div className="p-6 md:p-10 space-y-10">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}