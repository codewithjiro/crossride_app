"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { User, Mail, Phone, Lock, LogOut } from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  createdAt?: Date;
}

export default function UserProfile() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch("/api/auth/check");
        if (response.ok) {
          const data = (await response.json()) as {
            authenticated: boolean;
            user?: {
              id: string;
              email: string;
              firstName?: string;
              lastName?: string;
              phoneNumber?: string;
              createdAt?: string;
            };
          };
          if (data.authenticated && data.user) {
            setUserProfile({
              id: data.user.id,
              name:
                `${data.user.firstName || ""} ${data.user.lastName || ""}`.trim() ||
                "User",
              email: data.user.email,
              phoneNumber: data.user.phoneNumber,
              createdAt: data.user.createdAt
                ? new Date(data.user.createdAt)
                : undefined,
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchUserProfile();
  }, []);

  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/auth/sign-out", {
        method: "POST",
      });
      if (response.ok) {
        router.push("/sign-in");
      }
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#071d3a] p-8">
        <p className="text-white">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#071d3a] p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Profile Settings</h1>
          <p className="mt-2 text-gray-400">Manage your account information</p>
        </div>

        {/* Personal Information */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-8 lg:col-span-2">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h2 className="mb-6 text-2xl font-bold text-white">
                  Personal Information
                </h2>

                {/* Name */}
                <div className="mb-6">
                  <label className="mb-2 flex items-center gap-2 text-sm text-gray-400">
                    <User size={16} />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={userProfile?.name ?? ""}
                    disabled
                    className="w-full cursor-not-allowed rounded border border-[#f1c44f]/20 bg-[#071d3a] px-4 py-2 text-white disabled:opacity-50"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Update in account settings.
                  </p>
                </div>

                {/* Email */}
                <div className="mb-6">
                  <label className="mb-2 flex items-center gap-2 text-sm text-gray-400">
                    <Mail size={16} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={userProfile?.email ?? ""}
                    disabled
                    className="w-full cursor-not-allowed rounded border border-[#f1c44f]/20 bg-[#071d3a] px-4 py-2 text-white disabled:opacity-50"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Primary email address
                  </p>
                </div>

                {/* Phone */}
                <div className="mb-6">
                  <label className="mb-2 flex items-center gap-2 text-sm text-gray-400">
                    <Phone size={16} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={userProfile?.phoneNumber ?? "Not set"}
                    disabled
                    className="w-full cursor-not-allowed rounded border border-[#f1c44f]/20 bg-[#071d3a] px-4 py-2 text-white disabled:opacity-50"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Contact number for bookings
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Account Status */}
        <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-8">
          <h3 className="mb-4 text-lg font-bold text-white">Account Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Account Type</span>
              <Badge className="bg-blue-500/20 text-blue-400">Passenger</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Account Status</span>
              <Badge className="bg-green-500/20 text-green-400">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Member Since</span>
              <span className="text-white">
                {userProfile?.createdAt
                  ? userProfile.createdAt.toLocaleDateString()
                  : "Unknown"}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
