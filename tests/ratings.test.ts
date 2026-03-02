import { describe, it, expect } from "vitest";
import { parseRatings, averageOverall } from "@/lib/ratings";

describe("parseRatings", () => {
  it("parses a valid JSON ratings string", () => {
    const result = parseRatings(
      '{"overall":4,"location":3,"price":5,"condition":4,"noise":2,"landlord":5}',
    );
    expect(result).toEqual({
      overall: 4,
      location: 3,
      price: 5,
      condition: 4,
      noise: 2,
      landlord: 5,
    });
  });

  it("returns an empty object for invalid JSON without throwing", () => {
    expect(() => parseRatings("not json")).not.toThrow();
    expect(parseRatings("not json")).toEqual({});
  });

  it("returns an empty object for an empty string", () => {
    expect(parseRatings("")).toEqual({});
  });

  it("returns an empty object for a null-ish JSON value", () => {
    expect(parseRatings("null")).toEqual({});
  });
});

describe("averageOverall", () => {
  it("returns 0 for an empty array", () => {
    expect(averageOverall([])).toBe(0);
  });

  it("returns the overall value for a single review", () => {
    expect(averageOverall([{ overall: 4 }])).toBe(4);
  });

  it("computes the mean across multiple reviews", () => {
    const result = averageOverall([{ overall: 3 }, { overall: 5 }, { overall: 4 }]);
    expect(result).toBeCloseTo(4);
  });

  it("treats a missing overall key as 0", () => {
    const result = averageOverall([{ location: 3 }, { overall: 4 }]);
    expect(result).toBeCloseTo(2);
  });

  it("does not return NaN when all entries lack overall", () => {
    const result = averageOverall([{ location: 3 }, { price: 5 }]);
    expect(result).not.toBeNaN();
    expect(result).toBe(0);
  });
});
