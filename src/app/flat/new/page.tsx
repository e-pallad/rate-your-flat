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
import { Label } from "@/components/ui/label";
import { FlatLocationPickerClient } from "@/components/flat-location-picker-client";
import type { LocationValue } from "@/components/flat-location-picker";

export default function NewFlatPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<LocationValue | null>(null);
  const [created, setCreated] = useState<{
    slug: string;
    verificationCode: string;
  } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const description = formData.get("description") as string;

    if (!location) {
      const msg = t("flat.noLocationSelected");
      setError(msg);
      toast.error(msg);
      setLoading(false);
      return;
    }

    const data = {
      address: location.address,
      city: location.city,
      postalCode: location.postalCode,
      country: location.country,
      description,
      latitude: location.latitude,
      longitude: location.longitude,
    };

    try {
      const res = await fetch("/api/flats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-requested-with": "XMLHttpRequest",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || t("common.error"));
      }

      const { slug, verificationCode } = await res.json();
      setCreated({ slug, verificationCode });
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
            <CardTitle className="text-2xl">{t("flat.flatCreated")}</CardTitle>
            <CardDescription>{t("flat.flatCreatedSubtitle")}</CardDescription>
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
            <div className="flex gap-3">
              <Button onClick={() => router.push(`/flat/${created.slug}`)}>
                {t("flat.viewFlat")}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/landlord")}
              >
                {t("nav.dashboard")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("flat.addFlat")}</CardTitle>
          <CardDescription>{t("flat.unclaimed")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
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

            {/* Show parsed address fields read-only once location is selected */}
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

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={loading || !location}
                className="flex-1"
              >
                {loading ? t("common.loading") : t("flat.addFlat")}
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
