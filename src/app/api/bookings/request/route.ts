import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "~/server/db";
import { bookings, trips, users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

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
    };

    const {
      vanId,
      driverId,
      route,
      departureTime,
      arrivalTime,
      seatsRequested,
    } = body;

    // Validate
    if (!vanId || !driverId || !route || !departureTime || !seatsRequested) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if trip already exists for this van + driver + date combo
    const existingTrip = await db.query.trips.findFirst({
      where: (trips, { eq, and }) =>
        and(
          eq(trips.vanId, vanId),
          eq(trips.driverId, driverId),
          eq(trips.departureTime, new Date(departureTime)),
        ),
    });

    let tripId: number;

    if (existingTrip) {
      tripId = existingTrip.id;
    } else {
      // Create new pending trip
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
          status: "scheduled",
        })
        .returning();

      tripId = newTrip[0].id;
    }

    // Get current trip to check available seats
    const currentTrip = await db.query.trips.findFirst({
      where: eq(trips.id, tripId),
    });

    if (!currentTrip) {
      return NextResponse.json(
        { error: "Trip not found" },
        { status: 404 }
      );
    }

    if (currentTrip.seatsAvailable < seatsRequested) {
      return NextResponse.json(
        { error: "Not enough available seats" },
        { status: 400 }
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
