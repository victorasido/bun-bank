import type { RegisterRequest, LoginRequest, AuthResponse } from "../dto/AuthDTO";
import { createUser, findUserByUsername, findUserByEmail } from "../repo/userRepo";
import { hashPassword, verifyPassword } from "./passwordUtil";
import { AppError } from "../errors/AppError";
import { signToken } from "../config/jwtUtil"; // Pastikan import ini aman

// REGISTER
export async function registerLogic(payload: RegisterRequest): Promise<AuthResponse> {
  const { username, email, password, fullName } = payload;

  if (!username || !email || !password) {
    throw new AppError("Username, email, and password are required", 400);
  }

  const existingByUsername = await findUserByUsername(username);
  if (existingByUsername) {
    throw new AppError("Username already taken", 400);
  }

  const existingByEmail = await findUserByEmail(email);
  if (existingByEmail) {
    throw new AppError("Email already registered", 400);
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser(username, email, passwordHash, fullName);

  // ✅ PERUBAHAN DI SINI: Tambah 'await'
  const token = await signToken(user.id);

  return {
    token,
    userId: user.id,
  };
}

// LOGIN
export async function loginLogic(payload: LoginRequest): Promise<AuthResponse> {
  const { username, password } = payload;

  if (!username || !password) {
    throw new AppError("Username and password are required", 400);
  }

  const user = await findUserByUsername(username);
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    throw new AppError("Invalid credentials", 401);
  }

  // ✅ PERUBAHAN DI SINI: Tambah 'await'
  const token = await signToken(user.id);

  return {
    token,
    userId: user.id,
  };
}