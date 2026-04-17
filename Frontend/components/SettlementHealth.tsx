interface RecentPayment {
  id: number;
  payerName: string;
  payeeName: string;
  amount: number;
  paidAt: string;
}

interface SettlementHealthProps {
  totalOutstanding: number;
  totalSettled: number;
  openSplits: number;
  settledThisWeek: number;
  recentPayments: RecentPayment[];
}

export default function SettlementHealth({
  totalOutstanding,
  totalSettled,
  openSplits,
  settledThisWeek,
  recentPayments,
}: SettlementHealthProps) {
  const safeOutstanding = Number(totalOutstanding) || 0;
  const safeSettled = Number(totalSettled) || 0;
  const total = safeOutstanding + safeSettled;
  const settledPercent = total > 0 ? Math.round((safeSettled / total) * 100) : 0;

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (settledPercent / 100) * circumference;

  return (
    <div className="md:col-span-7 lg:col-span-8 bg-surface-container-lowest rounded-xl p-8 ambient-depth flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold font-headline">Settlement Health</h3>
          <p className="text-sm text-outline mt-1">Group expense balance overview</p>
        </div>
        <span className="material-symbols-outlined text-outline/40">
          account_balance_wallet
        </span>
      </div>

      {/* progress ring + outstanding */}
      <div className="flex items-center gap-8">
        <div className="relative w-28 h-28 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r={radius}
              fill="none"
              strokeWidth="10"
              className="stroke-surface-container-low"
            />
            <circle
              cx="50" cy="50" r={radius}
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="stroke-primary transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-extrabold font-headline">{settledPercent}%</span>
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Settled</span>
          </div>
        </div>

        <div>
          <p className="text-4xl font-extrabold font-headline text-error">
            ${safeOutstanding.toFixed(2)}
          </p>
          <p className="text-xs font-bold text-outline uppercase tracking-wider mt-1">
            Outstanding
          </p>
        </div>
      </div>

      {/* stats row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-surface-container-low rounded-xl">
          <p className="text-xs font-bold text-outline uppercase tracking-wider mb-1">
            Open Splits
          </p>
          <p className="text-3xl font-extrabold font-headline text-on-surface">
            {openSplits}
          </p>
          <p className="text-xs text-outline mt-1">awaiting settlement</p>
        </div>

        <div className="p-4 bg-primary/5 rounded-xl">
          <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
            Settled This Week
          </p>
          <p className="text-3xl font-extrabold font-headline text-primary">
            {settledThisWeek}
          </p>
          <p className="text-xs text-outline mt-1">payments received</p>
        </div>
      </div>

      {/* recent payments feed */}
      <div className="flex flex-col gap-3 flex-grow">
        <p className="text-xs font-bold text-outline uppercase tracking-wider">
          Recent Payments
        </p>

        {recentPayments.length === 0 ? (
          <div className="flex items-center justify-center text-sm text-outline py-6">
            No payments yet
          </div>
        ) : (
          recentPayments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-[10px] font-bold text-on-primary-container">
                  {payment.payerName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight">{payment.payerName}</p>
                  <p className="text-xs text-outline">→ {payment.payeeName}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-extrabold text-primary">
                  ${Number(payment.amount).toFixed(2)}
                </p>
                <p className="text-[10px] text-outline">
                  {new Date(payment.paidAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}