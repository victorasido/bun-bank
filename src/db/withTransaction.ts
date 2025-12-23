// src/db/withTransaction.ts
import { prisma } from "./prisma";
import type { Prisma } from "@prisma/client";

// Kita bikin tipe 'TxClient' biar logic layer tau bentuk 'tx' itu kayak apa
export type TxClient = Prisma.TransactionClient;

/**
 * Fungsi ini ngebungkus logic bisnis dalam satu transaksi database.
 * Kalau ada error di dalam 'fn', semua perubahan DB bakal dibatalkan (Rollback).
 */
export async function withTransaction<T>(
  fn: (tx: TxClient) => Promise<T>
): Promise<T> {
  // Prisma $transaction otomatis handle BEGIN, COMMIT, dan ROLLBACK.
  return await prisma.$transaction(async (tx) => {
    return await fn(tx);
  });
}