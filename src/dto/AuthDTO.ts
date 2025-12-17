export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
}
