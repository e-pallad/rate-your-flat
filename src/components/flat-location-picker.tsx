"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import type {
  LatLngExpression,
  Map as LeafletMap,
  Marker as LeafletMarker,
} from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's broken default icon (webpack strips the image URL references)
let iconFixed = false;
function fixLeafletIcon() {
  if (iconFixed) return;
  iconFixed = true;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

export interface LocationValue {
  address: string;
  city: string;
  postalCode: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface FlatLocationPickerProps {
  /** Called whenever the user confirms a location (search select or pin drag) */
  onChange: (location: LocationValue) => void;
  /** Optional initial position — defaults to central Germany */
  initial?: Partial<LocationValue>;
  /** Translation strings */
  t: (key: string) => string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    house_number?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    postcode?: string;
    country?: string;
    state?: string;
  };
}

// Nominatim search (forward geocoding)
async function searchNominatim(q: string): Promise<NominatimResult[]> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=6&accept-language=de,en`;
  const res = await fetch(url, {
    headers: { "Accept-Language": "de,en" },
  });
  if (!res.ok) return [];
  return res.json();
}

// Nominatim reverse geocoding
async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<NominatimResult | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
  const res = await fetch(url, {
    headers: { "Accept-Language": "de,en" },
  });
  if (!res.ok) return null;
  return res.json();
}

function extractAddress(
  result: NominatimResult,
): Omit<LocationValue, "latitude" | "longitude"> {
  const a = result.address;
  const road = [a.road, a.house_number].filter(Boolean).join(" ");
  const city = a.city || a.town || a.village || a.municipality || a.state || "";
  return {
    address: road || result.display_name.split(",")[0],
    city,
    postalCode: a.postcode || "",
    country: a.country || "Germany",
  };
}

// Inner component: moves map when position changes and handles map clicks
function MapController({
  position,
  onMapClick,
}: {
  position: LatLngExpression | null;
  onMapClick: (lat: number, lng: number) => void;
}) {
  const map = useMap();

  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    if (position) {
      map.setView(position, Math.max(map.getZoom(), 14), { animate: true });
    }
  }, [map, position]);

  return null;
}

const DEFAULT_CENTER: LatLngExpression = [51.1657, 10.4515]; // centre of Germany
const DEFAULT_ZOOM = 6;

export function FlatLocationPicker({
  onChange,
  initial,
  t,
}: FlatLocationPickerProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [position, setPosition] = useState<LatLngExpression | null>(
    initial?.latitude && initial?.longitude
      ? [initial.latitude, initial.longitude]
      : null,
  );
  const [selectedLabel, setSelectedLabel] = useState<string | null>(
    initial?.address || null,
  );
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Fix Leaflet icon once on mount
  useEffect(() => {
    fixLeafletIcon();
  }, []);

  // Debounced Nominatim search
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchNominatim(value);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, []);

  const selectResult = useCallback(
    (result: NominatimResult) => {
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);
      const extracted = extractAddress(result);
      const loc: LocationValue = {
        ...extracted,
        latitude: lat,
        longitude: lng,
      };
      setPosition([lat, lng]);
      setSelectedLabel(result.display_name);
      setQuery(result.display_name.split(",").slice(0, 2).join(","));
      setSuggestions([]);
      setShowSuggestions(false);
      onChange(loc);
    },
    [onChange],
  );

  const handleMapClick = useCallback(
    async (lat: number, lng: number) => {
      setPosition([lat, lng]);
      setSelectedLabel(null);
      setLoading(true);
      try {
        const result = await reverseGeocode(lat, lng);
        if (result) {
          const extracted = extractAddress(result);
          const loc: LocationValue = {
            ...extracted,
            latitude: lat,
            longitude: lng,
          };
          setSelectedLabel(result.display_name);
          setQuery(result.display_name.split(",").slice(0, 2).join(","));
          onChange(loc);
        } else {
          onChange({
            address: "",
            city: "",
            postalCode: "",
            country: "Germany",
            latitude: lat,
            longitude: lng,
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [onChange],
  );

  // Close suggestions when clicking outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className="space-y-2" ref={containerRef}>
      {/* Search bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <svg
            className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder={t("flat.searchPlaceholder")}
            className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            autoComplete="off"
            aria-label={t("flat.searchAddress")}
          />
          {loading && (
            <div className="absolute right-3 h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-[1000] mt-1 w-full rounded-md border border-input bg-popover shadow-md max-h-60 overflow-auto">
            {suggestions.map((r) => (
              <li key={r.place_id}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  onMouseDown={(e) => {
                    // prevent blur from closing dropdown before click registers
                    e.preventDefault();
                    selectResult(r);
                  }}
                >
                  {r.display_name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Hint */}
      <p className="text-xs text-muted-foreground">{t("flat.mapPickerHint")}</p>

      {/* Map */}
      <div className="rounded-md overflow-hidden border border-input">
        <MapContainer
          center={position ?? DEFAULT_CENTER}
          zoom={position ? 14 : DEFAULT_ZOOM}
          style={{ height: "320px", width: "100%" }}
          scrollWheelZoom={false}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController position={position} onMapClick={handleMapClick} />
          {position && (
            <Marker
              position={position}
              draggable
              ref={markerRef}
              eventHandlers={{
                dragend() {
                  const m = markerRef.current;
                  if (m) {
                    const { lat, lng } = m.getLatLng();
                    handleMapClick(lat, lng);
                  }
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Selected location label */}
      {selectedLabel ? (
        <p className="text-xs text-muted-foreground truncate">
          <span className="font-medium text-foreground">
            {t("flat.locationSelected")}:
          </span>{" "}
          {selectedLabel}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground italic">
          {t("flat.noLocationSelected")}
        </p>
      )}
    </div>
  );
}
