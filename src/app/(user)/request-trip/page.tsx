"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { DRIVERS } from "~/lib/data";
import { MapPin, Users, Calendar, Loader2, ArrowLeft } from "lucide-react";

interface BookingRequest {
  vanId: string;
  driverId: string;
  date: string;
  time: string;
  seatsRequested: number;
  department: string;
}

interface LocationResult {
  label: string;
  lat: number;
  lon: number;
}

interface RouteInfo {
  distanceKm: number;
  durationMin: number;
  coords: Array<{ lat: number; lon: number }>;
}

const DEPARTMENTS = [
  "School of Arts, Sciences and Education",
  "School of Criminal Justice",
  "School of Tourism and Hospitality Management",
  "School of Computer Information Technology and Engineering",
  "School of Business and Accountancy",
];

interface AvailabilityData {
  dates: Array<{ value: string; label: string }>;
  times: Array<{ value: string; label: string }>;
}

export default function RequestTrip() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [availability, setAvailability] = useState<AvailabilityData | null>(
    null,
  );
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [unavailableVanIds, setUnavailableVanIds] = useState<number[]>([]);
  const [unavailableDriverIds, setUnavailableDriverIds] = useState<number[]>(
    [],
  );

  const [pickupQuery, setPickupQuery] = useState(
    "Holy Cross College Santa Ana Pampanga",
  );
  const [dropoffQuery, setDropoffQuery] = useState("");
  const [pickupResults, setPickupResults] = useState<LocationResult[]>([]);
  const [dropoffResults, setDropoffResults] = useState<LocationResult[]>([]);
  const [selectedPickup, setSelectedPickup] = useState<LocationResult | null>({
    label: "Holy Cross College Santa Ana Pampanga",
    lat: 15.093701809054442,
    lon: 120.769449501851,
  });
  const [selectedDropoff, setSelectedDropoff] = useState<LocationResult | null>(
    null,
  );
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [vans, setVans] = useState<
    Array<{ id: number; name: string; plateNumber: string; capacity: number }>
  >([]);
  const [loadingVans, setLoadingVans] = useState(true);

  const RouteMap = dynamic(() => import("~/components/maps/route-map"), {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-gray-400">
        Loading map...
      </div>
    ),
  });

  const [formData, setFormData] = useState<BookingRequest>({
    vanId: "",
    driverId: "",
    date: "",
    time: "08:00",
    seatsRequested: 1,
    department: "",
  });

  const selectedVan = vans.find((v) => String(v.id) === formData.vanId);
  const selectedDriver = DRIVERS.find((d) => d.id === formData.driverId);

  // Fetch availability from API
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const response = await fetch("/api/bookings/availability");
        const data = await response.json();
        if (response.ok) {
          setAvailability(data);
          // Set first available date by default
          if (data.dates.length > 0) {
            setFormData((prev) => ({ ...prev, date: data.dates[0].value }));
          }
          // Set first available time by default
          if (data.times.length > 0) {
            setFormData((prev) => ({ ...prev, time: data.times[0].value }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch availability:", err);
      } finally {
        setLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, []);

  // Fetch active vans
  useEffect(() => {
    const loadVans = async () => {
      try {
        const res = await fetch("/api/vans");
        const data = await res.json();
        if (res.ok && Array.isArray(data.vans)) {
          setVans(data.vans);
        }
      } catch (err) {
        console.error("Failed to load vans", err);
      } finally {
        setLoadingVans(false);
      }
    };
    loadVans();
  }, []);

  // Fetch unavailable vans and drivers for selected date
  useEffect(() => {
    if (!formData.date) {
      setUnavailableVanIds([]);
      setUnavailableDriverIds([]);
      return;
    }

    const fetchUnavailable = async () => {
      try {
        const response = await fetch(
          `/api/trips/by-date?date=${formData.date}`,
        );
        const data = await response.json();
        if (response.ok) {
          setUnavailableVanIds(data.unavailableVanIds || []);
          setUnavailableDriverIds(data.unavailableDriverIds || []);
        }
      } catch (err) {
        console.error("Failed to fetch unavailable vans and drivers:", err);
      }
    };

    fetchUnavailable();
  }, [formData.date]);

  // Geocode helpers (debounced fetches)
  useEffect(() => {
    const controller = new AbortController();
    if (!pickupQuery || pickupQuery.length < 3) {
      setPickupResults([]);
      return () => controller.abort();
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/geocode?q=${encodeURIComponent(pickupQuery)}`,
          { signal: controller.signal },
        );
        const data = await res.json();
        if (res.ok) setPickupResults(data.results || []);
      } catch (err) {
        if (err?.name !== "AbortError") {
          console.error("Pickup search failed", err);
        }
      }
    }, 300);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [pickupQuery]);

  useEffect(() => {
    const controller = new AbortController();
    if (!dropoffQuery || dropoffQuery.length < 3) {
      setDropoffResults([]);
      return () => controller.abort();
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/geocode?q=${encodeURIComponent(dropoffQuery)}`,
          { signal: controller.signal },
        );
        const data = await res.json();
        if (res.ok) setDropoffResults(data.results || []);
      } catch (err) {
        if ((err as any)?.name !== "AbortError") {
          console.error("Dropoff search failed", err);
        }
      }
    }, 300);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [dropoffQuery]);

  // Fetch route info when both points are selected
  useEffect(() => {
    const fetchRoute = async () => {
      if (!selectedPickup || !selectedDropoff) {
        setRouteInfo(null);
        return;
      }
      try {
        const res = await fetch(
          `/api/route?from=${selectedPickup.lat},${selectedPickup.lon}&to=${selectedDropoff.lat},${selectedDropoff.lon}`,
        );
        const data = await res.json();
        if (res.ok && data.route) {
          setRouteInfo({
            distanceKm: data.route.distanceKm,
            durationMin: data.route.durationMin,
            coords: data.route.coords || [],
          });
        }
      } catch (err) {
        console.error("Route fetch failed", err);
      }
    };
    fetchRoute();
  }, [selectedPickup, selectedDropoff]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.vanId || !formData.driverId || !formData.date) {
      setError("Please select a van, driver, and date");
      return;
    }

    if (!formData.department) {
      setError("Please select your department");
      return;
    }

    if (!selectedPickup || !selectedDropoff) {
      setError("Please select pickup and destination from suggestions");
      return;
    }

    if (formData.seatsRequested < 1) {
      setError("Please select at least 1 seat");
      return;
    }

    setLoading(true);

    try {
      // Combine date and time: "2026-03-20" + "08:00" = "2026-03-20T08:00"
      const dateTimeString = `${formData.date}T${formData.time}`;
      const depDateTime = new Date(dateTimeString);
      const arrDateTime = new Date(depDateTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

      const response = await fetch("/api/bookings/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vanId: parseInt(formData.vanId),
          driverId: parseInt(formData.driverId),
          route:
            `Pickup: ${selectedPickup.label} → Dropoff: ${selectedDropoff.label}` +
            (routeInfo
              ? ` | Distance: ${routeInfo.distanceKm} km, ETA: ${routeInfo.durationMin} mins`
              : ""),
          department: formData.department,
          departureTime: depDateTime.toISOString(),
          arrivalTime: arrDateTime.toISOString(),
          seatsRequested: formData.seatsRequested,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create booking request");
        return;
      }

      // Success - redirect to my bookings
      router.push("/my-bookings?success=true");
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071d3a] p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Request a Trip</h1>
          <p className="mt-2 text-gray-400">
            Book a van and driver for your transportation needs
          </p>
        </div>

        {error && (
          <Card className="mb-6 border-red-500/20 bg-red-500/10 p-4">
            <p className="text-red-400">{error}</p>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Department */}
          <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-4">
            <label className="mb-2 block text-sm font-semibold text-white">
              Department
            </label>
            <select
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
              className="w-full rounded-lg border border-gray-600 bg-[#071d3a] px-4 py-2 text-white focus:border-[#f1c44f] focus:outline-none"
              required
            >
              <option value="">Select department</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </Card>

          {/* Date Picker */}
          <div>
            <label className="mb-4 block text-lg font-bold text-white">
              <Calendar className="mr-2 mb-2 inline" size={20} />
              Select Departure Date
            </label>
            {loadingAvailability ? (
              <div className="rounded-lg border border-gray-600 bg-[#071d3a] px-4 py-2 text-gray-400">
                Loading dates...
              </div>
            ) : (
              <div>
                <select
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-600 bg-[#071d3a] px-4 py-2 text-white focus:border-[#f1c44f] focus:outline-none"
                  required
                >
                  <option value="">Select a date</option>
                  {availability?.dates.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Time Picker */}
          <div>
            <label className="mb-4 block text-lg font-bold text-white">
              Select Departure Time
            </label>
            {loadingAvailability ? (
              <div className="rounded-lg border border-gray-600 bg-[#071d3a] px-4 py-2 text-gray-400">
                Loading times...
              </div>
            ) : (
              <select
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                className="w-full rounded-lg border border-gray-600 bg-[#071d3a] px-4 py-2 text-white focus:border-[#f1c44f] focus:outline-none"
                required
              >
                {availability?.times.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Select Van */}
          <div>
            <label className="mb-4 block text-lg font-bold text-white">
              <MapPin className="mr-2 mb-2 inline" size={20} />
              Select a Van
            </label>
            <div className="grid gap-4 md:grid-cols-3">
              {(loadingVans ? [] : vans).map((van) => {
                // Van is unavailable only if it has a trip on the SELECTED date
                const isUnavailableOnSelectedDate =
                  formData.date && unavailableVanIds.includes(van.id);

                return (
                  <Card
                    key={van.id}
                    className={`border-2 p-4 transition-all ${
                      isUnavailableOnSelectedDate
                        ? "cursor-not-allowed border-red-600/50 bg-red-900/20 opacity-60"
                        : `cursor-pointer ${
                            formData.vanId === String(van.id)
                              ? "border-[#f1c44f] bg-[#f1c44f]/10"
                              : "border-[#f1c44f]/20 bg-[#0a2540] hover:border-[#f1c44f]/40"
                          }`
                    }`}
                    onClick={() =>
                      !isUnavailableOnSelectedDate &&
                      setFormData({ ...formData, vanId: String(van.id) })
                    }
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-white">{van.name}</h3>
                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
                          <Users size={16} />
                          {van.capacity} seats · Plate {van.plateNumber}
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          {van.description}
                        </p>
                        {isUnavailableOnSelectedDate && (
                          <p className="mt-2 text-xs font-semibold text-red-400">
                            ❌ Not available on{" "}
                            {formData.date
                              ? new Date(formData.date).toLocaleDateString()
                              : "selected date"}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Select Driver */}
          <div>
            <label className="mb-4 block text-lg font-bold text-white">
              Select a Driver
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              {DRIVERS.map((driver) => {
                const isUnavailableOnSelectedDate =
                  formData.date &&
                  unavailableDriverIds.includes(parseInt(driver.id));

                return (
                  <Card
                    key={driver.id}
                    className={`border-2 p-4 transition-all ${
                      isUnavailableOnSelectedDate
                        ? "cursor-not-allowed border-red-600/50 bg-red-900/20 opacity-60"
                        : `cursor-pointer ${
                            formData.driverId === driver.id
                              ? "border-[#f1c44f] bg-[#f1c44f]/10"
                              : "border-[#f1c44f]/20 bg-[#0a2540] hover:border-[#f1c44f]/40"
                          }`
                    }`}
                    onClick={() =>
                      !isUnavailableOnSelectedDate &&
                      setFormData({ ...formData, driverId: driver.id })
                    }
                  >
                    <h3 className="font-bold text-white">{driver.name}</h3>
                    <p className="text-sm text-gray-400">{driver.role}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {driver.experience} experience
                    </p>
                    <p className="text-xs text-[#f1c44f]">
                      {driver.specialization}
                    </p>
                    {isUnavailableOnSelectedDate && (
                      <p className="mt-2 text-xs font-semibold text-red-400">
                        ❌ Not available on{" "}
                        {formData.date
                          ? new Date(formData.date).toLocaleDateString()
                          : "selected date"}
                      </p>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Seats Selection */}
          <div>
            <label className="mb-4 block text-lg font-bold text-white">
              <Users className="mr-2 mb-2 inline" size={20} />
              Number of Seats
            </label>
            <select
              value={formData.seatsRequested}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  seatsRequested: parseInt(e.target.value),
                })
              }
              className="w-full rounded-lg border border-gray-600 bg-[#071d3a] px-4 py-2 text-white focus:border-[#f1c44f] focus:outline-none"
              required
            >
              {selectedVan ? (
                Array.from({ length: selectedVan.capacity }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} {i === 0 ? "seat" : "seats"}
                  </option>
                ))
              ) : (
                <option>Select van first</option>
              )}
            </select>
          </div>

          {/* Locations */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-4">
              <p className="text-sm font-semibold text-white">
                Pickup Location
              </p>
              <input
                value={pickupQuery}
                onChange={(e) => {
                  setPickupQuery(e.target.value);
                  setSelectedPickup(null);
                }}
                placeholder="Search address or place"
                className="mt-2 w-full rounded-lg border border-gray-600 bg-[#071d3a] px-3 py-2 text-white focus:border-[#f1c44f] focus:outline-none"
              />
              {selectedPickup && (
                <p className="mt-2 text-xs text-green-300">
                  Selected: {selectedPickup.label}
                </p>
              )}
              {!selectedPickup && pickupResults.length > 0 && (
                <div className="mt-2 max-h-40 space-y-1 overflow-auto rounded border border-gray-700 bg-[#0b2a4a] p-2">
                  {pickupResults.map((r) => (
                    <button
                      key={`${r.lat}-${r.lon}`}
                      type="button"
                      className="block w-full text-left text-xs text-gray-200 hover:text-[#f1c44f]"
                      onClick={() => {
                        setSelectedPickup(r);
                        setPickupQuery(r.label);
                        setPickupResults([]);
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              )}
            </Card>

            <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-4">
              <p className="text-sm font-semibold text-white">Destination</p>
              <input
                value={dropoffQuery}
                onChange={(e) => {
                  setDropoffQuery(e.target.value);
                  setSelectedDropoff(null);
                }}
                placeholder="Search destination"
                className="mt-2 w-full rounded-lg border border-gray-600 bg-[#071d3a] px-3 py-2 text-white focus:border-[#f1c44f] focus:outline-none"
              />
              {selectedDropoff && (
                <p className="mt-2 text-xs text-green-300">
                  Selected: {selectedDropoff.label}
                </p>
              )}
              {!selectedDropoff && dropoffResults.length > 0 && (
                <div className="mt-2 max-h-40 space-y-1 overflow-auto rounded border border-gray-700 bg-[#0b2a4a] p-2">
                  {dropoffResults.map((r) => (
                    <button
                      key={`${r.lat}-${r.lon}`}
                      type="button"
                      className="block w-full text-left text-xs text-gray-200 hover:text-[#f1c44f]"
                      onClick={() => {
                        setSelectedDropoff(r);
                        setDropoffQuery(r.label);
                        setDropoffResults([]);
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {routeInfo && (
            <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-4">
              <p className="text-sm text-gray-300">
                Estimated route:{" "}
                <span className="font-semibold text-white">
                  {routeInfo.distanceKm} km
                </span>{" "}
                ·
                <span className="font-semibold text-white">
                  {" "}
                  {routeInfo.durationMin} mins
                </span>
              </p>
            </Card>
          )}

          {/* Map Preview (Leaflet with OSM tiles + polyline) */}
          {selectedPickup && selectedDropoff && routeInfo && (
            <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-4">
              <p className="mb-3 text-sm font-semibold text-white">
                Route Preview
              </p>
              <div className="aspect-[16/9] overflow-hidden rounded-lg border border-gray-700">
                <RouteMap
                  pickup={{ lat: selectedPickup.lat, lon: selectedPickup.lon }}
                  dropoff={{
                    lat: selectedDropoff.lat,
                    lon: selectedDropoff.lon,
                  }}
                  coords={
                    routeInfo.coords?.length
                      ? routeInfo.coords
                      : [
                          { lat: selectedPickup.lat, lon: selectedPickup.lon },
                          {
                            lat: selectedDropoff.lat,
                            lon: selectedDropoff.lon,
                          },
                        ]
                  }
                />
              </div>
            </Card>
          )}

          {/* Summary */}
          {selectedVan && selectedDriver && formData.date && (
            <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-6">
              <h3 className="mb-4 font-bold text-white">Request Summary</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p>
                  <span className="text-gray-300">Van:</span> {selectedVan.name}
                </p>
                <p>
                  <span className="text-gray-300">Driver:</span>{" "}
                  {selectedDriver.name}
                </p>
                <p>
                  <span className="text-gray-300">Date:</span>{" "}
                  {new Date(formData.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  at {formData.time}
                </p>
                <p>
                  <span className="text-gray-300">Seats Requested:</span>{" "}
                  {formData.seatsRequested}
                </p>
              </div>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#f1c44f] font-semibold text-[#071d3a] hover:bg-[#f1c44f]/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>

            <Button
              type="button"
              onClick={() => router.back()}
              className="border border-gray-600 bg-transparent text-white hover:bg-gray-600/20"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
