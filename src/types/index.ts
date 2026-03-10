export interface Group {
  id?: number;
  name: string;
  icon: string;
}

export interface Card {
  id?: number;
  groupId: number;
  name: string;
  initialAmount: number;
  code: string;
  codeType: "qr" | "barcode";
}

export type TransactionType = "use" | "reload";

export interface Transaction {
  id?: number;
  cardId: number;
  type: TransactionType;
  amount: number;
  date: Date;
}

export interface GiftlyExportFile {
  version: 1;
  exportedAt: string;
  data: {
    groups: Omit<Group, "id">[];
    cards: (Omit<Card, "id" | "groupId"> & { groupIndex: number })[];
    transactions: (Omit<Transaction, "id" | "cardId"> & {
      cardIndex: number;
    })[];
  };
}
