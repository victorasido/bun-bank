export interface User {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  fullName?: string | null; 
}