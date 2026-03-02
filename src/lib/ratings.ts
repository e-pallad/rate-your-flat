/**
 * Parses a JSON ratings string into a key→number map.
 * Returns an empty object on malformed input (never throws).
 *
 * Shape: { overall, location, price, condition, noise, landlord } — integers 1–5
 */
export function parseRatings(raw: string): Record<string, number> {
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed !== null &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
    ) {
      return parsed as Record<string, number>;
    }
    return {};
  } catch {
    return {};
  }
}

/**
 * Computes the average of the `overall` field across an array of parsed ratings.
 * Returns 0 for an empty array or when all entries lack an `overall` key.
 */
export function averageOverall(ratings: Record<string, number>[]): number {
  if (ratings.length === 0) return 0;
  return ratings.reduce((acc, r) => acc + (r.overall || 0), 0) / ratings.length;
}
