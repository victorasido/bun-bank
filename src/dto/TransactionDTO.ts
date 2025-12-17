export interface DepositRequest {
  accountId: number;
  amount: number;
  description?: string;
}

export interface WithdrawRequest {
  accountId: number;
  amount: number;
  description?: string;
}

export interface TransferRequest {
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  description?: string;
}

export interface TransactionResponse {
  id: number;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description?: string;
  referenceNumber?: string;
  createdAt: Date;
}
