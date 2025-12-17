// src/index.ts

// supaya TypeScript tidak complain soal Bun
declare const Bun: any;

import { authRouter } from "./routes/authRoutes";
import { accountRouter } from "./routes/accountRoutes";
import { transactionRouter } from "./routes/transactionRoutes";

Bun.serve({
  port: 3000,

  async fetch(req: Request) {
    const url = new URL(req.url);
    const { pathname } = url;

    const json = (data: any, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: {
          "Content-Type": "application/json",
        },
      });

    try {
      // =========================
      // Health check
      // =========================
      if (pathname === "/health") {
        return json({
          status: "ok",
          app: "bun-user-account-app",
          bun: Bun?.version ?? "unknown",
        });
      }

      // =========================
      // Auth routes
      // =========================
      if (pathname.startsWith("/auth")) {
        return await authRouter(req);
      }

      // =========================
      // Account routes
      // =========================
      if (pathname.startsWith("/accounts")) {
        return await accountRouter(req);
      }

      // =========================
      // Transaction routes
      // =========================
      if (pathname.startsWith("/transactions")) {
        return await transactionRouter(req);
      }

      // =========================
      // Fallback
      // =========================
      return json({ error: "Not found" }, 404);
    } catch (err: any) {
      console.error("❌ Unhandled error:", err);

      return json(
        {
          error: "Internal Server Error",
          message: err?.message ?? "Unknown error",
        },
        500
      );
    }
  },
});

console.log("🚀 Server running on http://localhost:3000");
