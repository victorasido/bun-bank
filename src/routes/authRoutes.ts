//import necessary modules and types
import { Hono } from "hono";
import { registerLogic, loginLogic } from "../logic/authLogic";
import type { RegisterRequest, LoginRequest } from "../dto/AuthDTO";

//router hono
const app = new Hono();

//post/auth/register
app.post("/register", async (c) => {
  const body = await c.req.json<RegisterRequest>();
  const result = await registerLogic(body);

  return c.json({
    success: true,
    message: "User registered successfully",
    data: result,
  }, 201);
});

//post/auth/login
app.post("/login", async (c) => {
  const body = await c.req.json<LoginRequest>();
  const result = await loginLogic(body);

  return c.json({
    success: true,
    message: "Login successful",
    data: result,
  }, 200);
});

export default app;