import { prisma } from "../db/prisma";
import type { Account, Prisma } from "@prisma/client";

// Tipe khusus biar fungsi ini bisa nerima 'prisma' biasa ATAU 'transaksi'
type PrismaTx = Prisma.TransactionClient;

/**
 * =========================
 * CREATE ACCOUNT
 * =========================
 */
// Note: Gue sesuaikan urutan parameter biar cocok sama logic lo:
// (userId, accountNumber, accountName, initialBalance)
export async function createAccount(
  userId: number,
  accountNumber: string,
  accountName: string,
  initialBalance: number = 0,
  tx?: PrismaTx
): Promise<Account> {
  const db = tx || prisma;
  
  return await db.account.create({
    data: {
      userId,
      accountNumber,
      accountName,
      // Perlu di-convert ke BigInt karena schema kita pake BigInt
      balance: BigInt(initialBalance),
    },
  });
}

/**
 * =========================
 * FIND ACCOUNTS BY USER ID
 * =========================
 */

export async function findAccountsByUserId(
  userId: number
): Promise<Account[]> {
  return await prisma.account.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * =========================
 * FIND ACCOUNT BY ID
 * =========================
 */
export async function findAccountById(
  accountId: number,
  tx?: PrismaTx
): Promise<Account | null> {
  const db = tx || prisma;
  return await db.account.findUnique({
    where: { id: accountId },
  });
}

/**
 * =========================
 * FIND ACCOUNT BY NUMBER
 * =========================
 */
export async function findAccountByNumber(
  accountNumber: string,
  tx?: PrismaTx
): Promise<Account | null> {
  const db = tx || prisma;
  return await db.account.findUnique({
    where: { accountNumber },
  });
}

/**
 * =========================
 * UPDATE BALANCE (DEPOSIT/WITHDRAW)
 * =========================
 */
export async function updateAccountBalance(
  accountId: number,
  amount: number,
  tx?: PrismaTx
): Promise<Account> {
  const db = tx || prisma;

  // Prisma punya fitur 'increment' yang atomik!
  // Kalau amount negatif, dia otomatis ngurangin.
  return await db.account.update({
    where: { id: accountId },
    data: {
      balance: {
        increment: BigInt(amount),
      },
    },
  });
}