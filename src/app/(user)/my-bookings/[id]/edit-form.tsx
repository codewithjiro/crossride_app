"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  MapPin,
  Users,
  Calendar,
  Loader2,
  ArrowLeft,
  Info,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  CheckCircle,
} from "lucide-react";

interface EditBookingFormProps {
  bookingId: string;
}

interface BookingRequest {
  vanId: string;
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

interface AvailabilityData {
  dates: Array<{ value: string; label: string }>;
  times: Array<{ value: string; label: string }>;
}

const DEPARTMENTS = [
  "School of Arts, Sciences and Education",
  "School of Criminal Justice",
  "School of Tourism and Hospitality Management",
  "School of Computer Information Technology and Engineering",
  "School of Business and Accountancy",
  "Primary Education",
  "Secondary Education",
  "Senior Highschool",
];

const getVanImage = (van: { name: string; image?: string | null }): string => {
  if (van.image) return van.image;
  if (van.name.includes("Grandia")) return "/images/grandia.png";
  if (van.name.includes("L300")) return "/images/L300.png";
  if (van.name.includes("Deluxe") || van.name.includes("Commuter"))
    return "/images/deluxe.png";
  return "/images/deluxe.png";
};

const RouteMap = dynamic(() => import("~/components/maps/route-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-gray-400">
      Loading map...
    </div>
  ),
});

