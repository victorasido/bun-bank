//import semua yang dibutuhkan
import { Hono } from "hono";
import {
  depositLogic,
  withdrawLogic,
  transferLogic,
  getTransactionHistoryLogic,
} from "../logic/transactionLogic";
import { authMiddleware } from "../middleware/authMiddleware";
import type {
  DepositRequest,
  WithdrawRequest,
  TransferRequest,
} from "../dto/TransactionDTO";

//context c yang bisa di isi data macem2
type AuthEnv = {
  Variables: {
    user: { userId: number };
  };
};

//router hono denagn authenv yang udah di definisin diatas
const app = new Hono<AuthEnv>();

//pasang middlereware dari authMiddleware
app.use("*", authMiddleware);

//post/transactions/deposit
app.post("/deposit", async (c) => {
  const user = c.get("user");
  const body = await c.req.json<DepositRequest>();
  
  const result = await depositLogic(user.userId, body);

  return c.json({ success: true, message: "Deposit successful", data: result }, 201);
});

//post/transactions/withdraw
app.post("/withdraw", async (c) => {
  const user = c.get("user");
  const body = await c.req.json<WithdrawRequest>();
  
  const result = await withdrawLogic(user.userId, body);

  return c.json({ success: true, message: "Withdraw successful", data: result }, 201);
});

//post/transactions/transfer
app.post("/transfer", async (c) => {
  const user = c.get("user");
  const body = await c.req.json<TransferRequest>();
  
  const result = await transferLogic(user.userId, body);

  return c.json({ success: true, message: "Transfer successful", data: result }, 201);
});

//get/transactions/:accountId (History)
app.get("/:accountId", async (c) => {
  const user = c.get("user");
  
  // Ambil parameter accountId dari URL
  const accountId = Number(c.req.param("accountId"));

  if (Number.isNaN(accountId)) {
    return c.json({ success: false, message: "Invalid account ID" }, 400);
  }

  const history = await getTransactionHistoryLogic(user.userId, accountId);

  return c.json({
    success: true,
    message: "Transaction history fetched",
    data: history,
  }, 200);
});

export default app;