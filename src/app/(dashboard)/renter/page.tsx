import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const translations: Record<string, Record<string, string>> = {
  en: {
    "dashboard.renterDashboard": "Renter Dashboard",
    "dashboard.myReviews": "My Reviews",
    "dashboard.mySubmittedFlats": "Flats I Added",
    "flat.addFlat": "Add Flat",
    "flat.reviews": "Reviews",
    "flat.viewFlat": "View Flat",
    "flat.verified": "Verified",
    "flat.unverified": "Unverified",
    "flat.unclaimed": "No landlord linked",
    "common.noResults": "No results found",
  },
  de: {
    "dashboard.renterDashboard": "Mieter-Übersicht",
    "dashboard.myReviews": "Meine Bewertungen",
    "dashboard.mySubmittedFlats": "Von mir hinzugefügte Wohnungen",
    "flat.addFlat": "Wohnung hinzufügen",
    "flat.reviews": "Bewertungen",
    "flat.viewFlat": "Wohnung ansehen",
    "flat.verified": "Verifiziert",
    "flat.unverified": "Nicht verifiziert",
    "flat.unclaimed": "Kein Vermieter verknüpft",
    "common.noResults": "Keine Ergebnisse gefunden",
  },
};

function getTranslation(key: string): string {
  return (translations.de[key] || translations.en[key] || key) as string;
}

export default async function RenterDashboard() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "RENTER") {
    redirect("/");
  }

  const [reviews, submittedFlats] = await Promise.all([
    prisma.review.findMany({
      where: { userId: session.user.id },
      include: { flat: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.flat.findMany({
      where: { submittedById: session.user.id },
      include: { reviews: { select: { id: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const t = getTranslation;

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t("dashboard.renterDashboard")}</h1>
        <Link href="/flat/new">
          <Button>{t("flat.addFlat")}</Button>
        </Link>
      </div>

      {/* Submitted flats section */}
      <h2 className="text-xl font-semibold mb-4">{t("dashboard.mySubmittedFlats")}</h2>
      {submittedFlats.length === 0 ? (
        <Card className="mb-8">
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("common.noResults")}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 mb-8">
          {submittedFlats.map((flat) => (
            <Card key={flat.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{flat.address}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {flat.postalCode} {flat.city}
                    </p>
                  </div>
                  {flat.verified ? (
                    <Badge variant="default">{t("flat.verified")}</Badge>
                  ) : flat.landlordId ? (
                    <Badge variant="secondary">{t("flat.unverified")}</Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      {t("flat.unclaimed")}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {flat.reviews.length} {t("flat.reviews")}
                </span>
                <Link href={`/flat/${flat.slug}`}>
                  <Button variant="ghost" size="sm">
                    {t("flat.viewFlat")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reviews section */}
      <h2 className="text-xl font-semibold mb-4">{t("dashboard.myReviews")}</h2>
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("common.noResults")}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            let parsedRatings: Record<string, number> = {};
            try {
              parsedRatings = JSON.parse(review.ratings) as Record<string, number>;
            } catch {
              // malformed ratings — skip gracefully
            }
            return (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{review.flat.address}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {review.flat.postalCode} {review.flat.city}
                      </p>
                    </div>
                    <span className="text-lg font-semibold">
                      {parsedRatings.overall?.toFixed(1) ?? "—"} / 5
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-2">{review.comment}</p>
                  <Link href={`/flat/${review.flat.slug}`}>
                    <Button variant="ghost" size="sm">
                      {t("flat.viewFlat")}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
