import { NextResponse } from "next/server";
import { formatSafeError } from "@/lib/security";

export async function GET(req: Request) {
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/google/callback`;
  const clientId = process.env.GOOGLE_CLIENT_ID;

  // 1. Official Google OAuth: If Google Client ID is configured in .env, redirect directly to Google's official consent server
  if (clientId && clientId.trim().length > 0 && !clientId.includes("YOUR_GOOGLE_CLIENT_ID")) {
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      clientId.trim()
    )}&redirect_uri=${encodeURIComponent(
      callbackUrl
    )}&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=select_account`;
    return NextResponse.redirect(googleAuthUrl);
  }

  // 2. If Google credentials are not yet configured in .env, redirect to /login with helpful setup notice
  return NextResponse.redirect(new URL("/login?notice=google_setup_required", req.url));
}

export async function POST(req: Request) {
  try {
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/google/callback`;
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (clientId && clientId.trim().length > 0 && !clientId.includes("YOUR_GOOGLE_CLIENT_ID")) {
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
        clientId.trim()
      )}&redirect_uri=${encodeURIComponent(
        callbackUrl
      )}&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=select_account`;
      return NextResponse.json({ url: googleAuthUrl });
    }

    return NextResponse.json({ url: "/login?notice=google_setup_required" });
  } catch (err: any) {
    const safeErr = formatSafeError(err);
    return NextResponse.json(safeErr, { status: 500 });
  }
}
