import { AppError } from "../errors/AppError";
import {
  createAccount,
  findAccountsByUserId,
  findAccountByNumber
} from "../service/accountService";
import type { CreateAccountRequest, AccountResponse } from "../dto/AccountDTO";
import type { Account } from "@prisma/client";
// Import Stiker Ajaib yang sudah kita buat di Step 1
import { Trace } from "../utils/decorators"; 

/**
 * =========================
 * Helpers (Tetap di luar Class gapapa, sebagai utilitas lokal)
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
    // Convert BigInt ke Number biar aman di JSON
    balance: Number(account.balance), 
    createdAt: account.createdAt,
  };
}

/**
 * =========================
 * Class AccountLogic (Gedung Baru)
 * =========================
 */
export class AccountLogic {

  // 1. Logic Buka Rekening
  @Trace() // set up Monitoring
  async createAccount(
    userId: number,
    payload: CreateAccountRequest
  ): Promise<AccountResponse> {
    const { accountName } = payload;

    if (!userId) throw new AppError("Unauthorized", 401);
    if (!accountName) throw new AppError("Account name is required", 400);

    // Generate nomor rekening unik
    let accountNumber = generateAccountNumber();
    let exists = await findAccountByNumber(accountNumber);

    // Retry kalau kebetulan nomornya kembar
    while (exists) {
      accountNumber = generateAccountNumber();
      exists = await findAccountByNumber(accountNumber);
    }

    // Simpan ke DB (Initial balance 0)
    const newAccount = await createAccount(userId, accountNumber, accountName, 0);

    return toAccountResponse(newAccount);
  }

  // 2. Logic Lihat Daftar Rekening
  @Trace() // <--- Stiker Monitoring
  async getMyAccounts(
    userId: number
  ): Promise<AccountResponse[]> {
    if (!userId) throw new AppError("Unauthorized", 401);

    // Logic bersih, gak ada kode tracing manual lagi!
    const accounts = await findAccountsByUserId(userId);

    return accounts.map(toAccountResponse);
  }
}