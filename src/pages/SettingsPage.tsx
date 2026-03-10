import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  exportData,
  downloadJson,
  validateImportFile,
  importData,
} from "../lib/dataPortability";

export default function SettingsPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  async function handleExport() {
    setStatus(null);
    setExporting(true);
    try {
      const data = await exportData();
      downloadJson(data);
      setStatus({ type: "success", message: "Data exported successfully." });
    } catch {
      setStatus({ type: "error", message: "Failed to export data." });
    } finally {
      setExporting(false);
    }
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus(null);
    setImporting(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!validateImportFile(parsed)) {
        setStatus({ type: "error", message: "Invalid backup file format." });
        setImporting(false);
        e.target.value = "";
        return;
      }
      const result = await importData(parsed);
      setStatus({
        type: "success",
        message: `Imported ${result.groups} groups, ${result.cards} cards, and ${result.transactions} transactions.`,
      });
    } catch {
      setStatus({
        type: "error",
        message:
          "Failed to import data. Make sure the file is a valid Giftly backup.",
      });
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="text-indigo-400 hover:underline"
        >
          &larr; Back
        </button>
      </div>

      <h1 className="text-2xl font-bold">Settings</h1>

      <section className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
        <h2 className="mb-3 text-lg font-semibold">Data Management</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Export your data as a JSON file for backup or transfer to another
          device. On iOS, save the file to iCloud Drive for automatic sync.
          Importing will add data alongside your existing cards.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full rounded-lg bg-indigo-500 py-3 font-semibold text-white hover:bg-indigo-600 active:bg-indigo-700 disabled:opacity-50"
          >
            {exporting ? "Exporting..." : "Export Data"}
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="w-full rounded-lg border-2 border-indigo-500 py-3 font-semibold text-indigo-500 hover:bg-indigo-50 active:bg-indigo-100 dark:hover:bg-indigo-500/10 dark:active:bg-indigo-500/20 disabled:opacity-50"
          >
            {importing ? "Importing..." : "Import Data"}
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImportFile}
          className="hidden"
        />
      </section>

      {status && (
        <div
          className={`rounded-xl p-4 text-sm ${
            status.type === "success"
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-rose-500/10 text-rose-400"
          }`}
        >
          {status.message}
        </div>
      )}
    </div>
  );
}
