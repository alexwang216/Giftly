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
      <div className="rounded-xl bg-surface p-6 text-center text-text-muted shadow-sm">
        No transactions yet
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl bg-surface shadow-sm">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border-base text-left text-xs text-text-muted">
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr
              key={tx.id}
              className="border-b border-border-base last:border-0"
            >
              <td className="px-4 py-3 text-sm text-text-subtle">
                {formatDate(tx.date)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    tx.type === "reload"
                      ? "bg-success/20 text-success-hover"
                      : "bg-danger/20 text-danger-hover"
                  }`}
                >
                  {tx.type === "reload" ? "Reload" : "Use"}
                </span>
              </td>
              <td
                className={`px-4 py-3 text-right text-sm font-medium ${
                  tx.type === "reload" ? "text-success-hover" : "text-danger-hover"
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
