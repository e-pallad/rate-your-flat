/**
 * Generates a URL-safe slug from a flat's address and city.
 *
 * @param address - Street address of the flat
 * @param city - City name
 * @param suffix - Random suffix for uniqueness; defaults to a 5-char random string.
 *                 Pass a fixed value in tests to make output deterministic.
 */
export function generateSlug(
  address: string,
  city: string,
  suffix = Math.random().toString(36).slice(2, 7),
): string {
  const base = `${address}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
  return `${base}-${suffix}`;
}
