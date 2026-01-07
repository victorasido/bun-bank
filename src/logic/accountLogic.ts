import { AppError } from "../errors/AppError";
import {
  createAccount,
  findAccountsByUserId,
  findAccountByNumber
} from "../service/accountService";
import type { CreateAccountRequest, AccountResponse } from "../dto/AccountDTO";
// ✅ GANTI IMPORT: Pake tipe dari Prisma
import type { Account } from "@prisma/client";
import telemetry from "@opentelemetry/api";

/**
 * =========================
 * Helper: Generate Random Account Number
 * =========================
 */
function generateAccountNumber(): string {
  // Bikin 10 digit angka random
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

function toAccountResponse(account: Account): AccountResponse {
  return {
    id: account.id,
    userId: account.userId,
    accountNumber: account.accountNumber,
    // Prisma balikin null, DTO minta undefined. Kita convert pake '??'
    accountName: account.accountName ?? undefined, 
    // ✅ PENTING: Convert BigInt ke Number biar bisa jadi JSON
    balance: Number(account.balance), 
    createdAt: account.createdAt,
  };
}

/**
 * =========================
 * Create Account Logic
 * =========================
 */
export async function createAccountLogic(
  userId: number,
  payload: CreateAccountRequest
): Promise<AccountResponse> {
  const { accountName } = payload;

  if (!userId) throw new AppError("Unauthorized", 401);
  if (!accountName) throw new AppError("Account name is required", 400);

  // 1. Generate nomor rekening unik
  let accountNumber = generateAccountNumber();
  let exists = await findAccountByNumber(accountNumber);

  // Retry kalau kebetulan nomornya kembar
  while (exists) {
    accountNumber = generateAccountNumber();
    exists = await findAccountByNumber(accountNumber);
  }

  // 2. Simpan ke DB (Initial balance 0)
  const newAccount = await createAccount(userId, accountNumber, accountName, 0);

  return toAccountResponse(newAccount);
}

/**
 * =========================
 * Get My Accounts Logic
 * =========================
 */
export async function getMyAccountsLogic(
  userId: number
): Promise<AccountResponse[]> {
  if (!userId) throw new AppError("Unauthorized", 401);

  const tracer = telemetry.trace.getTracer("account-logic-tracer");

  const span = tracer.startSpan("getMyAccountsLogic-span");

  const accounts = await findAccountsByUserId(userId);

  span.end();

  

  return accounts.map(toAccountResponse);
}