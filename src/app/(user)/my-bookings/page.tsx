import { Suspense } from "react";
import { db } from "~/server/db";
import { bookings } from "~/server/db/schema";
import { eq, and, or } from "drizzle-orm";
import { Card } from "~/components/ui/card";
import { BookingCard } from "~/components/user/booking-card";
import { getCurrentUser } from "~/lib/auth";

// Force dynamic rendering (no static prerendering)
export const dynamic = "force-dynamic";

async function MyBookingsTable() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Show only pending and approved bookings (exclude completed, rejected, cancelled)
  const userBookings = await db.query.bookings.findMany({
    where: (b) =>
      and(
        eq(b.userId, user.id),
        or(eq(b.status, "pending"), eq(b.status, "approved")),
      ),
    with: {
      trip: {
        with: {
          van: true,
          driver: true,
        },
      },
    },
    orderBy: (bookings, { desc }) => [desc(bookings.createdAt)],
  });

  return (
    <div className="space-y-4">
      {userBookings.length === 0 ? (
        <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-6">
          <p className="text-gray-400">
            No bookings yet. Start exploring available trips!
          </p>
        </Card>
      ) : (
        userBookings.map((booking) => (
          <BookingCard
            key={booking.id}
            id={booking.id}
            status={
              booking.status as
                | "pending"
                | "approved"
                | "completed"
                | "rejected"
                | "cancelled"
            }
            route={booking.trip?.route || "Unknown Route"}
            seatsBooked={booking.seatsBooked}
            driverName={booking.trip?.driver?.name || "Unknown"}
            departureTime={booking.trip?.departureTime?.toISOString() || ""}
            vanName={booking.trip?.van?.name || "Unknown"}
            plateNumber={booking.trip?.van?.plateNumber || "Unknown"}
            createdAt={booking.createdAt}
            department={booking.department || ""}
          />
        ))
      )}
    </div>
  );
}

export default function MyBookings() {
  return (
    <div className="min-h-screen bg-[#071d3a] p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">My Bookings</h1>
          <p className="mt-2 text-gray-400">
            View and manage all your transportation bookings
          </p>
        </div>

        {/* Bookings List */}
        <Suspense
          fallback={<div className="text-white">Loading bookings...</div>}
        >
          <MyBookingsTable />
        </Suspense>
      </div>
    </div>
  );
}
