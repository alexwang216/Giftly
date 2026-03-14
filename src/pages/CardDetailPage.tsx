import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { useCards } from "../hooks/useCards";
import { useTransactions } from "../hooks/useTransactions";
import { useAppStore } from "../store/useAppStore";
import { decryptCode } from "../lib/crypto";
import CodeDisplay from "../components/code-display/CodeDisplay";
import TransactionTable from "../components/transactions/TransactionTable";
import TransactionFormModal from "../components/transactions/TransactionFormModal";

export default function CardDetailPage() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const id = Number(cardId);

  const card = useLiveQuery(async () => {
    const raw = await db.cards.get(id);
    if (!raw) return undefined;
    return { ...raw, code: await decryptCode(raw.code) };
  }, [id]);
  const { transactions, addTransaction, computeBalance } = useTransactions(id);
  const { deleteCard } = useCards(null);

  const setTransactionModalOpen = useAppStore(
    (s) => s.setTransactionModalOpen,
  );
  const setTransactionType = useAppStore((s) => s.setTransactionType);

  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!card) {
    return (
      <div className="p-4 text-text-muted">
        <button
          onClick={() => navigate("/")}
          className="text-primary hover:underline"
        >
          &larr; Back
        </button>
        <p className="mt-4">Card not found.</p>
      </div>
    );
  }

  const balance = computeBalance(card.initialAmount);

  async function handleDelete() {
    await deleteCard(id);
    navigate("/");
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="text-primary hover:underline"
        >
          &larr; Back
        </button>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="rounded-lg p-2 text-text-muted hover:bg-danger/10 hover:text-danger"
            aria-label="Delete card"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted">Delete?</span>
            <button
              onClick={handleDelete}
              className="btn-danger !px-3 !py-1 !text-sm"
            >
              Yes
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="btn-secondary !px-3 !py-1 !text-sm"
            >
              No
            </button>
          </div>
        )}
      </div>

      <h1 className="text-2xl font-bold">{card.name}</h1>

      <CodeDisplay value={card.code} type={card.codeType} />

      {card.type !== "membership" && (
        <>
          <div className="text-center">
            <p className="text-sm text-text-muted">Remaining Balance</p>
            <p
              className={`text-3xl font-bold ${
                balance > 0 ? "text-success" : "text-danger"
              }`}
            >
              ${balance.toFixed(2)}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              className="btn-success flex-1 py-3"
              onClick={() => {
                setTransactionType("reload");
                setTransactionModalOpen(true);
              }}
            >
              Reload
            </button>
            <button
              className="btn-danger flex-1 py-3"
              onClick={() => {
                setTransactionType("use");
                setTransactionModalOpen(true);
              }}
            >
              Use
            </button>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold">Transactions</h2>
            <TransactionTable transactions={transactions} />
          </div>

          <TransactionFormModal
            cardId={id}
            balance={balance}
            onAdd={addTransaction}
          />
        </>
      )}
    </div>
  );
}
