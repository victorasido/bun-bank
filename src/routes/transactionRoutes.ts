import {
  depositLogic,
  withdrawLogic,
  transferLogic,
  getTransactionHistoryLogic,
} from "../logic/transactionLogic";
import { jsonResponse, handleError } from "../errors/errorHandler";
import { getUserIdFromRequest } from "../middleware/authMiddleware";
import type {
  DepositRequest,
  WithdrawRequest,
  TransferRequest,
} from "../dto/TransactionDTO";

export async function transactionRouter(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const { pathname } = url;

  try {
    // =====================
    // DEPOSIT
    // =====================
    if (pathname === "/transactions/deposit" && req.method === "POST") {
      // ✅ PERUBAHAN: Tambah 'await'
      const userId = await getUserIdFromRequest(req);
      
      const body = (await req.json()) as DepositRequest;
      const result = await depositLogic(userId, body);

      return jsonResponse(
        { success: true, message: "Deposit successful", data: result },
        201
      );
    }

    // =====================
    // WITHDRAW
    // =====================
    if (pathname === "/transactions/withdraw" && req.method === "POST") {
      // ✅ PERUBAHAN: Tambah 'await'
      const userId = await getUserIdFromRequest(req);
      
      const body = (await req.json()) as WithdrawRequest;
      const result = await withdrawLogic(userId, body);

      return jsonResponse(
        { success: true, message: "Withdraw successful", data: result },
        201
      );
    }

    // =====================
    // TRANSFER
    // =====================
    if (pathname === "/transactions/transfer" && req.method === "POST") {
      // ✅ PERUBAHAN: Tambah 'await'
      const userId = await getUserIdFromRequest(req);
      
      const body = (await req.json()) as TransferRequest;
      const result = await transferLogic(userId, body);

      return jsonResponse(
        { success: true, message: "Transfer successful", data: result },
        201
      );
    }

    // =====================
    // TRANSACTION HISTORY
    // =====================
    if (pathname.startsWith("/transactions/") && req.method === "GET") {
      // ✅ PERUBAHAN: Tambah 'await'
      const userId = await getUserIdFromRequest(req);

      const accountIdStr = pathname.split("/")[2];
      if (!accountIdStr) {
        return jsonResponse(
          { success: false, message: "Account id is required" },
          400
        );
      }

      const accountId = Number(accountIdStr);
      if (Number.isNaN(accountId)) {
        return jsonResponse(
          { success: false, message: "Invalid account id" },
          400
        );
      }

      const history = await getTransactionHistoryLogic(userId, accountId);

      return jsonResponse(
        {
          success: true,
          message: "Transaction history fetched",
          data: history,
        },
        200
      );
    }

    return jsonResponse({ success: false, message: "Not found" }, 404);
  } catch (err) {
    return handleError(err);
  }
}