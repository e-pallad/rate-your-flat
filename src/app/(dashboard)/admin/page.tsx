import { requireAdmin } from "@/lib/admin";
import prisma from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const translations: Record<string, Record<string, string>> = {
  en: {
    "admin.dashboard": "Admin Dashboard",
    "admin.overview": "Overview",
    "admin.users": "User Management",
    "admin.content": "Content Moderation",
    "admin.totalUsers": "Total Users",
    "admin.totalFlats": "Total Flats",
    "admin.totalReviews": "Total Reviews",
    "admin.totalModerators": "Total Moderators",
  },
  de: {
    "admin.dashboard": "Admin-Übersicht",
    "admin.overview": "Übersicht",
    "admin.users": "Nutzerverwaltung",
    "admin.content": "Inhaltsmoderation",
    "admin.totalUsers": "Nutzer gesamt",
    "admin.totalFlats": "Wohnungen gesamt",
    "admin.totalReviews": "Bewertungen gesamt",
    "admin.totalModerators": "Moderatoren gesamt",
  },
};

function t(key: string): string {
  return translations.de[key] || translations.en[key] || key;
}

export default async function AdminDashboard() {
  await requireAdmin();

  const [totalUsers, totalFlats, totalReviews, totalModerators] = await Promise.all([
    prisma.user.count(),
    prisma.flat.count(),
    prisma.review.count(),
    prisma.user.count({ where: { role: "MODERATOR" } }),
  ]);

  const stats = [
    { label: t("admin.totalUsers"), value: totalUsers },
    { label: t("admin.totalFlats"), value: totalFlats },
    { label: t("admin.totalReviews"), value: totalReviews },
    { label: t("admin.totalModerators"), value: totalModerators },
  ];

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t("admin.dashboard")}</h1>
        <div className="flex gap-2">
          <Link href="/admin/users">
            <Button variant="outline">{t("admin.users")}</Button>
          </Link>
          <Link href="/admin/content">
            <Button variant="outline">{t("admin.content")}</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
