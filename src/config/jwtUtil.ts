// src/config/jwtUtil.ts

// NOTE: ini cuma placeholder untuk Goal 4.
// Goal 5 nanti bisa diisi pakai library JWT (misal jose/jsonwebtoken, dll).

export function signToken(userId: number): string {
  // TODO: implement JWT real di Goal 5
  return `fake-jwt-${userId}-${Date.now()}`;
}

export function verifyToken(token: string): { userId: number } {
  // TODO: implement JWT verify di Goal 5
  // sementara untuk demo:
  if (!token.startsWith("fake-jwt-")) {
    throw new Error("Invalid token");
  }
  const parts = token.split("-");
  const userId = Number(parts[2]);
  return { userId };
}
