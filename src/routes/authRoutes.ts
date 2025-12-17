import { registerLogic, loginLogic } from "../logic/authLogic";
import { jsonResponse, handleError } from "../errors/errorHandler";
import type { RegisterRequest, LoginRequest } from "../dto/AuthDTO";

export async function authRouter(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const { pathname } = url;

  try {
    // =====================
    // REGISTER
    // POST /auth/register
    // =====================
    if (pathname === "/auth/register" && req.method === "POST") {
      const body = (await req.json()) as RegisterRequest;

      // ✅ WAJIB AWAIT: Karena registerLogic sekarang connect ke DB
      const result = await registerLogic(body);

      return jsonResponse(
        {
          success: true,
          message: "User registered successfully",
          data: result,
        },
        201
      );
    }

    // =====================
    // LOGIN
    // POST /auth/login
    // =====================
    if (pathname === "/auth/login" && req.method === "POST") {
      const body = (await req.json()) as LoginRequest;

      // ✅ WAJIB AWAIT: Karena loginLogic sekarang connect ke DB
      const result = await loginLogic(body);

      return jsonResponse(
        {
          success: true,
          message: "Login successful",
          data: result,
        },
        200
      );
    }

    // Endpoint tidak ditemukan di router ini
    return jsonResponse(
      { success: false, message: "Auth route not found" },
      404
    );
  } catch (err) {
    return handleError(err);
  }
}