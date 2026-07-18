import { describe, it, expect } from "vitest";
import { extractJson } from "@/lib/json";

describe("lib/json.ts extractJson", () => {
  it("parses a bare JSON object", () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });

  it("parses a bare JSON array", () => {
    expect(extractJson("[1,2,3]")).toEqual([1, 2, 3]);
  });

  it("strips ```json fences", () => {
    const raw = '```json\n{"b":2}\n```';
    expect(extractJson(raw)).toEqual({ b: 2 });
  });

  it("strips plain ``` fences", () => {
    const raw = "```\n[1,2]\n```";
    expect(extractJson(raw)).toEqual([1, 2]);
  });

  it("extracts JSON embedded in prose", () => {
    const raw = "Sure! Here is your plan:\n{\"trip\":true}\nHope that helps.";
    expect(extractJson(raw)).toEqual({ trip: true });
  });

  it("extracts an array embedded in prose", () => {
    const raw = "Here you go: [\"a\", \"b\"] done.";
    expect(extractJson(raw)).toEqual(["a", "b"]);
  });

  it("handles nested objects with strings containing brackets", () => {
    const raw = '{"text": "a [weird] string", "n": 5}';
    expect(extractJson(raw)).toEqual({ text: "a [weird] string", n: 5 });
  });

  it("handles escaped quotes inside strings", () => {
    const raw = '{"q": "he said \\"hi\\""}';
    expect(extractJson(raw)).toEqual({ q: 'he said "hi"' });
  });

  it("throws on empty input", () => {
    expect(() => extractJson("")).toThrow();
  });

  it("throws when no JSON is present", () => {
    expect(() => extractJson("Sorry, I cannot help.")).toThrow();
  });
});
