import { beforeEach, describe, expect, it, vi } from "vitest";
import "./setup";
import { createMockNextRequest } from "./setup";

const mockAuth = vi.hoisted(() => vi.fn());
const mockFindFirst = vi.hoisted(() => vi.fn());
const mockChat = vi.hoisted(() => vi.fn());

vi.mock("@/auth", () => ({ auth: mockAuth }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    trip: { findFirst: mockFindFirst, update: vi.fn() },
    location: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));
vi.mock("@/lib/ai", () => ({ chatCompletion: mockChat }));

import { POST } from "@/app/api/ai/suggest-locations/route";

describe("POST /api/ai/suggest-locations", () => {
  beforeEach(() => {
    mockAuth.mockReset();
    mockFindFirst.mockReset();
    mockChat.mockReset();
  });

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

  it("should return array of suggested locations", async () => {
    const fakeTrip = {
      id: "trip-123",
      title: "Europe Tour",
      description: "Backpacking",
      startDate: new Date("2026-06-01"),
      endDate: new Date("2026-06-30"),
      locations: [{ id: "loc-1", locationTitle: "Paris", order: 0 }],
    };
    const fakeAI = JSON.stringify([
      {
        name: "Barcelona",
        address: "Barcelona, Spain",
        reason: "Great food",
        bestFor: "food",
        estimatedDays: 2,
      },
      {
        name: "Amsterdam",
        address: "Amsterdam, Netherlands",
        reason: "Canals",
        bestFor: "culture",
        estimatedDays: 3,
      },
    ]);
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockFindFirst.mockResolvedValueOnce(fakeTrip);
    mockChat.mockResolvedValueOnce(fakeAI);
    const res = await POST(createMockNextRequest({ tripId: "trip-123" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(2);
    expect(body[0].name).toBe("Barcelona");
    expect(body[0].address).toBe("Barcelona, Spain");
  });

  it("should include existing locations in the AI prompt", async () => {
    const fakeTrip = {
      id: "trip-123",
      title: "Europe Tour",
      description: "Backpacking",
      startDate: new Date("2026-06-01"),
      endDate: new Date("2026-06-30"),
      locations: [
        { id: "loc-1", locationTitle: "Paris", order: 0 },
        { id: "loc-2", locationTitle: "Berlin", order: 1 },
      ],
    };
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockFindFirst.mockResolvedValueOnce(fakeTrip);
    mockChat.mockResolvedValueOnce(JSON.stringify([]));
    await POST(createMockNextRequest({ tripId: "trip-123" }));
    expect(mockChat).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          role: "user",
          content: expect.stringContaining("Paris, Berlin"),
        }),
      ]),
      expect.anything(),
    );
  });

  it("should return 500 when AI response has no JSON array", async () => {
    const fakeTrip = {
      id: "trip-123",
      title: "Test",
      description: "Desc",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-01-05"),
      locations: [],
    };
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockFindFirst.mockResolvedValueOnce(fakeTrip);
    mockChat.mockResolvedValueOnce("I need more information.");
    const res = await POST(createMockNextRequest({ tripId: "trip-123" }));
    expect(res.status).toBe(500);
  });
});
