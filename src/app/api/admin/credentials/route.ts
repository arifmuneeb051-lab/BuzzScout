import { NextResponse } from "next/server";
import { formatSafeError } from "@/lib/security";
import { getAdminUser, hashPassword, signJwt, ADMIN_COOKIE_NAME } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized: Admin privileges required" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { newEmail, newPassword } = body;

    if (!newEmail && !newPassword) {
      return NextResponse.json({ error: "Please provide a new email or password to update" }, { status: 400 });
    }

    const updateData: { email?: string; password?: string } = {};

    if (newEmail) {
      const cleanEmail = newEmail.toLowerCase().trim();
      if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
        return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
      }

      // Check if email already taken by another user
      const existing = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });
      if (existing && existing.id !== admin.id) {
        return NextResponse.json({ error: "This email is already in use by another account" }, { status: 400 });
      }

      updateData.email = cleanEmail;
    }

    if (newPassword) {
      const { validatePasswordStrength } = await import("@/lib/security");
      const strength = validatePasswordStrength(newPassword);
      if (!strength.valid) {
        return NextResponse.json({ error: strength.reason || "Password does not meet security requirements" }, { status: 400 });
      }
      updateData.password = await hashPassword(newPassword);
    }

    const updatedUser = await prisma.user.update({
      where: { id: admin.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
      },
    });

    // Re-sign token with updated email
    const token = signJwt({
      userId: updatedUser.id,
      email: updatedUser.email,
      plan: updatedUser.plan,
      role: "ADMIN",
    });

    const response = NextResponse.json({
      success: true,
      message: "Admin credentials successfully updated! Your new login details are active.",
      admin: updatedUser,
    });

    const isLocalhost = req.url.includes("localhost") || req.url.includes("127.0.0.1");
    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" && !isLocalhost,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Admin credentials update error:", err);
    const safeErr = formatSafeError(err);
    return NextResponse.json(safeErr, { status: 500 });
  }
}
