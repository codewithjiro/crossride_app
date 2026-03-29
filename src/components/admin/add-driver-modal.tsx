"use client";

import { useState } from "react";
import { Card } from "~/components/ui/card";
import { X, Trash2 } from "lucide-react";
import { DriverImageUpload } from "./driver-image-upload";

const SPECIALIZATION_OPTIONS = [
  "Fleet Coordinator",
  "Safety Specialist",
  "Senior Driver",
  "Premium Driver",
  "Logistics Specialist",
];

interface Driver {
  id: number;
  firstName: string;
  middleName?: string;
  surname: string;
  email: string;
  phoneNumber: string;
  licenseNumber: string;
  experience?: string;
  specialization?: string;
  profileImage?: string;
}

export function AddDriverModal({
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
    firstName: "",
    middleName: "",
    surname: "",
    email: "",
    phoneNumber: "",
    licenseNumber: "",
    experience: "",
    specialization: "",
    profileImage: "",
  });

  const handleUploadComplete = (url: string) => {
    setFormData({ ...formData, profileImage: url });
    setImagePreview(url);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          middleName: formData.middleName || undefined,
          surname: formData.surname,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          licenseNumber: formData.licenseNumber,
          experience: formData.experience || undefined,
          specialization: formData.specialization || undefined,
          profileImage: formData.profileImage || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add driver");
      }

      setFormData({
        firstName: "",
        middleName: "",
        surname: "",
        email: "",
        phoneNumber: "",
        licenseNumber: "",
        experience: "",
        specialization: "",
        profileImage: "",
      });
      setImagePreview(null);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50">
      <Card className="my-8 w-full max-w-md border-[#f1c44f]/20 bg-[#0a2540] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Add Driver</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="custom-scrollbar max-h-[calc(100vh-200px)] space-y-3 overflow-y-auto pr-6"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="w-full rounded-lg border border-[#f1c44f]/20 bg-[#071d3a] px-4 py-2 text-white placeholder-gray-500 focus:border-[#f1c44f]/50 focus:outline-none"
                placeholder="e.g., Jiro"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Middle Name
              </label>
              <input
                type="text"
                value={formData.middleName}
                onChange={(e) =>
                  setFormData({ ...formData, middleName: e.target.value })
                }
                className="w-full rounded-lg border border-[#f1c44f]/20 bg-[#071d3a] px-4 py-2 text-white placeholder-gray-500 focus:border-[#f1c44f]/50 focus:outline-none"
                placeholder="e.g., Carlos"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Surname *
            </label>
            <input
              type="text"
              required
              value={formData.surname}
              onChange={(e) =>
                setFormData({ ...formData, surname: e.target.value })
              }
              className="w-full rounded-lg border border-[#f1c44f]/20 bg-[#071d3a] px-4 py-2 text-white placeholder-gray-500 focus:border-[#f1c44f]/50 focus:outline-none"
              placeholder="e.g., Gonzales"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full rounded-lg border border-[#f1c44f]/20 bg-[#071d3a] px-4 py-2 text-white placeholder-gray-500 focus:border-[#f1c44f]/50 focus:outline-none"
              placeholder="jiro@crossride.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Phone *
            </label>
            <input
              type="tel"
              required
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              className="w-full rounded-lg border border-[#f1c44f]/20 bg-[#071d3a] px-4 py-2 text-white placeholder-gray-500 focus:border-[#f1c44f]/50 focus:outline-none"
              placeholder="09171234567"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              License Number *
            </label>
            <input
              type="text"
              required
              value={formData.licenseNumber}
              onChange={(e) =>
                setFormData({ ...formData, licenseNumber: e.target.value })
              }
              className="w-full rounded-lg border border-[#f1c44f]/20 bg-[#071d3a] px-4 py-2 text-white placeholder-gray-500 focus:border-[#f1c44f]/50 focus:outline-none"
              placeholder="DL-001"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Experience
            </label>
            <input
              type="text"
              value={formData.experience}
              onChange={(e) =>
                setFormData({ ...formData, experience: e.target.value })
              }
              className="w-full rounded-lg border border-[#f1c44f]/20 bg-[#071d3a] px-4 py-2 text-white placeholder-gray-500 focus:border-[#f1c44f]/50 focus:outline-none"
              placeholder="e.g., 10+ Years"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Specialization
            </label>
            <select
              value={formData.specialization}
              onChange={(e) =>
                setFormData({ ...formData, specialization: e.target.value })
              }
              className="w-full rounded-lg border border-[#f1c44f]/20 bg-[#071d3a] px-4 py-2 text-white focus:border-[#f1c44f]/50 focus:outline-none"
            >
              <option value="" className="bg-[#071d3a] text-white">
                -- Select Specialization --
              </option>
              {SPECIALIZATION_OPTIONS.map((spec) => (
                <option
                  key={spec}
                  value={spec}
                  className="bg-[#071d3a] text-white"
                >
                  {spec}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Profile Picture
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
                    setFormData({ ...formData, profileImage: "" });
                    setImagePreview(null);
                  }}
                  className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/20"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            )}
            <DriverImageUpload onUploadComplete={handleUploadComplete} />
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
              {loading ? "Adding..." : "Add Driver"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
