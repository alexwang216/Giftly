import Dexie, { type Table } from "dexie";
import type { Group, Card, Transaction } from "../types";

export class GiftlyDB extends Dexie {
  groups!: Table<Group>;
  cards!: Table<Card>;
  transactions!: Table<Transaction>;

  constructor() {
    super("giftly");

    this.version(1).stores({
      groups: "++id, name",
      cards: "++id, groupId, name",
      transactions: "++id, cardId, date",
    });
  }
}

export const db = new GiftlyDB();
