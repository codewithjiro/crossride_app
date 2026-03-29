import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { trips } from "~/server/db/schema";
import { and, eq, ne, lt, gt } from "drizzle-orm";
import { requireAdmin } from "~/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const { vanId, driverId, departureTime, arrivalTime, tripIdToExclude } =
      (await req.json()) as {
        vanId: number;
        driverId: number | null;
        departureTime: string | Date;
        arrivalTime: string | Date;
        tripIdToExclude?: number;
      };

    if (!vanId || !driverId || !departureTime || !arrivalTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const depTime = new Date(departureTime);
    const arrTime = new Date(arrivalTime);

    // Check for driver conflicts with ACTIVE trips only (not pending, cancelled, or completed)
    const driverConflicts = await db.query.trips.findMany({
      where: and(
        eq(trips.driverId, driverId),
        ne(trips.status, "cancelled"),
        ne(trips.status, "completed"),
        ne(trips.status, "pending"),
        tripIdToExclude ? ne(trips.id, tripIdToExclude) : undefined,
        // Time overlap: new trip starts before existing trip ends AND new trip ends after existing trip starts
        lt(trips.departureTime, arrTime),
        gt(trips.arrivalTime, depTime),
      ),
    });

    const hasConflict = driverConflicts.length > 0;

    return NextResponse.json({ hasConflict });
  } catch (error) {
    console.error("Error checking conflict:", error);
    return NextResponse.json(
      { error: "Failed to check conflict" },
      { status: 500 },
    );
  }
}
