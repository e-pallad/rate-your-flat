"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FlatLocationPickerClient } from "@/components/flat-location-picker-client";
import type { LocationValue } from "@/components/flat-location-picker";

const RATING_FIELDS = [
  "overall",
  "location",
  "price",
  "condition",
  "noise",
  "landlord",
] as const;

type RatingField = (typeof RATING_FIELDS)[number];

const DEFAULT_RATINGS: Record<RatingField, number> = {
  overall: 5,
  location: 5,
  price: 5,
  condition: 5,
  noise: 5,
  landlord: 5,
};

interface SuccessState {
  slug: string;
  verificationCode: string;
}

export default function GuestAddFlatPage() {
  const { t } = useTranslation();
  const router = useRouter();

  // flat state
  const [location, setLocation] = useState<LocationValue | null>(null);

  // review state
  const [ratings, setRatings] =
    useState<Record<RatingField, number>>(DEFAULT_RATINGS);

  // shared state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<SuccessState | null>(null);

  function handleRatingChange(field: RatingField, value: number) {
    setRatings((prev) => ({ ...prev, [field]: value }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!location) {
      const msg = t("flat.noLocationSelected");
      setError(msg);
      toast.error(msg);
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const description = formData.get("description") as string;
    const guestSubmitterName =
      (formData.get("guestSubmitterName") as string) || undefined;
    const comment = formData.get("comment") as string;
    const guestName = (formData.get("guestName") as string) || undefined;
    const isAnonymous = formData.get("isAnonymous") === "on";

    try {
      // Step 1: Create the flat
      const flatRes = await fetch("/api/flats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-requested-with": "XMLHttpRequest",
        },
        body: JSON.stringify({
          address: location.address,
          city: location.city,
          postalCode: location.postalCode,
          country: location.country,
          description,
          latitude: location.latitude,
          longitude: location.longitude,
          guestSubmitterName,
        }),
      });

      if (!flatRes.ok) {
        const body = await flatRes.json();
        throw new Error(body.message || t("common.error"));
      }

      const { slug, verificationCode } = await flatRes.json();

      // Step 2: Submit the review (required on the guest combined page)
      const reviewRes = await fetch(`/api/flats/${slug}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-requested-with": "XMLHttpRequest",
        },
        body: JSON.stringify({
          ...ratings,
          comment,
          isAnonymous,
          guestName,
        }),
      });

      if (!reviewRes.ok) {
        const body = await reviewRes.json();
        throw new Error(body.message || t("common.error"));
      }

      setCreated({ slug, verificationCode });
      toast.success(t("review.reviewSubmitted"));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("common.error");
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  if (created) {
    return (
      <div className="container py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {t("flat.flatCreatedWithReview")}
            </CardTitle>
            <CardDescription>
              {t("flat.flatCreatedWithReviewSubtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                {t("flat.verificationCodeLabel")}
              </p>
              <p className="font-mono text-lg font-bold tracking-widest text-yellow-900 dark:text-yellow-100 select-all">
                {created.verificationCode}
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
                {t("flat.verificationCodeHint")}
              </p>
            </div>
            <Button onClick={() => router.push(`/flat/${created.slug}`)}>
              {t("flat.viewFlat")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-2xl">
      <form onSubmit={onSubmit} className="space-y-6">
        {/* ── Section 1: Flat details ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {t("flat.addFlatAndReview")}
            </CardTitle>
            <CardDescription>
              {t("flat.addFlatAndReviewSubtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}

            {/* Map + address search */}
            <div className="space-y-2">
              <Label>{t("flat.searchAddress")}</Label>
              <FlatLocationPickerClient onChange={setLocation} t={t} />
            </div>

            {/* Parsed address read-only summary */}
            {location && (
              <div className="rounded-md border border-input bg-muted/40 px-4 py-3 space-y-1 text-sm">
                <p>
                  <span className="font-medium">{t("flat.address")}:</span>{" "}
                  {location.address || "—"}
                </p>
                <p>
                  <span className="font-medium">{t("flat.postalCode")}:</span>{" "}
                  {location.postalCode || "—"}{" "}
                  <span className="font-medium">{t("flat.city")}:</span>{" "}
                  {location.city || "—"}
                </p>
                <p>
                  <span className="font-medium">{t("flat.country")}:</span>{" "}
                  {location.country || "—"}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">{t("flat.description")}</Label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                placeholder="Optional description of the flat..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guestSubmitterName">
                {t("flat.guestSubmitterName")}
              </Label>
              <Input
                id="guestSubmitterName"
                name="guestSubmitterName"
                type="text"
                placeholder={t("flat.guestSubmitterNamePlaceholder")}
                maxLength={100}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Section 2: Review ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              {t("review.submitReview")}
            </CardTitle>
            <CardDescription>
              {t("review.submitReviewSubtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Optional guest name for the review */}
            <div className="space-y-2">
              <Label htmlFor="guestName">{t("review.guestName")}</Label>
              <Input
                id="guestName"
                name="guestName"
                type="text"
                placeholder={t("review.guestNamePlaceholder")}
                maxLength={100}
              />
            </div>

            {/* Star ratings */}
            <div className="space-y-4">
              <h3 className="font-medium">{t("review.ratings")}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {RATING_FIELDS.map((key) => (
                  <div key={key} className="space-y-2">
                    <Label>
                      {t(
                        `review.${key === "overall" ? "overallRating" : key === "landlord" ? "landlordRating" : key}`,
                      )}
                    </Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingChange(key, star)}
                          className={`text-2xl ${
                            star <= ratings[key]
                              ? "text-yellow-500"
                              : "text-gray-300"
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comment (required) */}
            <div className="space-y-2">
              <Label htmlFor="comment">{t("review.comment")}</Label>
              <textarea
                id="comment"
                name="comment"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={t("review.commentPlaceholder")}
                required
                minLength={10}
              />
            </div>

            {/* Anonymous toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isAnonymous"
                name="isAnonymous"
                className="w-4 h-4"
              />
              <Label htmlFor="isAnonymous" className="cursor-pointer">
                {t("review.anonymous")}
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={loading || !location}
            className="flex-1"
          >
            {loading ? t("common.loading") : t("flat.addFlatAndReview")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            {t("common.cancel")}
          </Button>
        </div>
      </form>
    </div>
  );
}
