"use client";

import { useState, use } from "react";
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

interface VerifyPageProps {
  params: Promise<{ id: string }>;
}

export default function VerifyFlatPage({ params }: VerifyPageProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const resolvedParams = use(params);
  const flatId = resolvedParams.id;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/flats/${flatId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Verification failed");
      }

      router.push("/landlord");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container flex h-[calc(100vh-4rem)] items-center justify-center py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">{t("flat.verify")}</CardTitle>
          <CardDescription>
            Enter the verification code for your flat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {error}
              </div>
            )}
            <input type="hidden" name="flatId" value={flatId} />
            <div className="space-y-2">
              <Label htmlFor="verificationCode">
                {t("flat.verificationCode")}
              </Label>
              <Input
                id="verificationCode"
                name="verificationCode"
                type="text"
                required
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder={t("flat.enterCode")}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("common.loading") : t("flat.verify")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
