import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { trips, adminLogs } from "~/server/db/schema";
import { requireAdmin } from "~/lib/auth";
import { checkConflicts } from "~/lib/conflicts";

export async function GET() {
  try {
    await requireAdmin();

    const allTrips = await db.query.trips.findMany({
      with: {
        van: true,
        driver: true,
        bookings: {
          with: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json(allTrips);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch trips",
      },
      { status: 500 },
    );
  }
}

interface CreateTripRequest {
  vanId: string | number;
  driverId: string | number;
  route: string;
  departureTime: string;
  arrivalTime: string;
  seatsAvailable: string | number;
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdmin();
    const {
      vanId,
      driverId,
      route,
      departureTime,
      arrivalTime,
      seatsAvailable,
    } = (await req.json()) as CreateTripRequest;

    if (
      !vanId ||
      !driverId ||
      !route ||
      !departureTime ||
      !arrivalTime ||
      !seatsAvailable
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const depTime = new Date(departureTime);
    const arrTime = new Date(arrivalTime);
    const vanIdInt = parseInt(String(vanId), 10);
    const driverIdInt = parseInt(String(driverId), 10);
    const seatsInt = parseInt(String(seatsAvailable), 10);

    // Validate times
    if (depTime >= arrTime) {
      return NextResponse.json(
        { error: "Departure time must be before arrival time" },
        { status: 400 },
      );
    }

    // Validate seat count
    if (seatsInt < 1) {
      return NextResponse.json(
        { error: "Must have at least 1 seat available" },
        { status: 400 },
      );
    }

    // Check for scheduling conflicts
    const conflictCheck = await checkConflicts(
      vanIdInt,
      driverIdInt,
      depTime,
      arrTime,
    );
    if (conflictCheck.hasConflict) {
      return NextResponse.json(
        { error: conflictCheck.message ?? "Scheduling conflict detected" },
        { status: 400 },
      );
    }

    const newTrip = await db
      .insert(trips)
      .values({
        vanId: vanIdInt,
        driverId: driverIdInt,
        route,
        departureTime: depTime,
        arrivalTime: arrTime,
        seatsAvailable: seatsInt,
        seatsReserved: 0,
        status: "scheduled",
      })
      .returning();

    // Log the action
    await db.insert(adminLogs).values({
      adminId: user.id,
      action: "CREATE",
      entityType: "trip",
      entityId: String(newTrip[0]?.id),
      description: `Created new trip: ${route}`,
    });

    return NextResponse.json(newTrip[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create trip",
      },
      { status: 500 },
    );
  }
}