export default function EditBookingForm({ bookingId }: EditBookingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [availability, setAvailability] = useState<AvailabilityData | null>(
    null,
  );
  const [unavailableVanIds, setUnavailableVanIds] = useState<number[]>([]);
  const [vans, setVans] = useState<
    Array<{
      id: number;
      name: string;
      plateNumber: string;
      capacity: number;
      image?: string | null;
    }>
  >([]);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const [pickupQuery, setPickupQuery] = useState("");
  const [dropoffQuery, setDropoffQuery] = useState("");
  const [pickupResults, setPickupResults] = useState<LocationResult[]>([]);
  const [dropoffResults, setDropoffResults] = useState<LocationResult[]>([]);
  const [selectedPickup, setSelectedPickup] = useState<LocationResult | null>(
    null,
  );
  const [selectedDropoff, setSelectedDropoff] = useState<LocationResult | null>(
    null,
  );
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  const [formData, setFormData] = useState<BookingRequest>({
    vanId: "",
    date: "",
    time: "08:00",
    seatsRequested: 1,
    department: "",
  });

  const [calendarMonth2, setCalendarMonth2] = useState(new Date());
  const selectedVan = vans.find((v) => String(v.id) === formData.vanId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch availability
        const availRes = await fetch("/api/bookings/availability");
        const availData = await availRes.json();
        if (availRes.ok) setAvailability(availData);

        // Fetch vans
        const vansRes = await fetch("/api/vans");
        const vansData = await vansRes.json();
        if (vansRes.ok && Array.isArray(vansData.vans)) setVans(vansData.vans);

        // Fetch booking details
        const bookingRes = await fetch(`/api/bookings/${bookingId}`);
        if (!bookingRes.ok) {
          setError("Failed to load booking");
          return;
        }
        const bookingData = await bookingRes.json();

        if (!bookingData.trip?.departureTime) {
          setError("Booking data is incomplete");
          return;
        }

        const depTime = new Date(bookingData.trip.departureTime);
        const dateStr = depTime.toISOString().split("T")[0] || "";
        const timeStr = `${String(depTime.getHours()).padStart(2, "0")}:${String(depTime.getMinutes()).padStart(2, "0")}`;

        setFormData({
          vanId: String(bookingData.trip.vanId),
          date: dateStr,
          time: timeStr,
          seatsRequested: bookingData.seatsBooked,
          department: bookingData.department,
        });

        if (bookingData.trip.route) {
          // Parse route parts to extract pickup and dropoff
          // Route format: "Pickup: location → Dropoff: location | Distance: X km, ETA: Y mins"
          const pickupMatch =
            bookingData.trip.route.match(/Pickup:\s*(.*?)\s*→/);
          const dropoffMatch = bookingData.trip.route.match(
            /→\s*Dropoff:\s*([^|]+)(?:\||$)/,
          );

          const pickupValue = pickupMatch?.[1]?.trim() || "";
          const dropoffValue = dropoffMatch?.[1]?.trim() || "";

          if (pickupValue) {
            setPickupQuery(pickupValue);
            setSelectedPickup({ label: pickupValue, lat: 0, lon: 0 });
          }
          if (dropoffValue) {
            setDropoffQuery(dropoffValue);
            setSelectedDropoff({ label: dropoffValue, lat: 0, lon: 0 });
          }
        }

        setCalendarMonth(new Date(dateStr));
      } catch (err) {
        setError("Failed to load booking");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookingId]);

  // Fetch unavailable vans
  useEffect(() => {
    if (!formData.date) {
      setUnavailableVanIds([]);
      return;
    }

    const fetchUnavailable = async () => {
      try {
        const response = await fetch(
          `/api/trips/by-date?date=${formData.date}`,
        );
        const data = await response.json();
        if (response.ok) setUnavailableVanIds(data.unavailableVanIds || []);
      } catch {
        console.error("Failed to fetch unavailable vans");
      }
    };

    fetchUnavailable();
  }, [formData.date]);

  // Geocode helpers
  useEffect(() => {
    const controller = new AbortController();
    if (!pickupQuery || pickupQuery.length < 3) {
      setPickupResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/geocode?q=${encodeURIComponent(pickupQuery)}`,
          {
            signal: controller.signal,
          },
        );
        const data = await res.json();
        if (res.ok) setPickupResults(data.results || []);
      } catch (err: any) {
        if (err?.name !== "AbortError") console.error("Pickup search failed");
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [pickupQuery]);

  useEffect(() => {
    const controller = new AbortController();
    if (!dropoffQuery || dropoffQuery.length < 3) {
      setDropoffResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/geocode?q=${encodeURIComponent(dropoffQuery)}`,
          {
            signal: controller.signal,
          },
        );
        const data = await res.json();
        if (res.ok) setDropoffResults(data.results || []);
      } catch (err: any) {
        if (err?.name !== "AbortError") console.error("Dropoff search failed");
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [dropoffQuery]);

  // Calendar functions
  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const isDateAvailable = (day: number) => {
    const dateStr = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return availability?.dates.some((d) => d.value === dateStr) ?? false;
  };

  const handleDateSelect = (day: number) => {
    const dateStr = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (isDateAvailable(day)) setFormData({ ...formData, date: dateStr });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.vanId || !formData.date) {
      setError("Please select a van and date");
      return;
    }
    if (!formData.department) {
      setError("Please select your department");
      return;
    }
    if (!selectedPickup || !selectedDropoff) {
      setError("Please select pickup and destination");
      return;
    }
    if (formData.seatsRequested < 1) {
      setError("Please select at least 1 seat");
      return;
    }

    setSubmitting(true);

    try {
      const dateTimeString = `${formData.date}T${formData.time}`;
      const depDateTime = new Date(dateTimeString);
      const arrDateTime = new Date(depDateTime.getTime() + 2 * 60 * 60 * 1000);

      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vanId: parseInt(formData.vanId),
          department: formData.department,
          departureTime: depDateTime.toISOString(),
          arrivalTime: arrDateTime.toISOString(),
          seatsRequested: formData.seatsRequested,
          route: `${selectedPickup.label} to ${selectedDropoff.label}`,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to update booking");
        return;
      }

      router.refresh();
      router.push(`/my-bookings/${bookingId}`);
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#071d3a]">
        <Loader2 className="h-8 w-8 animate-spin text-[#f1c44f]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#071d3a] p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Link
            href="/my-bookings"
            className="mb-4 inline-flex items-center text-sm text-gray-300 hover:text-white"
          >
            <ArrowLeft size={16} className="mr-2" /> Back to My Bookings
          </Link>
          <h1 className="text-4xl font-bold text-white">Edit Booking</h1>
          <p className="mt-2 text-gray-400">Update your pending trip details</p>
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
              className="w-full rounded-lg border border-gray-600 bg-[#071d3a] px-4 py-2 text-white"
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
                placeholder="Search address"
                className="mt-2 w-full rounded-lg border border-gray-600 bg-[#071d3a] px-3 py-2 text-white"
              />
              {selectedPickup && (
                <p className="mt-2 flex items-center gap-2 text-xs text-green-300">
                  <CheckCircle size={16} /> {selectedPickup.label}
                </p>
              )}
              {!selectedPickup && pickupResults.length > 0 && (
                <div className="mt-2 max-h-40 space-y-1 overflow-auto">
                  {pickupResults.map((r, i) => (
                    <button
                      key={`${i}-${r.lat}`}
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
                className="mt-2 w-full rounded-lg border border-gray-600 bg-[#071d3a] px-3 py-2 text-white"
              />
              {selectedDropoff && (
                <p className="mt-2 flex items-center gap-2 text-xs text-green-300">
                  <CheckCircle size={16} /> {selectedDropoff.label}
                </p>
              )}
              {!selectedDropoff && dropoffResults.length > 0 && (
                <div className="mt-2 max-h-40 space-y-1 overflow-auto">
                  {dropoffResults.map((r, i) => (
                    <button
                      key={`${i}-${r.lat}`}
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

          {/* Date Picker - Simplified */}
          <div>
            <label className="mb-4 block text-lg font-bold text-white">
              <Calendar className="mr-2 mb-2 inline" size={20} />
              Select Date
            </label>
            <div className="rounded-lg border-2 border-[#f1c44f]/20 bg-[#0a2540] p-6">
              <div className="mb-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() =>
                    setCalendarMonth(
                      new Date(
                        calendarMonth.getFullYear(),
                        calendarMonth.getMonth() - 1,
                        1,
                      ),
                    )
                  }
                  className="rounded-lg p-2 hover:bg-[#f1c44f]/10"
                >
                  <ChevronLeft size={20} className="text-[#f1c44f]" />
                </button>
                <h3 className="text-center text-xl font-bold text-white">
                  {calendarMonth.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setCalendarMonth(
                      new Date(
                        calendarMonth.getFullYear(),
                        calendarMonth.getMonth() + 1,
                        1,
                      ),
                    )
                  }
                  className="rounded-lg p-2 hover:bg-[#f1c44f]/10"
                >
                  <ChevronRight size={20} className="text-[#f1c44f]" />
                </button>
              </div>

              <div className="mb-2 grid grid-cols-7 gap-2 text-center">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div
                    key={day}
                    className="text-sm font-semibold text-gray-400"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: getFirstDayOfMonth(calendarMonth) }).map(
                  (_, i) => (
                    <div key={`empty-${i}`} className="h-10" />
                  ),
                )}
                {Array.from({ length: getDaysInMonth(calendarMonth) }).map(
                  (_, i) => {
                    const day = i + 1;
                    const available = isDateAvailable(day);
                    const dateStr = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const isSelected = formData.date === dateStr;
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDateSelect(day)}
                        disabled={!available}
                        className={`flex h-10 items-center justify-center rounded-lg text-sm font-semibold ${isSelected ? "bg-[#f1c44f] text-[#071d3a]" : available ? "border border-[#f1c44f]/30 text-white hover:border-[#f1c44f] hover:bg-[#f1c44f]/10" : "text-gray-600"}`}
                      >
                        {day}
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          </div>

          {/* Time Picker - Simplified */}
          <div>
            <label className="mb-4 block text-lg font-bold text-white">
              Select Time
            </label>
            <div className="grid gap-3 sm:grid-cols-4 lg:grid-cols-5">
              {availability?.times.map((time) => {
                const isSelected = formData.time === time.value;
                return (
                  <button
                    key={time.value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, time: time.value })
                    }
                    className={`rounded-lg px-4 py-3 text-sm font-semibold ${isSelected ? "bg-[#f1c44f] text-[#071d3a] shadow-lg shadow-[#f1c44f]/50" : "border-2 border-[#f1c44f]/30 text-white hover:border-[#f1c44f] hover:bg-[#f1c44f]/10"}`}
                  >
                    {time.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Van Selection */}
          <div>
            <label className="mb-4 block text-lg font-bold text-white">
              <MapPin className="mr-2 mb-2 inline" size={20} />
              Select Van
            </label>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {vans.map((van) => {
                const isUnavailable =
                  formData.date && unavailableVanIds.includes(van.id);
                return (
                  <Card
                    key={van.id}
                    className={`cursor-pointer p-4 transition-all ${isUnavailable ? "cursor-not-allowed border-red-600/50 bg-red-900/20 opacity-60" : formData.vanId === String(van.id) ? "border-2 border-[#f1c44f] bg-[#f1c44f]/10" : "border-2 border-[#f1c44f]/20 bg-[#0a2540] hover:border-[#f1c44f]"}`}
                    onClick={() =>
                      !isUnavailable &&
                      setFormData({ ...formData, vanId: String(van.id) })
                    }
                  >
                    <div className="mb-4 h-32 w-full overflow-hidden rounded-lg bg-black/30">
                      <Image
                        src={getVanImage(van)}
                        alt={van.name}
                        width={400}
                        height={300}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <h3 className="font-bold text-white">{van.name}</h3>
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
                      <Users size={16} /> {van.capacity} seats
                    </div>
                    <p className="text-xs text-gray-500">
                      Plate: {van.plateNumber}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Seats */}
          <div>
            <label className="mb-4 block text-lg font-bold text-white">
              <Users className="mr-2 mb-2 inline" size={20} />
              Seats
            </label>
            {!selectedVan ? (
              <div className="rounded-lg border border-gray-600 bg-[#071d3a] px-4 py-3 text-gray-400">
                Select a van first
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-6 lg:grid-cols-8">
                {Array.from({ length: selectedVan.capacity }, (_, i) => {
                  const seatNumber = i + 1;
                  const isSelected = formData.seatsRequested === seatNumber;
                  return (
                    <button
                      key={seatNumber}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, seatsRequested: seatNumber })
                      }
                      className={`flex h-12 items-center justify-center rounded-lg text-sm font-semibold ${isSelected ? "bg-[#f1c44f] text-[#071d3a]" : "border-2 border-[#f1c44f]/30 text-white hover:border-[#f1c44f] hover:bg-[#f1c44f]/10"}`}
                    >
                      {seatNumber}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Summary */}
          {selectedVan && formData.date && (
            <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-6">
              <h3 className="mb-4 font-bold text-white">Summary</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p>
                  <span className="text-gray-300">Van:</span> {selectedVan.name}
                </p>
                <p>
                  <span className="text-gray-300">Date:</span>{" "}
                  {new Date(formData.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  at{" "}
                  {(() => {
                    const [hours, minutes] = formData.time.split(":");
                    const hour = parseInt(hours);
                    const ampm = hour >= 12 ? "PM" : "AM";
                    const displayHour =
                      hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                    return `${displayHour}:${minutes} ${ampm}`;
                  })()}
                </p>
                <p>
                  <span className="text-gray-300">Seats:</span>{" "}
                  {formData.seatsRequested}
                </p>
                <p>
                  <span className="text-gray-300">Note:</span> Admin will assign
                  a driver after reviewing your request.
                </p>
              </div>
            </Card>
          )}

          {/* Buttons */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#f1c44f] font-semibold text-[#071d3a] hover:bg-[#f1c44f]/90"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Booking"
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
