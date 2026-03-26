import { Suspense } from "react";
import { db } from "~/server/db";
import { Card } from "~/components/ui/card";
import { DriversPageHeader } from "~/components/admin/drivers-page-header";
import { DriversTableWrapper } from "~/components/admin/drivers-table-wrapper";

// Force dynamic rendering (no static prerendering)
export const dynamic = "force-dynamic";

async function DriversTable() {
  const allDrivers = await db.query.drivers.findMany();

  return <DriversTableWrapper drivers={allDrivers} />;
}

export default function DriversPage() {
  return (
    <div className="p-8">
      <DriversPageHeader />

      <Card className="border-[#f1c44f]/20 bg-[#0a2540]">
        <Suspense
          fallback={<div className="p-8 text-white">Loading drivers...</div>}
        >
          <DriversTable />
        </Suspense>
      </Card>
    </div>
  );
}
