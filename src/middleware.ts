import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserById } from "~/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes
  const publicRoutes = ["/sign-in", "/sign-up", "/"];

  // Check if route is public
  if (publicRoutes.includes(pathname)) {
    // If user is logged in and trying to access auth pages, redirect to dashboard
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (userId && (pathname === "/sign-in" || pathname === "/sign-up")) {
      const user = await getUserById(userId);
      if (user) {
        const redirectPath = user.role === "admin" ? "/admin/dashboard" : "/dashboard";
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    }

    return NextResponse.next();
  }

  // Protected routes
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Verify user exists
  const user = await getUserById(userId);
  if (!user) {
    // User doesn't exist, clear cookie and redirect
    const response = NextResponse.redirect(new URL("/sign-in", request.url));
    response.cookies.delete("userId");
    return response;
  }

  // Check role-based access
  if (pathname.startsWith("/admin") && user.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname.startsWith("/dashboard") && user.role === "admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|api|public).*)",
  ],
};
