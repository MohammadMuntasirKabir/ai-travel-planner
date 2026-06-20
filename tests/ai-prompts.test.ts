// tests/ai-prompts.test.ts - Unit tests for lib/ai-prompts.ts

import { describe, it, expect } from "vitest";
import { PROMPTS } from "@/lib/ai-prompts";

describe("lib/ai-prompts.ts", () => {
  describe("PROMPTS.generateItinerary", () => {
    it("should include trip details in the prompt", () => {
      const prompt = PROMPTS.generateItinerary(
        "Japan Trip",
        "Cherry blossom viewing",
        "2026-03-01",
        "2026-03-15",
        "Tokyo, Kyoto"
      );

      expect(prompt).toContain("Japan Trip");
      expect(prompt).toContain("Cherry blossom viewing");
      expect(prompt).toContain("2026-03-01");
      expect(prompt).toContain("2026-03-15");
      expect(prompt).toContain("Tokyo, Kyoto");
    });

    it("should request JSON output with correct structure", () => {
      const prompt = PROMPTS.generateItinerary(
        "Test", "Desc", "2026-01-01", "2026-01-05", "Paris"
      );

      expect(prompt).toContain("JSON");
      expect(prompt).toContain("itinerary");
      expect(prompt).toContain("activities");
      expect(prompt).toContain("highlights");
      expect(prompt).toContain("estimatedBudget");
      expect(prompt).toContain("budget");
      expect(prompt).toContain("breakdown");
    });

    it("should include time, description, location, tips fields", () => {
      const prompt = PROMPTS.generateItinerary(
        "Test", "Desc", "2026-01-01", "2026-01-05", "Paris"
      );

      expect(prompt).toContain("time");
      expect(prompt).toContain("description");
      expect(prompt).toContain("location");
      expect(prompt).toContain("tips");
    });
  });

  describe("PROMPTS.suggestLocations", () => {
    it("should include trip context and existing locations", () => {
      const prompt = PROMPTS.suggestLocations(
        "Europe Tour",
        "Backpacking across Europe",
        "2026-06-01",
        "2026-06-30",
        "Paris, Berlin"
      );

      expect(prompt).toContain("Europe Tour");
      expect(prompt).toContain("Backpacking across Europe");
      expect(prompt).toContain("Paris, Berlin");
    });

    it("should handle empty existing locations", () => {
      const prompt = PROMPTS.suggestLocations(
        "Test Trip",
        "Description",
        "2026-01-01",
        "2026-01-05",
        ""
      );

      expect(prompt).toContain("None yet");
    });

    it("should request 5-8 locations with specific fields", () => {
      const prompt = PROMPTS.suggestLocations(
        "Test", "Desc", "2026-01-01", "2026-01-05", "None"
      );

      expect(prompt).toContain("name");
      expect(prompt).toContain("address");
      expect(prompt).toContain("reason");
      expect(prompt).toContain("bestFor");
      expect(prompt).toContain("estimatedDays");
      expect(prompt).toContain("5-8");
    });
  });

  describe("PROMPTS.generateSummary", () => {
    it("should include all trip details", () => {
      const prompt = PROMPTS.generateSummary(
        "Bali Retreat",
        "Relaxing beach vacation",
        "2026-07-01",
        "2026-07-10",
        "Ubud, Seminyak"
      );

      expect(prompt).toContain("Bali Retreat");
      expect(prompt).toContain("Relaxing beach vacation");
      expect(prompt).toContain("Ubud, Seminyak");
    });

    it("should request summary, tips, packing, budget", () => {
      const prompt = PROMPTS.generateSummary(
        "Test", "Desc", "2026-01-01", "2026-01-05", "Place"
      );

      expect(prompt).toContain("summary");
      expect(prompt).toContain("tips");
      expect(prompt).toContain("packingSuggestions");
      expect(prompt).toContain("budgetEstimate");
    });
  });

  describe("PROMPTS.locationTips", () => {
    it("should include location name and trip context", () => {
      const prompt = PROMPTS.locationTips("Tokyo, Japan", "Japan Adventure");

      expect(prompt).toContain("Tokyo, Japan");
      expect(prompt).toContain("Japan Adventure");
    });

    it("should request tips, mustTry, avoid, bestTime, cost", () => {
      const prompt = PROMPTS.locationTips("Paris, France", "Europe Trip");

      expect(prompt).toContain("tips");
      expect(prompt).toContain("mustTry");
      expect(prompt).toContain("avoid");
      expect(prompt).toContain("bestTimeToVisit");
      expect(prompt).toContain("estimatedCost");
    });
  });

  describe("PROMPTS.chatSystem", () => {
    it("should define a travel assistant persona", () => {
      expect(PROMPTS.chatSystem).toContain("travel assistant");
      expect(PROMPTS.chatSystem).toContain("concise");
      expect(PROMPTS.chatSystem).toContain("practical");
    });
  });
});
