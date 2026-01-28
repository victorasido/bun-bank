import { AppError } from "./AppError";

export function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function handleError(err: unknown): Response {
  if (err instanceof AppError) {
    return jsonResponse(
      {
        success: false,
        error: err.message,
      },
      err.statusCode,
    );
  }

  console.error(err);
  return jsonResponse(
    {
      success: false,
      error: "Internal server error",
    },
    500,
  );
}
