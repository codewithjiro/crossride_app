import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { trips } from "~/server/db/schema";
import { eq, gte, or } from "drizzle-orm";

/**
 * GET /api/vans/[id]/scheduled-dates
 * Returns all dates where a van has pending or scheduled trips (next 30 days)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const vanId = parseInt(id);

    if (!vanId) {
      return NextResponse.json(
        { error: "Van ID is required" },
        { status: 400 },
      );
    }

    // Get all pending and scheduled trips for this specific van only
    const scheduledTrips = await db.query.trips.findMany({
      where: (t, { eq, gte, or }) =>
        eq(t.vanId, vanId) &&
        gte(t.departureTime, new Date()) &&
        or(eq(t.status, "pending"), eq(t.status, "scheduled")),
      columns: {
        departureTime: true,
      },
    });

    // Extract unique dates (YYYY-MM-DD format)
    const scheduledDates = [
      ...new Set(
        scheduledTrips.map((trip) => {
          const date = new Date(trip.departureTime);
          return date.toISOString().split("T")[0];
        }),
      ),
    ];

    return NextResponse.json({
      success: true,
      scheduledDates: scheduledDates,
    });
  } catch (error) {
    console.error("Error fetching scheduled dates:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch scheduled dates",
      },
      { status: 500 },
    );
  }
}
