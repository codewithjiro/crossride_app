"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Edit, Trash2 } from "lucide-react";
import { Card } from "~/components/ui/card";
import { ConfirmationDialog } from "~/components/ui/confirmation-dialog";
import { EditVanModal } from "./edit-van-modal";

interface Van {
  id: number;
  name: string;
  plateNumber: string;
  capacity: number;
  image?: string;
}

export function VansTableWrapper({ vans: initialVans }: { vans: Van[] }) {
  const router = useRouter();
  const [vans, setVans] = useState<Van[]>(initialVans);
  const [editingVan, setEditingVan] = useState<Van | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [vanToDelete, setVanToDelete] = useState<Van | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Refetch vans when refreshKey changes
  useEffect(() => {
    if (refreshKey === 0) return;

    const fetchVans = async () => {
      try {
        const response = await fetch("/api/admin/vans");
        if (response.ok) {
          const data = await response.json();
          setVans(data);
        }
      } catch (err) {
        console.error("Error fetching vans:", err);
      }
    };

    fetchVans();
  }, [refreshKey]);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    router.refresh();
  };

  const handleEdit = (van: Van) => {
    setEditingVan(van);
  };

  const handleDeleteClick = (van: Van) => {
    setVanToDelete(van);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!vanToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/vans/${vanToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        alert(`Error: ${data.error}`);
        return;
      }

      setVans(vans.filter((v) => v.id !== vanToDelete.id));
    } catch (err) {
      alert("Error deleting van");
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
      setVanToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setVanToDelete(null);
  };

  if (vans.length === 0) {
    return (
      <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-8 text-center">
        <p className="text-gray-400">No vans yet. Create one to get started.</p>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {vans.map((van) => (
          <Card
            key={van.id}
            className="border-[#f1c44f]/20 bg-[#0a2540] p-4 transition-all hover:border-[#f1c44f]/40 hover:shadow-lg hover:shadow-[#f1c44f]/10"
          >
            {/* Van Image */}
            <div className="mb-4 flex h-44 w-full items-center justify-center overflow-hidden rounded-lg bg-black/30">
              {van.image ? (
                <Image
                  src={van.image}
                  alt={van.name}
                  width={300}
                  height={240}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#1a3a5c] text-4xl font-bold text-[#f1c44f]">
                  {van.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Van Info */}
            <div className="mb-4 space-y-2">
              <h3 className="text-lg font-bold text-white">{van.name}</h3>
              <div className="space-y-1 text-sm text-gray-400">
                <p>
                  <span className="text-gray-300">Plate:</span>{" "}
                  {van.plateNumber}
                </p>
                <p>
                  <span className="text-gray-300">Capacity:</span>{" "}
                  {van.capacity} seats
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(van)}
                className="flex-1 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-400 transition-colors hover:bg-blue-500/20"
              >
                <Edit size={16} className="mr-1 inline" /> Edit
              </button>
              <button
                onClick={() => handleDeleteClick(van)}
                className="flex-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
              >
                <Trash2 size={16} className="mr-1 inline" /> Delete
              </button>
            </div>
          </Card>
        ))}
      </div>

      <EditVanModal
        isOpen={editingVan !== null}
        van={editingVan}
        onClose={() => setEditingVan(null)}
        onSuccess={() => {
          triggerRefresh();
          setEditingVan(null);
        }}
      />

      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        title="Delete Van"
        description={`Are you sure you want to delete ${vanToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete Van"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={isDeleting}
      />
    </>
  );
}
