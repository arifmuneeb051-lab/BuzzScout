import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signJwt, COOKIE_NAME, ADMIN_COOKIE_NAME, isMasterAdminEmail, hashPassword } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const isTest = searchParams.get("test");

    let googleEmail = "";
    let googleName = "Google User";
    let googleAvatar: string | null = null;
    let googleId: string | null = null;

    // 1. If real Google OAuth code received
    if (code && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: `${(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "")}/api/auth/google/callback`,
          grant_type: "authorization_code",
        }),
      });

      if (!tokenRes.ok) {
        return NextResponse.redirect(new URL("/login?error=google_auth_failed", req.url));
      }

      const tokenData = await tokenRes.json();
      const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      if (!userInfoRes.ok) {
        return NextResponse.redirect(new URL("/login?error=google_user_failed", req.url));
      }

      const userInfo = await userInfoRes.json();
      googleEmail = userInfo.email?.toLowerCase().trim();
      googleName = userInfo.name || "Google User";
      googleAvatar = userInfo.picture || null;
      googleId = userInfo.sub || null;
    } else {
      return NextResponse.redirect(new URL("/login?error=missing_auth_code", req.url));
    }

    if (!googleEmail) {
      return NextResponse.redirect(new URL("/login?error=invalid_google_email", req.url));
    }

    // 2. Lookup or create user in Supabase
    let user = await prisma.user.findUnique({
      where: { email: googleEmail },
    });

    if (user && user.role !== "ADMIN" && user.planStatus === "SUSPENDED") {
      return NextResponse.redirect(new URL("/login?error=account_blocked", req.url));
    }

    const isMasterAdmin = isMasterAdminEmail(googleEmail);

    if (user) {
      // If master admin logs in, ensure their privileges and active LTD pass are always active
      const updateData: any = {};
      if (googleAvatar && (!user.avatarUrl || user.avatarUrl !== googleAvatar)) {
        updateData.avatarUrl = googleAvatar;
      }
      if (googleId && user.googleId !== googleId) {
        updateData.googleId = googleId;
      }
      if (isMasterAdmin && (user.role !== "ADMIN" || user.planStatus !== "ACTIVE")) {
        updateData.role = "ADMIN";
        updateData.plan = "LTD";
        updateData.planStatus = "ACTIVE";
      }

      // Ensure name is clean and does not contain any legacy (Master Owner) suffix
      const cleanGoogleName = (googleName && googleName !== "Google User" ? googleName : user.name || "Founder")
        .replace(/\s*\(Master Owner\)/gi, "")
        .trim();
      if (user.name !== cleanGoogleName && cleanGoogleName) {
        updateData.name = cleanGoogleName;
      }

      if (Object.keys(updateData).length > 0) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });
      }
    } else {
      const randomPassword = await hashPassword(Math.random().toString(36) + Date.now().toString());
      user = await prisma.user.create({
        data: {
          email: googleEmail,
          password: randomPassword,
          name: googleName.replace(/\s*\(Master Owner\)/gi, "").trim(),
          avatarUrl: googleAvatar,
          googleId: googleId,
          role: isMasterAdmin ? "ADMIN" : "USER",
          plan: isMasterAdmin ? "LTD" : "INACTIVE",
          planStatus: isMasterAdmin ? "ACTIVE" : "PENDING_PAYMENT",
          emailVerified: true,
          productName: "My Product",
          productUrl: "https://myproduct.io",
          productPitch: "An affordable and fast modern solution for founders.",
        },
      });
    }

    // 3. Issue JWT session cookie with avatar and plan status (Strictly tagged with GOOGLE authProvider)
    const token = signJwt({
      userId: user.id,
      email: user.email,
      plan: user.plan,
      planStatus: user.planStatus,
      role: user.role,
      avatarUrl: user.avatarUrl,
      authProvider: "GOOGLE",
    });

    const targetUrl = (user.role === "ADMIN" || user.planStatus === "ACTIVE")
      ? "/dashboard"
      : "/dashboard/billing?notice=subscription_required";
    const response = NextResponse.redirect(new URL(targetUrl, req.url));
    const isLocalhost = req.url.includes("localhost") || req.url.includes("127.0.0.1");
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" && !isLocalhost,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    if (user.role === "ADMIN") {
      response.cookies.set(ADMIN_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" && !isLocalhost,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });
    }

    return response;
  } catch (err: any) {
    console.error("Google auth callback error:", err);
    return NextResponse.redirect(new URL("/login?error=internal_error", req.url));
  }
}
