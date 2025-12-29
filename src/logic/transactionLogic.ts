import { withTransaction } from "../db/withTransaction";
import type { Transaction } from "@prisma/client"; // 
import { TransactionType } from "../constants/TransactionType";
import type { DepositRequest, WithdrawRequest, TransferRequest, TransactionResponse } from "../dto/TransactionDTO";
import { AppError } from "../errors/AppError";
import { findAccountById, findAccountByNumber, updateAccountBalance } from "../service/accountService";
import { saveTransaction, findTransactionsByAccountId } from "../service/transactionService";

// --- Helper ---
function assertAccountOwner(account: any, userId: number): any {
  if (!account) throw new AppError("Account not found", 404);
  if (account.userId !== userId) throw new AppError("Forbidden: account not yours", 403);
  return account;
}

// ✅ HELPER BARU: Handle BigInt ke Number buat JSON
function toResponse(tx: Transaction): TransactionResponse {
  return {
    id: tx.id,
    type: tx.type,
    amount: Number(tx.amount),               // BigInt -> Number
    balanceBefore: Number(tx.balanceBefore), // BigInt -> Number
    balanceAfter: Number(tx.balanceAfter),   // BigInt -> Number
    description: tx.description,
    referenceNumber: tx.referenceNumber,
    createdAt: tx.createdAt,
  };
}

function generateRef(): string {
  return "TXN-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

// --- Deposit ---
export async function depositLogic(userId: number, payload: DepositRequest): Promise<TransactionResponse> {
  const { accountNumber, amount } = payload;
  if (!userId) throw new AppError("Unauthorized", 401);
  if (!accountNumber || amount <= 0) throw new AppError("Invalid amount", 400);

  return await withTransaction(async (tx) => {
    // Note: tx di sini udah support Prisma karena withTransaction kita udah update
    const account = assertAccountOwner(await findAccountByNumber(accountNumber, tx), userId);
    
    // Convert BigInt buat logic matematika saldo
    const currentBalance = BigInt(account.balance);
    const amountBg = BigInt(amount);

    const updatedAccount = await updateAccountBalance(account.id, amount, tx);

    const transaction = await saveTransaction({
      accountNumber: updatedAccount.accountNumber,
      type: TransactionType.DEPOSIT,
      amount: amountBg,             
      balanceBefore: currentBalance, 
      balanceAfter: updatedAccount.balance, 
      description: "Deposit money",
      referenceNumber: generateRef(),
      relatedAccountNumber: null,
    }, tx);

    return toResponse(transaction);
  });
}

// --- Withdraw ---
export async function withdrawLogic(userId: number, payload: WithdrawRequest): Promise<TransactionResponse> {
  const { accountNumber, amount } = payload;
  if (!userId) throw new AppError("Unauthorized", 401);
  if (!accountNumber || amount <= 0) throw new AppError("Invalid amount", 400);

  return await withTransaction(async (tx) => {
    const account = assertAccountOwner(await findAccountByNumber(accountNumber, tx), userId);
    
    const currentBalance = BigInt(account.balance);
    const amountBg = BigInt(amount);

    if (currentBalance < amountBg) throw new AppError("Insufficient balance", 400);

    const updatedAccount = await updateAccountBalance(account.id, -amount, tx);

    const transaction = await saveTransaction({
      accountNumber: updatedAccount.accountNumber,
      type: TransactionType.WITHDRAW,
      amount: amountBg,
      balanceBefore: currentBalance,
      balanceAfter: updatedAccount.balance,
      description: "Withdraw money",
      referenceNumber: generateRef(),
      relatedAccountNumber: null,
    }, tx);

    return toResponse(transaction);
  });
}

// --- Transfer  ---
export async function transferLogic(userId: number, payload: TransferRequest): Promise<TransactionResponse[]> {
  const { fromAccountNumber, toAccountNumber, amount, description } = payload;
  
  if (!userId) throw new AppError("Unauthorized", 401);
  if (!fromAccountNumber || !toAccountNumber || amount <= 0) throw new AppError("Invalid transfer", 400);
  if (fromAccountNumber === toAccountNumber) throw new AppError("Cannot transfer to self", 400);

  return await withTransaction(async (tx) => {
    const sender = await findAccountByNumber(fromAccountNumber, tx);
    assertAccountOwner(sender, userId);

    const senderBalance = BigInt(sender!.balance);
    const amountBg = BigInt(amount);

    if (senderBalance < amountBg) throw new AppError("Insufficient balance", 400);

    const receiver = await findAccountByNumber(toAccountNumber, tx);
    if (!receiver) throw new AppError("Destination account not found", 404);

    const receiverBalance = BigInt(receiver.balance);
    const baseRef = generateRef();

    // 1. Potong Saldo Pengirim
    const updatedSender = await updateAccountBalance(sender!.id, -amount, tx);
    const txOut = await saveTransaction({
      accountNumber: sender!.accountNumber,
      type: TransactionType.TRANSFER_OUT,
      amount: amountBg,
      balanceBefore: senderBalance,
      balanceAfter: updatedSender.balance,
      description: description || "Transfer Out",
      referenceNumber: baseRef + "-OUT",
      relatedAccountNumber: receiver.accountNumber
    }, tx);

    // 2. Tambah Saldo Penerima
    const updatedReceiver = await updateAccountBalance(receiver.id, amount, tx);
    const txIn = await saveTransaction({
      accountNumber: receiver.accountNumber,
      type: TransactionType.TRANSFER_IN,
      amount: amountBg,
      balanceBefore: receiverBalance,
      balanceAfter: updatedReceiver.balance,
      description: description || "Transfer In",
      referenceNumber: baseRef + "-IN",
      relatedAccountNumber: sender!.accountNumber
    }, tx);

    return [toResponse(txOut), toResponse(txIn)];
  });
}

// --- History ---
export async function getTransactionHistoryLogic(userId: number, accountId: number): Promise<TransactionResponse[]> {
  if (!userId) throw new AppError("Unauthorized", 401);
  const account = assertAccountOwner(await findAccountById(accountId), userId);
  
  const list = await findTransactionsByAccountId(account.id);
  return list.map(toResponse);
}