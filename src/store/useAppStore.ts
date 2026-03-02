import { create } from "zustand";
import type { TransactionType } from "../types";

interface AppState {
  selectedGroupId: number | null;
  setSelectedGroupId: (id: number | null) => void;

  groupModalOpen: boolean;
  setGroupModalOpen: (open: boolean) => void;
  editingGroupId: number | null;
  setEditingGroupId: (id: number | null) => void;

  cardModalOpen: boolean;
  setCardModalOpen: (open: boolean) => void;
  editingCardId: number | null;
  setEditingCardId: (id: number | null) => void;

  transactionModalOpen: boolean;
  setTransactionModalOpen: (open: boolean) => void;
  transactionType: TransactionType;
  setTransactionType: (type: TransactionType) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedGroupId: null,
  setSelectedGroupId: (id) => set({ selectedGroupId: id }),

  groupModalOpen: false,
  setGroupModalOpen: (open) => set({ groupModalOpen: open }),
  editingGroupId: null,
  setEditingGroupId: (id) => set({ editingGroupId: id }),

  cardModalOpen: false,
  setCardModalOpen: (open) => set({ cardModalOpen: open }),
  editingCardId: null,
  setEditingCardId: (id) => set({ editingCardId: id }),

  transactionModalOpen: false,
  setTransactionModalOpen: (open) => set({ transactionModalOpen: open }),
  transactionType: "use",
  setTransactionType: (type) => set({ transactionType: type }),
}));
