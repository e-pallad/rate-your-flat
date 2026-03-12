"use client";

import dynamic from "next/dynamic";
import type { FlatLocationPickerProps } from "./flat-location-picker";

// `ssr: false` must live inside a Client Component — it is not allowed in
// Server Components under Next.js / Turbopack. This thin wrapper satisfies
// that requirement while keeping the actual Leaflet map code in
// flat-location-picker.tsx.
const FlatLocationPickerDynamic = dynamic(
  () =>
    import("@/components/flat-location-picker").then(
      (m) => m.FlatLocationPicker,
    ),
  { ssr: false },
);

export function FlatLocationPickerClient(props: FlatLocationPickerProps) {
  return <FlatLocationPickerDynamic {...props} />;
}
