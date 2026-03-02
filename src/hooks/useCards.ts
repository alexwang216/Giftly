import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import type { Card } from "../types";

export function useCards(groupId: number | null) {
  const cards =
    useLiveQuery(() => {
      if (groupId === null) return db.cards.toArray();
      return db.cards.where("groupId").equals(groupId).toArray();
    }, [groupId]) ?? [];

  async function addCard(card: Omit<Card, "id">) {
    return db.cards.add(card);
  }

  async function updateCard(
    id: number,
    changes: Partial<Omit<Card, "id">>,
  ) {
    return db.cards.update(id, changes);
  }

  async function deleteCard(id: number) {
    await db.transaction("rw", [db.cards, db.transactions], async () => {
      await db.transactions.where("cardId").equals(id).delete();
      await db.cards.delete(id);
    });
  }

  return { cards, addCard, updateCard, deleteCard };
}

export function useCardBalances(cards: Card[]) {
  const cardIds = cards.map((c) => c.id!);
  const transactions =
    useLiveQuery(
      () => db.transactions.where("cardId").anyOf(cardIds).toArray(),
      [cardIds.join(",")],
    ) ?? [];

  const balanceMap = new Map<number, number>();
  for (const card of cards) {
    const cardTxs = transactions.filter((tx) => tx.cardId === card.id);
    const balance = cardTxs.reduce((bal, tx) => {
      return tx.type === "reload" ? bal + tx.amount : bal - tx.amount;
    }, card.initialAmount);
    balanceMap.set(card.id!, balance);
  }

  return balanceMap;
}
