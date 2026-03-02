import { useState } from "react";
import type { Group } from "../../types";
import { useAppStore } from "../../store/useAppStore";
import { useGroups } from "../../hooks/useGroups";
import GroupChip from "./GroupChip";

interface GroupListProps {
  groups: Group[];
}

export default function GroupList({ groups }: GroupListProps) {
  const selectedGroupId = useAppStore((s) => s.selectedGroupId);
  const setSelectedGroupId = useAppStore((s) => s.setSelectedGroupId);
  const setGroupModalOpen = useAppStore((s) => s.setGroupModalOpen);
  const { deleteGroup } = useGroups();
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  async function handleDeleteGroup(id: number) {
    if (selectedGroupId === id) {
      setSelectedGroupId(null);
    }
    await deleteGroup(id);
    setConfirmDeleteId(null);
  }

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <GroupChip
          icon="📋"
          name="All"
          active={selectedGroupId === null}
          onClick={() => setSelectedGroupId(null)}
        />
        {groups.map((group) => (
          <GroupChip
            key={group.id}
            icon={group.icon}
            name={group.name}
            active={selectedGroupId === group.id}
            onClick={() => setSelectedGroupId(group.id!)}
            onDelete={() => setConfirmDeleteId(group.id!)}
          />
        ))}
        <button
          type="button"
          onClick={() => setGroupModalOpen(true)}
          className="flex shrink-0 items-center gap-1 rounded-full bg-slate-200 px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-300 hover:text-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
        >
          <span>+</span>
          <span>Group</span>
        </button>
      </div>

      {confirmDeleteId !== null && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold">Delete Group</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              This will also delete all cards and transactions in this group. Are you sure?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="rounded-lg px-4 py-2 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteGroup(confirmDeleteId)}
                className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
