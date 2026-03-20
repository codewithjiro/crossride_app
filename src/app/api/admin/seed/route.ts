import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { vans, drivers } from "~/server/db/schema";

/**
 * POST /api/admin/seed
 * Initialize database with vans and drivers
 * Only works in development or with proper authorization
 */
export async function POST() {
  try {
    // Check if already seeded
    const existingVans = await db.query.vans.findMany();
    const existingDrivers = await db.query.drivers.findMany();

    if (existingVans.length > 0 && existingDrivers.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Database already seeded",
          vans: existingVans.length,
          drivers: existingDrivers.length,
        },
        { status: 409 },
      );
    }

    // Seed vans
    const seedVans = [
      {
        name: "Hiace Commuter Deluxe",
        plateNumber: "HCC-001",
        capacity: 14,
      },
      {
        name: "Hiace Grandia",
        plateNumber: "HCG-001",
        capacity: 11,
      },
      {
        name: "L300 Van",
        plateNumber: "L3V-001",
        capacity: 10,
      },
    ];

    const createdVans = await db
      .insert(vans)
      .values(seedVans.map((v) => ({ ...v, status: "active" as const })))
      .returning();

    // Seed drivers
    const seedDrivers = [
      {
        name: "Jiro Gonzales",
        email: "jiro@crossride.com",
        phoneNumber: "09171234567",
        licenseNumber: "DL-001-JG",
      },
      {
        name: "Jenah Ambagan",
        email: "jenah@crossride.com",
        phoneNumber: "09172234567",
        licenseNumber: "DL-002-JA",
      },
      {
        name: "Joyce Manaloto",
        email: "joyce@crossride.com",
        phoneNumber: "09173234567",
        licenseNumber: "DL-003-JM",
      },
      {
        name: "Venice Bumagat",
        email: "venice@crossride.com",
        phoneNumber: "09174234567",
        licenseNumber: "DL-004-VB",
      },
    ];

    const createdDrivers = await db
      .insert(drivers)
      .values(seedDrivers.map((d) => ({ ...d, status: "active" as const })))
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "Database seeded successfully",
        vans: createdVans,
        drivers: createdDrivers,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to seed database",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/admin/seed
 * Check seeding status
 */
export async function GET() {
  try {
    const vanCount = await db.query.vans.findMany();
    const driverCount = await db.query.drivers.findMany();

    return NextResponse.json({
      isSeeded: vanCount.length > 0 && driverCount.length > 0,
      vans: vanCount.length,
      drivers: driverCount.length,
      data: {
        vans: vanCount,
        drivers: driverCount,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to check seed status",
      },
      { status: 500 },
    );
  }
}
