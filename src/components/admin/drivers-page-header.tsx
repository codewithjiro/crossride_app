"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";
import { AddDriverModal } from "~/components/admin/add-driver-modal";

export function DriversPageHeader() {
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Drivers</h1>
          <p className="text-gray-400">Manage your transport team</p>
        </div>
        <Button
          onClick={() => setIsAddDriverOpen(true)}
          className="gap-2 bg-[#f1c44f] text-[#071d3a] hover:bg-[#f1c44f]/90"
        >
          <Plus size={20} />
          Add Driver
        </Button>
      </div>

      <AddDriverModal
        isOpen={isAddDriverOpen}
        onClose={() => setIsAddDriverOpen(false)}
        onSuccess={() => setIsAddDriverOpen(false)}
      />
    </>
  );
}
