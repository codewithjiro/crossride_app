import { Suspense } from "react";
import { db } from "~/server/db";
import { bookings } from "~/server/db/schema";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

// Force dynamic rendering (no static prerendering)
export const dynamic = "force-dynamic";
import { Badge } from "~/components/ui/badge";
import { Check, X, MapPin, Users } from "lucide-react";

async function BookingsTable() {
  const allBookings = await db.query.bookings.findMany({
    with: {
      user: true,
      trip: {
        with: {
          van: true,
          driver: true,
        },
      },
    },
    orderBy: (bookings, { desc }) => [desc(bookings.id)],
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#f1c44f]/20 bg-[#0a2540]">
            <th className="px-6 py-3 text-left font-semibold text-[#f1c44f]">
              Passenger
            </th>
            <th className="px-6 py-3 text-left font-semibold text-[#f1c44f]">
              Route
            </th>
            <th className="px-6 py-3 text-left font-semibold text-[#f1c44f]">
              Van
            </th>
            <th className="px-6 py-3 text-left font-semibold text-[#f1c44f]">
              Seats
            </th>
            <th className="px-6 py-3 text-left font-semibold text-[#f1c44f]">
              Status
            </th>
            <th className="px-6 py-3 text-left font-semibold text-[#f1c44f]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {allBookings.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                No bookings yet.
              </td>
            </tr>
          ) : (
            allBookings.map((booking) => (
              <tr
                key={booking.id}
                className="border-b border-[#f1c44f]/10 transition-colors hover:bg-[#0a2540]/50"
              >
                <td className="px-6 py-4 font-medium text-white">
                  {booking.user?.firstName} {booking.user?.lastName}
                </td>
                <td className="flex items-center gap-2 px-6 py-4 text-gray-300">
                  <MapPin size={16} className="text-[#f1c44f]" />
                  {booking.trip?.route}
                </td>
                <td className="px-6 py-4 text-gray-300">
                  {booking.trip?.van?.name}
                </td>
                <td className="flex items-center gap-2 px-6 py-4 text-gray-300">
                  <Users size={16} />
                  {booking.seatsBooked}
                </td>
                <td className="px-6 py-4">
                  <Badge
                    className={`capitalize ${
                      booking.status === "approved"
                        ? "bg-green-500/20 text-green-400"
                        : booking.status === "pending"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {booking.status}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  {booking.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        className="rounded-lg p-2 text-green-400 transition-colors hover:bg-green-500/20"
                        title="Approve"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/20"
                        title="Reject"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                  {booking.status !== "pending" && (
                    <span className="text-xs text-gray-500">No action</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function BookingsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">Bookings</h1>
        <p className="text-gray-400">Review and approve passenger bookings</p>
      </div>

      <Card className="border-[#f1c44f]/20 bg-[#0a2540]">
        <Suspense
          fallback={<div className="p-8 text-white">Loading bookings...</div>}
        >
          <BookingsTable />
        </Suspense>
      </Card>
    </div>
  );
}
