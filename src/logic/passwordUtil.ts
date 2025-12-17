export function hashPassword(password: string): string {
  // sementara, cuma contoh. Nanti bisa diganti bcrypt.
  return "HASHED:" + password;
}

export function verifyPassword(password: string, hash: string): boolean {
  return hash === "HASHED:" + password;
}