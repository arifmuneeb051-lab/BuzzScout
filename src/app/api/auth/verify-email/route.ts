import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { formatSafeError } from "@/lib/security";
import { logSecurityEvent } from "@/lib/audit-logger";

export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "127.0.0.1";
  const userAgent = req.headers.get("user-agent");
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token || token.length < 32) {
    return NextResponse.json(
      { error: "Invalid verification token." },
      { status: 400 }
    );
  }

  try {
    const now = new Date();
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: { gt: now },
      },
    });

    if (!user) {
      await logSecurityEvent({
        eventType: "IDOR_ATTEMPT_DETECTED",
        ipAddress: ip,
        userAgent,
        details: "Invalid or expired email verification token probed",
        severity: "WARNING",
      });

      return NextResponse.json(
        { error: "This email verification link is invalid or has expired. Please request a new one." },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    await logSecurityEvent({
      eventType: "EMAIL_VERIFIED",
      userId: user.id,
      email: user.email,
      ipAddress: ip,
      userAgent,
      details: "Email address successfully verified via token",
      severity: "INFO",
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(new URL("/login?verified=true", appUrl));
  } catch (err: any) {
    const safeErr = formatSafeError(err, "Verify Email GET");
    return NextResponse.json(safeErr, { status: 500 });
  }
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "127.0.0.1";
  const userAgent = req.headers.get("user-agent");

  try {
    const { token } = await req.json();

    if (!token || typeof token !== "string" || token.length < 32) {
      return NextResponse.json(
        { error: "Invalid verification token." },
        { status: 400 }
      );
    }

    const now = new Date();
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: { gt: now },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "This email verification link is invalid or has expired." },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    await logSecurityEvent({
      eventType: "EMAIL_VERIFIED",
      userId: user.id,
      email: user.email,
      ipAddress: ip,
      userAgent,
      details: "Email verified successfully via API POST",
      severity: "INFO",
    });

    return NextResponse.json({
      success: true,
      message: "Your email has been verified successfully. You can now access all features.",
    });
  } catch (err: any) {
    const safeErr = formatSafeError(err, "Verify Email POST");
    return NextResponse.json(safeErr, { status: 500 });
  }
}
