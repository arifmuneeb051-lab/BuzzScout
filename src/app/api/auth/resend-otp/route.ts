import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkRateLimit, formatSafeError } from "@/lib/security";
import { logSecurityEvent } from "@/lib/audit-logger";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "127.0.0.1";
  const userAgent = req.headers.get("user-agent");

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Rate limit: 1 resend per 60 seconds per email
    const rateKey = `${ip}:${cleanEmail}:resend_otp`;
    const rate = checkRateLimit(rateKey, 1, 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          error: `Please wait ${rate.retryAfterSeconds} seconds before requesting a new code.`,
          retryAfter: rate.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    let newOtp = "";
    if (user && !user.emailVerified) {
      newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationToken: newOtp,
          emailVerificationExpires: expiresAt,
        },
      });

      console.log(`[RESEND_EMAIL_OTP] 6-digit OTP for ${cleanEmail}: ${newOtp}`);

      await logSecurityEvent({
        eventType: "EMAIL_VERIFICATION_SENT",
        userId: user.id,
        email: cleanEmail,
        ipAddress: ip,
        userAgent,
        details: `Fresh 6-digit OTP issued. Expires at: ${expiresAt.toISOString()}`,
        severity: "INFO",
      });
    }

    const isDev = process.env.NODE_ENV !== "production" || cleanEmail.endsWith(".local") || cleanEmail.includes("test");

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a fresh 6-digit code has been sent.",
      devOtp: (isDev && newOtp) ? newOtp : undefined,
    });
  } catch (err: any) {
    const safeErr = formatSafeError(err, "Resend OTP");
    return NextResponse.json(safeErr, { status: 500 });
  }
}
