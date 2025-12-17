import type { RegisterRequest, LoginRequest, AuthResponse } from "../dto/AuthDTO";
import { createUser, findUserByUsername, findUserByEmail } from "../repo/userRepo";
import { hashPassword, verifyPassword } from "./passwordUtil";
import { AppError } from "../errors/AppError";
import { signToken } from "../config/jwtUtil";

// REGISTER
export function registerLogic(payload: RegisterRequest): AuthResponse {
  const { username, email, password } = payload;

  if (!username || !email || !password) {
    throw new AppError("Username, email, and password are required", 400);
  }

  // cek duplikasi username
  const existingByUsername = findUserByUsername(username);
  if (existingByUsername) {
    throw new AppError("Username already taken", 400);
  }

  // cek duplikasi email
  const existingByEmail = findUserByEmail(email);
  if (existingByEmail) {
    throw new AppError("Email already registered", 400);
  }

  const passwordHash = hashPassword(password);
  const user = createUser(username, email, passwordHash);

  // ⬇️ pakai signToken, bukan generateFakeToken
  const token = signToken(user.id);

  return {
    token,
    userId: user.id,
  };
}

// LOGIN
export function loginLogic(payload: LoginRequest): AuthResponse {
  const { username, password } = payload;

  if (!username || !password) {
    throw new AppError("Username and password are required", 400);
  }

  const user = findUserByUsername(username);
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const ok = verifyPassword(password, user.passwordHash);
  if (!ok) {
    throw new AppError("Invalid credentials", 401);
  }

  // ⬇️ sama, pakai signToken
  const token = signToken(user.id);

  return {
    token,
    userId: user.id,
  };
}
