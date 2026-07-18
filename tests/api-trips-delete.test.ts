import { beforeEach, describe, expect, it, vi } from "vitest";
import "./setup";
import { createMockNextRequest } from "./setup";

const mockAuth = vi.hoisted(() => vi.fn());
const mockTripFindFirst = vi.hoisted(() => vi.fn());
const mockTripDelete = vi.hoisted(() => vi.fn());
const mockLocFindFirst = vi.hoisted(() => vi.fn());
const mockLocDelete = vi.hoisted(() => vi.fn());

vi.mock("@/auth", () => ({ auth: mockAuth }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    trip: { findFirst: mockTripFindFirst, delete: mockTripDelete },
    location: {
      findFirst: mockLocFindFirst,
      delete: mockLocDelete,
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { DELETE } from "@/app/api/trips/route";

describe("DELETE /api/trips", () => {
  beforeEach(() => {
    mockAuth.mockReset();
    mockTripFindFirst.mockReset();
    mockTripDelete.mockReset();
    mockLocFindFirst.mockReset();
    mockLocDelete.mockReset();
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);
    const req = createMockNextRequest({ id: "trip-123" }, "DELETE");
    const res = await DELETE(req);
    expect(res.status).toBe(401);
  });

  it("deletes a trip owned by the user", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockTripFindFirst.mockResolvedValueOnce({ id: "trip-123" });
    mockTripDelete.mockResolvedValueOnce({});
    const req = createMockNextRequest({ id: "trip-123" }, "DELETE");
    const res = await DELETE(req);
    expect(res.status).toBe(204);
    expect(mockTripDelete).toHaveBeenCalledWith({ where: { id: "trip-123" } });
  });

  it("returns 404 when trip not owned", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockTripFindFirst.mockResolvedValueOnce(null);
    const req = createMockNextRequest({ id: "nope" }, "DELETE");
    const res = await DELETE(req);
    expect(res.status).toBe(404);
  });

  it("returns 400 when id missing", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });
    const req = createMockNextRequest({}, "DELETE");
    const res = await DELETE(req);
    expect(res.status).toBe(400);
  });

  it("deletes a location when locationId is provided", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockLocFindFirst.mockResolvedValueOnce({ id: "loc-1" });
    mockLocDelete.mockResolvedValueOnce({});
    const req = new Request("http://localhost/api/trips?locationId=loc-1", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    }) as unknown as Parameters<typeof DELETE>[0];
    const res = await DELETE(req);
    expect(res.status).toBe(204);
    expect(mockLocDelete).toHaveBeenCalledWith({ where: { id: "loc-1" } });
  });

  it("returns 404 when location not owned", async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockLocFindFirst.mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/trips?locationId=loc-x", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    }) as unknown as Parameters<typeof DELETE>[0];
    const res = await DELETE(req);
    expect(res.status).toBe(404);
  });
});
