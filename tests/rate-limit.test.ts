import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";

describe("lib/rate-limit.ts checkRateLimit", () => {
  beforeEach(() => {
    // Reset in-memory state for deterministic limits.
    vi.resetModules();
  });

  it("allows requests under the window limit and reports remaining", async () => {
    const ip = `ip-${Math.random().toString(36).slice(2)}`;
    const spoofed = new Request("http://localhost", {
      method: "POST",
      headers: { "x-forwarded-for": ip },
    }) as unknown as Parameters<typeof checkRateLimit>[0];

    const first = checkRateLimit(spoofed);
    expect(first.allowed).toBe(true);
    expect(first.remaining).toBeGreaterThan(0);
  });

  it("blocks requests once the window limit is exceeded", async () => {
    const ip = `ip-${Math.random().toString(36).slice(2)}`;
    const make = () =>
      new Request("http://localhost", {
        headers: { "x-forwarded-for": ip },
      }) as unknown as Parameters<typeof checkRateLimit>[0];

    // The default limit is 10 requests / 60s window.
    let lastAllowed = true;
    for (let i = 0; i < 12; i++) {
      const res = checkRateLimit(make());
      if (i < 10) {
        expect(res.allowed).toBe(true);
      } else {
        lastAllowed = res.allowed;
      }
    }
    expect(lastAllowed).toBe(false);
  });

  it("returns a retry-after hint when blocked", async () => {
    const ip = `ip-${Math.random().toString(36).slice(2)}`;
    const make = () =>
      new Request("http://localhost", {
        headers: { "x-forwarded-for": ip },
      }) as unknown as Parameters<typeof checkRateLimit>[0];

    for (let i = 0; i < 11; i++) checkRateLimit(make());
    const blocked = checkRateLimit(make());
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });
});
