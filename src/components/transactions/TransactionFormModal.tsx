import { useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import type { Transaction } from "../../types";

interface TransactionFormModalProps {
  cardId: number;
  balance: number;
  onAdd: (tx: Omit<Transaction, "id">) => Promise<void>;
}

export default function TransactionFormModal({
  cardId,
  balance,
  onAdd,
}: TransactionFormModalProps) {
  const open = useAppStore((s) => s.transactionModalOpen);
  const setOpen = useAppStore((s) => s.setTransactionModalOpen);
  const type = useAppStore((s) => s.transactionType);

  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  function close() {
    setOpen(false);
    setAmount("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (type === "use" && value > balance) {
      setError(`Cannot exceed remaining balance of $${balance.toFixed(2)}.`);
      return;
    }
    try {
      await onAdd({
        cardId,
        type,
        amount: value,
        date: new Date(),
      });
      close();
    } catch {
      setError("Failed to save transaction.");
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60" onClick={close}>
      <div
        className="w-full max-w-lg rounded-t-2xl bg-white p-6 dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-bold">
          {type === "use" ? "Use Card" : "Reload Card"}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm text-slate-500 dark:text-slate-400">
              Amount ($)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError("");
              }}
              placeholder="0.00"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-500"
              autoFocus
            />
            {type === "use" && (
              <p className="mt-1 text-xs text-slate-500">
                Available: ${balance.toFixed(2)}
              </p>
            )}
            {error && <p className="mt-1 text-sm text-rose-400">{error}</p>}
          </div>
          <div className="flex gap-2">
            <div className="flex-1" />
            <button
              type="button"
              onClick={close}
              className="rounded-lg px-4 py-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`rounded-lg px-4 py-2 font-semibold text-white ${
                type === "use"
                  ? "bg-rose-500 hover:bg-rose-600"
                  : "bg-emerald-500 hover:bg-emerald-600"
              }`}
            >
              {type === "use" ? "Use" : "Reload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
