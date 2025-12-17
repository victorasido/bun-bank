import { TransactionType } from "../constants/TransactionType";

export interface TransactionResponse {
  id: number;
  type: TransactionType | string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description?: string | null;      // ✅ Baru
  referenceNumber: string;          // ✅ Baru
  createdAt: Date;
}

export interface DepositRequest {
  accountId: number;
  amount: number;
}

export interface WithdrawRequest {
  accountId: number;
  amount: number;
}

export interface TransferRequest {
  fromAccountId: number;
  toAccountNumber: string; // ✅ Ganti dari toAccountId (opsional) jadi wajib string
  amount: number;
  description?: string;    // ✅ Baru
}