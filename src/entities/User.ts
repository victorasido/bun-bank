export interface User {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  fullName?: string | null; // ✅ Tambahan baru
  createdAt: Date;
}