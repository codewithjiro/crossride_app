"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  LayoutDashboard,
  MapPin,
  Ticket,
  History,
  User,
  LogOut,
} from "lucide-react";

const navigationItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Available Trips",
    href: "/available-trips",
    icon: MapPin,
  },
  {
    label: "My Bookings",
    href: "/my-bookings",
    icon: Ticket,
  },
  {
    label: "Trip History",
    href: "/trip-history",
    icon: History,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: User,
  },
];

export function LayoutSidebar() {
  const pathname = usePathname();
  const router = useRouter();

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

  return (
    <aside className="w-64 bg-[#0a2540] border-r border-[#f1c44f]/20 flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-[#f1c44f]/20">
        <h1 className="text-2xl font-bold text-[#f1c44f]">CrossRide</h1>
        <p className="text-gray-400 text-sm mt-1">Passenger Portal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 ${
                  isActive
                    ? "bg-[#f1c44f] text-[#071d3a] hover:bg-[#f1c44f]/90"
                    : "text-gray-400 hover:text-white hover:bg-[#f1c44f]/10"
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-[#f1c44f]/20 space-y-4">
        <Separator className="bg-[#f1c44f]/20" />
        <Button 
          onClick={handleSignOut}
          className="w-full gap-2 bg-red-500/20 text-red-400 hover:bg-red-500/30"
        >
          <LogOut size={20} />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
