import type { Transaction } from "../../types";

interface TransactionTableProps {
  transactions: Transaction[];
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TransactionTable({
  transactions,
}: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-xl bg-white p-6 text-center text-slate-400 shadow-sm dark:bg-slate-800 dark:text-slate-500">
        No transactions yet
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-slate-800">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr
              key={tx.id}
              className="border-b border-slate-100 last:border-0 dark:border-slate-700/50"
            >
              <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                {formatDate(tx.date)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    tx.type === "reload"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/20 text-rose-400"
                  }`}
                >
                  {tx.type === "reload" ? "Reload" : "Use"}
                </span>
              </td>
              <td
                className={`px-4 py-3 text-right text-sm font-medium ${
                  tx.type === "reload" ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {tx.type === "reload" ? "+" : "-"}${tx.amount.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
