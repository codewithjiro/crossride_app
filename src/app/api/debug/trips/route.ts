import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { trips, bookings } from "~/server/db/schema";

/**
 * DEBUG ENDPOINT - Shows all trips in database
 * GET /api/debug/trips
 */
export async function GET() {
  try {
    // Get ALL trips
    const allTrips = await db.query.trips.findMany({
      with: {
        van: {
          columns: { id: true, name: true },
        },
        driver: {
          columns: {
            id: true,
            firstName: true,
            middleName: true,
            surname: true,
          },
        },
      },
    });

    // Get ALL bookings
    const allBookings = await db.query.bookings.findMany();

    console.log("=== DATABASE DEBUG ===");
    console.log("Total trips:", allTrips.length);
    console.log("Total bookings:", allBookings.length);

    return NextResponse.json({
      success: true,
      totalTrips: allTrips.length,
      totalBookings: allBookings.length,
      trips: allTrips.map((t) => ({
        id: t.id,
        vanId: t.vanId,
        vanName: t.van.name,
        driverId: t.driverId,
        driverName: `${t.driver.firstName} ${t.driver.middleName ? `${t.driver.middleName} ` : ""}${t.driver.surname}`,
        status: t.status,
        departureTime: t.departureTime,
        departureTimeISO: t.departureTime.toISOString(),
        route: t.route,
        seatsAvailable: t.seatsAvailable,
      })),
      bookings: allBookings.map((b) => ({
        id: b.id,
        userId: b.userId,
        tripId: b.tripId,
        status: b.status,
        seatsBooked: b.seatsBooked,
        createdAt: b.createdAt,
      })),
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch debug data",
      },
      { status: 500 },
    );
  }
}
