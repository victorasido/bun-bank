import { AppError } from "../errors/AppError";
import {
  createAccount,
  findAccountsByUserId,
  findAccountByNumber
} from "../repo/accountRepo";
import type { CreateAccountRequest, AccountResponse } from "../dto/AccountDTO";
import type { Account } from "../entities/Account";

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
    accountName: account.accountName,
    balance: Number(account.balance), // Pastikan jadi number
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

  // Retry kalau kebetulan nomornya kembar (tabrakan)
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

  const accounts = await findAccountsByUserId(userId);
  return accounts.map(toAccountResponse);
}