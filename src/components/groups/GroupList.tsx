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
          className="flex shrink-0 items-center gap-1 rounded-full bg-surface-active px-4 py-2 text-sm font-medium text-text-muted hover:bg-border-strong hover:text-text-main"
        >
          <span>+</span>
          <span>Group</span>
        </button>
      </div>

      {confirmDeleteId !== null && (
        <div
          className="modal-overlay"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="mx-4 w-full max-w-sm rounded-2xl bg-surface p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-text-main">Delete Group</h3>
            <p className="mt-2 text-sm text-text-muted">
              This will also delete all cards and transactions in this group. Are you sure?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteGroup(confirmDeleteId)}
                className="btn-danger"
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
