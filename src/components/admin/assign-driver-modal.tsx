"use client";

import { useState, useEffect } from "react";
import { Card } from "~/components/ui/card";
import { X, AlertCircle, MapPin, Clock, Truck } from "lucide-react";

interface Driver {
  id: number;
  firstName: string;
  middleName?: string;
  surname: string;
  experience?: string;
  specialization?: string;
  profileImage?: string;
}

interface Van {
  name: string;
}

interface Trip {
  id: number;
  route: string;
  departureTime: Date | string;
  arrivalTime?: Date | string;
  driverId: number | null;
  vanId: number;
  van?: Van;
}

export function AssignDriverModal({
  isOpen,
  trip,
  drivers,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  trip: Trip | null;
  drivers: Driver[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [assignmentError, setAssignmentError] = useState("");
  const [unavailableDriverIds, setUnavailableDriverIds] = useState<number[]>(
    [],
  );
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Check which drivers have conflicts with the trip time
  useEffect(() => {
    if (!isOpen || !trip) return;

    const checkDriverAvailability = async () => {
      setCheckingAvailability(true);
      try {
        const unavailable: number[] = [];

        for (const driver of drivers) {
          const response = await fetch(`/api/admin/trips/check-conflict`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              vanId: trip.vanId,
              driverId: driver.id,
              departureTime: trip.departureTime,
              arrivalTime: trip.arrivalTime,
              tripIdToExclude: trip.id,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.hasConflict) {
              unavailable.push(driver.id);
            }
          }
        }

        setUnavailableDriverIds(unavailable);
      } catch (err) {
        console.error("Error checking driver availability:", err);
      } finally {
        setCheckingAvailability(false);
      }
    };

    checkDriverAvailability();
  }, [isOpen, trip, drivers]);

  useEffect(() => {
    if (isOpen) {
      setSelectedDriverId(trip?.driverId || null);
      setError("");
      setAssignmentError("");
    }
  }, [isOpen, trip]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setAssignmentError("");

    if (!selectedDriverId) {
      setError("Please select a driver");
      return;
    }

    if (!trip) {
      setError("Trip not found");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/trips/${trip.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverId: selectedDriverId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setAssignmentError(data.error || "Failed to assign driver to trip");
        setLoading(false);
        return;
      }

      setSelectedDriverId(null);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const departureDate = trip
    ? new Date(trip.departureTime).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "N/A";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="border-secondary/20 w-full max-w-2xl bg-[#0a2540] p-6">
        <div className="sticky top-0 mb-4 flex items-center justify-between bg-[#0a2540] pb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Approve Booking</h2>
            <p className="mt-1 text-sm text-gray-400">
              Assign a driver to complete the approval
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-lg bg-gray-700/20 p-2 text-gray-400 transition-colors hover:bg-gray-700/40 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="custom-scrollbar max-h-[calc(100vh-160px)] space-y-4 overflow-y-auto pr-6"
        >
          {/* Requirement Message */}
          <div className="border-secondary/30 bg-secondary/10 rounded-lg border p-4">
            <p className="text-secondary text-sm font-medium">
              ⚠️ You must assign a driver before this booking can be approved.
            </p>
          </div>

          {/* Trip Details Card - Full View */}
          <div className="border-secondary/30 space-y-3 rounded-lg border bg-gradient-to-br from-[#071d3a] to-[#0a2540] p-5">
            <h3 className="text-secondary mb-3 text-sm font-semibold">
              Trip Details
            </h3>

            <div className="flex items-start gap-3">
              <MapPin
                size={16}
                className="text-secondary mt-0.5 flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs tracking-wide text-gray-400 uppercase">
                  Route
                </p>
                <p className="text-sm font-semibold break-words whitespace-normal text-white">
                  {trip?.route}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock
                size={16}
                className="text-secondary mt-0.5 flex-shrink-0"
              />
              <div>
                <p className="text-xs tracking-wide text-gray-400 uppercase">
                  Departure
                </p>
                <p className="text-sm font-semibold text-white">
                  {departureDate}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Truck
                size={16}
                className="text-secondary mt-0.5 flex-shrink-0"
              />
              <div>
                <p className="text-xs tracking-wide text-gray-400 uppercase">
                  Vehicle
                </p>
                <p className="text-sm font-semibold text-white">
                  {trip?.van?.name || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Driver Selection - Compact */}
          <div>
            <label className="mb-2 block text-sm font-bold text-white">
              Select Driver *
            </label>
            {checkingAvailability && (
              <div className="text-secondary mb-2 text-xs">
                Checking driver availability...
              </div>
            )}
            <div className="max-h-56 space-y-2 overflow-y-auto">
              {drivers.length === 0 ? (
                <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-300">
                  No drivers available
                </div>
              ) : (
                drivers.map((driver) => {
                  const isUnavailable = unavailableDriverIds.includes(
                    driver.id,
                  );
                  return (
                    <label
                      key={driver.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-all ${
                        isUnavailable
                          ? "pointer-events-none border-red-500/20 bg-red-900/10 opacity-50"
                          : selectedDriverId === driver.id
                            ? "border-secondary/60 bg-secondary/10"
                            : "hover:border-secondary/40 border-gray-600/40 hover:bg-gray-900/30"
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
                        disabled={isUnavailable}
                        className="accent-secondary h-4 w-4 flex-shrink-0 cursor-pointer"
                      />

                      {/* Driver Profile Image */}
                      <div
                        className={`border-secondary/30 h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border-2 bg-gray-800 ${
                          isUnavailable ? "opacity-60" : ""
                        }`}
                      >
                        <img
                          src={
                            driver.profileImage ||
                            "/profile/default_profile.jpg"
                          }
                          alt={`${driver.firstName} ${driver.surname}`}
                          className="h-12 w-12 object-cover"
                        />
                      </div>

                      {/* Driver Info */}
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-white">
                          {driver.firstName}{" "}
                          {driver.middleName ? `${driver.middleName} ` : ""}
                          {driver.surname}
                        </h3>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {isUnavailable && (
                            <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-300">
                              Not available
                            </span>
                          )}
                          {!isUnavailable && driver.experience && (
                            <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-300">
                              {driver.experience}
                            </span>
                          )}
                          {!isUnavailable && driver.specialization && (
                            <span className="bg-secondary/20 text-secondary rounded-full px-2 py-0.5 text-xs font-medium">
                              {driver.specialization}
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {assignmentError && (
            <div className="flex gap-2 rounded-lg border border-red-500/30 bg-red-900/20 p-3 text-xs text-red-300">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{assignmentError}</span>
            </div>
          )}

          {error && <p className="text-xs font-medium text-red-400">{error}</p>}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-600/40 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-900/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-secondary hover:bg-secondary/90 flex-1 rounded-lg px-3 py-2 text-sm font-semibold text-[#071d3a] transition-colors disabled:opacity-50"
            >
              {loading ? "Processing..." : "Assign & Approve"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
