"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { MapPin, Calendar, Users, Trash2, CheckCircle2 } from "lucide-react";

interface BookingCardProps {
  id: number;
  status: "pending" | "approved" | "completed" | "rejected" | "cancelled";
  route: string;
  seatsBooked: number;
  driverName: string;
  departureTime: string;
  vanName: string;
  plateNumber: string;
  createdAt: Date;
  department: string;
  onCompleted?: () => void;
}

export function BookingCard({
  id,
  status,
  route,
  seatsBooked,
  driverName,
  departureTime,
  vanName,
  plateNumber,
  createdAt,
  department,
  onCompleted,
}: BookingCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleMarkCompleted = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/bookings/${id}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to mark as completed");
        return;
      }

      // Success - refresh page
      window.location.reload();
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/bookings/${id}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to cancel booking");
        return;
      }

      window.location.reload();
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
      setShowCancelConfirm(false);
    }
  };

  return (
    <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-6">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-start gap-3">
            <MapPin className="mt-1 text-[#f1c44f]" size={20} />
            <div>
              <h3 className="text-xl font-bold text-white">{route}</h3>
              <p className="mt-1 text-sm text-gray-400">
                Driver: {driverName || "Unknown"}
              </p>
            </div>
          </div>

          <div className="mt-4 ml-8 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar size={16} />
              {new Date(departureTime).toLocaleString()}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Users size={16} />
              {seatsBooked} seat{seatsBooked !== 1 ? "s" : ""} booked
            </div>
          </div>

          <div className="mt-4 ml-8">
            <p className="text-sm text-gray-400">
              Van: {vanName} ({plateNumber})
            </p>
            {department && (
              <p className="mt-1 text-sm text-gray-300">Department: {department}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Booked on {new Date(createdAt).toLocaleDateString()}
            </p>
            {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <Badge
            className={`capitalize ${
              status === "approved"
                ? "bg-green-500/20 text-green-400"
                : status === "pending"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-red-500/20 text-red-400"
            }`}
          >
            {status}
          </Badge>
          <Button
            asChild
            variant="outline"
            className="border-gray-600/60 bg-[#0f2d4a] text-white hover:bg-[#12335b]"
          >
            <Link href={`/my-bookings/${id}`}>View Details</Link>
          </Button>
          {(status === "pending" || status === "approved") && (
            <Button
              onClick={() => setShowCancelConfirm(true)}
              variant="ghost"
              className="gap-2 text-red-400 hover:text-red-300"
              disabled={loading}
            >
              <Trash2 size={16} />
              Cancel
            </Button>
          )}
          {status === "approved" && (
            <Button
              onClick={handleMarkCompleted}
              disabled={loading}
              className="gap-2 bg-green-600/20 text-green-400 hover:bg-green-600/40"
            >
              <CheckCircle2 size={16} />
              {loading ? "Marking..." : "Mark Complete"}
            </Button>
          )}
          {status !== "pending" && status !== "approved" && (
            <p className="text-xs text-gray-500">In trip history</p>
          )}
        </div>
      </div>

      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-lg border border-[#f1c44f]/30 bg-[#0a2540] p-6 shadow-xl">
            <h4 className="text-lg font-bold text-white">Cancel booking?</h4>
            <p className="mt-2 text-sm text-gray-300">
              This will free your reserved seats and move the booking to
              history. You can rebook later if slots are available.
            </p>
            {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                className="border-gray-500/50 text-gray-200"
                onClick={() => setShowCancelConfirm(false)}
                disabled={loading}
              >
                Keep Booking
              </Button>
              <Button
                onClick={handleCancelBooking}
                disabled={loading}
                className="bg-red-600/80 text-white hover:bg-red-600"
              >
                {loading ? "Cancelling..." : "Confirm Cancel"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
