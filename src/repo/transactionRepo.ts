import type { Transaction } from "../entities/Transaction";
import { TransactionType } from "../constants/TransactionType";

let transactions: Transaction[] = [];
let nextTransactionId = 1;

export function saveTransaction(
  tx: Omit<Transaction, "id" | "createdAt">
): Transaction {
  const transaction: Transaction = {
    id: nextTransactionId++,
    ...tx,
    createdAt: new Date(),
  };
  transactions.push(transaction);
  return transaction;
}

export function findTransactionsByAccountId(
  accountId: number
): Transaction[] {
  return transactions.filter((tx) => tx.accountId === accountId);
}

export function findTransactionById(
  id: number
): Transaction | null {
  return transactions.find((tx) => tx.id === id) ?? null;
}
