import { beforeEach, describe, expect, it, vi } from "vitest";
import "./setup";

// Mock fetch for geocode tests
const mockFetch = vi.hoisted(() => vi.fn());
vi.stubGlobal("fetch", mockFetch);

// Mock auth for auth-actions tests
const mockSignIn = vi.hoisted(() => vi.fn());
const mockSignOut = vi.hoisted(() => vi.fn());
vi.mock("@/auth", () => ({
  signIn: mockSignIn,
  signOut: mockSignOut,
}));

describe("lib/utils.ts", () => {
  describe("cn", () => {
    it("should merge class names correctly", async () => {
      const { cn } = await import("@/lib/utils");
      expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("should handle conditional classes", async () => {
      const { cn } = await import("@/lib/utils");
      expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
    });

    it("should merge tailwind classes without conflicts", async () => {
      const { cn } = await import("@/lib/utils");
      expect(cn("px-2", "px-4")).toBe("px-4");
    });

    it("should handle empty inputs", async () => {
      const { cn } = await import("@/lib/utils");
      expect(cn()).toBe("");
    });

    it("should handle undefined and null", async () => {
      const { cn } = await import("@/lib/utils");
      expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
    });
  });
});

describe("lib/auth-actions.ts", () => {
  beforeEach(() => {
    mockSignIn.mockReset();
    mockSignOut.mockReset();
  });

  describe("loginWithProvider", () => {
    it("should call signIn with the requested provider", async () => {
      mockSignIn.mockResolvedValueOnce(undefined);
      const { loginWithProvider } = await import("@/lib/auth-actions");
      await loginWithProvider("google");
      expect(mockSignIn).toHaveBeenCalledWith("google", {
        redirectTo: "/trips",
      });
    });
  });

  describe("logout", () => {
    it("should call signOut with redirect to /login", async () => {
      mockSignOut.mockResolvedValueOnce(undefined);
      const { logout } = await import("@/lib/auth-actions");
      await logout();
      expect(mockSignOut).toHaveBeenCalledWith({ redirectTo: "/login" });
    });
  });
});

describe("lib/actions/geocode.ts", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("getCountryFromCoordinates", () => {
    it("should return country and formatted address", async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          results: [
            {
              formatted_address: "Tokyo, Japan",
              address_components: [
                { types: ["country"], long_name: "Japan" },
                { types: ["administrative_area_level_1"], long_name: "Tokyo" },
              ],
            },
          ],
        }),
      });

      const { getCountryFromCoordinates } = await import(
        "@/lib/actions/geocode"
      );
      const result = await getCountryFromCoordinates(35.6762, 139.6503);

      expect(result).toEqual({
        country: "Japan",
        formattedAddress: "Tokyo, Japan",
      });
    });

    it("should return Unknown when no country component found", async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          results: [
            {
              formatted_address: "Somewhere",
              address_components: [
                { types: ["locality"], long_name: "Some City" },
              ],
            },
          ],
        }),
      });

      const { getCountryFromCoordinates } = await import(
        "@/lib/actions/geocode"
      );
      const result = await getCountryFromCoordinates(0, 0);

      expect(result.country).toBe("Unknown");
    });

    it("should call Google Maps API with correct params", async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => ({
          results: [
            {
              formatted_address: "Test",
              address_components: [
                { types: ["country"], long_name: "TestCountry" },
              ],
            },
          ],
        }),
      });

      const { getCountryFromCoordinates } = await import(
        "@/lib/actions/geocode"
      );
      await getCountryFromCoordinates(10.5, 20.3);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("latlng=10.5,20.3"),
      );
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("key="));
    });
  });
});
