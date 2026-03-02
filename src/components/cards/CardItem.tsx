import { useNavigate } from "react-router-dom";
import type { Card } from "../../types";

interface CardItemProps {
  card: Card;
  balance: number;
}

export default function CardItem({ card, balance }: CardItemProps) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/card/${card.id}`)}
      className="flex flex-col items-start rounded-2xl bg-white p-4 text-left shadow-sm transition-colors hover:bg-slate-50 active:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 dark:active:bg-slate-700"
    >
      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{card.name}</span>
      <span
        className={`mt-1 text-xl font-bold ${
          balance > 0 ? "text-emerald-400" : "text-rose-400"
        }`}
      >
        ${balance.toFixed(2)}
      </span>
      <span className="mt-2 text-xs text-slate-400 dark:text-slate-500">
        {card.codeType === "qr" ? "QR Code" : "Barcode"}
      </span>
    </button>
  );
}
