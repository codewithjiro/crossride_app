"use client";

import { useState } from "react";
import { Card } from "~/components/ui/card";
import { X, Trash2 } from "lucide-react";
import { VanImageUpload } from "./van-image-upload";

export function AddVanModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    plateNumber: "",
    capacity: "",
    image: "",
  });

  const handleUploadComplete = (url: string) => {
    setFormData({ ...formData, image: url });
    setImagePreview(url);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/vans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          plateNumber: formData.plateNumber,
          capacity: parseInt(formData.capacity),
          image: formData.image || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add van");
      }

      setFormData({ name: "", plateNumber: "", capacity: "", image: "" });
      setImagePreview(null);
      onClose();
      onSuccess();
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md border-[#f1c44f]/20 bg-[#0a2540] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Add Van</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="custom-scrollbar max-h-[calc(100vh-200px)] space-y-4 overflow-y-auto pr-6"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Van Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full rounded-lg border border-[#f1c44f]/20 bg-[#071d3a] px-4 py-2 text-white placeholder-gray-500 focus:border-[#f1c44f]/50 focus:outline-none"
              placeholder="e.g., Hiace Commuter Deluxe #1"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Plate Number
            </label>
            <input
              type="text"
              required
              value={formData.plateNumber}
              onChange={(e) =>
                setFormData({ ...formData, plateNumber: e.target.value })
              }
              className="w-full rounded-lg border border-[#f1c44f]/20 bg-[#071d3a] px-4 py-2 text-white placeholder-gray-500 focus:border-[#f1c44f]/50 focus:outline-none"
              placeholder="e.g., HCC-001"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Capacity (seats)
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.capacity}
              onChange={(e) =>
                setFormData({ ...formData, capacity: e.target.value })
              }
              className="w-full rounded-lg border border-[#f1c44f]/20 bg-[#071d3a] px-4 py-2 text-white placeholder-gray-500 focus:border-[#f1c44f]/50 focus:outline-none"
              placeholder="e.g., 14"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Van Picture
            </label>
            {imagePreview && (
              <div className="mb-3 flex items-end gap-3">
                <div className="overflow-hidden rounded-lg">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-24 w-24 rounded-lg object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, image: "" });
                    setImagePreview(null);
                  }}
                  className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/20"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            )}
            <VanImageUpload onUploadComplete={handleUploadComplete} />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-[#f1c44f]/20 px-4 py-2 text-white hover:bg-[#0a2540]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-[#f1c44f] px-4 py-2 font-semibold text-[#071d3a] hover:bg-[#f1c44f]/90 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Van"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
