import { useState, useEffect } from "react";
import { useAppStore } from "../../store/useAppStore";
import { useGroups } from "../../hooks/useGroups";
import { db } from "../../db/db";

const EMOJI_OPTIONS = [
  "🎁", "🛒", "☕", "🍔", "👗", "🎮", "✈️", "💳",
  "🏪", "📱", "🎵", "📚", "💄", "🏋️", "🎬", "🍕",
];

export default function GroupFormModal() {
  const open = useAppStore((s) => s.groupModalOpen);
  const setOpen = useAppStore((s) => s.setGroupModalOpen);
  const editingId = useAppStore((s) => s.editingGroupId);
  const setEditingId = useAppStore((s) => s.setEditingGroupId);
  const { addGroup, updateGroup, deleteGroup } = useGroups();

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🎁");

  useEffect(() => {
    if (editingId !== null) {
      db.groups.get(editingId).then((group) => {
        if (group) {
          setName(group.name);
          setIcon(group.icon);
        }
      });
    }
  }, [editingId]);

  if (!open) return null;

  function close() {
    setOpen(false);
    setEditingId(null);
    setName("");
    setIcon("🎁");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    if (editingId !== null) {
      await updateGroup(editingId, { name: name.trim(), icon });
    } else {
      await addGroup({ name: name.trim(), icon });
    }
    close();
  }

  async function handleDelete() {
    if (editingId !== null) {
      await deleteGroup(editingId);
      close();
    }
  }

  return (
    <div className="modal-overlay" onClick={close}>
      <div
        className="w-full max-w-lg rounded-t-2xl bg-white p-6 dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-bold">
          {editingId !== null ? "Edit Group" : "New Group"}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="form-label">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Coffee Shops"
              className="form-input"
              autoFocus
            />
          </div>
          <div>
            <label className="form-label">Icon</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`rounded-lg p-2 text-xl ${
                    icon === emoji
                      ? "bg-indigo-500"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            {editingId !== null && (
              <button
                type="button"
                onClick={handleDelete}
                className="btn-danger"
              >
                Delete
              </button>
            )}
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
              className="btn-primary"
            >
              {editingId !== null ? "Save" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
