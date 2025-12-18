import { SignJWT, jwtVerify } from "jose";

// Kunci rahasia buat tanda tangan digital (Secret Key)
// Di production, ini WAJIB dari process.env.JWT_SECRET
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "kunci_rahasia_bni_super_aman_123"
);

export async function signToken(userId: number): Promise<string> {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" }) // Algoritma hashing
    .setIssuedAt()
    .setExpirationTime("2h") // Token basi dalam 2 jam
    .sign(SECRET_KEY);
}

export async function verifyToken(token: string): Promise<{ userId: number }> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return { userId: Number(payload.userId) };
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
}