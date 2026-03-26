"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { X, MapPin, Calendar, Clock, Users, Car } from "lucide-react";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

const RouteMap = dynamic(() => import("~/components/maps/route-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 items-center justify-center text-sm text-gray-400">
      Loading map...
    </div>
  ),
});

type DbTrip = {
  id: number;
  vanId: number;
  driverId: number;
  route: string;
  departureTime: Date | string;
  arrivalTime: Date | string;
  seatsAvailable: number;
  seatsReserved: number;
  status: string;
  cancelReason?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string | null;
};

type DbVan = {
  id: number;
  name: string;
  plateNumber: string;
  capacity: number;
  status: string;
  image?: string;
};

type DbDriver = {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  licenseNumber: string;
  profileImage?: string;
};

interface TripWithRelations extends DbTrip {
  van: DbVan | null;
  driver: DbDriver | null;
}

interface TripDetailsModalProps {
  trip: TripWithRelations | null;
  isOpen: boolean;
  onClose: () => void;
}

function parseRouteParts(route: string | null | undefined) {
  if (!route) return { pickup: null, dropoff: null, coords: [] };
  const pickupMatch = route.match(/Pickup:\s*(.*?)\s*→/);
  const dropoffMatch = route.match(/→\s*Dropoff:\s*([^|]+)(?:\||$)/);
  return {
    pickup: pickupMatch?.[1]?.trim() || null,
    dropoff: dropoffMatch?.[1]?.trim() || null,
    coords: [],
  };
}

