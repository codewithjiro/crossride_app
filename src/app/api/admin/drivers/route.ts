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
  firstName: string;
  middleName?: string;
  surname: string;
  email: string;
  phoneNumber: string;
  licenseNumber: string;
  experience?: string;
  specialization?: string;
  profileImage?: string; // base64 or data URL
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdmin();
    const {
      firstName,
      middleName,
      surname,
      email,
      phoneNumber,
      licenseNumber,
      experience,
      specialization,
      profileImage,
    } = (await req.json()) as CreateDriverRequest;

    if (!firstName || !surname || !email || !phoneNumber || !licenseNumber) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const newDriver = await db
      .insert(drivers)
      .values({
        firstName,
        middleName: middleName || null,
        surname,
        email,
        phoneNumber,
        licenseNumber,
        experience: experience || null,
        specialization: specialization || null,
        profileImage: profileImage || null,
        status: "active",
      })
      .returning();

    // Log the action
    await db.insert(adminLogs).values({
      adminId: user.id,
      action: "CREATE",
      entityType: "driver",
      entityId: String(newDriver[0]?.id),
      description: `Created new driver: ${firstName} ${surname}`,
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
