import Link from "next/link";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import {
  Search,
  ChevronRight,
  ChevronLeft,
  PenLine,
  MapPin,
  Users,
} from "lucide-react";

const PAGE_SIZE = 12;

const translations: Record<string, Record<string, string>> = {
  en: {
    "nav.flats": "Flats",
    "common.search": "Search",
    "common.noResults": "No results found",
    "common.noResultsHint":
      "Try adjusting your search or filters, or be the first to add a flat in this area.",
    "flat.reviews": "Reviews",
    "flat.review": "Review",
    "flat.verified": "Verified",
    "flat.unverified": "Unverified",
    "flat.unclaimed": "No landlord linked",
    "flat.viewDetails": "View details",
    "flat.noRatingsYet": "No ratings yet",
    "faq.title": "FAQ",
    "faq.viewAll": "View all questions",
    "faq.search.q": "How do I find a flat?",
    "faq.search.a":
      "Use the search bar above to search by address, city, or postal code. All flats are shown — verified, unverified, and unclaimed.",
    "faq.review.q": "How do I submit a review?",
    "faq.review.a":
      'Open any flat\'s detail page and click "Write a Review". No account needed — guests can submit with just a name.',
    "faq.addFlat.q": "Can I add a flat as a renter?",
    "faq.addFlat.a":
      'Yes — anyone can add a flat, including guests without an account. Renter-submitted flats appear immediately as "Unclaimed".',
    "home.heroTitle": "Real reviews from real tenants",
    "home.heroSubtitle":
      "Find honest ratings for flats across Germany — written by people who actually lived there.",
    "home.heroSearchCta": "Browse flats",
    "home.heroReviewCta": "Share your experience",
    "home.socialProof": "reviews from real tenants",
    "home.ctaTitle": "Lived somewhere worth rating?",
    "home.ctaDesc":
      "Help the next tenant make a better decision. It takes less than 3 minutes.",
    "home.ctaButton": "Write a review",
    "home.ctaButtonGuest": "Submit as guest — no account needed",
    "home.ctaLoggedIn": "Add a flat & write a review",
    "pagination.previous": "Previous",
    "pagination.next": "Next",
    "pagination.page": "Page",
    "pagination.of": "of",
    "filter.city": "City",
    "filter.allCities": "All cities",
    "filter.minRating": "Min. rating",
    "filter.any": "Any",
    "filter.searchPlaceholder": "Address, city or postcode…",
  },
  de: {
    "nav.flats": "Wohnungen",
    "common.search": "Suchen",
    "common.noResults": "Keine Ergebnisse gefunden",
    "common.noResultsHint":
      "Versuche, deine Suche oder Filter anzupassen, oder trage als Erster eine Wohnung in dieser Gegend ein.",
    "flat.reviews": "Bewertungen",
    "flat.review": "Bewertung",
    "flat.verified": "Verifiziert",
    "flat.unverified": "Nicht verifiziert",
    "flat.unclaimed": "Kein Vermieter verknüpft",
    "flat.viewDetails": "Details ansehen",
    "flat.noRatingsYet": "Noch keine Bewertungen",
    "faq.title": "Häufige Fragen",
    "faq.viewAll": "Alle Fragen ansehen",
    "faq.search.q": "Wie finde ich eine Wohnung?",
    "faq.search.a":
      "Nutze die Suchleiste oben, um nach Adresse, Stadt oder Postleitzahl zu suchen. Alle Wohnungen werden angezeigt — verifizierte, nicht verifizierte und nicht beanspruchte.",
    "faq.review.q": "Wie schreibe ich eine Bewertung?",
    "faq.review.a":
      'Öffne die Detailseite einer Wohnung und klicke auf "Bewertung schreiben". Kein Konto erforderlich — Gäste können mit nur einem Namen eine Bewertung abgeben.',
    "faq.addFlat.q": "Kann ich als Mieter eine Wohnung hinzufügen?",
    "faq.addFlat.a":
      'Ja — jeder kann eine Wohnung eintragen, auch Gäste ohne Konto. Von Mietern oder Gästen eingetragene Wohnungen erscheinen sofort als "Nicht beansprucht".',
    "home.heroTitle": "Echte Bewertungen von echten Mietern",
    "home.heroSubtitle":
      "Finde ehrliche Bewertungen für Wohnungen in ganz Deutschland — geschrieben von Menschen, die dort wirklich gelebt haben.",
    "home.heroSearchCta": "Wohnungen entdecken",
    "home.heroReviewCta": "Erfahrung teilen",
    "home.socialProof": "Bewertungen von echten Mietern",
    "home.ctaTitle": "Irgendwo gewohnt, das eine Bewertung verdient?",
    "home.ctaDesc":
      "Hilf dem nächsten Mieter, eine bessere Entscheidung zu treffen. Dauert weniger als 3 Minuten.",
    "home.ctaButton": "Jetzt bewerten",
    "home.ctaButtonGuest": "Als Gast einreichen — kein Konto nötig",
    "home.ctaLoggedIn": "Wohnung hinzufügen & bewerten",
    "pagination.previous": "Zurück",
    "pagination.next": "Weiter",
    "pagination.page": "Seite",
    "pagination.of": "von",
    "filter.city": "Stadt",
    "filter.allCities": "Alle Städte",
    "filter.minRating": "Mindestbewertung",
    "filter.any": "Beliebig",
    "filter.searchPlaceholder": "Adresse, Stadt oder Postleitzahl…",
  },
};

