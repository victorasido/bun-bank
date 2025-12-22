import { pool } from "../db/postgres";
import type { User } from "../entities/User";

/**
 * =========================
 * CREATE USER
 * =========================
 */
export async function createUser(
  username: string,
  email: string,
  passwordHash: string,
  fullName?: string // ✅ Terima parameter fullName
): Promise<User> {
  const result = await pool.query(
    `
    INSERT INTO users (username, email, password_hash, full_name)
    VALUES ($1, $2, $3, $4)
    RETURNING 
      id, 
      username, 
      email, 
      password_hash AS "passwordHash", 
      full_name AS "fullName", 
      created_at AS "createdAt"
    `,
    [username, email, passwordHash, fullName || null]
  );
  
  return result.rows[0];
}

/**
 * =========================
 * FIND BY USERNAME
 * =========================
 */
export async function findUserByUsername(
  username: string
): Promise<User | undefined> {
  const result = await pool.query(
    `
    SELECT 
      id, 
      username, 
      email, 
      password_hash AS "passwordHash", 
      full_name AS "fullName",
      created_at AS "createdAt"
    FROM users 
    WHERE username = $1
    `,
    [username]
  );

  return result.rows[0];
}

/**
 * =========================
 * FIND BY EMAIL
 * =========================
 */
export async function findUserByEmail(
  email: string
): Promise<User | undefined> {
  const result = await pool.query(
    `
    SELECT 
      id, 
      username, 
      email, 
      password_hash AS "passwordHash", 
      full_name AS "fullName",
      created_at AS "createdAt"
    FROM users 
    WHERE email = $1
    `,
    [email]
  );

  return result.rows[0];
}

/**
 * =========================
 * FIND BY ID
 * =========================
 */
export async function findUserById(
  id: number
): Promise<User | undefined> {
  const result = await pool.query(
    `
    SELECT 
      id, 
      username, 
      email, 
      password_hash AS "passwordHash", 
      full_name AS "fullName",
      created_at AS "createdAt"
    FROM users 
    WHERE id = $1
    `,
    [id]
  );

  return result.rows[0];
}