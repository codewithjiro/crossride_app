import { db } from "~/server/db";
import { trips } from "~/server/db/schema";
import { and, eq, lt, gt, ne } from "drizzle-orm";

export async function checkConflicts(
  vanId: number,
  driverId: number,
  departureTime: Date,
  arrivalTime: Date,
  tripIdToExclude?: number
): Promise<{
  hasConflict: boolean;
  conflictType?: "van" | "driver" | "both";
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
    const vanConflicts = await db.query.trips.findMany({
      where: and(
        eq(trips.vanId, vanId),
        ne(trips.status, "cancelled"),
        tripIdToExclude ? ne(trips.id, tripIdToExclude) : undefined,
        // Check for time overlap: new trip starts before existing trip ends
        // AND new trip ends after existing trip starts
        lt(trips.departureTime, arrivalTime),
        gt(trips.arrivalTime, departureTime)
      ),
    });

    // Find trips with overlapping times for the same driver
    const driverConflicts = await db.query.trips.findMany({
      where: and(
        eq(trips.driverId, driverId),
        ne(trips.status, "cancelled"),
        tripIdToExclude ? ne(trips.id, tripIdToExclude) : undefined,
        lt(trips.departureTime, arrivalTime),
        gt(trips.arrivalTime, departureTime)
      ),
    });

    if (vanConflicts.length > 0 && driverConflicts.length > 0) {
      return {
        hasConflict: true,
        conflictType: "both",
        message: "Van and driver are not available at this time",
      };
    }

    if (vanConflicts.length > 0) {
      return {
        hasConflict: true,
        conflictType: "van",
        message: "Van is not available at this time",
      };
    }

    if (driverConflicts.length > 0) {
      return {
        hasConflict: true,
        conflictType: "driver",
        message: "Driver is not available at this time",
      };
    }

    return { hasConflict: false };
  } catch (error) {
    return {
      hasConflict: true,
      message: error instanceof Error ? error.message : "Error checking conflicts",
    };
  }
}
