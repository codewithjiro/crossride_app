import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("userId");

    return Response.json({
      success: true,
      message: "Signed out successfully",
    });
  } catch (error) {
    console.error("Sign-out error:", error);
    return Response.json({ error: "Failed to sign out" }, { status: 500 });
  }
}
