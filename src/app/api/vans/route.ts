import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { vans } from "~/server/db/schema";
import { eq } from "drizzle-orm";

// Public endpoint to list active vans for booking selection
export async function GET() {
  try {
    const activeVans = await db.query.vans.findMany({
      where: eq(vans.status, "active"),
      orderBy: (v, { asc }) => [asc(v.name), asc(v.plateNumber)],
    });

    return NextResponse.json({ vans: activeVans });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch vans",
      },
      { status: 500 },
    );
  }
}
