//import semua yang dibutuhkan
import { Hono } from "hono";
import { TransactionLogic } from "../logic/transactionLogic";
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

//router hono denagn authenv yang udah di definisikan diatas
const app = new Hono<AuthEnv>();

const transactionLogic = new TransactionLogic();

//pasang middlereware dari authMiddleware
app.use("*", authMiddleware);

//post/transactions/deposit
app.post("/deposit", async (c) => {
  const user = c.get("user");
  const body = await c.req.json<DepositRequest>();
  
  const result = await transactionLogic.deposit(user.userId, body);

  return c.json({ success: true, message: "Deposit successful", data: result }, 201);
});

//post/transactions/withdraw
app.post("/withdraw", async (c) => {
  const user = c.get("user");
  const body = await c.req.json<WithdrawRequest>();
  
  const result = await transactionLogic.withdraw(user.userId, body);

  return c.json({ success: true, message: "Withdraw successful", data: result }, 201);
});

//post/transactions/transfer
app.post("/transfer", async (c) => {
  const user = c.get("user");
  const body = await c.req.json<TransferRequest>();
  
  const result = await transactionLogic.transfer(user.userId, body);

  return c.json({ success: true, message: "Transfer successful", data: result }, 201);
});

//get/transactions/:accountNumber (History)
app.get("/:accountNumber", async (c) => {
  const user = c.get("user");
  
  // Ambil parameter accountNumber dari URL
  const accountNumber = (c.req.param("accountNumber"));

  if (!accountNumber) {
    return c.json({ success: false, message: "Invalid account number" }, 400);
  }

  const history = await transactionLogic.getTransactionHistory(user.userId, accountNumber);
  return c.json({
    success: true,
    message: "Transaction history fetched",
    data: history,
  }, 200);
});

export default app;