import { hash, compare } from "bcryptjs";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return hash(password, saltRounds);
}

// Compare password with hash
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}

// Get user by email
export async function getUserByEmail(email: string) {
  return db.query.users.findFirst({
    where: eq(users.email, email),
  });
}

// Get user by ID
export async function getUserById(id: string) {
  return db.query.users.findFirst({
    where: eq(users.id, id),
  });
}

// Type for session user
export interface SessionUser {
  id: string;
  email: string;
  role: "user" | "admin";
  firstName?: string;
  lastName?: string;
}
