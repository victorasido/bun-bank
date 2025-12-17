// src/routes/authRoutes.ts
import { registerLogic, loginLogic } from "../logic/authLogic";
import type { RegisterRequest, LoginRequest } from "../dto/AuthDTO";
import { jsonResponse, handleError } from "../errors/errorHandler";

export async function authRouter(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const { pathname } = url;

  try {
    if (pathname === "/auth/register" && req.method === "POST") {
      const body = (await req.json()) as RegisterRequest;
      const result = registerLogic(body);
      return jsonResponse(
        {
          success: true,
          data: result,
        },
        201,
      );
    }

    if (pathname === "/auth/login" && req.method === "POST") {
      const body = (await req.json()) as LoginRequest;
      const result = loginLogic(body);
      return jsonResponse(
        {
          success: true,
          data: result,
        },
        200,
      );
    }

    // kalau /auth tapi path-nya bukan yang dikenal
    return jsonResponse(
      {
        success: false,
        error: "Not found",
      },
      404,
    );
  } catch (err) {
    return handleError(err);
  }
}
