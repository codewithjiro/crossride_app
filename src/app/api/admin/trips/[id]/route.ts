import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "~/server/db";
import { trips, bookings, adminLogs } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "~/lib/auth";
import { checkConflicts, checkDuplicateTrip } from "~/lib/conflicts";
import { createNotification } from "~/lib/notifications";

interface UpdateTripRequest {
  vanId?: string | number;
  driverId?: string | number;
  route?: string;
  departureTime?: string;
  arrivalTime?: string;
  seatsAvailable?: string | number;
  status?: string;
  cancelReason?: string;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAdmin();
    const { id } = await params;
    const {
      vanId,
      driverId,
      route,
      departureTime,
      arrivalTime,
      seatsAvailable,
      status,
      cancelReason,
    } = (await req.json()) as UpdateTripRequest;
    const tripId = parseInt(id, 10);

    // Get existing trip
    const existingTrip = await db.query.trips.findFirst({
      where: eq(trips.id, tripId),
    });

    if (!existingTrip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const newVanId = vanId ? parseInt(String(vanId), 10) : existingTrip.vanId;
    const newDriverId = driverId
      ? parseInt(String(driverId), 10)
      : existingTrip.driverId;
    const newDepTime = departureTime
      ? new Date(departureTime)
      : existingTrip.departureTime;
    const newArrTime = arrivalTime
      ? new Date(arrivalTime)
      : existingTrip.arrivalTime;

    // Validate times if being updated
    if (departureTime ?? arrivalTime) {
      if (newDepTime >= newArrTime) {
        return NextResponse.json(
          { error: "Departure time must be before arrival time" },
          { status: 400 },
        );
      }
    }

    // Check for conflicts if van or driver or times changed
    if ((vanId ?? driverId ?? departureTime ?? arrivalTime) !== undefined) {
      const conflictCheck = await checkConflicts(
        newVanId,
        newDriverId,
        newDepTime,
        newArrTime,
        tripId,
      );
      if (conflictCheck.hasConflict) {
        console.log("⚠️ TRIP CONFLICT DETECTED:", {
          conflictType: conflictCheck.conflictType,
          message: conflictCheck.message,
          tripId: tripId,
        });

        // Get all bookings for this trip to notify affected users
        const tripBookings = await db.query.bookings.findMany({
          where: eq(bookings.tripId, tripId),
        });

        console.log(`📢 Found ${tripBookings.length} bookings affected`);

        // Create notifications for all affected users
        const notificationType =
          conflictCheck.conflictType || "driver_conflict";
        const notificationMessage =
          getConflictNotificationMessage(notificationType);

        for (const booking of tripBookings) {
          console.log(
            `📢 Creating notification for user ${booking.userId}, booking ${booking.id}`,
          );
          try {
            const notifResult = await createNotification({
              userId: booking.userId,
              bookingId: booking.id,
              tripId: tripId,
              type: notificationType as
                | "driver_conflict"
                | "van_conflict"
                | "both_conflict",
              message: notificationMessage,
            });
            console.log(`✅ Notification created for booking ${booking.id}`);
          } catch (notifError) {
            console.error(
              `❌ Failed to create notification for booking ${booking.id}:`,
              notifError,
            );
          }
        }

        return NextResponse.json(
          { error: conflictCheck.message ?? "Scheduling conflict detected" },
          { status: 409 }, // 409 Conflict
        );
      }

      // Also check for duplicate trips if route or times changed
      if (route ?? departureTime ?? arrivalTime) {
        const duplicateCheck = await checkDuplicateTrip(
          newVanId,
          route ?? existingTrip.route,
          newDepTime,
          newArrTime,
          tripId,
        );
        if (duplicateCheck.isDuplicate) {
          return NextResponse.json(
            {
              error: `Cannot update trip: ${duplicateCheck.message}`,
              conflictingTripId: duplicateCheck.existingTripId,
              conflictingTripStatus: duplicateCheck.existingTripStatus,
            },
            { status: 409 }, // 409 Conflict
          );
        }
      }
    }

    const updateData: Record<string, unknown> = {};
    if (vanId !== undefined) updateData.vanId = newVanId;
    if (driverId !== undefined) updateData.driverId = newDriverId;
    if (route !== undefined) updateData.route = route;
    if (departureTime !== undefined) updateData.departureTime = newDepTime;
    if (arrivalTime !== undefined) updateData.arrivalTime = newArrTime;
    if (seatsAvailable !== undefined)
      updateData.seatsAvailable = parseInt(String(seatsAvailable), 10);
    if (status !== undefined) updateData.status = status;
    if (cancelReason !== undefined) updateData.cancelReason = cancelReason;

    const updatedTrip = await db
      .update(trips)
      .set(updateData)
      .where(eq(trips.id, tripId))
      .returning();

    // If trip is being cancelled, also cancel all related bookings
    if (status === "cancelled") {
      await db
        .update(bookings)
        .set({ status: "cancelled" })
        .where(eq(bookings.tripId, tripId));
    }

    // Log the action
    await db.insert(adminLogs).values({
      adminId: user.id,
      action: "UPDATE",
      entityType: "trip",
      entityId: tripId.toString(),
      changes: JSON.stringify({ before: existingTrip, after: updateData }),
      description: `Updated trip: ${route ?? existingTrip.route}`,
    });

    revalidatePath("/admin/trips");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/dashboard");

    return NextResponse.json(updatedTrip[0]);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update trip",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAdmin();
    const { id } = await params;
    const tripId = parseInt(id, 10);

    // Check if trip exists
    const trip = await db.query.trips.findFirst({
      where: eq(trips.id, tripId),
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Delete trip
    await db.delete(trips).where(eq(trips.id, tripId));

    // Log the action
    await db.insert(adminLogs).values({
      adminId: user.id,
      action: "DELETE",
      entityType: "trip",
      entityId: tripId.toString(),
      description: `Deleted trip: ${trip.route}`,
    });

    return NextResponse.json({
      success: true,
      message: "Trip deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to delete trip",
      },
      { status: 500 },
    );
  }
}

/**
 * Get notification message based on conflict type
 */
function getConflictNotificationMessage(conflictType: string): string {
  switch (conflictType) {
    case "driver_conflict":
      return "⚠️ Scheduling Conflict: Your assigned driver is not available at the scheduled time. Your booking needs to be updated.";
    case "van_conflict":
      return "⚠️ Scheduling Conflict: Your assigned van is not available at the scheduled time. Your booking needs to be updated.";
    case "both_conflict":
      return "⚠️ Scheduling Conflict: Your assigned driver and van are not available at the scheduled time. Your booking needs to be updated.";
    default:
      return "⚠️ Scheduling Conflict: Your booking has a scheduling conflict. Your booking needs to be updated.";
  }
}
