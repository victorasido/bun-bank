import { AppError } from "../errors/AppError";
import { verifyToken } from "../config/jwtUtil";

export interface AuthPayload {
  userId: number;
}

// ✅ Ubah jadi Async Function
export async function getUserIdFromRequest(req: Request): Promise<number> {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Missing or invalid Authorization header", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    // ✅ Tambah 'await' di sini
    const payload = await verifyToken(token);
    
    if (!payload.userId || Number.isNaN(payload.userId)) {
      throw new AppError("Invalid token payload", 401);
    }

    return payload.userId;
  } catch (err) {
    throw new AppError("Invalid or expired token", 401);
  }
}