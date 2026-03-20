"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface SignInResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    role: "admin" | "user";
    firstName?: string;
    lastName?: string;
  };
}

export default function SignIn() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = (await response.json()) as SignInResponse & {
        error?: string;
      };

      if (!response.ok) {
        setError(data.error ?? "Failed to sign in");
        return;
      }

      // Redirect based on role
      const redirectPath =
        data.user.role === "admin" ? "/admin/dashboard" : "/dashboard";
      router.push(redirectPath);
      router.refresh();
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Demo credentials
  const fillDemoAdmin = () => {
    setFormData({
      email: "admin@crossride.com",
      password: "password123",
    });
  };

  const fillDemoUser = () => {
    setFormData({
      email: "user@crossride.com",
      password: "password123",
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#071d3a] to-[#0a2540] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-[#f1c44f]/20 bg-[#0a2540]/50 p-8 backdrop-blur-sm">
          {/* Back Button */}
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-[#f1c44f]"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-white">CrossRide</h1>
            <p className="text-sm text-gray-300">Sign in to your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-200"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-600 bg-[#071d3a] px-4 py-2 text-white placeholder-gray-400 focus:border-[#f1c44f] focus:outline-none"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-200"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-600 bg-[#071d3a] px-4 py-2 text-white placeholder-gray-400 focus:border-[#f1c44f] focus:outline-none"
                placeholder="••••••"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#f1c44f] font-semibold text-[#071d3a] hover:bg-[#f1c44f]/90"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6 border-t border-gray-600 pt-6">
            <p className="mb-3 text-center text-xs text-gray-400">
              DEMO ACCOUNTS
            </p>
            <button
              onClick={fillDemoAdmin}
              className="mb-2 w-full rounded-lg border border-blue-500/30 bg-blue-600/20 px-3 py-2 text-xs font-medium text-blue-300 hover:bg-blue-600/30"
            >
              Fill Admin (admin@crossride.com)
            </button>
            <button
              onClick={fillDemoUser}
              className="w-full rounded-lg border border-green-500/30 bg-green-600/20 px-3 py-2 text-xs font-medium text-green-300 hover:bg-green-600/30"
            >
              Fill User (user@crossride.com)
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-[#f1c44f] hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
