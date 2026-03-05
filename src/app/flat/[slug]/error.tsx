"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function FlatError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container flex flex-col items-center justify-center min-h-[60vh] py-16 text-center">
      <h2 className="text-2xl font-bold mb-2">Could not load flat</h2>
      <p className="text-muted-foreground mb-6 max-w-sm">
        There was a problem loading this flat. Please try again or go back to
        the listing.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <Link href="/">Back to listings</Link>
        </Button>
      </div>
    </div>
  );
}
