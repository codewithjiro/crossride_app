import { cookies } from "next/headers";
import { verifyPassword, getUserByEmail } from "~/lib/auth";

interface SignInRequest {
  email?: string;
  password?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SignInRequest;
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    // Find user
    const user = await getUserByEmail(email);
    if (!user) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Create session cookie
    const cookieStore = await cookies();
    cookieStore.set("userId", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // Return user (without password)
    const { password: _, ...userWithoutPassword } = user;
    return Response.json({
      success: true,
      message: "Signed in successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Sign-in error:", error);
    return Response.json({ error: "Failed to sign in" }, { status: 500 });
  }
}
