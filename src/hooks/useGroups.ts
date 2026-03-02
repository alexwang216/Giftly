import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import type { Group } from "../types";

export function useGroups() {
  const groups = useLiveQuery(() => db.groups.toArray()) ?? [];

  async function addGroup(group: Omit<Group, "id">) {
    return db.groups.add(group);
  }

  async function updateGroup(
    id: number,
    changes: Partial<Omit<Group, "id">>,
  ) {
    return db.groups.update(id, changes);
  }

  async function deleteGroup(id: number) {
    const cardIds = await db.cards
      .where("groupId")
      .equals(id)
      .primaryKeys();
    await db.transaction(
      "rw",
      [db.groups, db.cards, db.transactions],
      async () => {
        await db.transactions.where("cardId").anyOf(cardIds).delete();
        await db.cards.where("groupId").equals(id).delete();
        await db.groups.delete(id);
      },
    );
  }

  return { groups, addGroup, updateGroup, deleteGroup };
}
