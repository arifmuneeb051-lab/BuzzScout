import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, signJwt, COOKIE_NAME, ADMIN_COOKIE_NAME, MASTER_ADMIN_EMAIL, SESSION_MAX_AGE } from "@/lib/auth";
import { formatSafeError } from "@/lib/security";
import { logSecurityEvent } from "@/lib/audit-logger";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "127.0.0.1";
  const userAgent = req.headers.get("user-agent");

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // STRICT OWNER RESTRICTION: Master Administrator is prohibited from using manual password login.
    // Must authenticate exclusively through verified Google OAuth.
    if (MASTER_ADMIN_EMAIL && cleanEmail === MASTER_ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json(
        {
          error: "Security Policy: Master Administrator account is protected by OAuth. You must sign in exclusively via 'Sign in with Google'.",
        },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    // Zero user enumeration check
    if (!user) {
      await logSecurityEvent({
        eventType: "AUTH_LOGIN_FAILURE",
        email: cleanEmail,
        ipAddress: ip,
        userAgent,
        details: "Login attempt with non-existent email address",
        severity: "WARNING",
      });

      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Account lockout enforcement (5 consecutive failed attempts lock account for 15 mins)
    const now = new Date();
    if (user.lockoutUntil && user.lockoutUntil > now) {
      const waitSeconds = Math.ceil((user.lockoutUntil.getTime() - now.getTime()) / 1000);
      await logSecurityEvent({
        eventType: "AUTH_LOCKOUT_TRIGGERED",
        userId: user.id,
        email: user.email,
        ipAddress: ip,
        userAgent,
        details: `Login attempted on locked-out account. Remaining lockout: ${waitSeconds}s`,
        severity: "WARNING",
      });

      return NextResponse.json(
        {
          error: `Account temporarily locked due to excessive failed attempts. Please retry in ${Math.ceil(waitSeconds / 60)} minutes or reset your password.`,
        },
        { status: 429 }
      );
    }

    // Admin suspension check
    if (user.role !== "ADMIN" && user.planStatus === "SUSPENDED") {
      await logSecurityEvent({
        eventType: "AUTH_LOGIN_FAILURE",
        userId: user.id,
        email: user.email,
        ipAddress: ip,
        userAgent,
        details: "Login attempt on administratively suspended account",
        severity: "WARNING",
      });

      return NextResponse.json(
        { error: "Access Denied: Your account has been suspended by the administrator. Contact support." },
        { status: 403 }
      );
    }

    // Constant-time bcrypt verification
    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      const newFailedCount = (user.failedLoginAttempts || 0) + 1;
      let newLockout: Date | null = null;

      if (newFailedCount >= 5) {
        newLockout = new Date(Date.now() + 15 * 60 * 1000); // 15-minute lock
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newFailedCount,
          lockoutUntil: newLockout,
        },
      });

      await logSecurityEvent({
        eventType: newFailedCount >= 5 ? "AUTH_LOCKOUT_TRIGGERED" : "AUTH_LOGIN_FAILURE",
        userId: user.id,
        email: user.email,
        ipAddress: ip,
        userAgent,
        details: `Failed password attempt (${newFailedCount}/5)${newLockout ? " - Account locked for 15 mins" : ""}`,
        severity: "WARNING",
      });

      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Password valid -> reset lockout counters
    if (user.failedLoginAttempts > 0 || user.lockoutUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockoutUntil: null,
        },
      });
    }

    const isMasterAdmin = Boolean(
      MASTER_ADMIN_EMAIL &&
      cleanEmail === MASTER_ADMIN_EMAIL.toLowerCase()
    );

    if (isMasterAdmin && (user.role !== "ADMIN" || user.planStatus !== "ACTIVE")) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          role: "ADMIN",
          plan: "LTD",
          planStatus: "ACTIVE",
        },
      });
      user.role = "ADMIN";
      user.plan = "LTD";
      user.planStatus = "ACTIVE";
    }

    await logSecurityEvent({
      eventType: "AUTH_LOGIN_SUCCESS",
      userId: user.id,
      email: user.email,
      ipAddress: ip,
      userAgent,
      details: isMasterAdmin ? "Master administrator successfully authenticated" : "User successfully authenticated",
      severity: "INFO",
    });

    const token = signJwt({
      userId: user.id,
      email: user.email,
      plan: user.plan,
      planStatus: user.planStatus,
      role: user.role,
      avatarUrl: user.avatarUrl,
      authProvider: "CREDENTIALS",
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        planStatus: user.planStatus,
        role: user.role,
        emailVerified: user.emailVerified,
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

    if (user.role === "ADMIN") {
      response.cookies.set(ADMIN_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" && !isLocalhost,
        sameSite: "lax",
        maxAge: SESSION_MAX_AGE,
        path: "/",
      });
    }

    return response;
  } catch (err: any) {
    const safeErr = formatSafeError(err, "Login");
    return NextResponse.json(safeErr, { status: 500 });
  }
}
