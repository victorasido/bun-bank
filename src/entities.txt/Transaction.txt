import { TransactionType } from "../constants/TransactionType";

export interface Transaction {
  id: number;
  accountNumber: string;       
  type: TransactionType | string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description?: string | null;
  referenceNumber: string;
  relatedAccountNumber?: string | null; 
  createdAt: Date;
}