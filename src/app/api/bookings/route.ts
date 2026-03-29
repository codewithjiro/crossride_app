import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { bookings, trips } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "~/lib/auth";

// Force dynamic to prevent caching
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireAuth();

    // Users can only see their own bookings
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
    });

    return NextResponse.json(userBookings, {
      headers: {
        "Cache-Control": "no-store, must-revalidate",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch bookings",
      },
      { status: 401 },
    );
  }
}

interface CreateBookingRequest {
  tripId: string | number;
  seatsBooked: number;
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { tripId, seatsBooked } = (await req.json()) as CreateBookingRequest;

    if (!tripId || !seatsBooked) {
      return NextResponse.json(
        { error: "Missing required fields: tripId, seatsBooked" },
        { status: 400 },
      );
    }

    if (seatsBooked < 1) {
      return NextResponse.json(
        { error: "Must book at least 1 seat" },
        { status: 400 },
      );
    }

    // Get trip details
    const trip = await db.query.trips.findFirst({
      where: eq(trips.id, parseInt(String(tripId), 10)),
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Validate available seats
    const availableSeats = trip.seatsAvailable - trip.seatsReserved;
    if (seatsBooked > availableSeats) {
      return NextResponse.json(
        { error: `Only ${availableSeats} seats available` },
        { status: 400 },
      );
    }

    // Check if user already booked this trip
    const existingBooking = await db.query.bookings.findFirst({
      where: and(
        eq(bookings.userId, user.id),
        eq(bookings.tripId, parseInt(String(tripId), 10)),
      ),
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: "You already have a booking for this trip" },
        { status: 400 },
      );
    }

    // Create booking with pending status
    const newBooking = await db
      .insert(bookings)
      .values({
        userId: user.id,
        tripId: parseInt(String(tripId), 10),
        seatsBooked,
        status: "pending",
      })
      .returning();

    return NextResponse.json(newBooking[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create booking",
      },
      { status: 500 },
    );
  }
}
