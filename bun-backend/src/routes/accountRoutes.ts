//impost necessary modules and types 
import { Hono } from "hono";
import { AccountLogic } from "../logic/accountLogic";
import { authMiddleware } from "../middleware/authMiddleware";
import type { CreateAccountRequest } from "../dto/AccountDTO";

//context c yang bisa di isi data macem2
type AuthEnv = {
  Variables: {
    user: { userId: number };
  };
};

//router yang udah di definisikan diatas
const app = new Hono<AuthEnv>();

const accountLogic = new AccountLogic();

//pasang middlereware dari authMiddleware
app.use("*", authMiddleware);

//post/account (Create Account)
app.post("/", async (c) => {
  const user = c.get("user"); //ambil data user dengan c.get
  const body = await c.req.json<CreateAccountRequest>(); //ambil body request
  const result = await accountLogic.createAccount(user.userId, body); //panggil logic create account

  return c.json({
    success: true,
    message: "Account created successfully",
    data: result,
  }, 201);
});

// GET /accounts (List My Accounts)
app.get("/", async (c) => {
  const user = c.get("user");
  const result = await accountLogic.getMyAccounts(user.userId); //panggil logic get my accounts

  return c.json({
    success: true,
    message: "Accounts fetched",
    data: result,
  }, 200);
}); 

export default app;