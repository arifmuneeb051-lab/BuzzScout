import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { validatePasswordStrength, formatSafeError } from "@/lib/security";
import { logSecurityEvent } from "@/lib/audit-logger";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "127.0.0.1";
  const userAgent = req.headers.get("user-agent");

  try {
    const { token, password } = await req.json();

    if (!token || typeof token !== "string" || token.length < 32) {
      return NextResponse.json(
        { error: "A valid reset token is required." },
        { status: 400 }
      );
    }

    const strength = validatePasswordStrength(password);
    if (!strength.valid) {
      return NextResponse.json(
        { error: strength.reason || "Password does not meet security requirements." },
        { status: 400 }
      );
    }

    const now = new Date();

    // Verify token exists and has not expired
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { gt: now },
      },
    });

    if (!user) {
      await logSecurityEvent({
        eventType: "IDOR_ATTEMPT_DETECTED",
        ipAddress: ip,
        userAgent,
        details: "Attempted password reset with an invalid or expired token.",
        severity: "WARNING",
      });

      return NextResponse.json(
        { error: "Invalid or expired password reset link. Please request a fresh reset link." },
        { status: 400 }
      );
    }

    // Hash the new password with bcrypt salt rounds = 10
    const hashedPassword = await hashPassword(password);

    // Update user password and securely wipe reset token (single-use enforcement)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        failedLoginAttempts: 0,
        lockoutUntil: null,
      },
    });

    await logSecurityEvent({
      eventType: "PASSWORD_RESET_COMPLETED",
      userId: user.id,
      email: user.email,
      ipAddress: ip,
      userAgent,
      details: "Password reset completed successfully. Previous tokens revoked.",
      severity: "INFO",
    });

    return NextResponse.json({
      success: true,
      message: "Password has been successfully updated. You may now sign in with your new password.",
    });
  } catch (err: any) {
    const safeErr = formatSafeError(err, "Reset Password");
    return NextResponse.json(safeErr, { status: 500 });
  }
}
