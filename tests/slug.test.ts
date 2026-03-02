import { describe, it, expect } from "vitest";
import { generateSlug } from "@/lib/slug";

describe("generateSlug", () => {
  it("produces lowercase output", () => {
    const slug = generateSlug("Main Street", "Berlin", "abc12");
    expect(slug).toBe(slug.toLowerCase());
  });

  it("replaces spaces with hyphens", () => {
    const slug = generateSlug("Main Street", "New York", "abc12");
    expect(slug).not.toMatch(/\s/);
    expect(slug).toContain("-");
  });

  it("strips special characters including umlauts and punctuation", () => {
    const slug = generateSlug("Münchner Str. 5!", "Köln", "abc12");
    expect(slug).not.toMatch(/[^a-z0-9-]/);
  });

  it("collapses consecutive hyphens into one", () => {
    const slug = generateSlug("A--B", "C--D", "abc12");
    expect(slug).not.toMatch(/--/);
  });

  it("appends the provided suffix", () => {
    const slug = generateSlug("Some Street", "Berlin", "test1");
    expect(slug).toMatch(/-test1$/);
  });

  it("total length is at most 66 characters (60 base + dash + 5 suffix)", () => {
    const longAddress = "A".repeat(40);
    const longCity = "B".repeat(40);
    const slug = generateSlug(longAddress, longCity, "abc12");
    expect(slug.length).toBeLessThanOrEqual(66);
  });

  it("produces different slugs on two calls without a fixed suffix", () => {
    const slug1 = generateSlug("Main Street", "Berlin");
    const slug2 = generateSlug("Main Street", "Berlin");
    // This will fail with overwhelming probability if the suffix is truly random
    expect(slug1).not.toBe(slug2);
  });
});
