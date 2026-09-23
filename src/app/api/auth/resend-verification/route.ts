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

    if (user && !user.emailVerified) {
      const token = generateSecureToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationToken: token,
          emailVerificationExpires: expiresAt,
        },
      });

      await logSecurityEvent({
        eventType: "EMAIL_VERIFICATION_SENT",
        userId: user.id,
        email: cleanEmail,
        ipAddress: ip,
        userAgent,
        details: `Verification token refreshed. Expires at: ${expiresAt.toISOString()}`,
        severity: "INFO",
      });

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      console.log(`[VERIFICATION_EMAIL_DISPATCH] Verification URL: ${appUrl}/api/auth/verify-email?token=${token}`);
    }

    // Zero user enumeration: Generic response
    return NextResponse.json({
      success: true,
      message: "If that email address is associated with an unverified account, a new verification link has been sent.",
    });
  } catch (err: any) {
    const safeErr = formatSafeError(err, "Resend Verification");
    return NextResponse.json(safeErr, { status: 500 });
  }
}
