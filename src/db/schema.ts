export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  password: string;
  created_at: Date;
}

export interface Account {
  id: number;
  user_id: number;
  account_number: string;
  balance: number;
  created_at: Date;
}

export interface Transaction {
  id: number;
  from_account: string;
  to_account: string | null;
  amount: number;
  type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";
  description: string;
  created_at: Date;
}
