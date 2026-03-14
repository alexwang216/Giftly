import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface CodeScannerProps {
  onScan: (value: string, codeType: "qr" | "barcode") => void;
  onClose: () => void;
}

export default function CodeScanner({ onScan, onClose }: CodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const runningRef = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const scanner = new Html5Qrcode("code-scanner-region");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText, decodedResult) => {
          runningRef.current = false;
          scanner.stop().catch(() => {});
          if (!cancelled) {
            const isQr =
              decodedResult?.result?.format?.formatName === "QR_CODE";
            onScan(decodedText, isQr ? "qr" : "barcode");
          }
        },
        () => {},
      )
      .then(() => {
        if (cancelled) {
          scanner.stop().catch(() => {});
        } else {
          runningRef.current = true;
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not access camera. Please check permissions.");
        }
      });

    return () => {
      cancelled = true;
      if (runningRef.current) {
        runningRef.current = false;
        scanner.stop().catch(() => {});
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-bold text-white">Scan Code</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-surface px-4 py-2 text-sm text-text-main hover:bg-surface-hover"
        >
          Cancel
        </button>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <div id="code-scanner-region" className="w-full max-w-md" />
      </div>
      {error && (
        <p className="p-4 text-center text-sm text-danger-hover">{error}</p>
      )}
    </div>
  );
}
