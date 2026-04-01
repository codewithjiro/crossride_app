import { db } from "~/server/db";
import { trips } from "~/server/db/schema";
import { and, eq, lt, gt, ne } from "drizzle-orm";

export async function checkConflicts(
  vanId: number,
  driverId: number | null,
  departureTime: Date,
  arrivalTime: Date,
  tripIdToExclude?: number,
): Promise<{
  hasConflict: boolean;
  conflictType?: "van_conflict" | "driver_conflict" | "both_conflict";
  message?: string;
}> {
  // Validate time logic
  if (departureTime >= arrivalTime) {
    return {
      hasConflict: true,
      message: "Departure time must be before arrival time",
    };
  }

  try {
    // Find trips with overlapping times for the same van
    // Only check against ACTIVE trips (scheduled, in_progress)
    // Exclude: cancelled, completed, and pending (not approved yet, so no actual conflict)
    const vanConflicts = await db.query.trips.findMany({
      where: and(
        eq(trips.vanId, vanId),
        ne(trips.status, "cancelled"),
        ne(trips.status, "completed"),
        ne(trips.status, "pending"),
        tripIdToExclude ? ne(trips.id, tripIdToExclude) : undefined,
        // Check for time overlap: new trip starts before existing trip ends
        // AND new trip ends after existing trip starts
        lt(trips.departureTime, arrivalTime),
        gt(trips.arrivalTime, departureTime),
      ),
    });

    // Find trips with overlapping times for the same driver (only if driver is assigned)
    // Only check against ACTIVE trips (scheduled, in_progress)
    // Exclude: cancelled, completed, and pending (not approved yet, so no actual conflict)
    let driverConflicts = [];
    if (driverId !== null) {
      driverConflicts = await db.query.trips.findMany({
        where: and(
          eq(trips.driverId, driverId),
          ne(trips.status, "cancelled"),
          ne(trips.status, "completed"),
          ne(trips.status, "pending"),
          tripIdToExclude ? ne(trips.id, tripIdToExclude) : undefined,
          lt(trips.departureTime, arrivalTime),
          gt(trips.arrivalTime, departureTime),
        ),
      });
    }

    if (vanConflicts.length > 0 && driverConflicts.length > 0) {
      return {
        hasConflict: true,
        conflictType: "both_conflict",
        message: "Van and driver are not available at this time",
      };
    }

    if (vanConflicts.length > 0) {
      return {
        hasConflict: true,
        conflictType: "van_conflict",
        message: "Van is not available at this time",
      };
    }

    if (driverConflicts.length > 0) {
      return {
        hasConflict: true,
        conflictType: "driver_conflict",
        message: "Driver is not available at this time",
      };
    }

    return { hasConflict: false };
  } catch (error) {
    return {
      hasConflict: true,
      message:
        error instanceof Error ? error.message : "Error checking conflicts",
    };
  }
}

/**
 * Check for duplicate trip requests
 * Prevents the same trip (same van, route, times) from being requested multiple times
 * This prevents abuse where users with multiple accounts request the same trip
 */
export async function checkDuplicateTrip(
  vanId: number,
  route: string,
  departureTime: Date,
  arrivalTime: Date,
  tripIdToExclude?: number,
): Promise<{
  isDuplicate: boolean;
  existingTripId?: number;
  existingTripStatus?: string;
  message?: string;
}> {
  try {
    // Find trips with exact same details (van, route, times) that are ACTIVE
    // Exclude: cancelled, completed, and pending (pending doesn't consume resources yet)
    // Only block if there's an approved or in_progress trip with same details
    const duplicates = await db.query.trips.findMany({
      where: and(
        eq(trips.vanId, vanId),
        eq(trips.route, route),
        eq(trips.departureTime, departureTime),
        eq(trips.arrivalTime, arrivalTime),
        // Only check against active trips, not pending
        ne(trips.status, "cancelled"),
        ne(trips.status, "completed"),
        ne(trips.status, "pending"),
        tripIdToExclude ? ne(trips.id, tripIdToExclude) : undefined,
      ),
    });

    if (duplicates.length > 0) {
      const duplicate = duplicates[0];
      return {
        isDuplicate: true,
        existingTripId: duplicate.id,
        existingTripStatus: duplicate.status,
        message: `A ${duplicate.status} trip with identical details already exists. Please check existing bookings before requesting a new trip.`,
      };
    }

    return { isDuplicate: false };
  } catch (error) {
    return {
      isDuplicate: true,
      message:
        error instanceof Error
          ? error.message
          : "Error checking for duplicates",
    };
  }
}
