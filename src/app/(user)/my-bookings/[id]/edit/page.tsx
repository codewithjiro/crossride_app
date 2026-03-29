"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { ArrowLeft, AlertCircle, Info, Loader2 } from "lucide-react";
import EditBookingForm from "../edit-form";

export default function EditBooking({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const bookingId = id;

  const [loading, setLoading] = useState(true);
  const [bookingStatus, setBookingStatus] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch booking details to check status
  useEffect(() => {
    const fetchData = async () => {
      try {
        const bookingRes = await fetch(`/api/bookings/${bookingId}`);
        if (!bookingRes.ok) {
          setMessage("Failed to load booking details");
          setLoading(false);
          return;
        }

        const bookingData = await bookingRes.json();
        setBookingStatus(bookingData.status);

        // Only pending bookings can be edited
        if (bookingData.status === "pending") {
          setCanEdit(true);
        } else if (["approved", "scheduled"].includes(bookingData.status)) {
          setCanEdit(false);
          setMessage(
            "Your booking has been confirmed with a driver assigned. Confirmed bookings cannot be edited. To book a different trip, please submit a new request.",
          );
        } else if (
          ["completed", "rejected", "cancelled"].includes(bookingData.status)
        ) {
          setCanEdit(false);
          setMessage(
            `Your booking has been ${bookingData.status}. Completed bookings cannot be edited. To book a new trip, please submit a new request.`,
          );
        } else {
          setCanEdit(false);
          setMessage(
            "Your booking cannot be edited. To request a different trip, please submit a new booking request.",
          );
        }
      } catch (err) {
        setMessage("Failed to load booking details. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#071d3a]">
        <Loader2 className="h-8 w-8 animate-spin text-[#f1c44f]" />
      </div>
    );
  }

  // If can't edit, show blocked message
  if (!canEdit) {
    return (
      <div className="min-h-screen bg-[#071d3a] p-8">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/my-bookings"
              className="mb-4 inline-flex items-center text-sm text-gray-300 hover:text-white"
            >
              <ArrowLeft size={16} className="mr-2" /> Back to My Bookings
            </Link>
            <h1 className="text-4xl font-bold text-white">Edit Booking</h1>
          </div>

          {/* Blocked Message */}
          <Card className="border-amber-500/30 bg-amber-500/10 p-6">
            <div className="flex gap-4">
              <AlertCircle size={24} className="flex-shrink-0 text-amber-400" />
              <div>
                <h2 className="mb-2 text-lg font-semibold text-amber-300">
                  Booking Locked
                </h2>
                <p className="text-sm text-amber-200/90">{message}</p>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            <Button
              onClick={() => router.push("/my-bookings")}
              className="flex-1 bg-[#f1c44f] font-semibold text-[#071d3a] hover:bg-[#f1c44f]/90"
            >
              Back to My Bookings
            </Button>
            <Button
              onClick={() => router.push("/request-trip")}
              className="flex-1 border border-[#f1c44f]/30 bg-[#0a2540] font-semibold text-white hover:border-[#f1c44f] hover:bg-[#0a2540]/80"
            >
              Create New Request
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show edit form for pending bookings
  return <EditBookingForm bookingId={bookingId} />;
}
