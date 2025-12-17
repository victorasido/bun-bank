import type { Account } from "../entities/Account";
import { pool } from "../db/postgres";

/**
 * =========================
 * CREATE
 * =========================
 */
export async function createAccount(
  userId: number,
  accountNumber: string,
  accountName: string,
  initialBalance: number
): Promise<Account> {
  const result = await pool.query(
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
  id: number
): Promise<Account | undefined> {
  const result = await pool.query(
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
  userId: number
): Promise<Account[]> {
  const result = await pool.query(
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
  accountNumber: string
): Promise<Account | undefined> {
  const result = await pool.query(
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
 * UPDATE BALANCE
 * =========================
 */
export async function updateAccount(
  account: Account
): Promise<Account> {
  const result = await pool.query(
    `
    UPDATE accounts
    SET balance = $1
    WHERE id = $2
    RETURNING
      id,
      user_id AS "userId",
      account_number AS "accountNumber",
      account_name AS "accountName",
      balance,
      created_at AS "createdAt"
    `,
    [account.balance, account.id]
  );

  if (!result.rows[0]) {
    throw new Error("Account not found");
  }

  return result.rows[0];
}
