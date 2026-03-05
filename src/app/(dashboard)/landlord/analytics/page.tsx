import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { LandlordAnalyticsClient } from "@/components/landlord-analytics-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const translations: Record<string, Record<string, string>> = {
  en: {
    "analytics.title": "Analytics",
    "analytics.back": "Back to Dashboard",
  },
  de: {
    "analytics.title": "Analysen",
    "analytics.back": "Zurück zur Übersicht",
  },
};

function getTranslation(key: string): string {
  return (translations.de[key] || translations.en[key] || key) as string;
}

export default async function LandlordAnalyticsPage() {
  const session = await auth();

  if (!session) redirect("/login");
  if (session.user.role !== "LANDLORD") redirect("/");

  const t = getTranslation;

  const flats = await prisma.flat.findMany({
    where: { landlordId: session.user.id },
    select: { id: true, slug: true, address: true, city: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/landlord">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("analytics.back")}
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{t("analytics.title")}</h1>
      </div>

      <LandlordAnalyticsClient flats={flats} />
    </div>
  );
}
