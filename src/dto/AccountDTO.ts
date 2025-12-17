export interface CreateAccountRequest {
  accountName?: string;
  initialBalance: number;
}

export interface AccountResponse {
  id: number;
  userId: number;
  accountNumber: string;
  accountName?: string;
  balance: number;
  createdAt: Date;
}
