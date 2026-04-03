import Image from "next/image";

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
        <h2 className="text-sm font-bold uppercase tracking-widest text-outline">
          Household Dashboard
        </h2>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {/* Hearth Points */}
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
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBhxPrn_UtQQTfPAdbpZkElKlJg8xTr9GWIPC1r_IG11HFsIbpfRo-eSZ9dSVKKF18YP35qwrV4IHx0GMaFnHV-MIsVkwNVl4rDig9lEii3_MN18jowQKHle3L_Zyt0cfZgiEs1rH5RTziUiViEeWpeXHpxQK_R-Z-gYtI6210EZiuAVILSvnCUaArcBAzNd__c3gCzi2e5aMRJMLf-iriNFvb4vV82wKou_zQjGolyz3Zg9-cXm0B6j8tifg__RQsmcrXK-_VPg"
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
