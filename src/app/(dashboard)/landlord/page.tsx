import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const translations: Record<string, Record<string, string>> = {
  en: {
    "dashboard.landlordDashboard": "Landlord Dashboard",
    "flat.addFlat": "Add Flat",
    "dashboard.totalFlats": "Total Flats",
    "dashboard.totalReviews": "Total Reviews",
    "dashboard.pendingVerification": "Pending Verification",
    "nav.myFlats": "My Flats",
    "common.noResults": "No results found",
    "flat.verified": "Verified",
    "flat.unverified": "Not Verified",
    "flat.verify": "Verify",
    "flat.reviews": "Reviews",
    "flat.viewFlat": "View",
  },
  de: {
    "dashboard.landlordDashboard": "Vermieter-Übersicht",
    "flat.addFlat": "Wohnung hinzufügen",
    "dashboard.totalFlats": "Wohnungen gesamt",
    "dashboard.totalReviews": "Bewertungen gesamt",
    "dashboard.pendingVerification": "Ausstehende Verifizierung",
    "nav.myFlats": "Meine Wohnungen",
    "common.noResults": "Keine Ergebnisse gefunden",
    "flat.verified": "Verifiziert",
    "flat.unverified": "Nicht verifiziert",
    "flat.verify": "Verifizieren",
    "flat.reviews": "Bewertungen",
    "flat.viewFlat": "Ansehen",
  },
};

function getTranslation(key: string): string {
  return (translations.de[key] || translations.en[key] || key) as string;
}

export default async function LandlordDashboard() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "LANDLORD") {
    redirect("/");
  }

  const flats = await prisma.flat.findMany({
    where: { landlordId: session.user.id },
    include: {
      reviews: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalReviews = flats.reduce((acc, flat) => acc + flat.reviews.length, 0);
  const unverifiedFlats = flats.filter((flat) => !flat.verified);
  const t = getTranslation;

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t("dashboard.landlordDashboard")}</h1>
        <Link href="/flat/new">
          <Button>{t("flat.addFlat")}</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.totalFlats")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flats.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.totalReviews")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReviews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.pendingVerification")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unverifiedFlats.length}</div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mb-4">{t("nav.myFlats")}</h2>
      {flats.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("common.noResults")}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {flats.map((flat) => (
            <Card key={flat.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{flat.address}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {flat.postalCode} {flat.city}
                    </p>
                  </div>
                  <Badge variant={flat.verified ? "default" : "secondary"}>
                    {flat.verified ? t("flat.verified") : t("flat.unverified")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {flat.reviews.length} {t("flat.reviews")}
                </span>
                <div className="flex gap-2">
                  {!flat.verified && (
                    <Link href={`/flat/${flat.slug}/verify`}>
                      <Button variant="outline" size="sm">
                        {t("flat.verify")}
                      </Button>
                    </Link>
                  )}
                  <Link href={`/flat/${flat.slug}`}>
                    <Button variant="ghost" size="sm">
                      {t("flat.viewFlat")}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
