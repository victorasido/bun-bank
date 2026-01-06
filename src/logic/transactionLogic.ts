import { withTransaction } from "../db/withTransaction";
import type { Transaction } from "@prisma/client";
import { TransactionType } from "../constants/TransactionType";
import type { DepositRequest, WithdrawRequest, TransferRequest, TransactionResponse } from "../dto/TransactionDTO";
import { AppError } from "../errors/AppError";
import { findAccountById, findAccountByNumber, updateAccountBalance } from "../service/accountService";
import { saveTransaction, findTransactionsByAccountId } from "../service/transactionService";
import { trace, Span, Tracer } from "@opentelemetry/api";

// HELPERS

// Wrapper to handle OpenTelemetry span lifecycle (start, catch error, end)
async function runInSpan<T>(tracer: Tracer, name: string, callback: (span: Span) => Promise<T>): Promise<T> {
  return tracer.startActiveSpan(name, async (span) => {
    try {
      return await callback(span);
    } catch (error) {
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  });
}

function assertAccountOwner(account: any, userId: number): any {
  if (!account) throw new AppError("Account not found", 404);
  if (account.userId !== userId) throw new AppError("Forbidden: account not yours", 403);
  return account;
}

function toResponse(tx: Transaction): TransactionResponse {
  return {
    id: tx.id,
    type: tx.type,
    amount: Number(tx.amount),
    balanceBefore: Number(tx.balanceBefore),
    balanceAfter: Number(tx.balanceAfter),
    description: tx.description,
    referenceNumber: tx.referenceNumber,
    createdAt: tx.createdAt,
  };
}

function generateRef(): string {
  return "TXN-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

// DEPOSIT & WITHDRAW LOGIC
export async function depositLogic(userId: number, payload: DepositRequest): Promise<TransactionResponse> {
  const { accountNumber, amount } = payload;
  if (!userId) throw new AppError("Unauthorized", 401);
  if (!accountNumber || amount <= 0) throw new AppError("Invalid amount", 400);

  return await withTransaction(async (tx) => {
    const account = assertAccountOwner(await findAccountByNumber(accountNumber, tx), userId);
    const updatedAccount = await updateAccountBalance(account.id, amount, tx);
    
    const transaction = await saveTransaction({
      accountNumber: updatedAccount.accountNumber,
      type: TransactionType.DEPOSIT,
      amount: BigInt(amount),
      balanceBefore: BigInt(account.balance),
      balanceAfter: updatedAccount.balance,
      description: "Deposit money",
      referenceNumber: generateRef(),
      relatedAccountNumber: null,
    }, tx);

    return toResponse(transaction);
  });
}

export async function withdrawLogic(userId: number, payload: WithdrawRequest): Promise<TransactionResponse> {
  const { accountNumber, amount } = payload;
  if (!userId) throw new AppError("Unauthorized", 401);
  if (!accountNumber || amount <= 0) throw new AppError("Invalid amount", 400);

  return await withTransaction(async (tx) => {
    const account = assertAccountOwner(await findAccountByNumber(accountNumber, tx), userId);
    if (BigInt(account.balance) < BigInt(amount)) throw new AppError("Insufficient balance", 400);

    const updatedAccount = await updateAccountBalance(account.id, -amount, tx);
    
    const transaction = await saveTransaction({
      accountNumber: updatedAccount.accountNumber,
      type: TransactionType.WITHDRAW,
      amount: BigInt(amount),
      balanceBefore: BigInt(account.balance),
      balanceAfter: updatedAccount.balance,
      description: "Withdraw money",
      referenceNumber: generateRef(),
      relatedAccountNumber: null,
    }, tx);

    return toResponse(transaction);
  });
}

// TRANSFER LOGIC (REFACTORED)
// Sub-logic: Validate sender, receiver, and balance
async function processTransferValidation(tx: any, userId: number, payload: TransferRequest, span: Span) {
  const { fromAccountNumber, toAccountNumber, amount } = payload;
  // 1. Verify Sender
  const sender = await findAccountByNumber(fromAccountNumber, tx);
  assertAccountOwner(sender, userId);
  // 2. Check Balance
  if (BigInt(sender!.balance) < BigInt(amount)) {
    span.addEvent("Validation Failed: Insufficient Balance");
    throw new AppError("Insufficient balance", 400);
  }
  // 3. Verify Receiver
  const receiver = await findAccountByNumber(toAccountNumber, tx);
  if (!receiver) {
    span.addEvent("Validation Failed: Receiver Not Found");
    throw new AppError("Destination account not found", 404);
  }

  return { sender, receiver };
}

// Sub-logic: Update balances and save transaction records
async function processTransferExecution(tx: any, sender: any, receiver: any, payload: TransferRequest) {
  const { amount, description } = payload;
  const amountBg = BigInt(amount);
  const baseRef = generateRef();

  // 1. Process Sender (Debit)
  const updatedSender = await updateAccountBalance(sender.id, -amount, tx);
  const txOut = await saveTransaction({
    accountNumber: sender.accountNumber,
    type: TransactionType.TRANSFER_OUT,
    amount: amountBg,
    balanceBefore: BigInt(sender.balance),
    balanceAfter: updatedSender.balance,
    description: description || "Transfer Out",
    referenceNumber: baseRef + "-OUT",
    relatedAccountNumber: receiver.accountNumber
  }, tx);

  // 2. Process Receiver (Credit)
  const updatedReceiver = await updateAccountBalance(receiver.id, amount, tx);
  const txIn = await saveTransaction({
    accountNumber: receiver.accountNumber,
    type: TransactionType.TRANSFER_IN,
    amount: amountBg,
    balanceBefore: BigInt(receiver.balance),
    balanceAfter: updatedReceiver.balance,
    description: description || "Transfer In",
    referenceNumber: baseRef + "-IN",
    relatedAccountNumber: sender.accountNumber
  }, tx);

  return [toResponse(txOut), toResponse(txIn)];
}

// Main Function
export async function transferLogic(userId: number, payload: TransferRequest): Promise<TransactionResponse[]> {
  const { fromAccountNumber, toAccountNumber, amount } = payload;
  
  // 1. Basic Input Guards
  if (!userId) throw new AppError("Unauthorized", 401);
  if (!fromAccountNumber || !toAccountNumber || amount <= 0) throw new AppError("Invalid transfer", 400);
  if (fromAccountNumber === toAccountNumber) throw new AppError("Cannot transfer to self", 400);

  // 2. OpenTelemetry Setup
  const tracer = trace.getTracer("bun-bank-service");
  const mainSpan = trace.getActiveSpan();
  if (mainSpan) {
    mainSpan.setAttribute("transaction.type", "TRANSFER");
    mainSpan.setAttribute("transaction.amount", amount);
  }

  // 3. Execute DB Transaction
  return await withTransaction(async (tx) => {
    
    // Step A: Validation Phase (Instrumented)
    const { sender, receiver } = await runInSpan(tracer, "logic.validation", async (span) => {
      return await processTransferValidation(tx, userId, payload, span);
    });

    // Step B: Execution Phase (Instrumented)
    return await runInSpan(tracer, "logic.execution", async () => {
      return await processTransferExecution(tx, sender, receiver, payload);
    });

  });
}

// HISTORY LOGIC

export async function getTransactionHistoryLogic(userId: number, accountId: number): Promise<TransactionResponse[]> {
  if (!userId) throw new AppError("Unauthorized", 401);
  const account = assertAccountOwner(await findAccountById(accountId), userId);
  const list = await findTransactionsByAccountId(account.id);
  return list.map(toResponse);
}

/**
 * RANGKUMAN ALUR LOGIC 
 * File ini bertindak sebagai "SOP Teller Bank" yang mengatur keluar-masuk uang.
 *
 * 1. PERALATAN (Helpers):
 * - `runInSpan`: Helper buatan kita untuk membungkus logic dengan OpenTelemetry (CCTV).
 * Fungsinya biar kita gak capek nulis try-catch-finally berulang kali.
 * - `assertAccountOwner`: Satpam yang ngecek "Ini beneran rekening lu bukan?".
 *
 * 2. STANDAR LOGIC (Deposit & Withdraw):
 * - Alurnya simpel: Cek Akun -> Hitung Saldo -> Update DB -> Catat History.
 *
 * 3. COMPLEX LOGIC (Transfer):
 * Ini adalah "Jantung" aplikasi yang sudah di-refactor (dipecah) menjadi 3 bagian:
 * A. `transferLogic` (Manager): Mengatur alur utama, nyalain Transaction DB (ACID),
 * dan nyiapin Tracer (Alat Ukur).
 * B. `processTransferValidation` (Babak 1): Fokus cuma buat ngecek Validasi
 * (Cek User, Cek Saldo, Cek Tujuan). Dibungkus Span "logic.validation".
 * C. `processTransferExecution` (Babak 2): Fokus cuma buat Eksekusi
 * (Potong Saldo, Tambah Saldo, Simpan History). Dibungkus Span "logic.execution".
 *
 * TUJUAN REFACTORING:
 * Agar di dashboard Jaeger, kita bisa melihat durasi terpisah antara "Waktu Mikir (Validasi)"
 * dan "Waktu Kerja (Eksekusi)". Jadi kalau lemot, kita tahu persis di mana masalahnya.
 * ==================================================================================
 */