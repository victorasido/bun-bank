export const config = {
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "bun_user",
    password: process.env.DB_PASSWORD || "bun_password",
    name: process.env.DB_NAME || "bun_bank",
  },
  jwt: {
    // Ambil dari .env, kalau kosong pake default (untuk dev)
    secret: process.env.JWT_SECRET || "default_secret_kalau_lupa_set_env",
    expiration: process.env.JWT_EXPIRATION || "10m",
  },
};