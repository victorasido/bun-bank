import { TransactionType } from "../constants/TransactionType";

export interface Transaction {
  id: number;
  accountNumber: string;       // ✅ Ganti accountId jadi ini
  type: TransactionType | string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description?: string | null;
  referenceNumber: string;
  relatedAccountNumber?: string | null; // Mapping ke to_account_number
  createdAt: Date;
}