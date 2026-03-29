"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Truck,
  Users,
  AlertCircle,
  Check,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface Driver {
  id: number;
  firstName: string;
  middleName?: string;
  surname: string;
  experience?: string;
  specialization?: string;
  profileImage?: string;
}

interface Trip {
  route: string;
  departureTime: string;
  arrivalTime: string;
  seatsAvailable: number;
  seatsReserved: number;
  van: {
    name: string;
    plateNumber: string;
    capacity: number;
  };
}

interface BookingDetail {
  id: number;
  tripId: number;
  seatsBooked: number;
  department?: string | null;
  status: string;
  createdAt: string;
  user: {
    firstName?: string;
    lastName?: string;
    email: string;
    profileImage?: string;
  };
  trip: Trip;
}

export default function ApprovePage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [assignmentError, setAssignmentError] = useState("");

  useEffect(() => {
    fetchData();
  }, [bookingId]);

  const fetchData = async () => {
    try {
      // Fetch booking details
      const bookingResponse = await fetch("/api/admin/bookings");
      const bookingsData = await bookingResponse.json();
      const currentBooking = bookingsData.find(
        (b: BookingDetail) => b.id === parseInt(bookingId),
      );

      if (currentBooking) {
        setBooking(currentBooking);
      }

      // Fetch drivers
      const driversResponse = await fetch("/api/admin/drivers");
      const driversData = await driversResponse.json();
      setDrivers(driversData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssignmentError("");

    if (!selectedDriverId) {
      setAssignmentError("Please select a driver");
      return;
    }

    if (!booking) return;

    setSubmitting(true);

    try {
      // Assign driver to trip
      const assignResponse = await fetch(`/api/admin/trips/${booking.tripId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId: selectedDriverId }),
      });

      if (!assignResponse.ok) {
        const data = await assignResponse.json();
        const errorMsg = data.error || "Failed to assign driver";

        // Enhanced error messages
        if (assignResponse.status === 409) {
          setAssignmentError(
            `⚠️ Scheduling Conflict: ${errorMsg}\n\nPlease select a different driver.`,
          );
        } else {
          setAssignmentError(errorMsg);
        }
        return;
      }

      // Approve booking
      const approveResponse = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });

      if (approveResponse.ok) {
        // Redirect back to bookings
        router.push("/admin/bookings");
      } else {
        const data = await approveResponse.json();
        const errorMsg = data.error || "Failed to approve booking";

        // Enhanced error messages
        if (approveResponse.status === 409) {
          setAssignmentError(`⚠️ Approval Blocked: ${errorMsg}`);
        } else {
          setAssignmentError(errorMsg);
        }
      }
    } catch (err) {
      setAssignmentError(
        err instanceof Error ? err.message : "An error occurred",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen p-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="bg-background min-h-screen p-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-gray-400">Booking not found</p>
        </div>
      </div>
    );
  }

  const departureDate = new Date(booking.trip.departureTime).toLocaleString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    },
  );

  const arrivalDate = new Date(booking.trip.arrivalTime).toLocaleString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    },
  );

  return (
    <div className="bg-background min-h-screen p-6 sm:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-10">
          <Link href="/admin/bookings">
            <Button
              variant="outline"
              className="mb-6 gap-2 hover:bg-gray-800/50"
            >
              <ArrowLeft size={18} />
              Back to Bookings
            </Button>
          </Link>
          <div>
            <h1 className="mb-2 text-5xl font-bold text-white">
              Booking Approval
            </h1>
            <p className="text-lg text-gray-400">
              Assign a qualified driver and approve the booking
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-8 flex gap-4 rounded-xl border border-red-500/40 bg-gradient-to-r from-red-900/30 to-red-900/10 p-5">
            <AlertCircle
              size={24}
              className="mt-0.5 flex-shrink-0 text-red-400"
            />
            <div>
              <p className="text-lg font-semibold text-red-300">{error}</p>
            </div>
          </div>
        )}

        <div className="grid gap-8 xl:grid-cols-5">
          {/* Main Content - Left Side */}
          <div className="space-y-6 xl:col-span-3">
            {/* Requirement Alert */}
            <Card className="border-secondary/40 from-secondary/25 to-secondary/5 shadow-secondary/10 bg-gradient-to-br p-6 shadow-lg">
              <div className="flex gap-4">
                <div className="bg-secondary/20 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg">
                  <AlertCircle size={24} className="text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-secondary text-lg font-bold">
                    Driver Assignment Required
                  </p>
                  <p className="text-secondary/80 mt-2 text-sm leading-relaxed">
                    Select a qualified driver from the list to proceed with
                    booking approval. This ensures passenger safety and proper
                    trip coordination.
                  </p>
                </div>
              </div>
            </Card>

            {/* Passenger Information Card */}
            <Card className="border-secondary/20 bg-gradient-to-br from-[#0f3460] to-[#0a2540] p-8 shadow-xl">
              <div className="mb-7 flex items-center gap-2">
                <div className="bg-secondary h-1 w-1.5 rounded-full"></div>
                <h2 className="text-2xl font-bold text-white">Passenger</h2>
              </div>

              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                <div className="from-secondary/30 to-secondary/10 border-secondary/30 h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border-2 bg-gradient-to-br shadow-md">
                  <img
                    src={
                      booking.user?.profileImage ||
                      "/profile/default_profile.jpg"
                    }
                    alt={`${booking.user?.firstName} ${booking.user?.lastName}`}
                    className="h-24 w-24 object-cover"
                  />
                </div>

                <div className="flex-1">
                  <p className="text-secondary/70 text-xs font-bold tracking-widest uppercase">
                    Full Name
                  </p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {booking.user?.firstName} {booking.user?.lastName}
                  </p>
                  <p className="mt-3 text-sm text-gray-400">
                    {booking.user?.email}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-secondary/70 text-xs font-bold tracking-widest uppercase">
                    Seats
                  </p>
                  <div className="mt-2 flex items-center justify-end gap-2">
                    <Users size={20} className="text-secondary" />
                    <p className="text-secondary text-4xl font-bold">
                      {booking.seatsBooked}
                    </p>
                  </div>
                </div>

                {booking.department && (
                  <div className="bg-secondary/10 rounded-lg px-4 py-3">
                    <p className="text-secondary/70 text-xs font-bold tracking-widest uppercase">
                      Department
                    </p>
                    <p className="mt-1 font-medium text-white">
                      {booking.department}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Trip Details Card */}
            <Card className="border-secondary/20 bg-gradient-to-br from-[#0f3460] to-[#0a2540] p-8 shadow-xl">
              <div className="mb-7 flex items-center gap-2">
                <div className="bg-secondary h-1 w-1.5 rounded-full"></div>
                <h2 className="text-2xl font-bold text-white">Trip Details</h2>
              </div>

              <div className="space-y-6">
                {/* Route */}
                <div className="border-secondary/10 flex gap-5 border-b pb-6">
                  <div className="bg-secondary/15 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg shadow-md">
                    <MapPin size={22} className="text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-secondary/70 text-xs font-bold tracking-widest uppercase">
                      Route
                    </p>
                    <p className="mt-2 text-base leading-relaxed font-medium text-white">
                      {booking.trip.route}
                    </p>
                  </div>
                </div>

                {/* Departure */}
                <div className="border-secondary/10 flex gap-5 border-b pb-6">
                  <div className="bg-secondary/15 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg shadow-md">
                    <Clock size={22} className="text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-secondary/70 text-xs font-bold tracking-widest uppercase">
                      Departure Time
                    </p>
                    <p className="mt-2 text-base font-semibold text-white">
                      {departureDate}
                    </p>
                  </div>
                </div>

                {/* Arrival */}
                <div className="border-secondary/10 flex gap-5 border-b pb-6">
                  <div className="bg-secondary/15 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg shadow-md">
                    <Clock size={22} className="text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-secondary/70 text-xs font-bold tracking-widest uppercase">
                      Arrival Time
                    </p>
                    <p className="mt-2 text-base font-semibold text-white">
                      {arrivalDate}
                    </p>
                  </div>
                </div>

                {/* Vehicle */}
                <div className="border-secondary/10 flex gap-5 border-b pb-6">
                  <div className="bg-secondary/15 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg shadow-md">
                    <Truck size={22} className="text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-secondary/70 text-xs font-bold tracking-widest uppercase">
                      Vehicle
                    </p>
                    <p className="mt-2 text-base font-semibold text-white">
                      {booking.trip.van.name}
                    </p>
                    <p className="mt-1 text-sm text-gray-400">
                      Plate: {booking.trip.van.plateNumber}
                    </p>
                  </div>
                </div>

                {/* Seat Capacity */}
                <div className="flex gap-5">
                  <div className="bg-secondary/15 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg shadow-md">
                    <Users size={22} className="text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-secondary/70 text-xs font-bold tracking-widest uppercase">
                      Seat Capacity
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      <div className="bg-secondary/10 rounded-lg p-2 text-center">
                        <p className="text-secondary/70 text-xs">Total</p>
                        <p className="mt-1 text-lg font-bold text-white">
                          {booking.trip.van.capacity}
                        </p>
                      </div>
                      <div className="rounded-lg bg-emerald-500/10 p-2 text-center">
                        <p className="text-xs text-emerald-400/70">Reserved</p>
                        <p className="mt-1 text-lg font-bold text-emerald-400">
                          {booking.trip.seatsReserved}
                        </p>
                      </div>
                      <div className="rounded-lg bg-blue-500/10 p-2 text-center">
                        <p className="text-xs text-blue-400/70">Available</p>
                        <p className="mt-1 text-lg font-bold text-blue-400">
                          {booking.trip.seatsAvailable}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Driver Selection - Right Side */}
          <div className="xl:col-span-2">
            <Card className="border-secondary/20 sticky top-8 bg-gradient-to-br from-[#0f3460] to-[#0a2540] p-8 shadow-xl">
              <div className="mb-6 flex items-center gap-2">
                <div className="bg-secondary h-1 w-1.5 rounded-full"></div>
                <h2 className="text-2xl font-bold text-white">Select Driver</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Driver List */}
                <div className="custom-scrollbar max-h-[600px] space-y-3 overflow-y-auto pr-3">
                  {drivers.length === 0 ? (
                    <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed border-gray-600/30">
                      <p className="text-center font-medium text-gray-400">
                        No drivers available
                      </p>
                    </div>
                  ) : (
                    drivers.map((driver) => (
                      <label
                        key={driver.id}
                        className={`group flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-all duration-200 ${
                          selectedDriverId === driver.id
                            ? "border-secondary/70 from-secondary/25 to-secondary/10 shadow-secondary/20 bg-gradient-to-r shadow-lg"
                            : "hover:border-secondary/50 border-gray-600/40 bg-gray-900/30 hover:bg-gray-900/50 hover:shadow-md"
                        }`}
                      >
                        <input
                          type="radio"
                          name="driver"
                          value={driver.id}
                          checked={selectedDriverId === driver.id}
                          onChange={(e) =>
                            setSelectedDriverId(parseInt(e.target.value, 10))
                          }
                          className="accent-secondary mt-1 h-5 w-5 flex-shrink-0 cursor-pointer"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-3">
                            <div className="border-secondary/30 h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border-2 bg-gray-800 shadow-md">
                              <img
                                src={
                                  driver.profileImage ||
                                  "/profile/default_profile.jpg"
                                }
                                alt={`${driver.firstName} ${driver.surname}`}
                                className="h-12 w-12 object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm leading-tight font-bold text-white">
                                {driver.firstName}{" "}
                                {driver.middleName && `${driver.middleName} `}
                                {driver.surname}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {driver.experience && (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/40 bg-blue-500/30 px-3 py-1 text-xs font-semibold text-blue-200">
                                    {driver.experience}
                                  </span>
                                )}
                                {driver.specialization && (
                                  <span className="bg-secondary/30 text-secondary border-secondary/40 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold">
                                    {driver.specialization}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        {selectedDriverId === driver.id && (
                          <Check
                            size={20}
                            className="text-secondary mt-1 flex-shrink-0"
                          />
                        )}
                      </label>
                    ))
                  )}
                </div>

                {/* Error Message */}
                {assignmentError && (
                  <div className="flex gap-3 rounded-lg border border-red-500/30 bg-red-900/20 p-4">
                    <AlertCircle
                      size={18}
                      className="mt-0.5 flex-shrink-0 text-red-400"
                    />
                    <span className="text-sm font-medium text-red-300">
                      {assignmentError}
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting || !selectedDriverId}
                    className="from-secondary to-secondary/80 text-background hover:from-secondary hover:to-secondary/90 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r px-6 py-3 font-bold shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="border-background h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check size={18} />
                        Assign & Approve
                      </>
                    )}
                  </button>
                  <Link href="/admin/bookings" className="w-full">
                    <Button variant="outline" className="w-full">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