export function TripDetailsModal({
  trip,
  isOpen,
  onClose,
}: TripDetailsModalProps) {
  const [mapData, setMapData] = useState<{
    pickup: { lat: number; lon: number } | null;
    dropoff: { lat: number; lon: number } | null;
    coords: Array<{ lat: number; lon: number }>;
    distance?: string;
    duration?: string;
  } | null>(null);
  const [loadingMap, setLoadingMap] = useState(false);

  useEffect(() => {
    if (!trip || !isOpen) return;

    const fetchCoordinates = async () => {
      setLoadingMap(true);
      const { pickup, dropoff } = parseRouteParts(trip.route);

      try {
        let pickupCoords = null;
        let dropoffCoords = null;

        // Geocode pickup location
        if (pickup) {
          const pickupRes = await fetch(
            `/api/geocode?q=${encodeURIComponent(pickup)}`,
          );
          if (pickupRes.ok) {
            const pickupData = await pickupRes.json();
            if (pickupData.results && pickupData.results.length > 0) {
              pickupCoords = {
                lat: pickupData.results[0].lat,
                lon: pickupData.results[0].lon,
              };
            }
          }
        }

        // Geocode dropoff location
        if (dropoff) {
          const dropoffRes = await fetch(
            `/api/geocode?q=${encodeURIComponent(dropoff)}`,
          );
          if (dropoffRes.ok) {
            const dropoffData = await dropoffRes.json();
            if (dropoffData.results && dropoffData.results.length > 0) {
              dropoffCoords = {
                lat: dropoffData.results[0].lat,
                lon: dropoffData.results[0].lon,
              };
            }
          }
        }

        let routeData = null;
        let distance = undefined;
        let duration = undefined;

        // Fetch route data if both coordinates are available
        if (pickupCoords && dropoffCoords) {
          try {
            const routeRes = await fetch(
              `/api/route?from=${pickupCoords.lat},${pickupCoords.lon}&to=${dropoffCoords.lat},${dropoffCoords.lon}`,
            );
            if (routeRes.ok) {
              const routeResponse = await routeRes.json();
              routeData = routeResponse.route;
              distance = routeData.distanceKm;
              duration = routeData.durationMin;
            }
          } catch (err) {
            console.error("Error fetching route:", err);
          }
        }

        setMapData({
          pickup: pickupCoords,
          dropoff: dropoffCoords,
          coords:
            routeData?.coords?.length > 0
              ? routeData.coords
              : pickupCoords && dropoffCoords
                ? [pickupCoords, dropoffCoords]
                : [],
          distance,
          duration,
        });
      } catch (error) {
        console.error("Error geocoding locations:", error);
        setMapData({
          pickup: null,
          dropoff: null,
          coords: [],
        });
      } finally {
        setLoadingMap(false);
      }
    };

    fetchCoordinates();
  }, [trip, isOpen]);

  if (!isOpen || !trip) return null;

  const { pickup, dropoff } = parseRouteParts(trip.route);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/20 text-amber-300";
      case "scheduled":
        return "bg-emerald-500/20 text-emerald-300";
      case "completed":
        return "bg-green-500/20 text-green-300";
      case "cancelled":
        return "bg-red-500/20 text-red-300";
      default:
        return "bg-gray-500/20 text-gray-300";
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <Card className="max-h-[90vh] w-full max-w-4xl overflow-y-auto border-[#f1c44f]/20 bg-[#071d3a]">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-[#f1c44f]/20 bg-[#0a2540] px-8 py-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Trip Details</h2>
            <p className="mt-1 flex items-center gap-2 text-sm text-gray-300">
              <MapPin size={16} className="text-[#f1c44f]" />
              {trip.route}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge
              className={`${getStatusColor(trip.status)} text-sm capitalize`}
            >
              {trip.status}
            </Badge>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-[#f1c44f]/10 hover:text-[#f1c44f]"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8 p-8">
          {/* Schedule Section */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Schedule</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg bg-[#0a2540]/50 p-3">
                  <Calendar size={20} className="text-[#f1c44f]" />
                  <div>
                    <p className="text-xs text-gray-400">Departure</p>
                    <p className="font-medium text-white">
                      {formatDate(trip.departureTime)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-[#0a2540]/50 p-3">
                  <Clock size={20} className="text-[#f1c44f]" />
                  <div>
                    <p className="text-xs text-gray-400">
                      {trip.status === "completed" ? "Arrival" : "ETA"}
                    </p>
                    <p className="font-medium text-white">
                      {trip.status === "completed"
                        ? formatDate(trip.arrivalTime)
                        : mapData?.duration
                          ? formatDate(
                              new Date(
                                new Date(trip.departureTime).getTime() +
                                  mapData.duration * 60 * 1000,
                              ),
                            )
                          : formatDate(trip.arrivalTime)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle & Driver Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Vehicle & Driver
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg bg-[#0a2540]/50 p-3">
                  <Car size={20} className="text-[#f1c44f]" />
                  <div>
                    <p className="text-xs text-gray-400">Van</p>
                    <p className="font-medium text-white">
                      {trip.van?.name || "N/A"} ({trip.van?.plateNumber})
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-[#0a2540]/50 p-3">
                  <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-[#1a3a5c]">
                    {trip.driver?.profileImage ? (
                      <Image
                        src={trip.driver.profileImage}
                        alt={trip.driver.name}
                        width={56}
                        height={56}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg font-bold text-[#f1c44f]">
                        {trip.driver?.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Driver</p>
                    <p className="font-medium text-white">
                      {trip.driver?.name || "N/A"}
                    </p>
                    {trip.driver?.email && (
                      <p className="text-xs text-gray-400">
                        {trip.driver.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Capacity Section */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-[#f1c44f]/20 bg-[#0a2540]/50 p-4 text-center">
              <p className="text-sm text-gray-400">Total Seats</p>
              <p className="mt-2 text-3xl font-bold text-[#f1c44f]">
                {trip.van?.capacity || 0}
              </p>
            </Card>
            <Card className="border-emerald-500/20 bg-[#0a2540]/50 p-4 text-center">
              <p className="text-sm text-gray-400">Reserved Seats</p>
              <p className="mt-2 text-3xl font-bold text-emerald-400">
                {trip.seatsReserved}
              </p>
            </Card>
            <Card className="border-blue-500/20 bg-[#0a2540]/50 p-4 text-center">
              <p className="text-sm text-gray-400">Available Seats</p>
              <p className="mt-2 text-3xl font-bold text-blue-400">
                {trip.seatsAvailable}
              </p>
            </Card>
          </div>

          {/* Locations Section */}
          {pickup || dropoff ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Route</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {pickup && (
                  <div className="rounded-lg border border-[#f1c44f]/30 bg-[#0a2540]/50 p-4">
                    <p className="mb-1 text-xs font-semibold text-[#f1c44f]">
                      PICKUP
                    </p>
                    <p className="text-white">{pickup}</p>
                  </div>
                )}
                {dropoff && (
                  <div className="rounded-lg border border-[#f1c44f]/30 bg-[#0a2540]/50 p-4">
                    <p className="mb-1 text-xs font-semibold text-[#f1c44f]">
                      DROPOFF
                    </p>
                    <p className="text-white">{dropoff}</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Map */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Route Map</h3>
            {mapData?.distance && mapData?.duration && (
              <p className="text-sm text-gray-200">
                Estimated route:{" "}
                <span className="font-semibold text-white">
                  {mapData.distance} km
                </span>{" "}
                ·
                <span className="font-semibold text-white">
                  {" "}
                  {mapData.duration} mins
                </span>
              </p>
            )}
            <div className="h-96 overflow-hidden rounded-lg border border-[#f1c44f]/20 bg-[#0a2540]/50">
              {loadingMap ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-gray-400">Loading map...</p>
                </div>
              ) : mapData?.pickup && mapData?.dropoff ? (
                <RouteMap
                  pickup={mapData.pickup}
                  dropoff={mapData.dropoff}
                  coords={mapData.coords}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  <p>Map data unavailable</p>
                </div>
              )}
            </div>
          </div>

          {/* Cancel Reason (if cancelled) */}
          {trip.status === "cancelled" && trip.cancelReason && (
            <div className="rounded-lg border-l-4 border-red-500 bg-red-500/10 p-4">
              <p className="mb-1 text-sm font-semibold text-red-400">
                Cancellation Reason
              </p>
              <p className="text-gray-300">{trip.cancelReason}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
