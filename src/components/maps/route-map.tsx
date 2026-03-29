"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  useMap,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icons in Leaflet with Next bundling
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = icon;

function FitBounds({ coords }: { coords: Array<[number, number]> }) {
  const map = useMap();
  useEffect(() => {
    if (!coords.length) return;
    try {
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [20, 20] });
    } catch (err) {
      console.error("Error fitting bounds:", err);
    }
  }, [coords, map]);
  return null;
}

function MapLayers({
  pickup,
  dropoff,
  positions,
}: {
  pickup: { lat: number; lon: number };
  dropoff: { lat: number; lon: number };
  positions: Array<[number, number]>;
}) {
  const map = useMap();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, [map]);

  if (!ready) return null;

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {positions.length > 1 && (
        <Polyline
          positions={positions}
          pathOptions={{ color: "#0b2a4a", weight: 4, opacity: 0.9 }}
        />
      )}
      <Marker position={[pickup.lat, pickup.lon]}>
        <Tooltip direction="top" offset={[0, -10]} opacity={0.9} permanent>
          <span className="text-xs">Pickup</span>
        </Tooltip>
      </Marker>
      <Marker position={[dropoff.lat, dropoff.lon]}>
        <Tooltip direction="top" offset={[0, -10]} opacity={0.9} permanent>
          <span className="text-xs">Destination</span>
        </Tooltip>
      </Marker>
      <FitBounds
        coords={
          positions.length
            ? positions
            : [
                [pickup.lat, pickup.lon],
                [dropoff.lat, dropoff.lon],
              ]
        }
      />
    </>
  );
}

interface RouteMapProps {
  pickup: { lat: number; lon: number };
  dropoff: { lat: number; lon: number };
  coords: Array<{ lat: number; lon: number }>;
}

export default function RouteMap({ pickup, dropoff, coords }: RouteMapProps) {
  const positions = useMemo(
    () => coords.map((c) => [c.lat, c.lon] as [number, number]),
    [coords],
  );

  const center: [number, number] = positions.length
    ? positions[Math.floor(positions.length / 2)]
    : [(pickup.lat + dropoff.lat) / 2, (pickup.lon + dropoff.lon) / 2];

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <MapLayers pickup={pickup} dropoff={dropoff} positions={positions} />
    </MapContainer>
  );
}
