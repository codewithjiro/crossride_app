"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const RouteMap = dynamic(() => import("~/components/maps/route-map"), {
  ssr: false,
});

interface GeoPoint {
  lat: number;
  lon: number;
  label: string;
}

interface RouteInfo {
  coords: Array<{ lat: number; lon: number }>;
  distanceKm: number;
  durationMin: number;
}

export default function RoutePreview({
  pickupLabel,
  dropoffLabel,
}: {
  pickupLabel: string;
  dropoffLabel: string;
}) {
  const [pickup, setPickup] = useState<GeoPoint | null>(null);
  const [dropoff, setDropoff] = useState<GeoPoint | null>(null);
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchWithRetry = async (
      url: string,
      retries = 2,
    ): Promise<Response | null> => {
      for (let i = 0; i < retries; i++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          const res = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);
          return res;
        } catch (err: any) {
          if (i < retries - 1) {
            await new Promise((resolve) => setTimeout(resolve, 800));
          }
        }
      }
      return null;
    };

    const fetchGeocode = async (q: string): Promise<GeoPoint | null> => {
      const res = await fetchWithRetry(
        `/api/geocode?q=${encodeURIComponent(q)}`,
      );
      if (!res?.ok) return null;
      const data = await res.json();
      return (data.results?.[0] as GeoPoint | undefined) ?? null;
    };

    const fetchRoute = async (
      from: GeoPoint,
      to: GeoPoint,
    ): Promise<RouteInfo | null> => {
      const res = await fetchWithRetry(
        `/api/route?from=${from.lat},${from.lon}&to=${to.lat},${to.lon}`,
      );
      if (!res?.ok) return null;
      const data = await res.json();
      return data.route as RouteInfo | null;
    };

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [pickupResult, dropoffResult] = await Promise.all([
          fetchGeocode(pickupLabel),
          fetchGeocode(dropoffLabel),
        ]);

        if (cancelled) return;

        if (!pickupResult || !dropoffResult) {
          setError("Could not locate pickup or dropoff on the map.");
          setLoading(false);
          return;
        }

        setPickup(pickupResult);
        setDropoff(dropoffResult);

        const routeResult = await fetchRoute(pickupResult, dropoffResult);
        if (cancelled) return;

        if (routeResult) {
          setRoute(routeResult);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Failed to load route preview.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [pickupLabel, dropoffLabel]);

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-700 bg-[#0b2a4a] p-4 text-sm text-gray-300">
        Loading map...
      </div>
    );
  }

  if (error || !pickup || !dropoff) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
          {error ||
            "Route map unavailable. Try viewing the route details again."}
        </div>
        <div className="space-y-2 rounded-lg border border-gray-700 bg-[#0b2a4a] p-4">
          <div className="text-sm text-gray-400">
            <p className="font-semibold text-gray-300">Pickup:</p>
            <p className="text-gray-400">{pickupLabel}</p>
          </div>
          <div className="text-sm text-gray-400">
            <p className="font-semibold text-gray-300">Destination:</p>
            <p className="text-gray-400">{dropoffLabel}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {route && (
        <p className="text-sm text-gray-200">
          Estimated route:{" "}
          <span className="font-semibold text-white">
            {route.distanceKm} km
          </span>{" "}
          ·
          <span className="font-semibold text-white">
            {" "}
            {route.durationMin} mins
          </span>
        </p>
      )}
      <div className="aspect-[16/9] overflow-hidden rounded-lg border border-gray-700">
        <RouteMap
          pickup={pickup}
          dropoff={dropoff}
          coords={
            route?.coords?.length
              ? route.coords
              : [
                  { lat: pickup.lat, lon: pickup.lon },
                  { lat: dropoff.lat, lon: dropoff.lon },
                ]
          }
        />
      </div>
    </div>
  );
}
