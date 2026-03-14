import { useRegisterSW } from "virtual:pwa-register/react";

export default function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  function close() {
    setOfflineReady(false);
    setNeedRefresh(false);
  }

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 rounded-xl border border-border-base bg-surface p-4 shadow-xl">
      {offlineReady ? (
        <p className="text-sm text-text-subtle">App ready to work offline.</p>
      ) : (
        <p className="text-sm text-text-subtle">
          New content available. Click reload to update.
        </p>
      )}
      <div className="mt-2 flex gap-2">
        {needRefresh && (
          <button
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
            onClick={() => updateServiceWorker(true)}
          >
            Reload
          </button>
        )}
        <button
          className="rounded-lg px-4 py-2 text-sm text-text-muted hover:text-text-main"
          onClick={close}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
