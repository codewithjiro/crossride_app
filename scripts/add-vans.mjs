import postgres from "postgres";

const DATABASE_URL = "postgresql://neondb_owner:npg_9yoLDzmTHq5c@ep-fragrant-snow-a1bwj324-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const sql = postgres(DATABASE_URL);

async function main() {
  const inserts = [
    {
      name: "Hiace Commuter Deluxe",
      plate: "HCC-002",
      capacity: 14,
    },
    {
      name: "L300 Van",
      plate: "L3V-002",
      capacity: 10,
    },
  ];

  const columns = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'cross_ride_van'
    ORDER BY ordinal_position;
  `;
  console.log('van columns:', columns.map((c) => c.column_name));

  for (const v of inserts) {
    const res = await sql`
      INSERT INTO cross_ride_van (name, "plateNumber", capacity, status)
      VALUES (${v.name}, ${v.plate}, ${v.capacity}, 'active')
      ON CONFLICT ("plateNumber") DO NOTHING
      RETURNING id;
    `;
    console.log(`Upsert ${v.plate}: ${res.length ? 'inserted' : 'exists'}`);
  }

  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
