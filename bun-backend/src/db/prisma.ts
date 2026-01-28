import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { pool } from "./postgres"; 
// 1. adapter prisma ke pool
const adapter = new PrismaPg(pool);

// 2. Inisialisasi Prisma Client pake adapter
export const prisma = new PrismaClient({
  adapter,
}); 