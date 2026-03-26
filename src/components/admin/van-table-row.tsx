"use client";

import { useState } from "react";
import Image from "next/image";
import { Edit, Trash2 } from "lucide-react";
import { ConfirmationDialog } from "~/components/ui/confirmation-dialog";

interface Van {
  id: number;
  name: string;
  plateNumber: string;
  capacity: number;
  image?: string;
}

export function VanTableRow({
  van,
  onEdit,
  onDelete,
}: {
  van: Van;
  onEdit: (van: Van) => void;
  onDelete: (vanId: number, vanName: string) => Promise<void>;
}) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(van.id, van.name);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
  };

  return (
    <tr className="border-b border-[#f1c44f]/10 transition-colors hover:bg-[#0a2540]/50">
      <td className="px-6 py-4 align-top">
        <div className="h-16 w-16 overflow-hidden rounded-full bg-[#0a2540]">
          {van.image ? (
            <Image
              src={van.image}
              alt={van.name}
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#1a3a5c] text-xl font-semibold text-[#f1c44f]">
              {van.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 align-middle font-medium text-white">
        {van.name}
      </td>
      <td className="px-6 py-4 align-middle text-gray-300">
        {van.plateNumber}
      </td>
      <td className="px-6 py-4 align-middle text-gray-300">
        {van.capacity} seats
      </td>
      <td className="flex items-center gap-2 px-6 py-4">
        <button
          onClick={() => onEdit(van)}
          className="rounded-lg p-2 text-blue-400 transition-colors hover:bg-blue-500/20"
        >
          <Edit size={18} />
        </button>
        <button
          onClick={handleDeleteClick}
          className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/20"
        >
          <Trash2 size={18} />
        </button>
      </td>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Van"
        description={`Are you sure you want to delete ${van.name}? This action cannot be undone.`}
        confirmText="Delete Van"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={isDeleting}
      />
    </tr>
  );
}
