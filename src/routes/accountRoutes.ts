import { createAccountLogic, getMyAccountsLogic } from "../logic/accountLogic";
import { jsonResponse, handleError } from "../errors/errorHandler";
import { getUserIdFromRequest } from "../middleware/authMiddleware";
import type { CreateAccountRequest } from "../dto/AccountDTO";

export async function accountRouter(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const { pathname } = url;

  try {
    // =====================
    // CREATE ACCOUNT
    // =====================
    if (pathname === "/accounts" && req.method === "POST") {
      // ✅ PERUBAHAN: Tambah 'await'
      const userId = await getUserIdFromRequest(req); 
      
      const body = (await req.json()) as CreateAccountRequest;
      const result = await createAccountLogic(userId, body);

      return jsonResponse(
        {
          success: true,
          message: "Account created successfully",
          data: result,
        },
        201
      );
    }

    // =====================
    // GET MY ACCOUNTS
    // =====================
    if (pathname === "/accounts" && req.method === "GET") {
      // ✅ PERUBAHAN: Tambah 'await'
      const userId = await getUserIdFromRequest(req);

      const result = await getMyAccountsLogic(userId);

      return jsonResponse(
        {
          success: true,
          message: "Accounts fetched",
          data: result,
        },
        200
      );
    }

    return jsonResponse({ success: false, message: "Not found" }, 404);
  } catch (err) {
    return handleError(err);
  }
}