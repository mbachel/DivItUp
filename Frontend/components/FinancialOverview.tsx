import Image from "next/image";

interface BalanceEntry {
  id: string;
  name: string;
  avatar: string;
  description: string;
  amount: number;
  isOwed: boolean; // true = they owe you, false = you owe them
}

interface FinancialOverviewProps {
  totalDebt: number;
  entries: BalanceEntry[];
}

export default function FinancialOverview({
  totalDebt,
  entries,
}: FinancialOverviewProps) {
  return (
    <div className="md:col-span-7 lg:col-span-8 bg-surface-container-lowest rounded-xl p-8 ambient-depth relative">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h3 className="text-2xl font-bold text-on-surface mb-2 font-headline">
            Who owes what
          </h3>
          <p className="text-outline font-medium">Household balance settlement</p>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-primary uppercase tracking-wider">
            Total House Debt
          </span>
          <div className="text-4xl font-extrabold text-on-surface mt-1 font-headline">
            ${totalDebt.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl group hover:bg-primary-fixed transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <Image
                  src={entry.avatar}
                  alt={entry.name}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-bold">{entry.name}</p>
                <p className="text-xs text-outline group-hover:text-primary">
                  {entry.description}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`text-lg font-extrabold ${
                  entry.isOwed ? "text-primary" : "text-error"
                }`}
              >
                ${entry.amount.toFixed(2)}
              </p>
              <button
                className={`text-[10px] font-bold uppercase tracking-tighter text-outline ${
                  entry.isOwed
                    ? "hover:text-primary"
                    : "hover:text-error"
                }`}
              >
                {entry.isOwed ? "Remind" : "Pay Now"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
