import { useEffect, useRef, useState } from "react";
import { scanImageData, ZBarSymbolType } from "@undecaf/zbar-wasm";

interface CodeScannerProps {
  onScan: (value: string, codeType: "qr" | "barcode") => void;
  onClose: () => void;
}

export default function CodeScanner({ onScan, onClose }: CodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | null = null;
    let animFrameId = 0;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        scanLoop();
      } catch {
        if (!cancelled) {
          setError("Could not access camera. Please check permissions.");
        }
      }
    };

    const scanLoop = () => {
      if (cancelled) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        animFrameId = requestAnimationFrame(scanLoop);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        animFrameId = requestAnimationFrame(scanLoop);
        return;
      }

      ctx.drawImage(video, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      scanImageData(imageData)
        .then((symbols) => {
          if (cancelled || symbols.length === 0) {
            if (!cancelled) {
              animFrameId = requestAnimationFrame(scanLoop);
            }
            return;
          }
          const first = symbols[0];
          if (!first) {
            animFrameId = requestAnimationFrame(scanLoop);
            return;
          }
          const isQr = first.type === ZBarSymbolType.ZBAR_QRCODE;
          const decoded = first.decode();
          // Stop camera before calling onScan
          stream?.getTracks().forEach((t) => t.stop());
          if (!cancelled) {
            onScan(decoded, isQr ? "qr" : "barcode");
          }
        })
        .catch(() => {
          if (!cancelled) {
            animFrameId = requestAnimationFrame(scanLoop);
          }
        });
    };

    startCamera();

    return () => {
      cancelled = true;
      cancelAnimationFrame(animFrameId);
      stream?.getTracks().forEach((t) => t.stop());
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
        <video
          ref={videoRef}
          className="w-full max-w-md rounded-lg"
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>
      {error && (
        <p className="p-4 text-center text-sm text-danger-hover">{error}</p>
      )}
    </div>
  );
}
