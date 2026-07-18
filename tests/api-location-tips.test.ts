import { beforeEach, describe, expect, it, vi } from "vitest";
import "./setup";
import { createMockNextRequest } from "./setup";

const mockAuth = vi.hoisted(() => vi.fn());
const mockLocFindFirst = vi.hoisted(() => vi.fn());
const mockLocUpdate = vi.hoisted(() => vi.fn());
const mockChat = vi.hoisted(() => vi.fn());

vi.mock("@/auth", () => ({ auth: mockAuth }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    trip: { findFirst: vi.fn(), update: vi.fn() },
    location: {
      findFirst: mockLocFindFirst,
      create: vi.fn(),
      update: mockLocUpdate,
      count: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));
vi.mock("@/lib/ai", () => ({ chatCompletion: mockChat }));

import { POST } from "@/app/api/ai/location-tips/route";

describe("POST /api/ai/location-tips", () => {
  beforeEach(() => {
    mockAuth.mockReset();
    mockLocFindFirst.mockReset();
    mockLocUpdate.mockReset();
    mockChat.mockReset();
  });

  it("should return 401 when not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);
    const res = await POST(
      createMockNextRequest({ locationId: "loc-1", tripTitle: "Test" }),
    );
    expect(res.status).toBe(401);
  });

  it("should return 404 when location not found", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockLocFindFirst.mockResolvedValueOnce(null);
    const res = await POST(
      createMockNextRequest({ locationId: "nonexistent", tripTitle: "Test" }),
    );
    expect(res.status).toBe(404);
  });

  it("should generate and return location tips", async () => {
    const fakeLoc = {
      id: "loc-1",
      locationTitle: "Tokyo, Japan",
      lat: 35.6762,
      lng: 139.6503,
      tripId: "trip-123",
      order: 0,
      aiTips: null,
      trip: { userId: "user-1" },
    };
    const fakeAI = JSON.stringify({
      tips: ["Visit early morning", "Try street food"],
      mustTry: ["Ramen", "Sushi"],
      avoid: ["Tourist traps"],
      bestTimeToVisit: "Early morning",
      estimatedCost: "$50-100/day",
    });
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockLocFindFirst.mockResolvedValueOnce(fakeLoc);
    mockChat.mockResolvedValueOnce(fakeAI);
    mockLocUpdate.mockResolvedValueOnce({});
    const res = await POST(
      createMockNextRequest({
        locationId: "loc-1",
        tripTitle: "Japan Adventure",
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.tips).toContain("Visit early morning");
    expect(body.mustTry).toContain("Ramen");
    expect(body.bestTimeToVisit).toBe("Early morning");
    expect(body.estimatedCost).toBe("$50-100/day");
  });

  it("should save tips to database", async () => {
    const fakeLoc = {
      id: "loc-1",
      locationTitle: "Paris, France",
      lat: 48.8566,
      lng: 2.3522,
      tripId: "trip-123",
      order: 0,
      aiTips: null,
      trip: { userId: "user-1" },
    };
    const fakeAI = JSON.stringify({
      tips: ["Tip 1"],
      mustTry: ["Croissant"],
      avoid: ["Cafes"],
      bestTimeToVisit: "Morning",
      estimatedCost: "$80/day",
    });
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockLocFindFirst.mockResolvedValueOnce(fakeLoc);
    mockChat.mockResolvedValueOnce(fakeAI);
    mockLocUpdate.mockResolvedValueOnce({});
    await POST(
      createMockNextRequest({ locationId: "loc-1", tripTitle: "Europe Trip" }),
    );
    expect(mockLocUpdate).toHaveBeenCalledWith({
      where: { id: "loc-1" },
      data: { aiTips: fakeAI },
    });
  });

  it("should return 500 when AI response has no JSON", async () => {
    const fakeLoc = {
      id: "loc-1",
      locationTitle: "Test",
      lat: 0,
      lng: 0,
      tripId: "trip-123",
      order: 0,
      aiTips: null,
      trip: { userId: "user-1" },
    };
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockLocFindFirst.mockResolvedValueOnce(fakeLoc);
    mockChat.mockResolvedValueOnce("No tips available.");
    const res = await POST(
      createMockNextRequest({ locationId: "loc-1", tripTitle: "Test" }),
    );
    expect(res.status).toBe(500);
  });
});
