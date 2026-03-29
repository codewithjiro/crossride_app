import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "~/server/db";
import { bookings, trips } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "~/lib/auth";

// Force dynamic to prevent caching
export const dynamic = "force-dynamic";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const bookingId = Number(id);

    if (!bookingId || Number.isNaN(bookingId)) {
      return NextResponse.json(
        { error: "Invalid booking id" },
        { status: 400 },
      );
    }

    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.userId !== user.id && user.role !== "admin") {
      return NextResponse.json(
        { error: "Not authorized to cancel this booking" },
        { status: 403 },
      );
    }

    if (["cancelled", "completed", "rejected"].includes(booking.status)) {
      return NextResponse.json(
        { error: `Cannot cancel a ${booking.status} booking` },
        { status: 400 },
      );
    }

    // Restore seats to the trip if it still exists
    const trip = await db.query.trips.findFirst({
      where: eq(trips.id, booking.tripId),
    });
    if (trip) {
      await db
        .update(trips)
        .set({
          seatsAvailable: trip.seatsAvailable + booking.seatsBooked,
          seatsReserved: Math.max(0, trip.seatsReserved - booking.seatsBooked),
        })
        .where(eq(trips.id, trip.id));
    }

    await db
      .update(bookings)
      .set({ status: "cancelled" })
      .where(eq(bookings.id, bookingId));

    revalidatePath("/my-bookings");
    revalidatePath("/my-bookings/");
    revalidatePath("/dashboard");
    revalidatePath("/admin/bookings");
    revalidatePath("/api/bookings");

    return NextResponse.json(
      { success: true },
      {
        headers: {
          "Cache-Control": "no-store, must-revalidate",
        },
      },
    );
  } catch (error) {
    console.error("Cancel booking error:", error);
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 },
    );
  }
}
