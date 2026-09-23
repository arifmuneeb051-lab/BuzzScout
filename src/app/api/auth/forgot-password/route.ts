import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateSecureToken } from "@/lib/auth";
import { validateEmail, formatSafeError } from "@/lib/security";
import { logSecurityEvent } from "@/lib/audit-logger";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "127.0.0.1";
  const userAgent = req.headers.get("user-agent");

  try {
    const { email } = await req.json();

    if (!email || !validateEmail(email)) {
      return NextResponse.json(
        { error: "A valid email address is required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (user) {
      // 15-minute expiration strictly enforced
      const resetToken = generateSecureToken();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: resetToken,
          passwordResetExpires: expiresAt,
        },
      });

      await logSecurityEvent({
        eventType: "PASSWORD_RESET_REQUESTED",
        userId: user.id,
        email: cleanEmail,
        ipAddress: ip,
        userAgent,
        details: `Password reset token issued. Expires at: ${expiresAt.toISOString()}`,
        severity: "INFO",
      });

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      console.log(`[PASSWORD_RESET_DISPATCH] Reset URL generated: ${appUrl}/reset-password?token=${resetToken}`);
    } else {
      // Log unrecognized email request for unusual traffic analysis
      await logSecurityEvent({
        eventType: "PASSWORD_RESET_REQUESTED",
        email: cleanEmail,
        ipAddress: ip,
        userAgent,
        details: "Password reset requested for non-existent email address (handled silently)",
        severity: "INFO",
      });
    }

    // Zero User Enumeration: Identical generic message returned regardless of whether the email exists
    return NextResponse.json({
      success: true,
      message: "If that email address exists in our system, a password reset link has been dispatched. The link is valid for 15 minutes.",
    });
  } catch (err: any) {
    const safeErr = formatSafeError(err, "Forgot Password");
    return NextResponse.json(safeErr, { status: 500 });
  }
}
