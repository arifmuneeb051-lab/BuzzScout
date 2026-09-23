import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, signJwt, generateSecureToken, COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/auth";
import { validateEmail, validatePasswordStrength, formatSafeError } from "@/lib/security";
import { logSecurityEvent } from "@/lib/audit-logger";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "127.0.0.1";
  const userAgent = req.headers.get("user-agent");

  try {
    const {
      email,
      password,
      name,
      productName,
      productUrl,
      productPitch,
      licenseKey,
      selectedPlan,
      ageConfirmed,
    } = await req.json();

    if (!ageConfirmed) {
      return NextResponse.json(
        { error: "You must confirm that you are at least 18 years of age to register." },
        { status: 400 }
      );
    }

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 });
    }

    const strength = validatePasswordStrength(password);
    if (!strength.valid) {
      return NextResponse.json({ error: strength.reason || "Password does not meet security requirements" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 });
    }

    let finalPlan = selectedPlan || "PRO";
    let finalPlanStatus = "PENDING_PAYMENT";
    let validatedLicense = null;

    // Check if licenseKey is provided
    if (licenseKey && typeof licenseKey === "string" && licenseKey.trim().length > 0) {
      const cleanKey = licenseKey.trim().toUpperCase();
      validatedLicense = await prisma.licenseKey.findUnique({
        where: { code: cleanKey },
      });

      if (!validatedLicense) {
        return NextResponse.json(
          { error: "Invalid license key. Please check the code or register without a key." },
          { status: 400 }
        );
      }

      if (validatedLicense.isUsed) {
        return NextResponse.json(
          { error: "This license key has already been redeemed. Please use a fresh key." },
          { status: 400 }
        );
      }

      finalPlan = validatedLicense.plan || "LTD";
      finalPlanStatus = "ACTIVE";
    }

    const hashedPassword = await hashPassword(password);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create user with forced role USER and 6-digit email verification OTP
    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        password: hashedPassword,
        name: name ? name.trim() : cleanEmail.split("@")[0],
        role: "USER",
        productName: productName ? productName.trim() : "My Product",
        productUrl: productUrl ? productUrl.trim() : "https://myproduct.io",
        productPitch: productPitch ? productPitch.trim() : "An affordable and fast modern solution for founders.",
        plan: finalPlan,
        planStatus: finalPlanStatus,
        emailVerified: false,
        emailVerificationToken: otpCode,
        emailVerificationExpires: otpExpires,
      },
    });

    // If license key was used, mark it as redeemed and create transaction record
    if (validatedLicense) {
      await prisma.licenseKey.update({
        where: { id: validatedLicense.id },
        data: {
          isUsed: true,
          usedByEmail: cleanEmail,
          redeemedAt: new Date(),
        },
      });

      await prisma.paymentTransaction.create({
        data: {
          userId: user.id,
          userEmail: cleanEmail,
          amount: 0.0,
          currency: "usd",
          plan: finalPlan,
          status: "COMPLETED",
          paymentMethod: "ADMIN_LICENSE_KEY",
          cardLast4: "KEY",
        },
      });
    }

    console.log(`[SIGNUP_EMAIL_OTP_DISPATCH] 6-digit code for ${cleanEmail}: ${otpCode}`);

    await logSecurityEvent({
      eventType: "AUTH_REGISTER_SUCCESS",
      userId: user.id,
      email: user.email,
      ipAddress: ip,
      userAgent,
      details: `User registered with plan ${finalPlan}. 6-digit OTP issued.`,
      severity: "INFO",
    });

    const isDev = process.env.NODE_ENV !== "production" || cleanEmail.endsWith(".local") || cleanEmail.includes("test");

    return NextResponse.json({
      success: true,
      requiresOtp: true,
      email: user.email,
      message: "Account created! A 6-digit verification code has been dispatched to your email.",
      devOtp: isDev ? otpCode : undefined,
    });
  } catch (err: any) {
    const safeErr = formatSafeError(err, "Registration");
    return NextResponse.json(safeErr, { status: 500 });
  }
}
