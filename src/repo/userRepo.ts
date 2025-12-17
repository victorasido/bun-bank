import type { User } from "../entities/User";

let users: User[] = [];
let nextUserId = 1;

export function createUser(username: string, email: string, passwordHash: string): User {
  const user: User = {
    id: nextUserId++,
    username,
    email,
    passwordHash,
    createdAt: new Date(),
  };
  users.push(user);
  return user;
}

export function findUserByUsername(username: string): User | undefined {
  return users.find((u) => u.username === username);
}

export function findUserByEmail(email: string): User | undefined {
  return users.find((u) => u.email === email);
}

export function findUserById(id: number): User | undefined {
  return users.find((u) => u.id === id);
}