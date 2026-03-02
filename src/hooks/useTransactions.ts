import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import type { Transaction } from "../types";

export function useTransactions(cardId: number) {
  const transactions =
    useLiveQuery(
      () =>
        db.transactions
          .where("cardId")
          .equals(cardId)
          .reverse()
          .sortBy("date"),
      [cardId],
    ) ?? [];

  async function addTransaction(tx: Omit<Transaction, "id">) {
    if (tx.type === "use") {
      await db.transaction("rw", [db.cards, db.transactions], async () => {
        const card = await db.cards.get(tx.cardId);
        if (!card) throw new Error("Card not found");
        const allTxs = await db.transactions
          .where("cardId")
          .equals(tx.cardId)
          .toArray();
        const balance = allTxs.reduce((b, t) => {
          return t.type === "reload" ? b + t.amount : b - t.amount;
        }, card.initialAmount);
        if (tx.amount > balance) throw new Error("Insufficient balance");
        await db.transactions.add(tx);
      });
    } else {
      await db.transactions.add(tx);
    }
  }

  function computeBalance(initialAmount: number): number {
    return transactions.reduce((balance, tx) => {
      if (tx.type === "reload") return balance + tx.amount;
      if (tx.type === "use") return balance - tx.amount;
      return balance;
    }, initialAmount);
  }

  return { transactions, addTransaction, computeBalance };
}
