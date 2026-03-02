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

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => (
        <CardItem
          key={card.id}
          card={card}
          balance={balanceMap.get(card.id!) ?? card.initialAmount}
        />
      ))}
      <button
        type="button"
        onClick={() => setCardModalOpen(true)}
        className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 p-4 text-slate-400 transition-colors hover:border-slate-400 hover:text-slate-500 dark:border-slate-700 dark:text-slate-500 dark:hover:border-slate-600 dark:hover:text-slate-400"
      >
        <span className="text-2xl">+</span>
        <span className="mt-1 text-sm">Add Card</span>
      </button>
    </div>
  );
}
