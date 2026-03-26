import { Suspense } from "react";
import { db } from "~/server/db";
import { Card } from "~/components/ui/card";
import { VansPageHeader } from "~/components/admin/vans-page-header";
import { VansTableWrapper } from "~/components/admin/vans-table-wrapper";

// Force dynamic rendering (no static prerendering)
export const dynamic = "force-dynamic";

async function VansTable() {
  const allVans = await db.query.vans.findMany();

  return <VansTableWrapper vans={allVans} />;
}

export default function VansPage() {
  return (
    <div className="p-8">
      <VansPageHeader />

      <Card className="border-[#f1c44f]/20 bg-[#0a2540]">
        <Suspense
          fallback={<div className="p-8 text-white">Loading vans...</div>}
        >
          <VansTable />
        </Suspense>
      </Card>
    </div>
  );
}
