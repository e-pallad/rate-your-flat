"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewFlatPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      postalCode: formData.get("postalCode") as string,
      country: (formData.get("country") as string) || "Germany",
      description: formData.get("description") as string,
    };

    try {
      const res = await fetch("/api/flats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create flat");
      }

      router.push("/landlord");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create flat");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container flex h-[calc(100vh-4rem)] items-center justify-center py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">{t("flat.addFlat")}</CardTitle>
          <CardDescription>Enter your flat details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="address">{t("flat.address")}</Label>
              <Input
                id="address"
                name="address"
                type="text"
                required
                placeholder="Main Street 123"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">{t("flat.city")}</Label>
              <Input
                id="city"
                name="city"
                type="text"
                required
                placeholder="Berlin"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">{t("flat.postalCode")}</Label>
              <Input
                id="postalCode"
                name="postalCode"
                type="text"
                required
                placeholder="10115"
              />
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
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Describe your flat..."
                rows={4}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("common.loading") : t("common.submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
