import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { drivers, adminLogs } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "~/lib/auth";

interface UpdateDriverRequest {
  name?: string;
  email?: string;
  phoneNumber?: string;
  licenseNumber?: string;
  status?: string;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin();
    const { id } = await params;
    const { name, email, phoneNumber, licenseNumber, status } = (await req.json()) as UpdateDriverRequest;
    const driverId = parseInt(id, 10);

    // Get existing driver
    const existingDriver = await db.query.drivers.findFirst({
      where: eq(drivers.id, driverId),
    });

    if (!existingDriver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (licenseNumber !== undefined) updateData.licenseNumber = licenseNumber;
    if (status !== undefined) updateData.status = status;

    const updatedDriver = await db
      .update(drivers)
      .set(updateData)
      .where(eq(drivers.id, driverId))
      .returning();

    // Log the action
    await db.insert(adminLogs).values({
      adminId: user.id,
      action: "UPDATE",
      entityType: "driver",
      entityId: driverId.toString(),
      changes: JSON.stringify({ before: existingDriver, after: updateData }),
      description: `Updated driver: ${name ?? existingDriver.name}`,
    });

    return NextResponse.json(updatedDriver[0]);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update driver" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin();
    const { id } = await params;
    const driverId = parseInt(id, 10);

    // Check if driver exists
    const driver = await db.query.drivers.findFirst({
      where: eq(drivers.id, driverId),
    });

    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    // Delete driver
    await db.delete(drivers).where(eq(drivers.id, driverId));

    // Log the action
    await db.insert(adminLogs).values({
      adminId: user.id,
      action: "DELETE",
      entityType: "driver",
      entityId: driverId.toString(),
      description: `Deleted driver: ${driver.name}`,
    });

    return NextResponse.json({ success: true, message: "Driver deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete driver" },
      { status: 500 }
    );
  }
}
