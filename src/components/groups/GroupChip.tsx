interface GroupChipProps {
  icon: string;
  name: string;
  active: boolean;
  onClick: () => void;
  onDelete?: () => void;
}

export default function GroupChip({
  icon,
  name,
  active,
  onClick,
  onDelete,
}: GroupChipProps) {
  return (
    <div
      className={`flex shrink-0 items-center gap-1.5 rounded-full text-sm font-medium transition-colors ${
        active
          ? "bg-indigo-500 text-white"
          : "bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-1.5 py-2 pl-4 pr-1"
      >
        <span>{icon}</span>
        <span>{name}</span>
      </button>
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="flex items-center pr-3 pl-1 py-2 opacity-60 hover:opacity-100"
          aria-label={`Delete ${name}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
        </button>
      )}
      {!onDelete && <span className="pr-2" />}
    </div>
  );
}
