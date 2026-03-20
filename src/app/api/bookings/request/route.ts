import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "~/server/db";
import { bookings, trips, users } from "~/server/db/schema";
import { eq, and, gte, lt, or } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user exists
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = (await request.json()) as {
      vanId: number;
      driverId: number;
      route: string;
      departureTime: string;
      arrivalTime: string;
      seatsRequested: number;
      department?: string;
    };

    const {
      vanId,
      driverId,
      route,
      departureTime,
      arrivalTime,
      seatsRequested,
      department,
    } = body;

    console.log("=== BOOKING REQUEST ===");
    console.log("User ID:", userId);
    console.log("Van ID:", vanId);
    console.log("Driver ID:", driverId);
    console.log("Departure Time:", departureTime);

    // Validate
    if (!vanId || !driverId || !route || !departureTime || !seatsRequested) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!department) {
      return NextResponse.json(
        { error: "Missing required field: department" },
        { status: 400 },
      );
    }

    // Check if van already has any APPROVED/scheduled trip on this date
    const depTime = new Date(departureTime);
    const dateString = depTime.toISOString().split("T")[0]; // "2026-03-24"
    const startOfDay = new Date(dateString + "T00:00:00.000Z");
    const endOfDay = new Date(dateString + "T23:59:59.999Z");

    const vanTripsOnDate = await db.query.trips.findMany({
      where: and(
        eq(trips.vanId, vanId),
        eq(trips.status, "scheduled"),
        gte(trips.departureTime, startOfDay),
        lt(trips.departureTime, endOfDay),
      ),
    });

    if (vanTripsOnDate.length > 0) {
      return NextResponse.json(
        {
          error:
            "This van is already scheduled for another trip on this date. Vans can only operate one route per day.",
        },
        { status: 400 },
      );
    }

    // Check if driver already has any APPROVED/scheduled trip on this date
    const driverTripsOnDate = await db.query.trips.findMany({
      where: and(
        eq(trips.driverId, driverId),
        eq(trips.status, "scheduled"),
        gte(trips.departureTime, startOfDay),
        lt(trips.departureTime, endOfDay),
      ),
    });

    if (driverTripsOnDate.length > 0) {
      return NextResponse.json(
        {
          error:
            "This driver is already assigned to another trip on this date. Drivers can only operate one route per day.",
        },
        { status: 400 },
      );
    }

    // Check if trip already exists for this van + driver + time in same hour
    // Round to nearest hour to match booking times
    const depTimeHour = new Date(
      depTime.getFullYear(),
      depTime.getMonth(),
      depTime.getDate(),
      depTime.getHours(),
      0,
      0,
    );
    const depTimeNextHour = new Date(depTimeHour.getTime() + 60 * 60 * 1000);

    const existingTrip = await db.query.trips.findFirst({
      where: and(
        eq(trips.vanId, vanId),
        eq(trips.driverId, driverId),
        gte(trips.departureTime, depTimeHour),
        lt(trips.departureTime, depTimeNextHour),
      ),
    });

    let tripId: number;

    if (existingTrip) {
      tripId = existingTrip.id;
    } else {
      // Create new pending trip (will be scheduled after admin approval)
      const newTrip = await db
        .insert(trips)
        .values({
          vanId,
          driverId,
          route,
          departureTime: new Date(departureTime),
          arrivalTime: new Date(arrivalTime),
          seatsAvailable: 15, // Default capacity
          seatsReserved: 0,
          status: "pending",
        })
        .returning();

      tripId = newTrip[0].id;
      console.log("✅ Trip created:", {
        id: tripId,
        vanId,
        driverId,
        departureTime: newTrip[0].departureTime,
        status: newTrip[0].status,
      });
    }

    // Get current trip to check available seats
    const currentTrip = await db.query.trips.findFirst({
      where: eq(trips.id, tripId),
    });

    if (!currentTrip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    if (currentTrip.seatsAvailable < seatsRequested) {
      return NextResponse.json(
        { error: "Not enough available seats" },
        { status: 400 },
      );
    }

    // Reserve seats by reducing seatsAvailable
    await db
      .update(trips)
      .set({
        seatsAvailable: currentTrip.seatsAvailable - seatsRequested,
      })
      .where(eq(trips.id, tripId));

    // Create pending booking
    const newBooking = await db
      .insert(bookings)
      .values({
        userId,
        tripId,
        seatsBooked: seatsRequested,
        department,
        status: "pending",
      })
      .returning();

    return NextResponse.json({
      success: true,
      booking: newBooking[0],
      message: "Booking request submitted. Awaiting admin approval.",
    });
  } catch (error) {
    console.error("Booking request error:", error);
    return NextResponse.json(
      { error: "Failed to create booking request" },
      { status: 500 },
    );
  }
}
