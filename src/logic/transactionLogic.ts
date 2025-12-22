import { withTransaction } from "../db/withTransaction";
import type { Transaction } from "../entities/Transaction";
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

// --- Deposit ---
export async function depositLogic(userId: number, payload: DepositRequest): Promise<TransactionResponse> {
  const { accountId, amount } = payload;
  if (!userId) throw new AppError("Unauthorized", 401);
  if (!accountId || amount <= 0) throw new AppError("Invalid amount", 400);

  return await withTransaction(async (tx) => {
    const account = assertAccountOwner(await findAccountById(accountId, tx), userId);
    const updatedAccount = await updateAccountBalance(accountId, amount, tx);

    const transaction = await saveTransaction({
      accountNumber: updatedAccount.accountNumber,
      type: TransactionType.DEPOSIT,
      amount,
      balanceBefore: Number(account.balance),
      balanceAfter: Number(updatedAccount.balance),
      description: "Deposit money",
      referenceNumber: generateRef(),
    }, tx);

    return toResponse(transaction);
  });
}

// --- Withdraw ---
export async function withdrawLogic(userId: number, payload: WithdrawRequest): Promise<TransactionResponse> {
  const { accountId, amount } = payload;
  if (!userId) throw new AppError("Unauthorized", 401);
  if (!accountId || amount <= 0) throw new AppError("Invalid amount", 400);

  return await withTransaction(async (tx) => {
    const account = assertAccountOwner(await findAccountById(accountId, tx), userId);
    if (Number(account.balance) < amount) throw new AppError("Insufficient balance", 400);

    const updatedAccount = await updateAccountBalance(accountId, -amount, tx);

    const transaction = await saveTransaction({
      accountNumber: updatedAccount.accountNumber,
      type: TransactionType.WITHDRAW,
      amount,
      balanceBefore: Number(account.balance),
      balanceAfter: Number(updatedAccount.balance),
      description: "Withdraw money",
      referenceNumber: generateRef(),
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
    // 1. Cari Akun Pengirim by NUMBER (Bukan ID)
    const sender = await findAccountByNumber(fromAccountNumber, tx);
    
    // 2. VALIDASI KEPEMILIKAN (Wajib Punya User yg Login)
    assertAccountOwner(sender, userId);

    // 3. Cek Saldo
    if (Number(sender!.balance) < amount) throw new AppError("Insufficient balance", 400);

    // 4. Cari Akun Penerima
    const receiver = await findAccountByNumber(toAccountNumber, tx);
    if (!receiver) throw new AppError("Destination account not found", 404);

    const baseRef = generateRef();

    // 5. Eksekusi Transfer (Sender Keluar)
    const updatedSender = await updateAccountBalance(sender!.id, -amount, tx);
    const txOut = await saveTransaction({
      accountNumber: sender!.accountNumber,
      type: TransactionType.TRANSFER_OUT,
      amount,
      balanceBefore: Number(sender!.balance),
      balanceAfter: Number(updatedSender.balance),
      description: description || "Transfer Out",
      referenceNumber: baseRef + "-OUT",
      relatedAccountNumber: receiver.accountNumber
    }, tx);

    // 6. Eksekusi Transfer (Receiver Masuk)
    const updatedReceiver = await updateAccountBalance(receiver.id, amount, tx);
    const txIn = await saveTransaction({
      accountNumber: receiver.accountNumber,
      type: TransactionType.TRANSFER_IN,
      amount,
      balanceBefore: Number(receiver.balance),
      balanceAfter: Number(updatedReceiver.balance),
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