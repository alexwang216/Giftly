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
    <div className="modal-overlay" onClick={close}>
      <div
        className="w-full max-w-lg rounded-t-2xl bg-white p-6 dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-bold">
          {type === "use" ? "Use Card" : "Reload Card"}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="form-label">
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
              className="form-input"
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
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={
                type === "use" ? "btn-danger" : "btn-success"
              }
            >
              {type === "use" ? "Use" : "Reload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
