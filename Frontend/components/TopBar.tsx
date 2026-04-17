"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { CiLogout } from "react-icons/ci";
import { MdStar } from "react-icons/md";
import { useState, useEffect } from "react";
// import * as api from "../lib/apiClient"; // Placeholder for API integration

export default function TopBar() {
  const router = useRouter();
  const [points, setPoints] = useState<number>(1240); // Placeholder for group_members points

  useEffect(() => {
    // TODO: Fetch user points from group_members when available in the backend
    // async function loadPoints() {
    //   const data = await api.fetchCurrentUserPoints();
    //   setPoints(data.points);
    // }
    // loadPoints();
  }, []);

  const handleLogout = () => {
    console.log("Logging out...");
    router.push("/login");
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

        <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/20 shrink-0">
          <Image
            src="/Mogistan.jpg"
            alt="User profile"
            width={40}
            height={40}
            className="object-cover"
          />
        </div>
      </div>
    </header>
  );
}
