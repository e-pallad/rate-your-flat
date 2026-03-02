"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import { use } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Ratings {
  overall: number;
  location: number;
  price: number;
  condition: number;
  noise: number;
  landlord: number;
}

function RatingInput({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor={name}>{label}</Label>
        <span className="text-sm font-semibold tabular-nums">{value} / 5</span>
      </div>
      <input
        id={name}
        name={name}
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
      </div>
    </div>
  );
}

export default function ReviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { t } = useTranslation();
  const router = useRouter();

  const [ratings, setRatings] = useState<Ratings>({
    overall: 3,
    location: 3,
    price: 3,
    condition: 3,
    noise: 3,
    landlord: 3,
  });
  const [comment, setComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function setRating(key: keyof Ratings) {
    return (value: number) => setRatings((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!comment.trim()) {
      setError(t("review.comment") + " is required");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/flats/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...ratings,
          comment: comment.trim(),
          isAnonymous,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || t("common.error"));
      }

      router.push(`/flat/${slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("flat.writeReview")}</CardTitle>
          <CardDescription>{t("review.title")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <h3 className="font-medium">{t("review.ratings")}</h3>
              <RatingInput
                label={t("review.overallRating")}
                name="overall"
                value={ratings.overall}
                onChange={setRating("overall")}
              />
              <RatingInput
                label={t("review.location")}
                name="location"
                value={ratings.location}
                onChange={setRating("location")}
              />
              <RatingInput
                label={t("review.price")}
                name="price"
                value={ratings.price}
                onChange={setRating("price")}
              />
              <RatingInput
                label={t("review.condition")}
                name="condition"
                value={ratings.condition}
                onChange={setRating("condition")}
              />
              <RatingInput
                label={t("review.noise")}
                name="noise"
                value={ratings.noise}
                onChange={setRating("noise")}
              />
              <RatingInput
                label={t("review.landlordRating")}
                name="landlord"
                value={ratings.landlord}
                onChange={setRating("landlord")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">{t("review.comment")} *</Label>
              <textarea
                id="comment"
                name="comment"
                required
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={2000}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                placeholder="Share your experience..."
              />
              <p className="text-xs text-muted-foreground text-right">
                {comment.length} / 2000
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="anonymous"
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              <Label htmlFor="anonymous" className="cursor-pointer font-normal">
                {t("review.anonymous")}
              </Label>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? t("common.loading") : t("review.submitReview")}
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
        </CardContent>
      </Card>
    </div>
  );
}
