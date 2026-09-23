import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./db";
import { isTokenRevoked } from "./token-blacklist";

import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = "buzzscout_session";
const ADMIN_COOKIE_NAME = "buzzscout_admin_session";
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds
export const SESSION_EXPIRY = "7d";

export interface SessionPayload {
  userId: string;
  email: string;
  plan: string;
  planStatus?: string;
  role?: string;
  avatarUrl?: string | null;
  authProvider?: "GOOGLE" | "CREDENTIALS";
}

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signJwt(payload: SessionPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("CRITICAL: JWT_SECRET environment variable is missing.");
  }
  return jwt.sign(payload, secret, { expiresIn: SESSION_EXPIRY });
}

export function verifyJwt(token: string): SessionPayload | null {
  if (!token || isTokenRevoked(token)) return null;
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  try {
    return jwt.verify(token, secret) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) return null;

    const payload = verifyJwt(token);
    if (!payload?.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        googleId: true,
        productName: true,
        productUrl: true,
        productPitch: true,
        plan: true,
        planStatus: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (!user) return null;

    // If user has been blocked/suspended by admin, revoke session
    if (user.role !== "ADMIN" && user.planStatus === "SUSPENDED") {
      return null;
    }

    // Clean any legacy Master Owner suffix so user displays cleanly as a normal founder
    if (user.name && user.name.includes("(Master Owner)")) {
      const cleanName = user.name.replace(/\s*\(Master Owner\)/gi, "").trim() || "Muneeb";
      user.name = cleanName;
      // Auto-heal database record in the background
      prisma.user.update({
        where: { id: user.id },
        data: { name: cleanName },
      }).catch(() => {});
    }

    return user;
  } catch (err) {
    console.error("Failed to get current user:", err);
    return null;
  }
}

export const MASTER_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || process.env.ADMIN_ID || "").toLowerCase().trim();

export async function getAdminUser() {
  try {
    const cookieStore = await cookies();
    // Check either admin dedicated cookie or main session cookie
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value || cookieStore.get(COOKIE_NAME)?.value;

    if (!token) return null;

    const payload = verifyJwt(token);
    if (!payload?.userId) return null;

    // STRICT REQUIREMENT: Master SuperUser MUST authenticate via Google Sign-In
    if (payload.authProvider !== "GOOGLE") {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        planStatus: true,
        googleId: true,
        createdAt: true,
      },
    });

    // Strictly enforce: Role must be ADMIN, email matches MASTER_ADMIN_EMAIL, and googleId is attached
    if (
      user &&
      user.role === "ADMIN" &&
      user.googleId &&
      MASTER_ADMIN_EMAIL &&
      user.email.toLowerCase().trim() === MASTER_ADMIN_EMAIL
    ) {
      return user;
    }
    return null;
  } catch (err) {
    console.error("Failed to verify admin user:", err);
    return null;
  }
}

export { COOKIE_NAME, ADMIN_COOKIE_NAME };
