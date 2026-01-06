import { createMiddleware } from "hono/factory";
import { verifyToken } from "../config/jwtUtil";
import { trace } from "@opentelemetry/api";

// Ini tipe data buat Context Hono biar dia tau ada variabel 'user'
type Env = {
  Variables: {
    user: { userId: number };
  };
};

// Middleware autentikasi JWT
export const authMiddleware = createMiddleware<Env>(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      { success: false, message: "Unauthorized: Missing token" },
      401
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = await verifyToken(token);
    
    // simpan userId ke dalam 'c' (context).
    // controller call c.get('user')
    c.set("user", { userId: payload.userId });

    // Add span OpenTelemetry
    const cuurrentSpan = trace.getActiveSpan();

    // Add attribute userId to the current span
    if (cuurrentSpan) {
      cuurrentSpan.setAttribute("app.user.id", payload.userId);
    }
    
    await next(); // Lanjut ke controller berikutnya
  } catch (err) {
    return c.json(
      { success: false, message: "Unauthorized: Invalid token" },
      401
    );
  }
});