import { Suspense } from "react";
import Link from "next/link";
import { db } from "~/server/db";
import { bookings } from "~/server/db/schema";
import { eq } from "drizzle-orm";

// Force dynamic rendering (no static prerendering)
export const dynamic = "force-dynamic";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { MapPin, Calendar, Users, Briefcase, CheckCircle2 } from "lucide-react";
import { getCurrentUser } from "~/lib/auth";
import { DashboardHeader } from "~/components/user/dashboard-header";

async function UpcomingBookings() {
  const user = await getCurrentUser();
  if (!user) return null;

  const userBookings = await db.query.bookings.findMany({
    where: eq(bookings.userId, user.id),
    with: {
      trip: {
        with: {
          van: true,
          driver: true,
        },
      },
    },
    limit: 3,
  });

  return (
    <div className="space-y-4">
      {userBookings.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-[#f1c44f]/30 bg-[#0a2540]/50 p-8 text-center">
          <p className="text-gray-400">
            No upcoming bookings yet.{" "}
            <Link
              href="/request-trip"
              className="text-[#f1c44f] hover:underline"
            >
              Request a trip
            </Link>{" "}
            to get started!
          </p>
        </div>
      ) : (
        userBookings.map((booking) => (
          <Card
            key={booking.id}
            className="border-[#f1c44f]/20 bg-gradient-to-r from-[#0a2540] to-[#0a2540]/80 p-6 transition-all hover:border-[#f1c44f]/40 hover:shadow-lg hover:shadow-[#f1c44f]/10"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-lg bg-[#f1c44f]/10 p-2">
                    <MapPin size={20} className="text-[#f1c44f]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">
                      {booking.trip?.route}
                    </h3>
                  </div>
                </div>
                <div className="mt-4 ml-11 grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar size={16} className="text-[#f1c44f]" />
                    <span>
                      {new Date(
                        booking.trip?.departureTime || "",
                      ).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Users size={16} className="text-[#f1c44f]" />
                    <span>
                      {booking.seatsBooked} seat
                      {booking.seatsBooked !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div>
                    <Badge
                      className={`capitalize ${
                        booking.status === "approved" ||
                        booking.status === "completed"
                          ? "border-green-500/50 bg-green-500/15 text-green-300"
                          : booking.status === "pending"
                            ? "border-amber-500/50 bg-amber-500/15 text-amber-300"
                            : "border-red-500/50 bg-red-500/15 text-red-300"
                      }`}
                    >
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

async function TripStats() {
  const user = await getCurrentUser();
  if (!user) return null;

  const userBookings = await db.query.bookings.findMany({
    where: eq(bookings.userId, user.id),
  });

  const approvedBookings = userBookings.filter((b) => b.status === "approved");
  const totalSeatsBooked = userBookings.reduce(
    (sum, b) => sum + b.seatsBooked,
    0,
  );

  return (
    <>
      <Card className="border-[#f1c44f]/30 bg-gradient-to-br from-[#0a2540] via-[#0a2540] to-[#051629] p-6 transition-all hover:border-[#f1c44f]/50 hover:shadow-lg hover:shadow-[#f1c44f]/10">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-[#f1c44f]/10 p-3">
            <Briefcase size={24} className="text-[#f1c44f]" />
          </div>
          <p className="text-sm font-medium text-gray-300">Total Bookings</p>
        </div>
        <p className="text-4xl font-bold text-[#f1c44f]">
          {userBookings.length}
        </p>
      </Card>
      <Card className="border-green-500/30 bg-gradient-to-br from-[#0a2540] via-[#0a2540] to-[#051629] p-6 transition-all hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-green-500/10 p-3">
            <CheckCircle2 size={24} className="text-green-400" />
          </div>
          <p className="text-sm font-medium text-gray-300">Approved Trips</p>
        </div>
        <p className="text-4xl font-bold text-green-400">
          {approvedBookings.length}
        </p>
      </Card>
      <Card className="border-blue-500/30 bg-gradient-to-br from-[#0a2540] via-[#0a2540] to-[#051629] p-6 transition-all hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-blue-500/10 p-3">
            <Users size={24} className="text-blue-400" />
          </div>
          <p className="text-sm font-medium text-gray-300">
            Total Seats Booked
          </p>
        </div>
        <p className="text-4xl font-bold text-blue-400">{totalSeatsBooked}</p>
      </Card>
    </>
  );
}

export default function UserDashboard() {
  return (
    <div className="min-h-screen bg-[#071d3a] p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <DashboardHeader />

        {/* Stats */}
        <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Suspense
            fallback={<div className="text-white">Loading stats...</div>}
          >
            <TripStats />
          </Suspense>
        </div>

        {/* Upcoming Bookings */}
        <div>
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white">Upcoming Trips</h2>
            </div>
            <Link href="/request-trip">
              <Button className="bg-[#f1c44f] font-semibold text-[#071d3a] hover:bg-[#f1c44f]/90">
                + Request a Trip
              </Button>
            </Link>
          </div>

          <Suspense
            fallback={<div className="text-white">Loading bookings...</div>}
          >
            <UpcomingBookings />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
