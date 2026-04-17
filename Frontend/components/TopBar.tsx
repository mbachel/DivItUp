"use client";

import { usePathname, useRouter } from "next/navigation";
import { CiLogout } from "react-icons/ci";
import { MdStar } from "react-icons/md";
import { useState, useEffect, useCallback } from "react";
import { logout } from "@/lib/authClient";
import UserAvatar from "@/components/UserAvatar";
import {
  POINTS_UPDATED_EVENT,
  resolveActiveMembership,
} from "@/lib/activeMembership";

export default function TopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [points, setPoints] = useState<number>(0);
  const [currentUsername, setCurrentUsername] = useState<string>("");
  const [currentFullName, setCurrentFullName] = useState<string>("");

  const loadPoints = useCallback(async () => {
    try {
      const context = await resolveActiveMembership();
      setPoints(Number(context.activeMembership.points ?? 0));
      setCurrentUsername(context.currentUser.username);
      setCurrentFullName(context.currentUser.full_name);
    } catch (error) {
      console.error("Failed to load points:", error);
      setPoints(0);
      setCurrentUsername("");
      setCurrentFullName("");
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function guardedLoadPoints() {
      if (!mounted) {
        return;
      }

      await loadPoints();
    }

    const handlePointsUpdated = (event: Event) => {
      if (!mounted) {
        return;
      }

      const customEvent = event as CustomEvent<{ points?: number }>;
      if (typeof customEvent.detail?.points === "number") {
        setPoints(customEvent.detail.points);
        return;
      }

      void guardedLoadPoints();
    };

    const handleFocus = () => {
      void guardedLoadPoints();
    };

    void guardedLoadPoints();

    window.addEventListener(POINTS_UPDATED_EVENT, handlePointsUpdated as EventListener);
    window.addEventListener("focus", handleFocus);

    return () => {
      mounted = false;
      window.removeEventListener(
        POINTS_UPDATED_EVENT,
        handlePointsUpdated as EventListener
      );
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadPoints, pathname]);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <header className="flex justify-end items-center px-6 py-4 w-full bg-[#f6fafb] sticky top-0 z-40">
      <div className="flex items-center gap-4">
        
        <div className="flex items-center gap-3 bg-[#f2f6f6] pl-1 pr-4 py-1 rounded-full">
          <div className="w-8 h-8 rounded-full bg-[#007B8C] flex items-center justify-center">
            <MdStar className="text-white text-xl" />
          </div>
          <span className="font-bold text-[#007B8C]">{points.toLocaleString()}</span>
        </div>

        <button onClick={handleLogout} className="p-2 hover:bg-[#007B8C]/10 rounded-full transition-colors flex items-center justify-center" aria-label="Log out">
          <CiLogout className="text-[#007B8C] text-2xl font-bold" />
        </button>

        <UserAvatar
          username={currentUsername}
          fullName={currentFullName}
          size={40}
          className="ring-2 ring-primary/20"
          fallbackClassName="text-xs"
          alt="User profile"
        />
      </div>
    </header>
  );
}
