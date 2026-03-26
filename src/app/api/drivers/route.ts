import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { drivers } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    // Fetch only active drivers
    const activeDrivers = await db.query.drivers.findMany({
      where: eq(drivers.status, "active"),
    });

    return NextResponse.json(activeDrivers);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch drivers",
      },
      { status: 500 },
    );
  }
}
