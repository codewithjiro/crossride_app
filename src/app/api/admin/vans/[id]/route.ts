import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { vans, adminLogs } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "~/lib/auth";

interface UpdateVanRequest {
  name?: string;
  plateNumber?: string;
  capacity?: string | number;
  status?: string;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAdmin();
    const { id } = await params;
    const { name, plateNumber, capacity, status } =
      (await req.json()) as UpdateVanRequest;
    const vanId = parseInt(id, 10);

    // Get existing van
    const existingVan = await db.query.vans.findFirst({
      where: eq(vans.id, vanId),
    });

    if (!existingVan) {
      return NextResponse.json({ error: "Van not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (plateNumber !== undefined) updateData.plateNumber = plateNumber;
    if (capacity !== undefined)
      updateData.capacity = parseInt(String(capacity), 10);
    if (status !== undefined) updateData.status = status;

    const updatedVan = await db
      .update(vans)
      .set(updateData)
      .where(eq(vans.id, vanId))
      .returning();

    // Log the action
    await db.insert(adminLogs).values({
      adminId: user.id,
      action: "UPDATE",
      entityType: "van",
      entityId: vanId.toString(),
      changes: JSON.stringify({ before: existingVan, after: updateData }),
      description: `Updated van: ${name ?? existingVan.name}`,
    });

    return NextResponse.json(updatedVan[0]);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update van",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAdmin();
    const { id } = await params;
    const vanId = parseInt(id, 10);

    // Check if van exists
    const van = await db.query.vans.findFirst({
      where: eq(vans.id, vanId),
    });

    if (!van) {
      return NextResponse.json({ error: "Van not found" }, { status: 404 });
    }

    // Delete van
    await db.delete(vans).where(eq(vans.id, vanId));

    // Log the action
    await db.insert(adminLogs).values({
      adminId: user.id,
      action: "DELETE",
      entityType: "van",
      entityId: vanId.toString(),
      description: `Deleted van: ${van.name}`,
    });

    return NextResponse.json({
      success: true,
      message: "Van deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to delete van",
      },
      { status: 500 },
    );
  }
}
