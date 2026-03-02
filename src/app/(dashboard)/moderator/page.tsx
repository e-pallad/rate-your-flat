"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";

type FlatItem = {
  id: string;
  slug: string;
  address: string;
  city: string;
  postalCode: string;
  verified: boolean;
  createdAt: string;
  _count: { reviews: number };
};

type ReviewItem = {
  id: string;
  comment: string;
  isAnonymous: boolean;
  createdAt: string;
  flat: { address: string; city: string; slug: string };
  user: { name: string | null; email: string | null };
};

export default function ModeratorDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const [tab, setTab] = useState<"flats" | "reviews">("flats");
  const [flats, setFlats] = useState<FlatItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [flatsRes, reviewsRes] = await Promise.all([
        fetch("/api/moderator/content/flats"),
        fetch("/api/moderator/content/reviews"),
      ]);
      if (flatsRes.status === 403 || reviewsRes.status === 403) {
        router.push("/");
        return;
      }
      if (!flatsRes.ok || !reviewsRes.ok) throw new Error("Failed to load content");
      const [flatsData, reviewsData] = await Promise.all([
        flatsRes.json(),
        reviewsRes.json(),
      ]);
      setFlats(flatsData.flats);
      setReviews(reviewsData.reviews);
    } catch {
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteFlat = async (slug: string, address: string) => {
    if (!confirm(`${t("moderator.confirmDeleteFlat")} (${address})`)) return;
    try {
      const res = await fetch(`/api/moderator/flats/${slug}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || t("common.error"));
        return;
      }
      setFlats((prev) => prev.filter((f) => f.slug !== slug));
    } catch {
      alert(t("common.error"));
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm(t("moderator.confirmDeleteReview"))) return;
    try {
      const res = await fetch(`/api/moderator/reviews/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || t("common.error"));
        return;
      }
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert(t("common.error"));
    }
  };

  const tabClass = (active: boolean) =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
      active
        ? "border-primary text-primary"
        : "border-transparent text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("moderator.dashboard")}</h1>
      </div>

      {loading ? (
        <p className="text-muted-foreground">{t("common.loading")}</p>
      ) : error ? (
        <p className="text-destructive">{error}</p>
      ) : (
        <>
          <div className="flex border-b mb-6">
            <button className={tabClass(tab === "flats")} onClick={() => setTab("flats")}>
              {t("moderator.flats")} ({flats.length})
            </button>
            <button className={tabClass(tab === "reviews")} onClick={() => setTab("reviews")}>
              {t("moderator.reviews")} ({reviews.length})
            </button>
          </div>

          {tab === "flats" && (
            flats.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  {t("common.noResults")}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {flats.map((flat) => (
                  <Card key={flat.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{flat.address}</CardTitle>
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
                      <p className="text-xs text-muted-foreground">
                        {new Date(flat.createdAt).toLocaleDateString("de-DE")}
                        {" \u00b7 "}
                        {flat._count.reviews} {t("moderator.reviews")}
                      </p>
                      <div className="flex gap-2">
                        <Link href={`/flat/${flat.slug}`} target="_blank">
                          <Button variant="ghost" size="sm">
                            {t("flat.viewFlat")}
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteFlat(flat.slug, flat.address)}
                        >
                          {t("moderator.deleteFlat")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          )}

          {tab === "reviews" && (
            reviews.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  {t("common.noResults")}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">
                            {review.flat.address}, {review.flat.city}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {review.isAnonymous ? "Anonymous" : review.user.name}
                            {!review.isAnonymous && review.user.email && (
                              <>{" \u00b7 "}{review.user.email}</>
                            )}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString("de-DE")}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="flex justify-between items-start gap-4">
                      <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                        {review.comment}
                      </p>
                      <div className="flex gap-2 shrink-0">
                        <Link href={`/flat/${review.flat.slug}`} target="_blank">
                          <Button variant="ghost" size="sm">
                            {t("flat.viewFlat")}
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteReview(review.id)}
                        >
                          {t("moderator.deleteReview")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
