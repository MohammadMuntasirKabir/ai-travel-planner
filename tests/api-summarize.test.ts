import { describe, it, expect, vi, beforeEach } from "vitest";
import "./setup";
import { createMockNextRequest } from "./setup";

const mockAuth = vi.hoisted(() => vi.fn());
const mockFindFirst = vi.hoisted(() => vi.fn());
const mockUpdate = vi.hoisted(() => vi.fn());
const mockChat = vi.hoisted(() => vi.fn());

vi.mock("@/auth", () => ({ auth: mockAuth }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    trip: { findFirst: mockFindFirst, update: mockUpdate },
    location: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), count: vi.fn() },
    $transaction: vi.fn(),
  },
}));
vi.mock("@/lib/ai", () => ({ chatCompletion: mockChat }));

import { POST } from "@/app/api/ai/summarize/route";

describe("POST /api/ai/summarize", () => {
  beforeEach(() => { mockAuth.mockReset(); mockFindFirst.mockReset(); mockUpdate.mockReset(); mockChat.mockReset(); });

  it("should return 401 when not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);
    const res = await POST(createMockNextRequest({ tripId: "trip-123" }));
    expect(res.status).toBe(401);
  });

  it("should return 404 when trip not found", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockFindFirst.mockResolvedValueOnce(null);
    const res = await POST(createMockNextRequest({ tripId: "nonexistent" }));
    expect(res.status).toBe(404);
  });

  it("should generate and return summary, tips, packing, budget", async () => {
    const fakeTrip = { id: "trip-123", title: "Bali Retreat", description: "Beach vacation",
      startDate: new Date("2026-07-01"), endDate: new Date("2026-07-10"),
      locations: [{ id: "loc-1", locationTitle: "Ubud", order: 0 }] };
    const fakeAI = JSON.stringify({
      summary: "A wonderful retreat in Bali...", tips: ["Bring sunscreen", "Book early"],
      packingSuggestions: ["Swimsuit", "Sunscreen", "Hat"], budgetEstimate: "$2000-3000 for 10 days",
    });
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockFindFirst.mockResolvedValueOnce(fakeTrip);
    mockChat.mockResolvedValueOnce(fakeAI);
    mockUpdate.mockResolvedValueOnce({});
    const res = await POST(createMockNextRequest({ tripId: "trip-123" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.summary).toBe("A wonderful retreat in Bali...");
    expect(body.tips).toHaveLength(2);
    expect(body.packingSuggestions).toContain("Swimsuit");
    expect(body.budgetEstimate).toBe("$2000-3000 for 10 days");
  });

  it("should save summary, packing list, and budget to database", async () => {
    const fakeTrip = { id: "trip-123", title: "Test", description: "Desc",
      startDate: new Date("2026-01-01"), endDate: new Date("2026-01-05"), locations: [] };
    const fakeAI = JSON.stringify({ summary: "Great trip", tips: ["Tip 1"], packingSuggestions: ["Item 1"], budgetEstimate: "$500" });
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockFindFirst.mockResolvedValueOnce(fakeTrip);
    mockChat.mockResolvedValueOnce(fakeAI);
    mockUpdate.mockResolvedValueOnce({});
    await POST(createMockNextRequest({ tripId: "trip-123" }));
    expect(mockUpdate).toHaveBeenCalledWith({ where: { id: "trip-123" }, data: expect.objectContaining({ aiSummary: "Great trip" }) });
  });

  it("should return 500 when AI response has no JSON", async () => {
    const fakeTrip = { id: "trip-123", title: "Test", description: "Desc",
      startDate: new Date("2026-01-01"), endDate: new Date("2026-01-05"), locations: [] };
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockFindFirst.mockResolvedValueOnce(fakeTrip);
    mockChat.mockResolvedValueOnce("I cannot summarize this trip.");
    const res = await POST(createMockNextRequest({ tripId: "trip-123" }));
    expect(res.status).toBe(500);
  });
});
