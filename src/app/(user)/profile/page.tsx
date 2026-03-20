"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { User, Mail, Phone, Lock, LogOut } from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";

interface UserProfile {
  name: string;
  email: string;
  phoneNumber?: string;
}

export default function UserProfile() {
  const { user } = useUser();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch("/api/auth/check");
        if (response.ok) {
          const data = (await response.json()) as { authenticated: boolean };
          if (data.authenticated && user) {
            setUserProfile({
              name: user.fullName ?? "User",
              email: user.emailAddresses?.[0]?.emailAddress ?? "",
              phoneNumber: user.phoneNumbers?.[0]?.phoneNumber ?? "",
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      void fetchUserProfile();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#071d3a] p-8 flex items-center justify-center">
        <p className="text-white">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#071d3a] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Profile Settings</h1>
          <p className="text-gray-400 mt-2">Manage your account information</p>
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-[#0a2540] border-[#f1c44f]/20 p-8 lg:col-span-2">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-6">Personal Information</h2>

                {/* Name */}
                <div className="mb-6">
                  <label className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                    <User size={16} />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={userProfile?.name ?? ""}
                    disabled
                    className="w-full px-4 py-2 bg-[#071d3a] border border-[#f1c44f]/20 rounded text-white disabled:opacity-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Connected to Clerk account. Update in account settings.
                  </p>
                </div>

                {/* Email */}
                <div className="mb-6">
                  <label className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                    <Mail size={16} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={userProfile?.email ?? ""}
                    disabled
                    className="w-full px-4 py-2 bg-[#071d3a] border border-[#f1c44f]/20 rounded text-white disabled:opacity-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Primary email address</p>
                </div>

                {/* Phone */}
                <div className="mb-6">
                  <label className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                    <Phone size={16} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={userProfile?.phoneNumber ?? "Not set"}
                    disabled
                    className="w-full px-4 py-2 bg-[#071d3a] border border-[#f1c44f]/20 rounded text-white disabled:opacity-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Contact number for bookings</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Security Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-[#0a2540] border-[#f1c44f]/20 p-8">
            <div className="flex items-start gap-4">
              <Lock className="text-[#f1c44f] mt-1" size={24} />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">Password</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Manage your password and security settings
                </p>
                <Button className="text-[#f1c44f] border border-[#f1c44f] hover:bg-[#f1c44f]/10">
                  Change Password
                </Button>
              </div>
            </div>
          </Card>

          <Card className="bg-[#0a2540] border-[#f1c44f]/20 p-8">
            <div className="flex items-start gap-4">
              <LogOut className="text-red-400 mt-1" size={24} />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">Sign Out</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Sign out from your account on this device
                </p>
                <SignOutButton>
                  <Button className="text-red-400 border border-red-400 hover:bg-red-400/10">
                    Sign Out Now
                  </Button>
                </SignOutButton>
              </div>
            </div>
          </Card>
        </div>

        {/* Account Status */}
        <Card className="bg-[#0a2540] border-[#f1c44f]/20 p-8">
          <h3 className="text-lg font-bold text-white mb-4">Account Status</h3>
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
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
