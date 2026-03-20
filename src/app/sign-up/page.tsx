"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function SignUp() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
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
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to sign up");
        return;
      }

      // Redirect to sign-in
      router.push("/sign-in");
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
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
            <p className="text-sm text-gray-300">Create your account</p>
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
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-200"
              >
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-600 bg-[#071d3a] px-4 py-2 text-white placeholder-gray-400 focus:border-[#f1c44f] focus:outline-none"
                placeholder="John"
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-200"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-600 bg-[#071d3a] px-4 py-2 text-white placeholder-gray-400 focus:border-[#f1c44f] focus:outline-none"
                placeholder="Doe"
              />
            </div>

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

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-200"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
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
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          {/* Sign In Link */}
          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-[#f1c44f] hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
