import type { Card } from "../../types";
import { useCardBalances } from "../../hooks/useCards";
import { useAppStore } from "../../store/useAppStore";
import CardItem from "./CardItem";

interface CardGridProps {
  cards: Card[];
}

export default function CardGrid({ cards }: CardGridProps) {
  const balanceMap = useCardBalances(cards);
  const setCardModalOpen = useAppStore((s) => s.setCardModalOpen);

  const sortedCards = [...cards].sort((a, b) => {
    if (a.type === "membership" && b.type !== "membership") return -1;
    if (b.type === "membership" && a.type !== "membership") return 1;
    return 0;
  });

  return (
    <div className="grid grid-cols-2 gap-3">
      {sortedCards.map((card) => (
        <CardItem
          key={card.id}
          card={card}
          balance={balanceMap.get(card.id!) ?? card.initialAmount}
        />
      ))}
      <button
        type="button"
        onClick={() => setCardModalOpen(true)}
        className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border-strong p-4 text-text-muted transition-colors hover:border-text-muted hover:text-text-subtle"
      >
        <span className="text-2xl">+</span>
        <span className="mt-1 text-sm">Add Card</span>
      </button>
    </div>
  );
}
