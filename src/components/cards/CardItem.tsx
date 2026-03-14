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
      className="flex flex-col items-start rounded-2xl bg-surface p-4 text-left shadow-sm transition-colors hover:bg-surface-subtle active:bg-surface-hover"
    >
      <span className="text-sm font-medium text-text-subtle">{card.name}</span>
      {card.type === "membership" ? (
        <span className="mt-1 text-lg font-bold text-primary">
          Membership
        </span>
      ) : (
        <span
          className={`mt-1 text-xl font-bold ${
            balance > 0 ? "text-success" : "text-danger"
          }`}
        >
          ${balance.toFixed(2)}
        </span>
      )}
      <span className="mt-2 text-xs text-text-muted">
        {card.codeType === "qr" ? "QR Code" : "Barcode"}
      </span>
    </button>
  );
}
