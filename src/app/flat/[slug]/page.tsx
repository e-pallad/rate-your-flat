import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { parseRatings, averageOverall } from "@/lib/ratings";
import { ChevronLeft, ChevronRight } from "lucide-react";

const REVIEWS_PER_PAGE = 10;

const translations: Record<string, Record<string, string>> = {
  en: {
    "flat.verified": "Verified",
    "flat.unverified": "Unverified",
    "flat.unclaimed": "No landlord account linked",
    "flat.reviews": "Reviews",
    "flat.noReviews": "No reviews yet",
    "flat.landlord": "Landlord",
    "review.anonymous": "Anonymous",
    "review.response": "Landlord Response",
    "flat.averageRating": "Average Rating",
    "flat.writeReview": "Write a Review",
    "review.alreadyReviewed": "You have already reviewed this flat",
    "pagination.previous": "Previous",
    "pagination.next": "Next",
    "pagination.page": "Page",
    "pagination.of": "of",
  },
  de: {
    "flat.verified": "Verifiziert",
    "flat.unverified": "Nicht verifiziert",
    "flat.unclaimed": "Kein Vermieter-Konto verknüpft",
    "flat.reviews": "Bewertungen",
    "flat.noReviews": "Noch keine Bewertungen",
    "flat.landlord": "Vermieter",
    "review.anonymous": "Anonym",
    "review.response": "Vermieter-Antwort",
    "flat.averageRating": "Durchschnittsbewertung",
    "flat.writeReview": "Bewertung schreiben",
    "review.alreadyReviewed": "Du hast diese Wohnung bereits bewertet",
    "pagination.previous": "Zurück",
    "pagination.next": "Weiter",
    "pagination.page": "Seite",
    "pagination.of": "von",
  },
};

function getTranslation(key: string): string {
  return (translations.de[key] || translations.en[key] || key) as string;
}

export default async function FlatPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const rawPage = Math.max(1, parseInt(pageParam || "1", 10) || 1);
  const t = getTranslation;

  const flat = await prisma.flat.findUnique({
    where: { slug },
    include: {
      landlord: { select: { name: true } },
    },
  });

  if (!flat) {
    notFound();
  }

  const totalReviews = await prisma.review.count({
    where: { flatId: flat.id },
  });
  const totalPages = Math.max(1, Math.ceil(totalReviews / REVIEWS_PER_PAGE));
  const page = Math.min(rawPage, totalPages);

  const [reviews, userReview] = await Promise.all([
    prisma.review.findMany({
      where: { flatId: flat.id },
      include: {
        images: true,
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: REVIEWS_PER_PAGE,
      skip: (page - 1) * REVIEWS_PER_PAGE,
    }),
    session
      ? prisma.review.findFirst({
          where: { flatId: flat.id, userId: session.user.id },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);

  // Compute average from ALL reviews (not just current page)
  const allRatingsRaw = await prisma.review.findMany({
    where: { flatId: flat.id },
    select: { ratings: true },
  });
  const ratings = allRatingsRaw.map((r) => parseRatings(r.ratings));
  const avgRating = averageOverall(ratings);

  return (
    <div className="container py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{flat.address}</CardTitle>
                  <p className="text-muted-foreground">
                    {flat.postalCode} {flat.city}, {flat.country}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {flat.verified ? (
                    <Badge variant="secondary">{t("flat.verified")}</Badge>
                  ) : flat.landlordId ? (
                    <Badge variant="outline">{t("flat.unverified")}</Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      {t("flat.unclaimed")}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {flat.description && <p className="mb-4">{flat.description}</p>}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {flat.landlord && (
                  <span>
                    {t("flat.landlord")}: {flat.landlord.name}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">
              {t("flat.reviews")} ({totalReviews})
            </h2>
            {reviews.length === 0 ? (
              <p className="text-muted-foreground">{t("flat.noReviews")}</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => {
                  const parsedRatings = parseRatings(review.ratings);
                  return (
                    <Card key={review.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium">
                              {review.isAnonymous
                                ? t("review.anonymous")
                                : review.user.name}
                            </span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <span className="text-lg font-semibold">
                            {parsedRatings.overall?.toFixed(1) ?? "—"} / 5
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-2">{review.comment}</p>
                        {review.landlordResponse && (
                          <div className="mt-4 p-3 bg-muted rounded-md">
                            <p className="text-sm font-medium">
                              {t("review.response")}:
                            </p>
                            <p className="text-sm">{review.landlordResponse}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-6">
                <Link
                  href={`?${new URLSearchParams({ page: String(page - 1) }).toString()}`}
                  aria-disabled={page <= 1}
                  tabIndex={page <= 1 ? -1 : undefined}
                >
                  <Button variant="outline" size="sm" disabled={page <= 1}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {t("pagination.previous")}
                  </Button>
                </Link>
                <span className="text-sm text-muted-foreground">
                  {t("pagination.page")} {page} {t("pagination.of")}{" "}
                  {totalPages}
                </span>
                <Link
                  href={`?${new URLSearchParams({ page: String(page + 1) }).toString()}`}
                  aria-disabled={page >= totalPages}
                  tabIndex={page >= totalPages ? -1 : undefined}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                  >
                    {t("pagination.next")}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>{t("flat.averageRating")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-center mb-4">
                {avgRating.toFixed(1)}
                <span className="text-xl text-muted-foreground"> / 5</span>
              </div>
              <div className="text-sm text-muted-foreground text-center mb-4">
                {totalReviews} {t("flat.reviews")}
              </div>
              {session?.user?.role === "RENTER" && !userReview && (
                <Link href={`/flat/${slug}/review`}>
                  <Button className="w-full">{t("flat.writeReview")}</Button>
                </Link>
              )}
              {userReview && (
                <p className="text-sm text-center text-muted-foreground">
                  {t("review.alreadyReviewed")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
