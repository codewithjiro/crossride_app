const driverId = process.env.ADMIN_ID || "user_test123"; // Use a placeholder for testing

const driversToRestore = [
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

async function restoreDrivers() {
  console.log("Restoring drivers...\n");

  for (const driver of driversToRestore) {
    try {
      const response = await fetch("http://localhost:3001/api/admin/drivers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(driver),
      });

      if (response.ok) {
        const created = await response.json();
        console.log(`✓ Created: ${driver.name} (ID: ${created.id})`);
      } else {
        const error = await response.json();
        console.log(`✗ Failed to create ${driver.name}: ${error.error}`);
      }
    } catch (err) {
      console.error(`✗ Error creating ${driver.name}:`, err);
    }
  }

  console.log("\nDone!");
}

restoreDrivers();
