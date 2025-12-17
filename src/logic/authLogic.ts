import type { RegisterRequest, LoginRequest, AuthResponse } from "../dto/AuthDTO";
import { createUser, findUserByUsername, findUserByEmail } from "../repo/userRepo";
import { hashPassword, verifyPassword } from "./passwordUtil";
import { AppError } from "../errors/AppError";
import { signToken } from "../config/jwtUtil";

// REGISTER
export async function registerLogic(payload: RegisterRequest): Promise<AuthResponse> {
  const { username, email, password } = payload;

  if (!username || !email || !password) {
    throw new AppError("Username, email, and password are required", 400);
  }

  // ✅ Tambah 'await' karena repo sekarang async konek DB
  const existingByUsername = await findUserByUsername(username);
  if (existingByUsername) {
    throw new AppError("Username already taken", 400);
  }

  // ✅ Tambah 'await'
  const existingByEmail = await findUserByEmail(email);
  if (existingByEmail) {
    throw new AppError("Email already registered", 400);
  }

  const passwordHash = await hashPassword(password); // Pastiin hashPassword support async/sync aman
  
  // ✅ Tambah 'await' saat create user
  const user = await createUser(username, email, passwordHash);

  const token = signToken(user.id);

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

  // ✅ Tambah 'await'
  const user = await findUserByUsername(username);
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = signToken(user.id);

  return {
    token,
    userId: user.id,
  };
}