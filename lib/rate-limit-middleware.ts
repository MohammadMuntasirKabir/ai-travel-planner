import { type NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

function rateLimitMiddleware(req: NextRequest): {
  response: NextResponse | null;
  remaining: number;
} {
  const { allowed, remaining, retryAfterMs } = checkRateLimit(req);

  if (!allowed) {
    const retryAfterSec = retryAfterMs ? Math.ceil(retryAfterMs / 1000) : 60;
    return {
      response: new NextResponse("Too many requests", {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSec),
          "X-RateLimit-Remaining": "0",
        },
      }),
      remaining: 0,
    };
  }

  // Allowed: surface the remaining budget so downstream routes can echo it.
  return { response: null, remaining };
}

export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse,
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const result = rateLimitMiddleware(req);

    if (result.response) return result.response;

    const remaining = result.remaining;

    const response = await handler(req);

    // Echo the remaining budget on successful responses too.
    response.headers.set("X-RateLimit-Remaining", String(remaining));

    return response;
  };
}
