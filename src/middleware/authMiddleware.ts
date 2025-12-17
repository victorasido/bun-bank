import { AppError } from "../errors/AppError";
import { verifyToken } from "../config/jwtUtil";

export interface AuthPayload {
  userId: number;
}

export function getUserIdFromRequest(req: Request): number {
  // ✅ FIX: Pake .get() karena ini standar Web Request di Bun
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Missing or invalid Authorization header", 401);
  }

  const token = authHeader.split(" ")[1];

  let payload: AuthPayload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new AppError("Invalid token", 401);
  }

  if (!payload.userId || Number.isNaN(payload.userId)) {
    throw new AppError("Invalid token payload", 401);
  }

  return payload.userId;
}