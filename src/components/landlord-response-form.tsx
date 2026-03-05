"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { toast } from "sonner";

interface LandlordResponseFormProps {
  reviewId: string;
}

export function LandlordResponseForm({ reviewId }: LandlordResponseFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!response.trim()) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/reviews/${reviewId}/response`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-requested-with": "XMLHttpRequest",
        },
        body: JSON.stringify({ response: response.trim() }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || t("common.error"));
      }

      toast.success(t("review.responseSubmitted"));
      setOpen(false);
      setResponse("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="mt-2"
      >
        {t("review.respond")}
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2">
      <textarea
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        placeholder={t("review.responsePlaceholder")}
        maxLength={1000}
        required
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? t("common.loading") : t("common.submit")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setOpen(false);
            setResponse("");
          }}
          disabled={loading}
        >
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  );
}