function getTranslation(key: string): string {
  return (translations.de[key] || translations.en[key] || key) as string;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    page?: string;
    city?: string;
    minRating?: string;
  }>;
}) {
  const params = await searchParams;
  const query = (params.q || "").trim().slice(0, 100);
  const cityFilter = (params.city || "").trim().slice(0, 100);
  const minRating = Math.min(
    5,
    Math.max(0, parseFloat(params.minRating || "0") || 0),
  );
  const rawPage = Math.max(1, parseInt(params.page || "1", 10) || 1);

  // Fetch distinct cities for the filter dropdown
  const cityRows = await prisma.flat.findMany({
    select: { city: true },
    distinct: ["city"],
    orderBy: { city: "asc" },
  });
  const cities = cityRows.map((r) => r.city);

  // Total review count for social proof
  const totalReviewCount = await prisma.review.count();

  // Build parameterised WHERE fragments for text search and city filter.
  const conditions: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sqlParams: any[] = [];
  let paramIdx = 1;

  if (query) {
    conditions.push(
      `(f.address ILIKE $${paramIdx} OR f.city ILIKE $${paramIdx} OR f."postalCode" ILIKE $${paramIdx})`,
    );
    sqlParams.push(`%${query}%`);
    paramIdx++;
  }
  if (cityFilter) {
    conditions.push(`f.city ILIKE $${paramIdx}`);
    sqlParams.push(cityFilter);
    paramIdx++;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const havingClause =
    minRating > 0
      ? `HAVING COALESCE(AVG(safe_jsonb_float(r.ratings, 'overall')), 0) >= $${paramIdx}`
      : "";
  if (minRating > 0) {
    sqlParams.push(minRating);
    paramIdx++;
  }

  // Count query
  const countSql = `
    SELECT COUNT(*) AS total
    FROM "Flat" f
    LEFT JOIN "Review" r ON r."flatId" = f.id
    ${whereClause}
    GROUP BY f.id
    ${havingClause}
  `;
  const countResult = await prisma.$queryRawUnsafe<{ total: bigint }[]>(
    `SELECT COUNT(*) AS total FROM (${countSql}) sub`,
    ...sqlParams,
  );
  const totalCount = Number(countResult[0]?.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const page = Math.min(rawPage, totalPages);

  // Paginated data query
  const offsetVal = (page - 1) * PAGE_SIZE;
  const dataParams = [...sqlParams, PAGE_SIZE, offsetVal];
  type FlatRow = {
    id: string;
    slug: string;
    address: string;
    city: string;
    postalCode: string;
    landlordId: string | null;
    verified: boolean;
    avgRating: number;
    reviewCount: bigint;
  };
  const pageFlats = await prisma.$queryRawUnsafe<FlatRow[]>(
    `
    SELECT
      f.id,
      f.slug,
      f.address,
      f.city,
      f."postalCode",
      f."landlordId",
      f.verified,
      COALESCE(AVG(safe_jsonb_float(r.ratings, 'overall')), 0) AS "avgRating",
      COUNT(r.id) AS "reviewCount"
    FROM "Flat" f
    LEFT JOIN "Review" r ON r."flatId" = f.id
    ${whereClause}
    GROUP BY f.id
    ${havingClause}
    ORDER BY f."createdAt" DESC
    LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
    `,
    ...dataParams,
  );

  const flatsForDisplay = pageFlats.map((f) => ({
    ...f,
    reviewCount: Number(f.reviewCount),
    avgRating: Number(f.avgRating),
    avgRatingDisplay: Number(f.avgRating).toFixed(1),
  }));

  const t = getTranslation;

  // Server-side session check
  const session = await auth();
  const isGuest = !session;

  const isFiltered = !!(query || cityFilter || minRating > 0);

  // Helper to build URL params preserving current filters
  function buildUrl(overrides: Record<string, string | undefined>) {
    const merged: Record<string, string> = {};
    if (query) merged.q = query;
    if (cityFilter) merged.city = cityFilter;
    if (minRating > 0) merged.minRating = String(minRating);
    merged.page = String(page);
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === undefined || v === "") delete merged[k];
      else merged[k] = v;
    });
    return `?${new URLSearchParams(merged).toString()}`;
  }

  return (
    <>
      {/* ── Hero ── */}
      {!isFiltered && page === 1 && (
        <section className="relative overflow-hidden border-b bg-gradient-to-br from-[var(--brand-light)] via-background to-background py-16 md:py-24">
          {/* decorative blobs */}
          <div
            className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full opacity-20"
            style={{
              background:
                "radial-gradient(circle, var(--brand) 0%, transparent 70%)",
            }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-16 -left-16 h-60 w-60 rounded-full opacity-10"
            style={{
              background:
                "radial-gradient(circle, var(--brand) 0%, transparent 70%)",
            }}
            aria-hidden="true"
          />

          <div className="container relative">
            <div className="mx-auto max-w-2xl text-center">
              {/* social proof pill */}
              {totalReviewCount > 0 && (
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--brand)]/30 bg-[var(--brand-light)] px-4 py-1.5 text-sm font-medium text-[var(--brand-dark)]">
                  <Users className="h-3.5 w-3.5" />
                  <span>
                    {totalReviewCount.toLocaleString("de-DE")}{" "}
                    {t("home.socialProof")}
                  </span>
                </div>
              )}

              <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
                {t("home.heroTitle")}
              </h1>
              <p className="mb-8 text-lg text-muted-foreground md:text-xl">
                {t("home.heroSubtitle")}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <a href="#listings">
                  <Button size="lg" className="gap-2 font-semibold shadow-sm">
                    <Search className="h-4 w-4" />
                    {t("home.heroSearchCta")}
                  </Button>
                </a>
                <Link href="/flat/new/guest">
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 font-semibold"
                  >
                    <PenLine className="h-4 w-4" />
                    {t("home.heroReviewCta")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Listings ── */}
      <div id="listings" className="container py-8">
        {/* search bar */}
        <div className="mb-8">
          {isFiltered && (
            <h1 className="mb-4 text-2xl font-bold">{t("nav.flats")}</h1>
          )}
          <form className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-48">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                placeholder={t("filter.searchPlaceholder")}
                defaultValue={query}
                className="pl-9"
              />
            </div>
            {/* City filter */}
            <select
              name="city"
              defaultValue={cityFilter}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">{t("filter.allCities")}</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {/* Min-rating filter */}
            <select
              name="minRating"
              defaultValue={minRating > 0 ? String(minRating) : ""}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">
                {t("filter.minRating")}: {t("filter.any")}
              </option>
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  ≥ {n} ★
                </option>
              ))}
            </select>
            <Button type="submit" className="gap-2">
              <Search className="h-4 w-4" />
              {t("common.search")}
            </Button>
          </form>
        </div>

        {flatsForDisplay.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold">{t("common.noResults")}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("common.noResultsHint")}
            </p>
            <div className="mt-6">
              <Link href="/flat/new/guest">
                <Button variant="outline" className="gap-2">
                  <PenLine className="h-4 w-4" />
                  {t("home.ctaButtonGuest")}
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {flatsForDisplay.map((flat) => (
              <Link key={flat.id} href={`/flat/${flat.slug}`}>
                <Card className="group h-full cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base leading-snug group-hover:text-primary transition-colors">
                        {flat.address}
                      </CardTitle>
                      {flat.verified ? (
                        <Badge variant="default" className="shrink-0 text-xs">
                          {t("flat.verified")}
                        </Badge>
                      ) : flat.landlordId ? (
                        <Badge variant="secondary" className="shrink-0 text-xs">
                          {t("flat.unverified")}
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="shrink-0 text-xs text-muted-foreground"
                        >
                          {t("flat.unclaimed")}
                        </Badge>
                      )}
                    </div>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {flat.postalCode} {flat.city}
                    </p>
                  </CardHeader>
                  <CardContent>
                    {flat.reviewCount > 0 ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <StarRating value={flat.avgRating} size="sm" />
                          <span className="text-sm font-semibold tabular-nums">
                            {flat.avgRatingDisplay}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {flat.reviewCount}{" "}
                          {flat.reviewCount === 1
                            ? t("flat.review")
                            : t("flat.reviews")}
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        {t("flat.noRatingsYet")}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <Link
              href={buildUrl({ page: String(page - 1) })}
              aria-disabled={page <= 1}
              tabIndex={page <= 1 ? -1 : undefined}
            >
              <Button variant="outline" size="sm" disabled={page <= 1}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t("pagination.previous")}
              </Button>
            </Link>
            <span className="text-sm text-muted-foreground">
              {t("pagination.page")} {page} {t("pagination.of")} {totalPages}
            </span>
            <Link
              href={buildUrl({ page: String(page + 1) })}
              aria-disabled={page >= totalPages}
              tabIndex={page >= totalPages ? -1 : undefined}
            >
              <Button variant="outline" size="sm" disabled={page >= totalPages}>
                {t("pagination.next")}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        )}

        {/* ── Review CTA — visible to all ── */}
        <div className="mt-16 overflow-hidden rounded-2xl border border-[var(--brand)]/20 bg-gradient-to-br from-[var(--brand-light)] to-background p-8 md:p-10">
          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
              <PenLine className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold md:text-2xl">
                {t("home.ctaTitle")}
              </h2>
              <p className="mt-1 text-muted-foreground">{t("home.ctaDesc")}</p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row md:flex-col lg:flex-row">
              {isGuest ? (
                <Link href="/flat/new/guest">
                  <Button size="lg" className="w-full gap-2 font-semibold">
                    <PenLine className="h-4 w-4" />
                    {t("home.ctaButtonGuest")}
                  </Button>
                </Link>
              ) : (
                <Link href="/flat/new">
                  <Button size="lg" className="w-full gap-2 font-semibold">
                    <PenLine className="h-4 w-4" />
                    {t("home.ctaLoggedIn")}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ── FAQ teaser ── */}
        <div className="mt-16 border-t pt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{t("faq.title")}</h2>
            <Link
              href="/faq"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("faq.viewAll")}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y rounded-xl border">
            {[
              { q: t("faq.search.q"), a: t("faq.search.a") },
              { q: t("faq.review.q"), a: t("faq.review.a") },
              { q: t("faq.addFlat.q"), a: t("faq.addFlat.a") },
            ].map(({ q, a }) => (
              <div key={q} className="px-5 py-4">
                <p className="font-semibold mb-1">{q}</p>
                <p className="text-sm text-muted-foreground">{a}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link href="/faq">
              <Button variant="outline" size="sm" className="gap-1">
                {t("faq.viewAll")}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
