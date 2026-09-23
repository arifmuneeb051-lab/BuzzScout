import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signJwt, COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/auth";
import { checkRateLimit, formatSafeError } from "@/lib/security";
import { logSecurityEvent } from "@/lib/audit-logger";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "127.0.0.1";
  const userAgent = req.headers.get("user-agent");

  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and 6-digit verification code are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      return NextResponse.json(
        { error: "Verification code must be exactly 6 digits." },
        { status: 400 }
      );
    }

    // Rate Limiting: 5 attempts per 5 minutes per IP & Email
    const rateKey = `${ip}:${cleanEmail}:otp_verify`;
    const rate = checkRateLimit(rateKey, 5, 5 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          error: `Too many invalid code attempts. Please wait ${rate.retryAfterSeconds} seconds before trying again.`,
          retryAfter: rate.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid verification code or email not found." },
        { status: 400 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: "Email is already verified. You can proceed to login.",
        alreadyVerified: true,
      });
    }

    const now = new Date();
    if (!user.emailVerificationToken || user.emailVerificationToken !== cleanOtp) {
      await logSecurityEvent({
        eventType: "IDOR_ATTEMPT_DETECTED",
        userId: user.id,
        email: cleanEmail,
        ipAddress: ip,
        userAgent,
        details: "Incorrect 6-digit OTP code entered during signup verification",
        severity: "WARNING",
      });

      return NextResponse.json(
        { error: "Invalid verification code. Please check your email or request a new code." },
        { status: 400 }
      );
    }

    if (user.emailVerificationExpires && user.emailVerificationExpires < now) {
      return NextResponse.json(
        { error: "Verification code has expired. Please click 'Resend Code' to receive a new one." },
        { status: 400 }
      );
    }

    // OTP is valid -> Mark user emailVerified = true and clear OTP fields
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    await logSecurityEvent({
      eventType: "EMAIL_VERIFIED",
      userId: updatedUser.id,
      email: updatedUser.email,
      ipAddress: ip,
      userAgent,
      details: "Email successfully verified via 6-digit OTP code",
      severity: "INFO",
    });

    // Issue full 7-day session token
    const token = signJwt({
      userId: updatedUser.id,
      email: updatedUser.email,
      plan: updatedUser.plan,
      planStatus: updatedUser.planStatus,
      role: updatedUser.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Email verified successfully! Welcome to BuzzScout.",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        plan: updatedUser.plan,
        planStatus: updatedUser.planStatus,
        emailVerified: true,
      },
    });

    const isLocalhost = req.url.includes("localhost") || req.url.includes("127.0.0.1");
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" && !isLocalhost,
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (err: any) {
    const safeErr = formatSafeError(err, "Verify OTP");
    return NextResponse.json(safeErr, { status: 500 });
  }
}
