import type {
  DepositRequest,
  WithdrawRequest,
  TransferRequest,
  TransactionResponse,
} from "../dto/TransactionDTO";

import { AppError } from "../errors/AppError";
import {
  findAccountById,
  updateAccount,
} from "../repo/accountRepo";

import {
  saveTransaction,
  findTransactionsByAccountId,
} from "../repo/transactionRepo";

import type { Account } from "../entities/Account";
import type { Transaction } from "../entities/Transaction";
import { TransactionType } from "../constants/TransactionType";

/**
 * =========================
 * Helper
 * =========================
 */
function assertAccountOwner(
  account: Account | undefined,
  userId: number
): Account {
  if (!account) throw new AppError("Account not found", 404);
  if (account.userId !== userId)
    throw new AppError("Forbidden: account not yours", 403);
  return account;
}

function toResponse(tx: Transaction): TransactionResponse {
  return {
    id: tx.id,
    type: tx.type,
    amount: tx.amount,
    balanceBefore: tx.balanceBefore,
    balanceAfter: tx.balanceAfter,
    createdAt: tx.createdAt,
  };
}

/**
 * =========================
 * Deposit
 * =========================
 */
export async function depositLogic(
  userId: number,
  payload: DepositRequest
): Promise<TransactionResponse> {
  const { accountId, amount } = payload;

  if (!userId) throw new AppError("Unauthorized", 401);
  if (!accountId || amount == null)
    throw new AppError("accountId and amount are required", 400);
  if (amount <= 0) throw new AppError("Amount must be positive", 400);

  const account = assertAccountOwner(
    await findAccountById(accountId),
    userId
  );

  const balanceBefore = account.balance;
  const balanceAfter = balanceBefore + amount;

  await updateAccount({ ...account, balance: balanceAfter });

  const tx = await saveTransaction({
    accountId: account.id,
    type: TransactionType.DEPOSIT,
    amount,
    balanceBefore,
    balanceAfter,
  });

  return toResponse(tx);
}

/**
 * =========================
 * Withdraw
 * =========================
 */
export async function withdrawLogic(
  userId: number,
  payload: WithdrawRequest
): Promise<TransactionResponse> {
  const { accountId, amount } = payload;

  if (!userId) throw new AppError("Unauthorized", 401);
  if (!accountId || amount == null)
    throw new AppError("accountId and amount are required", 400);
  if (amount <= 0) throw new AppError("Amount must be positive", 400);

  const account = assertAccountOwner(
    await findAccountById(accountId),
    userId
  );

  const balanceBefore = account.balance;
  if (balanceBefore < amount)
    throw new AppError("Insufficient balance", 400);

  const balanceAfter = balanceBefore - amount;

  await updateAccount({ ...account, balance: balanceAfter });

  const tx = await saveTransaction({
    accountId: account.id,
    type: TransactionType.WITHDRAW,
    amount,
    balanceBefore,
    balanceAfter,
  });

  return toResponse(tx);
}

/**
 * =========================
 * Transfer
 * =========================
 */
export async function transferLogic(
  userId: number,
  payload: TransferRequest
): Promise<TransactionResponse[]> {
  const { fromAccountId, toAccountId, amount } = payload;

  if (!userId) throw new AppError("Unauthorized", 401);
  if (!fromAccountId || !toAccountId || amount == null)
    throw new AppError("Missing transfer fields", 400);
  if (fromAccountId === toAccountId)
    throw new AppError("Cannot transfer to same account", 400);
  if (amount <= 0) throw new AppError("Amount must be positive", 400);

  const from = assertAccountOwner(
    await findAccountById(fromAccountId),
    userId
  );
  const to = await findAccountById(toAccountId);

  if (!to) throw new AppError("Destination account not found", 404);
  if (from.balance < amount)
    throw new AppError("Insufficient balance", 400);

  const fromBefore = from.balance;
  const toBefore = to.balance;

  const fromAfter = fromBefore - amount;
  const toAfter = toBefore + amount;

  await updateAccount({ ...from, balance: fromAfter });
  await updateAccount({ ...to, balance: toAfter });

  const txOut = await saveTransaction({
    accountId: from.id,
    type: TransactionType.TRANSFER_OUT,
    amount,
    balanceBefore: fromBefore,
    balanceAfter: fromAfter,
  });

  const txIn = await saveTransaction({
    accountId: to.id,
    type: TransactionType.TRANSFER_IN,
    amount,
    balanceBefore: toBefore,
    balanceAfter: toAfter,
  });

  return [toResponse(txOut), toResponse(txIn)];
}

/**
 * =========================
 * History
 * =========================
 */
export async function getTransactionHistoryLogic(
  userId: number,
  accountId: number
): Promise<TransactionResponse[]> {
  if (!userId) throw new AppError("Unauthorized", 401);

  const account = assertAccountOwner(
    await findAccountById(accountId),
    userId
  );

  const list = await findTransactionsByAccountId(account.id);
  return list.map(toResponse);
}
