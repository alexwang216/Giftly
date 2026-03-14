import { db } from "../db/db";
import { decryptCode, encryptCode } from "./crypto";
import type { GiftlyExportFile } from "../types";

export async function exportData(): Promise<GiftlyExportFile> {
  const groups = await db.groups.toArray();
  const cards = await db.cards.toArray();
  const transactions = await db.transactions.toArray();

  const groupIdToIndex = new Map<number, number>();
  groups.forEach((g, i) => groupIdToIndex.set(g.id!, i));

  const cardIdToIndex = new Map<number, number>();
  cards.forEach((c, i) => cardIdToIndex.set(c.id!, i));

  const exportCards = await Promise.all(
    cards.map(async (card) => ({
      name: card.name,
      initialAmount: card.initialAmount,
      code: await decryptCode(card.code),
      codeType: card.codeType,
      type: card.type,
      groupIndex: groupIdToIndex.get(card.groupId) ?? 0,
    })),
  );

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      groups: groups.map((g) => ({ name: g.name, icon: g.icon })),
      cards: exportCards,
      transactions: transactions.map((tx) => ({
        type: tx.type,
        amount: tx.amount,
        date: tx.date,
        cardIndex: cardIdToIndex.get(tx.cardId) ?? 0,
      })),
    },
  };
}

export function downloadJson(data: GiftlyExportFile): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `giftly-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function validateImportFile(data: unknown): data is GiftlyExportFile {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  if (obj.version !== 1) return false;
  if (typeof obj.exportedAt !== "string") return false;
  if (typeof obj.data !== "object" || obj.data === null) return false;
  const d = obj.data as Record<string, unknown>;
  return (
    Array.isArray(d.groups) &&
    Array.isArray(d.cards) &&
    Array.isArray(d.transactions)
  );
}

export async function importData(
  file: GiftlyExportFile,
): Promise<{ groups: number; cards: number; transactions: number }> {
  const { groups, cards, transactions } = file.data;

  return db.transaction(
    "rw",
    [db.groups, db.cards, db.transactions],
    async () => {
      const newGroupIds: number[] = [];
      for (const group of groups) {
        const id = (await db.groups.add({
          name: group.name,
          icon: group.icon,
        })) as number;
        newGroupIds.push(id);
      }

      const newCardIds: number[] = [];
      for (const card of cards) {
        const groupId = newGroupIds[card.groupIndex];
        if (groupId === undefined) continue;
        const id = (await db.cards.add({
          name: card.name,
          initialAmount: card.initialAmount,
          code: await encryptCode(card.code),
          codeType: card.codeType,
          type: card.type || "gift",
          groupId,
        })) as number;
        newCardIds.push(id);
      }

      let txCount = 0;
      for (const tx of transactions) {
        const cardId = newCardIds[tx.cardIndex];
        if (cardId === undefined) continue;
        await db.transactions.add({
          type: tx.type,
          amount: tx.amount,
          date: new Date(tx.date),
          cardId,
        });
        txCount++;
      }

      return {
        groups: newGroupIds.length,
        cards: newCardIds.length,
        transactions: txCount,
      };
    },
  );
}
