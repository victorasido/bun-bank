// src/entities/Transaction.ts
import { TransactionType } from "../constants/TransactionType";

export interface Transaction {
  id: number;
  accountId: number;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: Date;
}
