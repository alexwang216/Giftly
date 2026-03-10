import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import type { Card } from "../types";
import { encryptCode, decryptCode } from "../lib/crypto";

export function useCards(groupId: number | null) {
  const cards =
    useLiveQuery(async () => {
      const raw =
        groupId === null
          ? await db.cards.toArray()
          : await db.cards.where("groupId").equals(groupId).toArray();
      return Promise.all(
        raw.map(async (card) => ({
          ...card,
          code: await decryptCode(card.code),
        })),
      );
    }, [groupId]) ?? [];

  async function addCard(card: Omit<Card, "id">) {
    return db.cards.add({ ...card, code: await encryptCode(card.code) });
  }

  async function updateCard(
    id: number,
    changes: Partial<Omit<Card, "id">>,
  ) {
    const toUpdate = { ...changes };
    if (toUpdate.code !== undefined) {
      toUpdate.code = await encryptCode(toUpdate.code);
    }
    return db.cards.update(id, toUpdate);
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
