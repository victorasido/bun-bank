import { Pool } from "pg";

export const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "bun_user",
  password: process.env.DB_PASSWORD || "bun_password",
  database: process.env.DB_NAME || "bun_bank",
  // Pengaturan pool koneksi
  max: 20, 
  min: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000, //proses query timeout
});
