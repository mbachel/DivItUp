import Image from "next/image";
import { CiLogout } from "react-icons/ci";

export default function TopBar() {
  return (
    <header className="flex justify-between items-center px-6 py-4 w-full bg-[#f6fafb] sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-full">
          <span
            className="material-symbols-outlined text-[#007B8C] fill-icon"
            style={{
              fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
            }}
          >
            stars
          </span>
          <span className="text-sm font-bold text-[#007B8C]">1,240</span>
        </div>

        <div className="flex items-center justify-end gap-3">
          <CiLogout className="text-[#007B8C] text-xl cursor-pointer" />
          <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/20">
            <Image
              src="/Mogistan.jpg"
              alt="User profile"
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
