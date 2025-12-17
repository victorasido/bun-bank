import { pool } from "./postgres";

console.log("🔄 Melakukan migrasi database...");

try {
  // Baca file schema.sql langsung pake fitur Bun
  const schema = await Bun.file("src/database/schema.sql").text();

  // Eksekusi query bikin tabel
  await pool.query(schema);

  console.log("✅ Migrasi BERHASIL! Tabel sudah dibuat.");
} catch (error) {
  console.error("❌ Migrasi GAGAL:", error);
} finally {
  // Tutup koneksi biar script berhenti
  await pool.end();
}