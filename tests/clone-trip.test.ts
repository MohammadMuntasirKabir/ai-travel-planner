import { beforeEach, describe, expect, it, vi } from "vitest";
import "./setup";

const mockAuth = vi.hoisted(() => vi.fn());
const mockTripFindFirst = vi.hoisted(() => vi.fn());
const mockTripCreate = vi.hoisted(() => vi.fn());
const _mockRedirect = vi.hoisted(() => vi.fn());

vi.mock("@/auth", () => ({ auth: mockAuth }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    trip: { findFirst: mockTripFindFirst, create: mockTripCreate },
    location: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));
vi.mock("next/navigation", () => ({
  redirect: (..._args: unknown[]) => {
    throw new Error("redirect");
  },
}));

import { cloneTrip } from "@/lib/actions/clone-trip";

describe("cloneTrip server action", () => {
  beforeEach(() => {
    mockAuth.mockReset();
    mockTripFindFirst.mockReset();
    mockTripCreate.mockReset();
  });

  it("throws when not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);
    await expect(cloneTrip("trip-123")).rejects.toThrow("Not authenticated");
  });

  it("throws when trip not found", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockTripFindFirst.mockResolvedValueOnce(null);
    await expect(cloneTrip("trip-123")).rejects.toThrow("Trip not found");
  });

  it("creates a copy with (Copy) suffix and clones locations, then redirects", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockTripFindFirst.mockResolvedValueOnce({
      id: "trip-123",
      title: "Japan",
      description: "Spring",
      imageUrl: "https://img/1.jpg",
      startDate: new Date("2026-03-01"),
      endDate: new Date("2026-03-15"),
      aiItinerary: '{"itinerary":[]}',
      aiSummary: "Nice",
      aiPackingList: '["hat"]',
      aiBudgetEstimate: '"$1000"',
      locations: [
        {
          locationTitle: "Tokyo",
          lat: 35.6,
          lng: 139.6,
          order: 0,
          aiTips: null,
        },
      ],
    });
    mockTripCreate.mockResolvedValueOnce({ id: "trip-new" });

    await expect(cloneTrip("trip-123")).rejects.toThrow("redirect");

    expect(mockTripCreate).toHaveBeenCalledTimes(1);
    const arg = mockTripCreate.mock.calls[0][0];
    expect(arg.data.title).toBe("Japan (Copy)");
    expect(arg.data.locations.create).toHaveLength(1);
    expect(arg.data.locations.create[0].locationTitle).toBe("Tokyo");
  });

  it("does not double the (Copy) suffix", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockTripFindFirst.mockResolvedValueOnce({
      id: "trip-123",
      title: "Japan (Copy)",
      description: "d",
      imageUrl: null,
      startDate: new Date("2026-03-01"),
      endDate: new Date("2026-03-15"),
      aiItinerary: null,
      aiSummary: null,
      aiPackingList: null,
      aiBudgetEstimate: null,
      locations: [],
    });
    mockTripCreate.mockResolvedValueOnce({ id: "trip-new" });

    await expect(cloneTrip("trip-123")).rejects.toThrow("redirect");
    expect(mockTripCreate.mock.calls[0][0].data.title).toBe("Japan (Copy)");
  });
});
