// Simple in-memory sliding-window rate limiter.
// Max 10 requests per 60-second window per IP.

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;

const hits = new Map<string, number[]>();

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim();
  }
  return "unknown";
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs?: number;
}

export function checkRateLimit(req: Request): RateLimitResult {
  const ip = getClientIp(req);
  const now = Date.now();

  const timestamps = hits.get(ip) ?? [];

  // Purge entries outside the window
  const valid = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  valid.push(now);
  hits.set(ip, valid);

  // Periodically prune stale IPs to prevent unbounded growth
  if (hits.size > 10_000) {
    for (const [key, value] of hits.entries()) {
      if (value.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) {
        hits.delete(key);
      }
    }
  }

  const allowed = valid.length <= RATE_LIMIT_MAX_REQUESTS;
  const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - valid.length);

  if (allowed) {
    // Pop the entry we just pushed — we only counted it to write valid back
    // but the caller should see remaining=true with request consumed
    return { allowed: true, remaining };
  }

  const oldestInWindow = valid[0]!;
  const retryAfterMs = RATE_LIMIT_WINDOW_MS - (now - oldestInWindow);
  return { allowed: false, remaining: 0, retryAfterMs };
}
