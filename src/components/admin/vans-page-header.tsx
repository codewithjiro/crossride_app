"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";
import { AddVanModal } from "~/components/admin/add-van-modal";

export function VansPageHeader() {
  const [isAddVanOpen, setIsAddVanOpen] = useState(false);

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Vans</h1>
          <p className="text-gray-400">Manage your fleet of vehicles</p>
        </div>
        <Button
          onClick={() => setIsAddVanOpen(true)}
          className="gap-2 bg-[#f1c44f] text-[#071d3a] hover:bg-[#f1c44f]/90"
        >
          <Plus size={20} />
          Add Van
        </Button>
      </div>

      <AddVanModal
        isOpen={isAddVanOpen}
        onClose={() => setIsAddVanOpen(false)}
        onSuccess={() => setIsAddVanOpen(false)}
      />
    </>
  );
}
