import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { vans, adminLogs } from "~/server/db/schema";
import { requireAdmin } from "~/lib/auth";

interface CreateVanRequest {
  name: string;
  plateNumber: string;
  capacity: string | number;
}

export async function GET() {
  try {
    await requireAdmin();

    const allVans = await db.query.vans.findMany();
    return NextResponse.json(allVans);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch vans",
      },
      {
        status:
          error instanceof Error && error.message.includes("Forbidden")
            ? 403
            : 500,
      },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdmin();
    const { name, plateNumber, capacity } =
      (await req.json()) as CreateVanRequest;

    if (!name || !plateNumber || !capacity) {
      return NextResponse.json(
        { error: "Missing required fields: name, plateNumber, capacity" },
        { status: 400 },
      );
    }

    const newVan = await db
      .insert(vans)
      .values({
        name,
        plateNumber,
        capacity: parseInt(String(capacity), 10),
        status: "active",
      })
      .returning();

    // Log the action
    await db.insert(adminLogs).values({
      adminId: user.id,
      action: "CREATE",
      entityType: "van",
      entityId: String(newVan[0]?.id),
      description: `Created new van: ${name}`,
    });

    return NextResponse.json(newVan[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create van",
      },
      { status: 500 },
    );
  }
}
