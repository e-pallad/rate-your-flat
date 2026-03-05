"use client";

import dynamic from "next/dynamic";
import type { FlatMapProps } from "./flat-map";

// `ssr: false` must live inside a Client Component — it is not allowed in
// Server Components under Next.js 16 / Turbopack. This thin wrapper satisfies
// that requirement while keeping the actual Leaflet map code in flat-map.tsx.
const FlatMapDynamic = dynamic(
  () => import("@/components/flat-map").then((m) => m.FlatMap),
  { ssr: false },
);

export function FlatMapClient(props: FlatMapProps) {
  return <FlatMapDynamic {...props} />;
}
