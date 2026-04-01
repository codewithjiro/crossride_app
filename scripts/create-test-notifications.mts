import { db } from "~/server/db";
import { trips, bookings, users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

/**
 * Script to create test data with conflicting trips
 * This will trigger notifications when approval is attempted
 */
async function createTestConflictData() {
  try {
    console.log("🔍 Fetching first user, van, and driver...");

    // Get first user
    const user = await db.query.users.findFirst();
    if (!user) {
      console.error("❌ No users found. Create a user first.");
      return;
    }

    // Get first van with status 'active'
    const van = await db.query.vans.findFirst({
      where: (vans, { eq }) => eq(vans.status, "active"),
    });
    if (!van) {
      console.error("❌ No active vans found. Add a van first.");
      return;
    }

    // Get first driver with status 'active'
    const driver = await db.query.drivers.findFirst({
      where: (drivers, { eq }) => eq(drivers.status, "active"),
    });
    if (!driver) {
      console.error("❌ No active drivers found. Add a driver first.");
      return;
    }

    console.log(`✅ User: ${user.email}`);
    console.log(`✅ Van: ${van.name}`);
    console.log(`✅ Driver: ${driver.firstName} ${driver.surname}`);

    // Create Trip 1 - Base trip (will be scheduled)
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const departureTime1 = new Date(tomorrow);
    departureTime1.setHours(9, 0, 0, 0); // 9:00 AM

    const arrivalTime1 = new Date(tomorrow);
    arrivalTime1.setHours(14, 0, 0, 0); // 2:00 PM

    console.log("\n📍 Creating Trip 1 (9:00 AM - 2:00 PM)...");
    const trip1 = await db
      .insert(trips)
      .values({
        vanId: van.id,
        driverId: driver.id,
        route: "Holy Cross College → Makati Business District",
        departureTime: departureTime1,
        arrivalTime: arrivalTime1,
        seatsAvailable: 12,
        seatsReserved: 2,
        status: "scheduled",
      })
      .returning();

    console.log(`✅ Trip 1 created: ${trip1[0].id}`);

    // Create Booking 1 for Trip 1
    const booking1 = await db
      .insert(bookings)
      .values({
        userId: user.id,
        tripId: trip1[0].id,
        seatsBooked: 2,
        department: "IT",
        status: "approved",
      })
      .returning();

    console.log(`✅ Booking 1 created: ${booking1[0].id}`);

    // Create Trip 2 - Conflicting trip (overlaps with Trip 1)
    const departureTime2 = new Date(tomorrow);
    departureTime2.setHours(13, 0, 0, 0); // 1:00 PM (overlaps!)

    const arrivalTime2 = new Date(tomorrow);
    arrivalTime2.setHours(17, 0, 0, 0); // 5:00 PM

    console.log("\n📍 Creating Trip 2 (1:00 PM - 5:00 PM) - OVERLAPPING...");
    const trip2 = await db
      .insert(trips)
      .values({
        vanId: van.id,
        driverId: driver.id,
        route: "BGC → Quiapo Church",
        departureTime: departureTime2,
        arrivalTime: arrivalTime2,
        seatsAvailable: 14,
        seatsReserved: 0,
        status: "pending",
      })
      .returning();

    console.log(`✅ Trip 2 created: ${trip2[0].id} (Status: pending)`);

    // Create Booking 2 for Trip 2 (pending)
    const booking2 = await db
      .insert(bookings)
      .values({
        userId: user.id,
        tripId: trip2[0].id,
        seatsBooked: 3,
        department: "HR",
        status: "pending",
      })
      .returning();

    console.log(`✅ Booking 2 created: ${booking2[0].id} (Status: pending)`);

    console.log("\n✨ TEST DATA CREATED!");
    console.log("═══════════════════════════════════════════════════════════");
    console.log(`
Trip 1 (SCHEDULED - Base trip):
  - ID: ${trip1[0].id}
  - Van: ${van.name}
  - Driver: ${driver.firstName} ${driver.surname}
  - Time: 9:00 AM - 2:00 PM
  - Status: SCHEDULED ✅
  - Booking: ${booking1[0].id} (APPROVED)

Trip 2 (PENDING - Conflicting):
  - ID: ${trip2[0].id}
  - Van: ${van.name} (SAME VAN)
  - Driver: ${driver.firstName} ${driver.surname} (SAME DRIVER)
  - Time: 1:00 PM - 5:00 PM (OVERLAPS! ⚠️)
  - Status: PENDING
  - Booking: ${booking2[0].id} (PENDING)

🎯 HOW TO TRIGGER NOTIFICATION:
1. Go to Admin Dashboard → Bookings
2. Find Booking ${booking2[0].id}
3. Click "Approve"
4. Try to assign Driver ${driver.id}
5. ERROR: "Scheduling Conflict: Driver is not available"
6. ✅ NOTIFICATION CREATED in database!
    `);
    console.log("═══════════════════════════════════════════════════════════");

    return {
      trip1Id: trip1[0].id,
      trip2Id: trip2[0].id,
      booking1Id: booking1[0].id,
      booking2Id: booking2[0].id,
    };
  } catch (error) {
    console.error("❌ Error creating test data:", error);
    throw error;
  }
}

// Run the script
createTestConflictData()
  .then(() => {
    console.log("\n✅ Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
