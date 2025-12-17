// src/routes/accountRoutes.ts
import { jsonResponse, handleError } from "../errors/errorHandler";

export async function accountRouter(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const { pathname } = url;

  try {
    // TODO: implement account routes
    return jsonResponse(
      {
        success: false,
        error: "Not implemented",
      },
      501,
    );
  } catch (err) {
    return handleError(err);
  }
}
