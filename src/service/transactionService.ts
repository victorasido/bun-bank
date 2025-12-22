import type { Transaction } from "../entities/Transaction";
import { pool } from "../db/postgres";

type DBExecutor = typeof pool;

/**
 * =========================
 * SAVE TRANSACTION
 * =========================
 */
export async function saveTransaction(
  txData: Omit<Transaction, "id" | "createdAt">,
  tx: DBExecutor = pool
): Promise<Transaction> {
  const result = await tx.query(
    `
    INSERT INTO transactions (
      account_number,        -- ✅ Sesuai Schema (Text)
      type,
      amount,
      balance_before,
      balance_after,
      description,
      reference_number,
      to_account_number      -- ✅ Sesuai Schema (Text)
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING 
      id,
      account_number AS "accountNumber",
      type,
      amount,
      balance_before AS "balanceBefore",
      balance_after AS "balanceAfter",
      description,
      reference_number AS "referenceNumber",
      to_account_number AS "relatedAccountNumber",
      created_at AS "createdAt"
    `,
    [
      txData.accountNumber, // ✅ Kirim String
      txData.type,
      txData.amount,
      txData.balanceBefore,
      txData.balanceAfter,
      txData.description,
      txData.referenceNumber,
      txData.relatedAccountNumber || null,
    ]
  );

  return result.rows[0];
}

/**
 * =========================
 * FIND BY ACCOUNT ID
 * =========================
 * Karena DB cuma nyimpen 'account_number', kita perlu JOIN ke tabel 'accounts'
 * buat nyari transaksi berdasarkan 'accountId' (integer).
 */
export async function findTransactionsByAccountId(
  accountId: number,
  tx: DBExecutor = pool
): Promise<Transaction[]> {
  const result = await tx.query(
    `
    SELECT 
      t.id,
      t.account_number AS "accountNumber",
      t.type,
      t.amount,
      t.balance_before AS "balanceBefore",
      t.balance_after AS "balanceAfter",
      t.description,
      t.reference_number AS "referenceNumber",
      t.to_account_number AS "relatedAccountNumber",
      t.created_at AS "createdAt"
    FROM transactions t
    JOIN accounts a ON t.account_number = a.account_number -- ✅ JOIN table
    WHERE a.id = $1
    ORDER BY t.created_at DESC
    `,
    [accountId]
  );

  return result.rows;
}