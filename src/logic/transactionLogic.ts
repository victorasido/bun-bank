// ... import yang lain tetap sama
import { withTransaction } from "../db/withTransaction";
import type { Transaction } from "../entities/Transaction";
import { TransactionType } from "../constants/TransactionType";
import type { DepositRequest, WithdrawRequest, TransferRequest, TransactionResponse } from "../dto/TransactionDTO";
import { AppError } from "../errors/AppError";
import { findAccountById, findAccountByNumber, updateAccountBalance } from "../repo/accountRepo";
import { saveTransaction, findTransactionsByAccountId } from "../repo/transactionRepo";

/**
 * =========================
 * Helper
 * =========================
 */
// ... assertAccountOwner tetap sama ...
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

/**
 * =========================
 * Deposit Logic
 * =========================
 */
export async function depositLogic(userId: number, payload: DepositRequest): Promise<TransactionResponse> {
  const { accountId, amount } = payload;
  if (!userId) throw new AppError("Unauthorized", 401);
  if (!accountId || amount == null || amount <= 0) throw new AppError("Invalid amount", 400);

  return await withTransaction(async (tx) => {
    const account = assertAccountOwner(await findAccountById(accountId, tx), userId);
    
    // Update Saldo
    const updatedAccount = await updateAccountBalance(accountId, amount, tx);
    const balanceAfter = Number(updatedAccount.balance);
    const balanceBefore = balanceAfter - amount;

    // ✅ Simpan Transaksi (Pake accountNumber)
    const transaction = await saveTransaction({
      accountNumber: updatedAccount.accountNumber, // ✅ Ganti accountId jadi ini
      type: TransactionType.DEPOSIT,
      amount,
      balanceBefore,
      balanceAfter,
      description: "Deposit money",
      referenceNumber: generateRef(),
      relatedAccountNumber: undefined
    }, tx);

    return toResponse(transaction);
  });
}

/**
 * =========================
 * Withdraw Logic
 * =========================
 */
export async function withdrawLogic(userId: number, payload: WithdrawRequest): Promise<TransactionResponse> {
  const { accountId, amount } = payload;
  if (!userId) throw new AppError("Unauthorized", 401);
  if (!accountId || amount == null || amount <= 0) throw new AppError("Invalid amount", 400);

  return await withTransaction(async (tx) => {
    const account = assertAccountOwner(await findAccountById(accountId, tx), userId);
    if (Number(account.balance) < amount) throw new AppError("Insufficient balance", 400);

    const updatedAccount = await updateAccountBalance(accountId, -amount, tx);
    const balanceAfter = Number(updatedAccount.balance);
    const balanceBefore = balanceAfter + amount;

    // ✅ Simpan Transaksi (Pake accountNumber)
    const transaction = await saveTransaction({
      accountNumber: updatedAccount.accountNumber, // ✅ Ganti accountId jadi ini
      type: TransactionType.WITHDRAW,
      amount,
      balanceBefore,
      balanceAfter,
      description: "Withdraw money",
      referenceNumber: generateRef(),
      relatedAccountNumber: undefined
    }, tx);

    return toResponse(transaction);
  });
}

/**
 * =========================
 * Transfer Logic
 * =========================
 */
/**
 * =========================
 * Transfer Logic
 * =========================
 */
export async function transferLogic(userId: number, payload: TransferRequest): Promise<TransactionResponse[]> {
  const { fromAccountId, toAccountNumber, amount, description } = payload;
  if (!userId) throw new AppError("Unauthorized", 401);
  if (!fromAccountId || !toAccountNumber || amount <= 0) throw new AppError("Invalid transfer", 400);

  return await withTransaction(async (tx) => {
    const sender = assertAccountOwner(await findAccountById(fromAccountId, tx), userId);
    
    if (sender.accountNumber === toAccountNumber) throw new AppError("Cannot transfer to self", 400);
    if (Number(sender.balance) < amount) throw new AppError("Insufficient balance", 400);

    const receiver = await findAccountByNumber(toAccountNumber, tx);
    if (!receiver) throw new AppError("Destination not found", 404);

    // 1. GENERATE BASE REF
    const baseRef = generateRef(); // Misal: TXN-12345

    // 2. Sender (Keluar)
    const updatedSender = await updateAccountBalance(sender.id, -amount, tx);
    const senderAfter = Number(updatedSender.balance);
    const senderBefore = senderAfter + amount;

    const txOut = await saveTransaction({
      accountNumber: sender.accountNumber,
      type: TransactionType.TRANSFER_OUT,
      amount,
      balanceBefore: senderBefore,
      balanceAfter: senderAfter,
      description: description || "Transfer Out",
      
      // ✅ FIX: Tambahin suffix "-OUT" biar unik
      referenceNumber: baseRef + "-OUT", 
      
      relatedAccountNumber: receiver.accountNumber
    }, tx);

    // 3. Receiver (Masuk)
    const updatedReceiver = await updateAccountBalance(receiver.id, amount, tx);
    const receiverAfter = Number(updatedReceiver.balance);
    const receiverBefore = receiverAfter - amount;

    const txIn = await saveTransaction({
      accountNumber: receiver.accountNumber,
      type: TransactionType.TRANSFER_IN,
      amount,
      balanceBefore: receiverBefore,
      balanceAfter: receiverAfter,
      description: description || "Transfer In",

      // ✅ FIX: Tambahin suffix "-IN" biar unik
      referenceNumber: baseRef + "-IN",

      relatedAccountNumber: sender.accountNumber
    }, tx);

    return [toResponse(txOut), toResponse(txIn)];
  });
}

/**
 * =========================
 * History Logic (Read)
 * =========================
 */
export async function getTransactionHistoryLogic(userId: number, accountId: number): Promise<TransactionResponse[]> {
  if (!userId) throw new AppError("Unauthorized", 401);
  const account = assertAccountOwner(await findAccountById(accountId), userId);
  
  // Repo udah kita update buat support find by accountId via JOIN
  const list = await findTransactionsByAccountId(account.id);
  return list.map(toResponse);
}