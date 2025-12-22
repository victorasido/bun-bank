import { pool } from "../db/postgres";
import type { Account } from "../entities/Account";

// Helper untuk mapping row DB ke object Account
function mapToAccount(row: any): Account {
  return {
    id: row.id,
    userId: row.user_id,
    accountNumber: row.account_number,
    accountName: row.account_name,
    balance: Number(row.balance), // Pastikan jadi number
    createdAt: row.created_at,
  };
}

export async function createAccount(userId: number, accountName: string, accountNumber: string, tx?: any): Promise<Account> {
  const client = tx || pool;
  const query = `
    INSERT INTO accounts (user_id, account_name, account_number, balance)
    VALUES ($1, $2, $3, 0)
    RETURNING *;
  `;
  const res = await client.query(query, [userId, accountName, accountNumber]);
  return mapToAccount(res.rows[0]);
}

export async function findAccountsByUserId(userId: number): Promise<Account[]> {
  const res = await pool.query("SELECT * FROM accounts WHERE user_id = $1", [userId]);
  return res.rows.map(mapToAccount);
}

export async function findAccountById(accountId: number, tx?: any): Promise<Account | null> {
  const client = tx || pool;
  const res = await client.query("SELECT * FROM accounts WHERE id = $1", [accountId,]);
  return res.rows[0] ? mapToAccount(res.rows[0]) : null;
}

// ✅ FUNGSI BARU (PENTING BUAT TRANSFER)
export async function findAccountByNumber(accountNumber: string, tx?: any): Promise<Account | null> {
  const client = tx || pool;
  const res = await client.query("SELECT * FROM accounts WHERE account_number = $1", [accountNumber]);
  return res.rows[0] ? mapToAccount(res.rows[0]) : null;
}

export async function updateAccountBalance(accountId: number, amount: number, tx?: any): Promise<Account> {
  const client = tx || pool;
  const query = `
    UPDATE accounts 
    SET balance = balance + $1 
    WHERE id = $2 
    RETURNING *;
  `;
  const res = await client.query(query, [amount, accountId]);
  return mapToAccount(res.rows[0]);
}