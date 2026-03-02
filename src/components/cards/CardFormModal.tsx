import { useState, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useAppStore } from "../../store/useAppStore";
import { useCards } from "../../hooks/useCards";
import { db } from "../../db/db";
import type { Group } from "../../types";

const CodeScanner = lazy(() => import("../scanner/CodeScanner"));

interface CardFormModalProps {
  groups: Group[];
}

export default function CardFormModal({ groups }: CardFormModalProps) {
  const open = useAppStore((s) => s.cardModalOpen);
  const setOpen = useAppStore((s) => s.setCardModalOpen);
  const editingId = useAppStore((s) => s.editingCardId);
  const setEditingId = useAppStore((s) => s.setEditingCardId);
  const selectedGroupId = useAppStore((s) => s.selectedGroupId);
  const { addCard, updateCard, deleteCard } = useCards(null);

  const [name, setName] = useState("");
  const [groupId, setGroupId] = useState<number | "">(selectedGroupId ?? "");
  const [initialAmount, setInitialAmount] = useState("");
  const [code, setCode] = useState("");
  const [codeType, setCodeType] = useState<"qr" | "barcode">("qr");
  const [scanning, setScanning] = useState(false);
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    if (editingId !== null) {
      db.cards.get(editingId).then((card) => {
        if (card) {
          setName(card.name);
          setGroupId(card.groupId);
          setInitialAmount(card.initialAmount.toString());
          setCode(card.code);
          setCodeType(card.codeType);
        }
      });
    } else {
      setName("");
      setGroupId(selectedGroupId ?? "");
      setInitialAmount("");
      setCode("");
      setCodeType("qr");
    }
  }, [editingId, open, selectedGroupId]);

  const handleScan = useCallback(
    (value: string, codeType: "qr" | "barcode") => {
      setCode(value);
      setCodeType(codeType);
      setScanning(false);
    },
    [],
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError("");
    try {
      // Prefer native BarcodeDetector (better barcode support, available iOS 16.4+)
      if ("BarcodeDetector" in window) {
        const bitmap = await createImageBitmap(file);
        const detector = new BarcodeDetector({
          formats: [
            "qr_code",
            "ean_13",
            "ean_8",
            "code_128",
            "code_39",
            "code_93",
            "upc_a",
            "upc_e",
            "codabar",
            "itf",
          ],
        });
        const results = await detector.detect(bitmap);
        bitmap.close();
        const first = results[0];
        if (first) {
          setCode(first.rawValue);
          setCodeType(first.format === "qr_code" ? "qr" : "barcode");
          e.target.value = "";
          return;
        }
      }
      // Fallback to html5-qrcode
      const scanner = new Html5Qrcode("image-scanner-temp");
      const result = await scanner.scanFileV2(file, true);
      const isQr = result?.result?.format?.formatName === "QR_CODE";
      setCode(result.decodedText);
      setCodeType(isQr ? "qr" : "barcode");
      scanner.clear();
    } catch {
      setImageError("No code found in image. Try a clearer photo.");
    }
    e.target.value = "";
  }

  if (!open) return null;

  if (scanning) {
    return (
      <Suspense
        fallback={
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white">
            Loading camera...
          </div>
        }
      >
        <CodeScanner onScan={handleScan} onClose={() => setScanning(false)} />
      </Suspense>
    );
  }

  function close() {
    setOpen(false);
    setEditingId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || groupId === "" || !code.trim()) return;
    const amount = parseFloat(initialAmount) || 0;
    if (editingId !== null) {
      await updateCard(editingId, {
        name: name.trim(),
        groupId: groupId as number,
        initialAmount: amount,
        code: code.trim(),
        codeType,
      });
    } else {
      await addCard({
        name: name.trim(),
        groupId: groupId as number,
        initialAmount: amount,
        code: code.trim(),
        codeType,
      });
    }
    close();
  }

  async function handleDelete() {
    if (editingId !== null) {
      await deleteCard(editingId);
      close();
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60" onClick={close}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-bold">
          {editingId !== null ? "Edit Card" : "New Card"}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm text-slate-500 dark:text-slate-400">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Starbucks Gift Card"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-500"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-500 dark:text-slate-400">Group</label>
            <select
              value={groupId}
              onChange={(e) =>
                setGroupId(e.target.value ? Number(e.target.value) : "")
              }
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            >
              <option value="">Select a group...</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.icon} {g.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-500 dark:text-slate-400">
              Initial Amount ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={initialAmount}
              onChange={(e) => setInitialAmount(e.target.value)}
              placeholder="50.00"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-500 dark:text-slate-400">
              Card Code
            </label>
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Card number or code"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 pr-8 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-500"
                />
                {code && (
                  <button
                    type="button"
                    onClick={() => setCode("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setScanning(true)}
                className="flex shrink-0 items-center gap-1 rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-600"
                title="Scan with camera"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex shrink-0 items-center gap-1 rounded-lg bg-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500"
                title="Scan from image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </button>
            </div>
            {imageError && (
              <p className="mt-1 text-sm text-rose-400">{imageError}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-500 dark:text-slate-400">
              Code Type
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCodeType("qr")}
                className={`flex-1 rounded-lg px-4 py-2 font-medium ${
                  codeType === "qr"
                    ? "bg-indigo-500 text-white"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                }`}
              >
                QR Code
              </button>
              <button
                type="button"
                onClick={() => setCodeType("barcode")}
                className={`flex-1 rounded-lg px-4 py-2 font-medium ${
                  codeType === "barcode"
                    ? "bg-indigo-500 text-white"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                }`}
              >
                Barcode
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            {editingId !== null && (
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-lg bg-rose-500 px-4 py-2 font-semibold text-white hover:bg-rose-600"
              >
                Delete
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={close}
              className="rounded-lg px-4 py-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-500 px-4 py-2 font-semibold text-white hover:bg-indigo-600"
            >
              {editingId !== null ? "Save" : "Add"}
            </button>
          </div>
        </form>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageFile}
          className="hidden"
        />
        <div id="image-scanner-temp" className="fixed -left-[9999px] -top-[9999px]" />
      </div>
    </div>
  );
}
