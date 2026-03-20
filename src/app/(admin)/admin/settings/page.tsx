"use client";

import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Settings as SettingsIcon, Bell, Lock, Database } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">Settings</h1>
        <p className="text-gray-400">Configure system settings and preferences</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* General Settings */}
        <Card className="bg-[#0a2540] border-[#f1c44f]/20 p-6">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <SettingsIcon size={24} className="text-[#f1c44f] flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-white">General Settings</h2>
                <p className="text-gray-400 text-sm mt-1">Configure system-wide preferences</p>
              </div>
            </div>
            <Button variant="outline" className="border-[#f1c44f]/50 text-[#f1c44f]">
              Configure
            </Button>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="bg-[#0a2540] border-[#f1c44f]/20 p-6">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <Bell size={24} className="text-[#f1c44f] flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-white">Notifications</h2>
                <p className="text-gray-400 text-sm mt-1">Manage alert preferences</p>
              </div>
            </div>
            <Button variant="outline" className="border-[#f1c44f]/50 text-[#f1c44f]">
              Configure
            </Button>
          </div>
        </Card>

        {/* Security */}
        <Card className="bg-[#0a2540] border-[#f1c44f]/20 p-6">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <Lock size={24} className="text-[#f1c44f] flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-white">Security</h2>
                <p className="text-gray-400 text-sm mt-1">Manage access control and permissions</p>
              </div>
            </div>
            <Button variant="outline" className="border-[#f1c44f]/50 text-[#f1c44f]">
              Configure
            </Button>
          </div>
        </Card>

        {/* Database */}
        <Card className="bg-[#0a2540] border-[#f1c44f]/20 p-6">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <Database size={24} className="text-[#f1c44f] flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-white">Database</h2>
                <p className="text-gray-400 text-sm mt-1">Backup and maintenance</p>
              </div>
            </div>
            <Button variant="outline" className="border-[#f1c44f]/50 text-[#f1c44f]">
              Configure
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
