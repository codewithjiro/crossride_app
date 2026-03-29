import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "~/server/db";
import { bookings, trips, users, vans } from "~/server/db/schema";
import { eq, and, gte, lt, or } from "drizzle-orm";
import { checkDuplicateTrip } from "~/lib/conflicts";

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
      route: string;
      departureTime: string;
      arrivalTime: string;
      seatsRequested: number;
      department?: string;
    };

    const {
      vanId,
      route,
      departureTime,
      arrivalTime,
      seatsRequested,
      department,
    } = body;

    console.log("=== BOOKING REQUEST ===");
    console.log("User ID:", userId);
    console.log("Van ID:", vanId);
    console.log("Departure Time:", departureTime);

    // Validate
    if (!vanId || !route || !departureTime || !seatsRequested) {
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

    // Get van's actual capacity
    const van = await db.query.vans.findFirst({
      where: eq(vans.id, vanId),
    });

    if (!van) {
      return NextResponse.json({ error: "Van not found" }, { status: 404 });
    }

    // Check for duplicate trip requests (same van, route, departure/arrival times)
    const depDate = new Date(departureTime);
    const arrDate = new Date(arrivalTime);

    const duplicateCheck = await checkDuplicateTrip(
      vanId,
      route,
      depDate,
      arrDate,
    );

    if (duplicateCheck.isDuplicate) {
      return NextResponse.json(
        {
          error: duplicateCheck.message,
          existingTripId: duplicateCheck.existingTripId,
          existingTripStatus: duplicateCheck.existingTripStatus,
        },
        { status: 409 }, // 409 Conflict
      );
    }

    // Create new pending trip WITHOUT driver (will be assigned by admin after approval)
    const newTrip = await db
      .insert(trips)
      .values({
        vanId,
        driverId: null, // No driver yet - admin will assign after approval
        route,
        departureTime: new Date(departureTime),
        arrivalTime: new Date(arrivalTime),
        seatsAvailable: van.capacity, // Use van's actual capacity
        seatsReserved: 0,
        status: "pending",
      })
      .returning();

    let tripId = newTrip[0].id;

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

    // Reserve seats by reducing seatsAvailable and increasing seatsReserved
    await db
      .update(trips)
      .set({
        seatsAvailable: currentTrip.seatsAvailable - seatsRequested,
        seatsReserved: currentTrip.seatsReserved + seatsRequested,
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
