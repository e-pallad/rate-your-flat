import { describe, it, expect } from "vitest";
import { translations } from "@/lib/i18n";

// Inline the same lookup logic used by the t() function in TranslationProvider
// so tests don't need to render any React component or set up jsdom.
function t(key: string, language: string): string {
  return translations[language]?.[key] || translations["de"]?.[key] || key;
}

describe("translations — German (de)", () => {
  it("returns the correct German string for a known key", () => {
    expect(t("common.appName", "de")).toBe("FlatCheck");
  });

  it("returns the correct German string for a review key", () => {
    expect(t("review.anonymous", "de")).toBe("Anonym veröffentlichen");
  });
});

describe("translations — English (en)", () => {
  it("returns the correct English string for a known key", () => {
    expect(t("review.anonymous", "en")).toBe("Post anonymously");
  });

  it("returns the correct English string for a flat key", () => {
    expect(t("flat.verified", "en")).toBe("Verified");
  });
});

describe("translations — fallback behaviour", () => {
  it("falls back to German when a key is missing from the requested language", () => {
    // Request a key via a non-existent language; should fall back to de value
    expect(t("flat.verified", "fr")).toBe("Verifiziert");
  });

  it("returns the key itself when it is missing from all languages", () => {
    expect(t("this.key.does.not.exist", "de")).toBe("this.key.does.not.exist");
    expect(t("this.key.does.not.exist", "en")).toBe("this.key.does.not.exist");
  });
});

describe("translations — completeness", () => {
  it("every key present in 'de' is also present in 'en'", () => {
    const deKeys = Object.keys(translations["de"]);
    const enKeys = new Set(Object.keys(translations["en"]));
    const missingInEn = deKeys.filter((k) => !enKeys.has(k));
    expect(missingInEn).toEqual([]);
  });

  it("every key present in 'en' is also present in 'de'", () => {
    const enKeys = Object.keys(translations["en"]);
    const deKeys = new Set(Object.keys(translations["de"]));
    const missingInDe = enKeys.filter((k) => !deKeys.has(k));
    expect(missingInDe).toEqual([]);
  });
});
