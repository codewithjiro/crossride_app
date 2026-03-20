"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutSidebar } from "~/components/user/sidebar";

interface AuthResponse {
  authenticated: boolean;
  role?: string;
  userId?: string;
}

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check");
        if (response.ok) {
          const data = (await response.json()) as AuthResponse;
          if (data.authenticated && data.role === "user") {
            setIsAuthenticated(true);
          } else {
            // Redirect to sign-in if not authenticated or is admin
            void router.push("/sign-in");
          }
        } else {
          void router.push("/sign-in");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        void router.push("/sign-in");
      } finally {
        setLoading(false);
      }
    };

    void checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#071d3a]">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-[#071d3a] flex">
      <LayoutSidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
