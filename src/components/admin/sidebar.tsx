"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "~/components/ui/button";
import { ConfirmationDialog } from "~/components/ui/confirmation-dialog";
import {
  LayoutDashboard,
  Truck,
  Users,
  MapPin,
  Briefcase,
  LogOut,
  UserCheck,
  ChevronDown,
} from "lucide-react";

const mainMenuItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    badge: false,
  },
];

const operationsMenuItems = [
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
    badge: false,
  },
  {
    label: "Vans",
    href: "/admin/vans",
    icon: Truck,
    badge: false,
  },
  {
    label: "Drivers",
    href: "/admin/drivers",
    icon: UserCheck,
    badge: false,
  },
  {
    label: "Trips",
    href: "/admin/trips",
    icon: MapPin,
    badge: true, // Shows badge count
  },
  {
    label: "Bookings",
    href: "/admin/bookings",
    icon: Briefcase,
    badge: true, // Shows badge count
  },
];



export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [tripsCount, setTripsCount] = useState(0);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "operations",
  ]);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [tripsRes, bookingsRes] = await Promise.all([
          fetch("/api/admin/trips"),
          fetch("/api/admin/bookings"),
        ]);

        if (tripsRes.ok) {
          const trips = await tripsRes.json();
          const scheduledCount = Array.isArray(trips)
            ? trips.filter((t: any) => t.status === "scheduled").length
            : 0;
          setTripsCount(scheduledCount);
        }

        if (bookingsRes.ok) {
          const bookings = await bookingsRes.json();
          const pendingCount = Array.isArray(bookings)
            ? bookings.filter((b: any) => b.status === "pending").length
            : 0;
          setBookingsCount(pendingCount);
        }
      } catch (error) {
        console.error("Failed to fetch counts:", error);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 2500);
    return () => clearInterval(interval);
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const handleLogout = () => {
    setLogoutConfirmOpen(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/sign-out", {
        method: "POST",
      });
      if (response.ok) {
        router.push("/");
      }
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setIsLoggingOut(false);
      setLogoutConfirmOpen(false);
    }
  };

  const handleCancelLogout = () => {
    setLogoutConfirmOpen(false);
  };

  const renderMenuItem = (item: any) => {
    const Icon = item.icon;
    const isActive = pathname === item.href;
    let badgeCount = 0;

    if (item.badge && item.label === "Trips") {
      badgeCount = tripsCount;
    } else if (item.badge && item.label === "Bookings") {
      badgeCount = bookingsCount;
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`group flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
          isActive
            ? "bg-secondary/15 text-secondary shadow-lg shadow-secondary/10"
            : "text-gray-300 hover:bg-secondary/10 hover:text-secondary"
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon
            size={20}
            className={`transition-transform group-hover:scale-110 ${
              isActive ? "text-secondary" : ""
            }`}
          />
          <span>{item.label}</span>
        </div>
        {badgeCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {badgeCount}
          </span>
        )}
      </Link>
    );
  };

  const renderMenuSection = (
    title: string,
    items: any[],
    sectionId: string
  ) => {
    const isExpanded = expandedSections.includes(sectionId);

    return (
      <div key={sectionId}>
        <button
          onClick={() => toggleSection(sectionId)}
          className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-300 transition-colors"
        >
          <span>{title}</span>
          <ChevronDown
            size={16}
            className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </button>
        {isExpanded && <div className="space-y-1 px-2">{items.map(renderMenuItem)}</div>}
      </div>
    );
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-secondary/20 bg-linear-to-b from-[#0a2540] via-[#0a1f37] to-[#050d1a]">
      {/* Header */}
      <div className="border-b border-secondary/20 p-6">
        <div className="flex items-center gap-3">
          <Image
            src="/images/logohcc-150x150.png"
            alt="logo"
            width={40}
            height={40}
            className="rounded shadow-lg"
          />
          <div>
            <h1 className="text-2xl font-bold text-secondary">CrossRide</h1>
            <p className="text-xs text-gray-400">SaaS Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto border-b border-secondary/10 p-4">
        {/* Main */}
        <div className="space-y-1">
          {mainMenuItems.map(renderMenuItem)}
        </div>

        {/* Operations */}
        {renderMenuSection("Operations", operationsMenuItems, "operations")}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-secondary/20 p-4 space-y-2">
        <Button
          onClick={handleLogout}
          disabled={isLoggingOut}
          variant="outline"
          className="w-full gap-2 bg-red-600/20 text-red-400 hover:bg-red-600/40 hover:text-red-300 border-red-600/40 disabled:opacity-50"
        >
          <LogOut size={18} />
          Logout
        </Button>
      </div>

      <ConfirmationDialog
        isOpen={logoutConfirmOpen}
        title="Logout"
        description="Are you sure you want to logout? You will be signed out of your account."
        confirmText="Logout"
        cancelText="Cancel"
        isDangerous={false}
        isLoading={isLoggingOut}
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />
    </aside>
  );
}
