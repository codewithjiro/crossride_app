import { Suspense } from "react";
import { db } from "~/server/db";
import { Card } from "~/components/ui/card";
import { Truck, Users, MapPin, Briefcase } from "lucide-react";

// Force dynamic rendering (no static prerendering)
export const dynamic = "force-dynamic";

async function DashboardStats() {
  try {
    const [vansCount, driversCount, tripsCount, bookingsCount] =
      await Promise.all([
        db.query.vans.findMany().then((vans) => vans.length),
        db.query.drivers.findMany().then((drivers) => drivers.length),
        db.query.trips.findMany().then((trips) => trips.length),
        db.query.bookings.findMany().then((bookings) => bookings.length),
      ]);

    const stats = [
      {
        label: "Total Vans",
        value: vansCount,
        icon: Truck,
        color: "text-blue-500",
      },
      {
        label: "Total Drivers",
        value: driversCount,
        icon: Users,
        color: "text-green-500",
      },
      {
        label: "Total Trips",
        value: tripsCount,
        icon: MapPin,
        color: "text-purple-500",
      },
      {
        label: "Total Bookings",
        value: bookingsCount,
        icon: Briefcase,
        color: "text-orange-500",
      },
    ];

    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="border-[#f1c44f]/20 bg-[#0a2540] p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {stat.value}
                  </p>
                </div>
                <Icon className={`${stat.color} h-12 w-12 opacity-50`} />
              </div>
            </Card>
          );
        })}
      </div>
    );
  } catch {
    return <div className="text-red-500">Failed to load statistics</div>;
  }
}

async function RecentBookings() {
  try {
    const recentBookings = await db.query.bookings.findMany({
      limit: 5,
      with: {
        user: true,
        trip: {
          with: {
            van: true,
          },
        },
      },
      orderBy: (bookings, { desc }) => [desc(bookings.id)],
    });

    return (
      <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-6">
        <h2 className="mb-4 text-xl font-bold text-white">Recent Bookings</h2>
        <div className="space-y-4">
          {recentBookings.length === 0 ? (
            <p className="text-gray-400">No bookings yet</p>
          ) : (
            recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between rounded-lg bg-[#071d3a] p-3"
              >
                <div>
                  <p className="font-medium text-white">
                    {booking.user?.firstName} {booking.user?.lastName}
                  </p>
                  <p className="text-sm text-gray-400">
                    {booking.trip?.van?.name} - {booking.seatsBooked} seats
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    booking.status === "approved"
                      ? "bg-green-500/20 text-green-400"
                      : booking.status === "rejected"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {booking.status}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>
    );
  } catch {
    return <div className="text-red-500">Failed to load recent bookings</div>;
  }
}

export default function AdminDashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400">
          Welcome back! Here&apos;s an overview of your system.
        </p>
      </div>

      <Suspense
        fallback={<div className="text-white">Loading statistics...</div>}
      >
        <DashboardStats />
      </Suspense>

      <div className="mt-8">
        <Suspense
          fallback={<div className="text-white">Loading bookings...</div>}
        >
          <RecentBookings />
        </Suspense>
      </div>
    </div>
  );
}
