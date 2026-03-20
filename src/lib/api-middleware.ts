import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCurrentUser, requireAdmin } from "~/lib/auth";

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  role: "user" | "admin";
}

export async function withAuth(
  handler: (req: NextRequest, user: User) => Promise<NextResponse>,
) {
  return async (req: NextRequest) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      return handler(req, user);
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error ? error.message : "Internal Server Error",
        },
        { status: 500 },
      );
    }
  };
}

export async function withAdminAuth(
  handler: (req: NextRequest, user: User) => Promise<NextResponse>,
) {
  return async (req: NextRequest) => {
    try {
      const user = await requireAdmin();
      return handler(req, user);
    } catch (error) {
      if (error instanceof Error && error.message.includes("Forbidden")) {
        return NextResponse.json(
          { error: "Forbidden: Admin access required" },
          { status: 403 },
        );
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  };
}
