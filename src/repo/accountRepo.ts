import type { Account } from "../entities/Account";
import { pool } from "../db/postgres";

// Kita define tipe untuk Executor (bisa Pool atau Transaction Client)
// Ini biar repo kita bisa dipake dalam mode biasa ATAU mode transaksi
type DBExecutor = typeof pool; 

/**
 * =========================
 * CREATE
 * =========================
 */
export async function createAccount(
  userId: number,
  accountNumber: string,
  accountName: string,
  initialBalance: number,
  tx: DBExecutor = pool // Default pake pool (auto-commit) kalau gak ada transaksi
): Promise<Account> {
  const result = await tx.query(
    `
    INSERT INTO accounts
      (user_id, account_number, account_name, balance)
    VALUES
      ($1, $2, $3, $4)
    RETURNING
      id,
      user_id AS "userId",
      account_number AS "accountNumber",
      account_name AS "accountName",
      balance,
      created_at AS "createdAt"
    `,
    [userId, accountNumber, accountName, initialBalance]
  );

  return result.rows[0];
}

/**
 * =========================
 * FIND BY ID
 * =========================
 */
export async function findAccountById(
  id: number,
  tx: DBExecutor = pool
): Promise<Account | undefined> {
  const result = await tx.query(
    `
    SELECT
      id,
      user_id AS "userId",
      account_number AS "accountNumber",
      account_name AS "accountName",
      balance,
      created_at AS "createdAt"
    FROM accounts
    WHERE id = $1
    `,
    [id]
  );

  return result.rows[0];
}

/**
 * =========================
 * FIND BY USER
 * =========================
 */
export async function findAccountsByUserId(
  userId: number,
  tx: DBExecutor = pool
): Promise<Account[]> {
  const result = await tx.query(
    `
    SELECT
      id,
      user_id AS "userId",
      account_number AS "accountNumber",
      account_name AS "accountName",
      balance,
      created_at AS "createdAt"
    FROM accounts
    WHERE user_id = $1
    ORDER BY created_at DESC
    `,
    [userId]
  );

  return result.rows;
}

/**
 * =========================
 * FIND BY ACCOUNT NUMBER
 * =========================
 */
export async function findAccountByNumber(
  accountNumber: string,
  tx: DBExecutor = pool
): Promise<Account | undefined> {
  const result = await tx.query(
    `
    SELECT
      id,
      user_id AS "userId",
      account_number AS "accountNumber",
      account_name AS "accountName",
      balance,
      created_at AS "createdAt"
    FROM accounts
    WHERE account_number = $1
    `,
    [accountNumber]
  );

  return result.rows[0];
}

/**
 * =========================
 * UPDATE BALANCE (ATOMIC & SAFE)
 * =========================
 * Perubahan:
 * 1. Menerima 'amountChange' (selisih), bukan saldo akhir.
 * 2. Menggunakan query 'balance = balance + $1' biar aman dari race condition.
 */
export async function updateAccountBalance(
  id: number,
  amountChange: number,
  tx: DBExecutor = pool
): Promise<Account> {
  const result = await tx.query(
    `
    UPDATE accounts
    SET balance = balance + $1
    WHERE id = $2
    RETURNING
      id,
      user_id AS "userId",
      account_number AS "accountNumber",
      account_name AS "accountName",
      balance,
      created_at AS "createdAt"
    `,
    [amountChange, id]
  );

  if (!result.rows[0]) {
    throw new Error("Account not found");
  }

  return result.rows[0];
}