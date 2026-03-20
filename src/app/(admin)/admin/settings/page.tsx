"use client";

import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Settings as SettingsIcon, Bell, Lock, Database } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">Settings</h1>
        <p className="text-gray-400">
          Configure system settings and preferences
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* General Settings */}
        <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-6">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <SettingsIcon
                size={24}
                className="mt-1 flex-shrink-0 text-[#f1c44f]"
              />
              <div>
                <h2 className="text-xl font-bold text-white">
                  General Settings
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  Configure system-wide preferences
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-[#f1c44f]/50 text-[#f1c44f]"
            >
              Configure
            </Button>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-6">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <Bell size={24} className="mt-1 flex-shrink-0 text-[#f1c44f]" />
              <div>
                <h2 className="text-xl font-bold text-white">Notifications</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Manage alert preferences
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-[#f1c44f]/50 text-[#f1c44f]"
            >
              Configure
            </Button>
          </div>
        </Card>

        {/* Security */}
        <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-6">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <Lock size={24} className="mt-1 flex-shrink-0 text-[#f1c44f]" />
              <div>
                <h2 className="text-xl font-bold text-white">Security</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Manage access control and permissions
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-[#f1c44f]/50 text-[#f1c44f]"
            >
              Configure
            </Button>
          </div>
        </Card>

        {/* Database */}
        <Card className="border-[#f1c44f]/20 bg-[#0a2540] p-6">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <Database
                size={24}
                className="mt-1 flex-shrink-0 text-[#f1c44f]"
              />
              <div>
                <h2 className="text-xl font-bold text-white">Database</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Backup and maintenance
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-[#f1c44f]/50 text-[#f1c44f]"
            >
              Configure
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
