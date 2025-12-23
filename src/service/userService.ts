import { PrismaClient } from "@prisma/client";
import type { User } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * =========================
 * CREATE USER
 * =========================
 */
export async function createUser(
  username: string,
  email: string,
  passwordHash: string,
  fullName?: string
): Promise<User> {
  // Pake Prisma: Lebih bersih, gak ada SQL string
  return await prisma.user.create({
    data: {
      username,
      email,
      passwordHash, // Prisma otomatis map ke 'password_hash' di DB
      fullName,     // Prisma otomatis map ke 'full_name' di DB
    },
  });
}

/**
 * =========================
 * FIND BY USERNAME
 * =========================
 */
export async function findUserByUsername(
  username: string
): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { username },
  });
}

/**
 * =========================
 * FIND BY EMAIL
 * =========================
 */
export async function findUserByEmail(
  email: string
): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { email },
  });
}

/**
 * =========================
 * FIND BY ID
 * =========================
 */
export async function findUserById(
  id: number
): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { id },
  });
}