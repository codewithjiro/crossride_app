import { db } from "./src/server/db/index.ts";

async function checkDrivers() {
  try {
    const drivers = await db.query.drivers.findMany();
    console.log("Drivers in database:", drivers.length);
    drivers.forEach((d) => {
      console.log(`- ${d.id}: ${d.name} (${d.role})`);
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

checkDrivers();
