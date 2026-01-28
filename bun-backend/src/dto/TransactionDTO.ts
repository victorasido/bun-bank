import { TransactionType } from "../constants/TransactionType";

export interface TransactionResponse {
  id: number;
  type: TransactionType | string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description?: string | null;      
  referenceNumber: string;          
  createdAt: Date;
}

export interface DepositRequest {
  accountNumber: string;
  amount: number;
}

export interface WithdrawRequest {
  accountNumber: string;
  amount: number;
}

export interface TransferRequest {
  fromAccountNumber: string;
  toAccountNumber: string; 
  amount: number;
  description?: string;    
}