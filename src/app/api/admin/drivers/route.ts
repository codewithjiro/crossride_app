import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { drivers, adminLogs } from "~/server/db/schema";
import { requireAdmin } from "~/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    const allDrivers = await db.query.drivers.findMany();
    return NextResponse.json(allDrivers);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch drivers",
      },
      { status: 500 },
    );
  }
}

interface CreateDriverRequest {
  name: string;
  email: string;
  phoneNumber: string;
  licenseNumber: string;
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdmin();
    const { name, email, phoneNumber, licenseNumber } =
      (await req.json()) as CreateDriverRequest;

    if (!name || !email || !phoneNumber || !licenseNumber) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const newDriver = await db
      .insert(drivers)
      .values({
        name,
        email,
        phoneNumber,
        licenseNumber,
        status: "active",
      })
      .returning();

    // Log the action
    await db.insert(adminLogs).values({
      adminId: user.id,
      action: "CREATE",
      entityType: "driver",
      entityId: String(newDriver[0]?.id),
      description: `Created new driver: ${name}`,
    });

    return NextResponse.json(newDriver[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create driver",
      },
      { status: 500 },
    );
  }
}
