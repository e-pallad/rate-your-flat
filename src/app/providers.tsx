"use client";

import { SessionProvider } from "next-auth/react";
import { TranslationProvider } from "@/lib/i18n";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TranslationProvider>{children}</TranslationProvider>
    </SessionProvider>
  );
}
