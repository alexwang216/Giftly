import { QRCodeSVG } from "qrcode.react";
import Barcode from "react-barcode";

interface CodeDisplayProps {
  value: string;
  type: "qr" | "barcode";
}

export default function CodeDisplay({ value, type }: CodeDisplayProps) {
  return (
    <div className="flex justify-center rounded-xl bg-white p-6">
      {type === "qr" ? (
        <QRCodeSVG value={value} size={200} />
      ) : (
        <Barcode value={value} />
      )}
    </div>
  );
}
