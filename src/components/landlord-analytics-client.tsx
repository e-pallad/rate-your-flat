"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";

interface RatingsEntry {
  overall: number;
  location: number;
  price: number;
  condition: number;
  noise: number;
  landlord: number;
}

interface Review {
  id: string;
  createdAt: string;
  ratings: RatingsEntry;
}

interface FlatOption {
  id: string;
  slug: string;
  address: string;
  city: string;
}

interface MonthPoint {
  month: string;
  avg: number;
  count: number;
}

interface DimensionPoint {
  name: string;
  avg: number;
}

function groupByMonth(reviews: Review[]): MonthPoint[] {
  const map: Record<string, { sum: number; count: number }> = {};
  for (const r of reviews) {
    const d = new Date(r.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!map[key]) map[key] = { sum: 0, count: 0 };
    map[key].sum += r.ratings.overall ?? 0;
    map[key].count += 1;
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, { sum, count }]) => ({
      month,
      avg: parseFloat((sum / count).toFixed(2)),
      count,
    }));
}

function dimensionAverages(reviews: Review[]): DimensionPoint[] {
  if (reviews.length === 0) return [];
  const keys: (keyof RatingsEntry)[] = [
    "overall",
    "location",
    "price",
    "condition",
    "noise",
    "landlord",
  ];
  return keys.map((k) => ({
    name: k.charAt(0).toUpperCase() + k.slice(1),
    avg: parseFloat(
      (
        reviews.reduce((s, r) => s + (r.ratings[k] ?? 0), 0) / reviews.length
      ).toFixed(2),
    ),
  }));
}

export function LandlordAnalyticsClient({ flats }: { flats: FlatOption[] }) {
  const { t } = useTranslation();
  const [selectedFlat, setSelectedFlat] = useState<string>(flats[0]?.id ?? "");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedFlat) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/landlord/analytics?flatId=${selectedFlat}`,
          { headers: { "x-requested-with": "XMLHttpRequest" } },
        );
        const data = await res.json();
        if (!cancelled) setReviews(data.reviews ?? []);
      } catch {
        if (!cancelled) setReviews([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedFlat]);

  const trendData = groupByMonth(reviews);
  const dimData = dimensionAverages(reviews);

  if (flats.length === 0) {
    return <p className="text-muted-foreground">{t("analytics.noFlats")}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <label htmlFor="flat-select" className="text-sm font-medium">
          {t("analytics.selectFlat")}
        </label>
        <select
          id="flat-select"
          value={selectedFlat}
          onChange={(e) => setSelectedFlat(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring w-72"
        >
          {flats.map((f) => (
            <option key={f.id} value={f.id}>
              {f.address}, {f.city}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <p className="text-muted-foreground text-sm">{t("common.loading")}</p>
      )}

      {!loading && reviews.length === 0 && (
        <p className="text-muted-foreground text-sm">{t("flat.noReviews")}</p>
      )}

      {!loading && reviews.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{t("analytics.ratingTrend")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(
                      val: number | string | (number | string)[] | undefined,
                    ) => [
                      typeof val === "number"
                        ? val.toFixed(2)
                        : String(val ?? ""),
                      t("review.overallRating"),
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="avg"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name={t("review.overallRating")}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("analytics.dimensionBreakdown")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dimData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(
                      val: number | string | (number | string)[] | undefined,
                    ) => [
                      typeof val === "number"
                        ? val.toFixed(2)
                        : String(val ?? ""),
                      t("analytics.avgRating"),
                    ]}
                  />
                  <Legend />
                  <Bar
                    dataKey="avg"
                    fill="#6366f1"
                    name={t("analytics.avgRating")}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">
            {t("analytics.basedOn")} {reviews.length}{" "}
            {t("analytics.reviewsCount")}
          </p>
        </>
      )}
    </div>
  );
}
