import Image from "next/image";
{/*Adding comments for clarity*/}
export default function TopBar() {
  return (
    <header className="flex justify-between items-center px-6 py-4 w-full bg-[#f6fafb] sticky top-0 z-40">
      {/* Mobile logo */}
      <div className="md:hidden">
        <span className="text-2xl font-bold tracking-tight text-[#181c1d] font-headline">
          H&amp;H
        </span>
      </div>

      {/* Desktop title */}
      <div className="hidden md:block">
        <h2 className="text-xl font-bold uppercase tracking-widest text-outline">
          Household Dashboard
        </h2>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {/* DivItUp Points */}
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

        {/* Wallet icon */}
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-outline p-2 hover:bg-[#007B8C]/10 rounded-full transition-colors cursor-pointer">
            account_balance_wallet
          </span>

          {/* Avatar */}
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
