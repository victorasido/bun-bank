//import module
import { Hono } from "hono";
import { logger } from "hono/logger";

//import routes
import authRoutes from "./routes/authRoutes";
import accountRoutes from "./routes/accountRoutes";
import transactionRoutes from "./routes/transactionRoutes";

const app = new Hono();

//logger middleware
app.use("*", logger());

//app error handler
app.onError((err, c) => {
  console.error(`❌ Error: ${err.message}`);
  
  // Default status 500, kecuali error-nya punya status code sendiri
  const status = (err as any).status || 500;
  return c.json({
    success: false,
    message: err.message || "Internal Server Error",
  }, status);
});

// 3. HEALTH CHECK
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    app: "bun-bank-hono",
    version: "1.0.0"
  });
});

// route mounting
app.route("/auth", authRoutes);
app.route("/accounts", accountRoutes);
app.route("/transactions", transactionRoutes);

//start server
console.log("🚀 Server running on http://localhost:3000");

export default {
  port: 3000,
  fetch: app.fetch, // Ini yang bikin Hono jalan di atas Bun
};