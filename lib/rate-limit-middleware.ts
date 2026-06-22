import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

function rateLimitMiddleware(req: NextRequest): NextResponse | null {
  const { allowed, remaining, retryAfterMs } = checkRateLimit(req);

  if (!allowed) {
    const retryAfterSec = retryAfterMs
      ? Math.ceil(retryAfterMs / 1000)
      : 60;
    return new NextResponse("Too many requests", {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSec),
        "X-RateLimit-Remaining": "0",
      },
    });
  }

  // Attach remaining count so downstream routes can add it to their response headers
  // (stored in request headers since NextRequest is immutable-ish)
  const headers = new Headers(req.headers);
  headers.set("x-rate-limit-remaining", String(remaining));

  return null;
}

export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const rateLimitResult = rateLimitMiddleware(req);
    if (rateLimitResult) return rateLimitResult;

    const remaining = rateLimitResult
      ? 0
      : Number(req.headers.get("x-rate-limit-remaining") ?? "0");

    const response = await handler(req);

    // Add rate limit headers to successful responses too
    if (remaining >= 0) {
      response.headers.set("X-RateLimit-Remaining", String(remaining));
    }

    return response;
  };
}
