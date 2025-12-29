// src/service/transactionService.ts
import { prisma } from "../db/prisma";
import type { Transaction, Prisma } from "@prisma/client";
import { findAccountById } from "./accountService"; // Kita butuh ini buat cari nomor rekening

// Tipe helper buat transaksi
type PrismaTx = Prisma.TransactionClient;

/**
 * =========================
 * SAVE TRANSACTION
 * =========================
 */
export async function saveTransaction(
  data: Omit<Transaction, "id" | "createdAt">,
  tx?: PrismaTx
): Promise<Transaction> {
  const db = tx || prisma;

  return await db.transaction.create({
    data: {
      accountNumber: data.accountNumber,
      type: data.type,
      amount: data.amount, 
      balanceBefore: data.balanceBefore, 
      balanceAfter: data.balanceAfter, 
      description: data.description,
      referenceNumber: data.referenceNumber,
      relatedAccountNumber: data.relatedAccountNumber,
    },
  });
}

/**
 * =========================
 * FIND TRANSACTIONS BY ACCOUNT ID
 * =========================
 */
export async function findTransactionsByAccountId(
  accountId: number
): Promise<Transaction[]> {
  // 1. Karena transaksi disimpen pake 'accountNumber', kita cari dulu nomor rekeningnya dari ID
  const account = await findAccountById(accountId);
  
  if (!account) {
    return [];
  }

  // 2. Cari semua transaksi yang punya nomor rekening itu
  return await prisma.transaction.findMany({
    where: {
      accountNumber: account.accountNumber,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}