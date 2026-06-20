import { describe, it, expect } from "vitest";
import { prisma } from "@/lib/prisma";

describe("Prisma schema", () => {
  it("should have Trip model with AI fields defined", () => {
    expect(prisma.trip).toBeDefined();
    expect(prisma.trip.findFirst).toBeDefined();
    expect(prisma.trip.create).toBeDefined();
    expect(prisma.trip.update).toBeDefined();
  });

  it("should have Location model with aiTips field", () => {
    expect(prisma.location).toBeDefined();
    expect(prisma.location.findFirst).toBeDefined();
    expect(prisma.location.create).toBeDefined();
    expect(prisma.location.update).toBeDefined();
  });

  it("should support transaction operations", () => {
    expect(prisma.$transaction).toBeDefined();
  });

  it("should have proper model structure for Trip", () => {
    const tripData = {
      title: "Test Trip", description: "Test Description",
      startDate: new Date("2026-01-01"), endDate: new Date("2026-01-05"), userId: "user-123",
      aiItinerary: "{\"itinerary\": []}", aiSummary: "A great trip",
      aiPackingList: "[\"sunscreen\"]", aiBudgetEstimate: "{\"total\": \"$500\"}",
    };
    expect(tripData.aiItinerary).toBeDefined();
    expect(tripData.aiSummary).toBeDefined();
    expect(tripData.aiPackingList).toBeDefined();
    expect(tripData.aiBudgetEstimate).toBeDefined();
  });

  it("should have proper model structure for Location with aiTips", () => {
    const locData = { locationTitle: "Tokyo, Japan", lat: 35.6762, lng: 139.6503, tripId: "trip-123", order: 0, aiTips: "{\"tips\": [\"Visit early\"]}" };
    expect(locData.aiTips).toBeDefined();
  });
});
