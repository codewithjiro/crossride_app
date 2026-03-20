import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { bookings, trips, adminLogs } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "~/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

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
    });

    return NextResponse.json(allBookings);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch bookings",
      },
      { status: 500 },
    );
  }
}

interface BookingUpdateRequest {
  bookingId: string;
  action: "approve" | "reject" | "cancel";
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAdmin();
    const { bookingId, action } = (await req.json()) as BookingUpdateRequest;

    if (!bookingId || !action) {
      return NextResponse.json(
        { error: "Missing required fields: bookingId, action" },
        { status: 400 },
      );
    }

    if (!["approve", "reject", "cancel"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be approve, reject, or cancel" },
        { status: 400 },
      );
    }

    // Get the booking
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, parseInt(bookingId, 10)),
      with: { trip: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    let newStatus: "approved" | "rejected" | "cancelled" | "pending" =
      "pending";
    if (action === "approve") {
      newStatus = "approved";
      // Update trip seats
      if (booking.trip) {
        await db
          .update(trips)
          .set({
            seatsReserved:
              (booking.trip.seatsReserved ?? 0) + booking.seatsBooked,
          })
          .where(eq(trips.id, booking.trip.id));
      }
    } else if (action === "reject") {
      newStatus = "rejected";
    } else if (action === "cancel") {
      newStatus = "cancelled";
      // Release seats if was approved
      if (booking.status === "approved" && booking.trip) {
        await db
          .update(trips)
          .set({
            seatsReserved: Math.max(
              0,
              (booking.trip.seatsReserved ?? 0) - booking.seatsBooked,
            ),
          })
          .where(eq(trips.id, booking.trip.id));
      }
    }

    const updatedBooking = await db
      .update(bookings)
      .set({ status: newStatus })
      .where(eq(bookings.id, parseInt(bookingId, 10)))
      .returning();

    // Log the action
    await db.insert(adminLogs).values({
      adminId: user.id,
      action: action.toUpperCase() as "APPROVE" | "REJECT" | "CANCEL",
      entityType: "booking",
      entityId: bookingId,
      description: `${action.charAt(0).toUpperCase() + action.slice(1)} booking #${bookingId}`,
    });

    return NextResponse.json(updatedBooking[0] ?? null);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update booking",
      },
      { status: 500 },
    );
  }
}
