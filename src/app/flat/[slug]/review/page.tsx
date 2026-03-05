"use client";

import { useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ReviewPageProps {
  params: Promise<{ slug: string }>;
}

export default function ReviewPage({ params }: ReviewPageProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ratings, setRatings] = useState({
    overall: 5,
    location: 5,
    price: 5,
    condition: 5,
    noise: 5,
    landlord: 5,
  });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const comment = formData.get("comment") as string;
    const isAnonymous = formData.get("isAnonymous") === "on";

    try {
      // Step 1: Create the review
      const res = await fetch(`/api/flats/${slug}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-requested-with": "XMLHttpRequest",
        },
        body: JSON.stringify({ ...ratings, comment, isAnonymous }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || t("common.error"));
      }

      const { id: reviewId } = await res.json();

      // Step 2: Upload images (if any), best-effort — don't block on failures
      if (selectedFiles.length > 0) {
        await Promise.allSettled(
          selectedFiles.map(async (file) => {
            const fd = new FormData();
            fd.append("file", file);
            await fetch(`/api/reviews/${reviewId}/images`, {
              method: "POST",
              headers: { "x-requested-with": "XMLHttpRequest" },
              body: fd,
            });
          }),
        );
      }

      toast.success(t("review.reviewSubmitted"));
      router.push(`/flat/${slug}`);
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("common.error");
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleRatingChange(field: string, value: number) {
    setRatings((prev) => ({ ...prev, [field]: value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    // Keep at most 5 images
    setSelectedFiles((prev) => {
      const combined = [...prev, ...files];
      return combined.slice(0, 5);
    });
    // Reset input so same file can be re-selected after removal
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="container py-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">{t("review.submitReview")}</CardTitle>
          <CardDescription>{t("review.submitReviewSubtitle")}</CardDescription>
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { key: "overall", label: t("review.overallRating") },
                  { key: "location", label: t("review.location") },
                  { key: "price", label: t("review.price") },
                  { key: "condition", label: t("review.condition") },
                  { key: "noise", label: t("review.noise") },
                  { key: "landlord", label: t("review.landlordRating") },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-2">
                    <Label>{label}</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingChange(key, star)}
                          className={`text-2xl ${
                            star <= ratings[key as keyof typeof ratings]
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

            {/* Image upload */}
            <div className="space-y-2">
              <Label>{t("review.addImages")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("review.imagesHint")}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleFileChange}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80 cursor-pointer"
              />
              {selectedFiles.length > 0 && (
                <ul className="space-y-1 mt-2">
                  {selectedFiles.map((file, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between text-sm py-1 px-2 bg-muted rounded"
                    >
                      <span className="truncate max-w-xs">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="ml-2 text-muted-foreground hover:text-foreground shrink-0"
                        aria-label="Remove"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

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

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? t("common.loading") : t("review.submitReview")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
