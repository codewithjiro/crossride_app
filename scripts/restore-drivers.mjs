import postgres from "postgres";

const DATABASE_URL =
  "postgresql://neondb_owner:npg_9yoLDzmTHq5c@ep-fragrant-snow-a1bwj324-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const sql = postgres(DATABASE_URL);

async function main() {
  const drivers = [
    {
      name: "Jiro Gonzales",
      email: "jiro.gonzales@crossride.com",
      phoneNumber: "09171234501",
      licenseNumber: "DL-001",
      role: "Senior Driver",
      experience: "10+ Years",
      specialization: "Fleet Coordinator",
    },
    {
      name: "Jenah Ambagan",
      email: "jenah.ambagan@crossride.com",
      phoneNumber: "09171234502",
      licenseNumber: "DL-002",
      role: "Professional Driver",
      experience: "10+ Years",
      specialization: "Safety Specialist",
    },
    {
      name: "Joyce Manaloto",
      email: "joyce.manaloto@crossride.com",
      phoneNumber: "09171234503",
      licenseNumber: "DL-003",
      role: "Professional Driver",
      experience: "8+ Years",
      specialization: "Route Expert",
    },
    {
      name: "Venice Bumagat",
      email: "venice.bumagat@crossride.com",
      phoneNumber: "09171234504",
      licenseNumber: "DL-004",
      role: "Professional Driver",
      experience: "8+ Years",
      specialization: "Customer Care",
    },
  ];

  console.log("Restoring drivers to database...\n");

  for (const driver of drivers) {
    try {
      const res = await sql`
        INSERT INTO cross_ride_driver (
          name,
          email,
          "phoneNumber",
          "licenseNumber",
          role,
          experience,
          specialization,
          status
        )
        VALUES (
          ${driver.name},
          ${driver.email},
          ${driver.phoneNumber},
          ${driver.licenseNumber},
          ${driver.role},
          ${driver.experience},
          ${driver.specialization},
          'active'
        )
        ON CONFLICT (email) DO NOTHING
        RETURNING id, name;
      `;

      if (res.length > 0) {
        console.log(`✓ Restored: ${driver.name} (ID: ${res[0].id})`);
      } else {
        console.log(`- Already exists: ${driver.name}`);
      }
    } catch (err) {
      console.error(`✗ Error restoring ${driver.name}:`, err.message);
    }
  }

  console.log("\nDone! Drivers have been restored.");
  await sql.end();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
