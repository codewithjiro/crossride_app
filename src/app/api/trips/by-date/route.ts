import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { trips } from "~/server/db/schema";
import { eq, gte, lt, and, or } from "drizzle-orm";

/**
 * GET /api/trips/by-date?date=2026-03-20
 * Returns all pending and scheduled trips for a specific date and which vans/drivers are unavailable
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 },
      );
    }

    // Parse date and create start/end of day range in UTC
    // Input format: "2026-03-24"
    const startOfDay = new Date(date + "T00:00:00.000Z");
    const endOfDay = new Date(date + "T23:59:59.999Z");

    // Fetch trips for this date (only scheduled/approved)
    const tripsForDate = await db.query.trips.findMany({
      where: and(
        eq(trips.status, "scheduled"),
        gte(trips.departureTime, startOfDay),
        lt(trips.departureTime, endOfDay),
      ),
      with: {
        van: {
          columns: { name: true, plateNumber: true },
        },
        driver: true,
      },
      orderBy: (trips, { asc }) => [asc(trips.departureTime)],
    });

    console.log("=== trips/by-date API ===");
    console.log("Query date:", date);
    console.log("Trips found for date:", tripsForDate.length);

    // DEBUG: Get ALL trips to see if any exist at all
    const allTrips = await db.query.trips.findMany();
    console.log("Total trips in DB:", allTrips.length);
    if (allTrips.length > 0) {
      console.log(
        "All trips:",
        allTrips.map((t) => ({
          id: t.id,
          vanId: t.vanId,
          driverId: t.driverId,
          status: t.status,
          departureTime: t.departureTime,
        })),
      );
    }

    // Format response
    const formattedTrips = tripsForDate.map((trip) => ({
      id: trip.id,
      vanId: trip.vanId,
      driverId: trip.driverId,
      time: new Date(trip.departureTime).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      seatsAvailable: trip.seatsAvailable,
      van: trip.van,
      driver: trip.driver,
    }));

    // Extract unavailable van and driver IDs
    const unavailableVanIds = [
      ...new Set(tripsForDate.map((trip) => trip.vanId)),
    ];
    const unavailableDriverIds = [
      ...new Set(tripsForDate.map((trip) => trip.driverId)),
    ];

    return NextResponse.json({
      success: true,
      trips: formattedTrips,
      unavailableVanIds: unavailableVanIds,
      unavailableDriverIds: unavailableDriverIds,
    });
  } catch (error) {
    console.error("Error fetching trips by date:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch trips by date",
      },
      { status: 500 },
    );
  }
}
