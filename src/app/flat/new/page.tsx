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

export default function NewFlatPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<{
    slug: string;
    verificationCode: string;
  } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      postalCode: formData.get("postalCode") as string,
      country: formData.get("country") as string,
      description: formData.get("description") as string,
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
          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="address">{t("flat.address")} *</Label>
              <Input
                id="address"
                name="address"
                type="text"
                required
                placeholder="Musterstraße 42"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">{t("flat.postalCode")} *</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  required
                  placeholder="10115"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">{t("flat.city")} *</Label>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  required
                  placeholder="Berlin"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">{t("flat.country")}</Label>
              <Input
                id="country"
                name="country"
                type="text"
                defaultValue="Germany"
                placeholder="Germany"
              />
            </div>

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
              <Button type="submit" disabled={loading} className="flex-1">
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
