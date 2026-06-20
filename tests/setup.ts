// tests/setup.ts - Global test setup and shared mocks

import { vi } from "vitest";
import type { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Mock the OpenAI SDK (used by lib/ai.ts)
// ---------------------------------------------------------------------------
const mockChatCompletion = vi.fn();

vi.mock("openai", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: mockChatCompletion,
        },
      },
    })),
  };
});

// Expose mock so test files can configure it
vi.stubGlobal("__mockChatCompletion", mockChatCompletion);

// ---------------------------------------------------------------------------
// Mock next-auth
// ---------------------------------------------------------------------------
vi.mock("next-auth", () => ({
  default: vi.fn().mockImplementation(() => ({
    auth: vi.fn(),
    handlers: { GET: vi.fn(), POST: vi.fn() },
    signIn: vi.fn(),
    signOut: vi.fn(),
  })),
}));

// ---------------------------------------------------------------------------
// Mock next/navigation
// ---------------------------------------------------------------------------
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  useRouter: vi.fn().mockReturnValue({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: vi.fn().mockReturnValue("/"),
  useSearchParams: vi.fn().mockReturnValue(new URLSearchParams()),
}));

// ---------------------------------------------------------------------------
// Helper: create a mock NextRequest
// ---------------------------------------------------------------------------
export function createMockNextRequest(
  body: unknown,
  method = "POST"
): NextRequest {
  const url = "http://localhost:3000/api/test";
  const baseReq = new Request(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return baseReq as unknown as NextRequest;
}

// ---------------------------------------------------------------------------
// Helper: create mock auth session
// ---------------------------------------------------------------------------
export function mockSession(overrides: Record<string, unknown> = {}) {
  return {
    user: { id: "user-123", name: "Test User", email: "test@example.com" },
    expires: new Date(Date.now() + 86400000).toISOString(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Helper: create mock trip
// ---------------------------------------------------------------------------
export function mockTrip(overrides: Record<string, unknown> = {}) {
  return {
    id: "trip-abc",
    title: "Japan Adventure",
    description: "A two-week trip across Japan",
    imageUrl: null,
    startDate: new Date("2026-03-01"),
    endDate: new Date("2026-03-15"),
    userId: "user-123",
    aiItinerary: null,
    aiSummary: null,
    aiPackingList: null,
    aiBudgetEstimate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    locations: [],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Helper: create mock location
// ---------------------------------------------------------------------------
export function mockLocation(overrides: Record<string, unknown> = {}) {
  return {
    id: "loc-1",
    locationTitle: "Tokyo, Japan",
    lat: 35.6762,
    lng: 139.6503,
    tripId: "trip-abc",
    order: 0,
    aiTips: null,
    createdAt: new Date(),
    ...overrides,
  };
}

// Re-export
export { mockChatCompletion };
