import Link from "next/link";
import prisma from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronRight } from "lucide-react";

const translations: Record<string, Record<string, string>> = {
  en: {
    "nav.flats": "Flats",
    "common.search": "Search",
    "common.noResults": "No results found",
    "flat.reviews": "Reviews",
    "flat.verified": "Verified",
    "flat.unverified": "Unverified",
    "flat.unclaimed": "No landlord linked",
    "faq.title": "FAQ",
    "faq.viewAll": "View all questions",
    "faq.search.q": "How do I find a flat?",
    "faq.search.a": "Use the search bar above to search by address, city, or postal code. All flats are shown - verified, unverified, and unclaimed.",
    "faq.review.q": "How do I submit a review?",
    "faq.review.a": "Open any flat's detail page and click \"Write a Review\". You need a free account to submit.",
    "faq.addFlat.q": "Can I add a flat as a renter?",
    "faq.addFlat.a": "Yes - any logged-in user can add a flat. Renter-submitted flats appear immediately as \"Unclaimed\".",
  },
  de: {
    "nav.flats": "Wohnungen",
    "common.search": "Suchen",
    "common.noResults": "Keine Ergebnisse gefunden",
    "flat.reviews": "Bewertungen",
    "flat.verified": "Verifiziert",
    "flat.unverified": "Nicht verifiziert",
    "flat.unclaimed": "Kein Vermieter verkn\u00fcpft",
    "faq.title": "H\u00e4ufige Fragen",
    "faq.viewAll": "Alle Fragen ansehen",
    "faq.search.q": "Wie finde ich eine Wohnung?",
    "faq.search.a": "Nutze die Suchleiste oben, um nach Adresse, Stadt oder Postleitzahl zu suchen. Alle Wohnungen werden angezeigt - verifizierte, nicht verifizierte und nicht beanspruchte.",
    "faq.review.q": "Wie schreibe ich eine Bewertung?",
    "faq.review.a": "Oeffne die Detailseite einer Wohnung und klicke auf \"Bewertung schreiben\". Du benoeligst ein kostenloses Konto.",
    "faq.addFlat.q": "Kann ich als Mieter eine Wohnung hinzuf\u00fcgen?",
    "faq.addFlat.a": "Ja - jeder angemeldete Nutzer kann eine Wohnung hinzuf\u00fcgen. Von Mietern eingetragene Wohnungen erscheinen sofort als \"Nicht beansprucht\".",
  },
};

function getTranslation(key: string): string {
  return (translations.de[key] || translations.en[key] || key) as string;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = (params.q || "").trim().slice(0, 100);

  const flats = await prisma.flat.findMany({
    where: query
      ? {
          OR: [
            { address: { contains: query } },
            { city: { contains: query } },
            { postalCode: { contains: query } },
          ],
        }
      : {},
    include: {
      reviews: { select: { ratings: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const flatsWithRating = flats.map((flat) => {
    const ratings = flat.reviews.map((r) => {
      try {
        return JSON.parse(r.ratings) as Record<string, number>;
      } catch {
        return {} as Record<string, number>;
      }
    });
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((acc, r) => acc + (r.overall || 0), 0) / ratings.length
        : 0;
    return { ...flat, avgRating: avgRating.toFixed(1), reviewCount: flat.reviews.length };
  });

  const t = getTranslation;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{t("nav.flats")}</h1>
        <form className="flex gap-2 max-w-md">
          <Input
            name="q"
            placeholder={t("common.search")}
            defaultValue={query}
            className="flex-1"
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            {t("common.search")}
          </Button>
        </form>
      </div>

      {flatsWithRating.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {t("common.noResults")}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {flatsWithRating.map((flat) => (
            <Link key={flat.id} href={`/flat/${flat.slug}`}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg">{flat.address}</CardTitle>
                    {flat.verified ? (
                      <Badge variant="default" className="shrink-0">
                        {t("flat.verified")}
                      </Badge>
                    ) : flat.landlordId ? (
                      <Badge variant="secondary" className="shrink-0">
                        {t("flat.unverified")}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="shrink-0 text-muted-foreground">
                        {t("flat.unclaimed")}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {flat.postalCode} {flat.city}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-bold">{flat.avgRating}</span>
                      <span className="text-sm text-muted-foreground"> / 5</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {flat.reviewCount} {t("flat.reviews")}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* FAQ teaser */}
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
        <div className="divide-y rounded-lg border">
          {[
            { q: t("faq.search.q"), a: t("faq.search.a") },
            { q: t("faq.review.q"), a: t("faq.review.a") },
            { q: t("faq.addFlat.q"), a: t("faq.addFlat.a") },
          ].map(({ q, a }) => (
            <div key={q} className="px-5 py-4">
              <p className="font-medium mb-1">{q}</p>
              <p className="text-sm text-muted-foreground">{a}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link href="/faq">
            <Button variant="outline" size="sm">
              {t("faq.viewAll")}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
