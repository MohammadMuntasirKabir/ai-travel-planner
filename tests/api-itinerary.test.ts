import { describe, it, expect, vi, beforeEach } from "vitest";
import "./setup";
import { createMockNextRequest } from "./setup";

// Hoisted mocks - these run before vi.mock() calls
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

import { POST } from "@/app/api/ai/generate-itinerary/route";

describe("POST /api/ai/generate-itinerary", () => {
  beforeEach(() => {
    mockAuth.mockReset();
    mockFindFirst.mockReset();
    mockUpdate.mockReset();
    mockChat.mockReset();
  });

  it("should return 401 when not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);
    const req = createMockNextRequest({ tripId: "trip-123" });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("should return 404 when trip not found", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockFindFirst.mockResolvedValueOnce(null);
    const req = createMockNextRequest({ tripId: "nonexistent" });
    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it("should generate and return itinerary when authenticated", async () => {
    const fakeTrip = {
      id: "trip-123", title: "Japan Trip", description: "Spring vacation",
      startDate: new Date("2026-03-01"), endDate: new Date("2026-03-15"),
      locations: [{ id: "loc-1", locationTitle: "Tokyo", order: 0 }, { id: "loc-2", locationTitle: "Kyoto", order: 1 }],
    };
    const fakeAI = JSON.stringify({
      itinerary: [{ day: 1, date: "2026-03-01", title: "Arrive", activities: [] }, { day: 2, date: "2026-03-02", title: "Sightseeing", activities: [] }],
      highlights: ["Cherry blossoms", "Sushi tasting"],
      estimatedBudget: { budget: "$$$", currency: "USD", breakdown: {} },
    });
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockFindFirst.mockResolvedValueOnce(fakeTrip);
    mockChat.mockResolvedValueOnce(fakeAI);
    mockUpdate.mockResolvedValueOnce({});
    const req = createMockNextRequest({ tripId: "trip-123" });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.itinerary).toHaveLength(2);
    expect(body.highlights).toContain("Cherry blossoms");
    expect(body.estimatedBudget.budget).toBe("$$$");
  });

  it("should save generated itinerary to database", async () => {
    const fakeTrip = { id: "trip-123", title: "Test", description: "Desc",      startDate: new Date("2026-01-01"), endDate: new Date("2026-01-05"), locations: [] };
    const fakeAI = JSON.stringify({ itinerary: [], highlights: [] });
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockFindFirst.mockResolvedValueOnce(fakeTrip);
    mockChat.mockResolvedValueOnce(fakeAI);
    mockUpdate.mockResolvedValueOnce({});
    const req = createMockNextRequest({ tripId: "trip-123" });
    await POST(req);
    expect(mockUpdate).toHaveBeenCalledWith({ where: { id: "trip-123" }, data: { aiItinerary: fakeAI } });
  });

  it("should return 500 when AI response has no JSON", async () => {
    const fakeTrip = { id: "trip-123", title: "Test", description: "Desc",
      startDate: new Date("2026-01-01"), endDate: new Date("2026-01-05"), locations: [] };
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockFindFirst.mockResolvedValueOnce(fakeTrip);
    mockChat.mockResolvedValueOnce("Sorry, I can\'t help with that.");
    const req = createMockNextRequest({ tripId: "trip-123" });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });

  it("should pass correct prompt to AI with trip details", async () => {
    const fakeTrip = { id: "trip-123", title: "Bali Trip", description: "Beach vacation",
      startDate: new Date("2026-07-01"), endDate: new Date("2026-07-10"),
      locations: [{ id: "loc-1", locationTitle: "Ubud", order: 0 }] };
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockFindFirst.mockResolvedValueOnce(fakeTrip);
    mockChat.mockResolvedValueOnce(JSON.stringify({ itinerary: [] }));
    mockUpdate.mockResolvedValueOnce({});
    const req = createMockNextRequest({ tripId: "trip-123" });
    await POST(req);
    expect(mockChat).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ role: "system" }),
        expect.objectContaining({ role: "user", content: expect.stringContaining("Bali Trip") }),
      ]),
      expect.objectContaining({ maxTokens: 4096 })
    );
  });
});
