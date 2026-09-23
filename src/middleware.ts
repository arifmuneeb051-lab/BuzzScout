import { NextResponse, type NextRequest } from "next/server";
import { checkRateLimit } from "./lib/security";

function decodeJwtPayload(token?: string): { email?: string; role?: string; plan?: string; planStatus?: string; authProvider?: string } | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

const MASTER_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || process.env.ADMIN_ID || "").toLowerCase().trim();

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "127.0.0.1";

  // 0. Stealth File Probe Defense: Block direct requests for sensitive system files
  if (/\/\.(env|git|svn|aws|htaccess|DS_Store)/i.test(pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  // 1. CORS Validation & Preflight Handler
  const origin = req.headers.get("origin");
  const host = req.headers.get("host") || "localhost:3000";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  
  const allowedOrigins = [
    appUrl,
    `http://${host}`,
    `https://${host}`,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ].filter(Boolean);

  const isOriginAllowed = !origin || allowedOrigins.some((allowed) => allowed && (origin === allowed || origin.startsWith(allowed)));

  if (req.method === "OPTIONS") {
    if (origin && isOriginAllowed) {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Max-Age": "86400",
        },
      });
    }
    return new NextResponse(JSON.stringify({ error: "CORS origin forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2. Strict Rate Limiting on Authentication Endpoints (Brute-force protection)
  // Minimum: 5 attempts per minute per IP on login and register
  if (
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/register")
  ) {
    if (req.method === "POST") {
      const rate = checkRateLimit(`${ip}:${pathname}`, 5, 60000); // 5 attempts per minute
      if (!rate.allowed) {
        return new NextResponse(
          JSON.stringify({
            error: `Too many authentication attempts. Anti-bruteforce lock active. Please retry in ${rate.retryAfterSeconds} seconds.`,
            retryAfter: rate.retryAfterSeconds,
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": String(rate.retryAfterSeconds),
            },
          }
        );
      }
    }
  }

  // Password / Credentials change: 3 attempts per hour per IP
  if (pathname.startsWith("/api/admin/credentials")) {
    if (req.method === "POST") {
      const rate = checkRateLimit(`${ip}:credentials_change`, 3, 3600000); // 3 attempts per hour
      if (!rate.allowed) {
        return new NextResponse(
          JSON.stringify({
            error: `Too many credential modification attempts. Anti-tamper lock active. Please retry in ${Math.ceil(rate.retryAfterSeconds / 60)} minutes.`,
            retryAfter: rate.retryAfterSeconds,
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": String(rate.retryAfterSeconds),
            },
          }
        );
      }
    }
  }

  // Password Reset & Verification Abuse Protection
  if (pathname.startsWith("/api/auth/forgot-password")) {
    if (req.method === "POST") {
      const rate = checkRateLimit(`${ip}:forgot_password`, 3, 15 * 60 * 1000); // 3 attempts per 15 min
      if (!rate.allowed) {
        return new NextResponse(
          JSON.stringify({
            error: `Too many password reset requests. Please retry in ${Math.ceil(rate.retryAfterSeconds / 60)} minutes.`,
            retryAfter: rate.retryAfterSeconds,
          }),
          { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(rate.retryAfterSeconds) } }
        );
      }
    }
  }

  if (pathname.startsWith("/api/auth/reset-password")) {
    if (req.method === "POST") {
      const rate = checkRateLimit(`${ip}:reset_password`, 5, 15 * 60 * 1000); // 5 attempts per 15 min
      if (!rate.allowed) {
        return new NextResponse(
          JSON.stringify({
            error: `Too many password reset attempts. Anti-tamper lock active. Please retry in ${Math.ceil(rate.retryAfterSeconds / 60)} minutes.`,
            retryAfter: rate.retryAfterSeconds,
          }),
          { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(rate.retryAfterSeconds) } }
        );
      }
    }
  }

  if (pathname.startsWith("/api/auth/resend-verification")) {
    if (req.method === "POST") {
      const rate = checkRateLimit(`${ip}:resend_verification`, 3, 15 * 60 * 1000); // 3 attempts per 15 min
      if (!rate.allowed) {
        return new NextResponse(
          JSON.stringify({
            error: `Too many email verification requests. Please retry in ${Math.ceil(rate.retryAfterSeconds / 60)} minutes.`,
            retryAfter: rate.retryAfterSeconds,
          }),
          { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(rate.retryAfterSeconds) } }
        );
      }
    }
  }

  // AI Pitch Generation Abuse Protection: Max 20 pitches per minute per IP
  if (pathname.startsWith("/api/leads/pitch")) {
    if (req.method === "POST") {
      const rate = checkRateLimit(`${ip}:ai_pitch`, 20, 60000);
      if (!rate.allowed) {
        return new NextResponse(
          JSON.stringify({
            error: `AI pitch generation rate limit reached. Please wait ${rate.retryAfterSeconds} seconds before generating more pitches.`,
            retryAfter: rate.retryAfterSeconds,
          }),
          { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(rate.retryAfterSeconds) } }
        );
      }
    }
  }

  // General API Flood Protection: Max 120 calls per minute per IP
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/webhooks")) {
    const rate = checkRateLimit(`${ip}:api_flood`, 120, 60000);
    if (!rate.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: `API rate limit exceeded. Please throttle requests. Retry in ${rate.retryAfterSeconds} seconds.`,
          retryAfter: rate.retryAfterSeconds,
        }),
        { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(rate.retryAfterSeconds) } }
      );
    }
  }

  // License Key Brute-Force Defense: 5 attempts per minute per IP
  if (
    pathname.startsWith("/api/billing/redeem") ||
    pathname.startsWith("/api/billing/validate-key")
  ) {
    if (req.method === "POST" || req.method === "GET") {
      const rate = checkRateLimit(`${ip}:license_probe`, 5, 60000);
      if (!rate.allowed) {
        return new NextResponse(
          JSON.stringify({
            error: `Too many license redemption attempts. Anti-bruteforce lock active. Please retry in ${rate.retryAfterSeconds} seconds.`,
            retryAfter: rate.retryAfterSeconds,
          }),
          { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(rate.retryAfterSeconds) } }
        );
      }
    }
  }

  // 2. Protected Routes Authorization & Redirection Checks
  const userToken = req.cookies.get("buzzscout_session")?.value;
  const adminToken = req.cookies.get("buzzscout_admin_session")?.value || userToken;
  const userPayload = decodeJwtPayload(userToken);
  const adminPayload = decodeJwtPayload(adminToken);

  const isPlanActive = Boolean(
    userPayload && (
      userPayload.role === "ADMIN" ||
      userPayload.planStatus === "ACTIVE"
    )
  );

  // A. Automatic Dashboard Redirection for Logged-In Users on Landing Page or Auth Pages
  if (pathname === "/" || pathname === "/login" || pathname === "/register") {
    if (userToken && userPayload?.email) {
      if (isPlanActive) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      } else {
        return NextResponse.redirect(new URL("/dashboard/billing?notice=subscription_required", req.url));
      }
    }
  }

  // B. Protect & Subscription-Gate /dashboard
  if (pathname.startsWith("/dashboard")) {
    if (!userToken || !userPayload?.email) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If logged in, but not an active subscriber and not on billing page:
    if (!isPlanActive && pathname !== "/dashboard/billing") {
      return NextResponse.redirect(new URL("/dashboard/billing?notice=subscription_required", req.url));
    }
  }

  // STEALTH ADMIN PROTECTION: Hard Lockout & Instant Dashboard Throw
  // Admin panel is strictly restricted: ONLY arifmuneeb81@gmail.com authenticated via "Sign In with Google" is allowed.
  if (pathname.startsWith("/admin")) {
    const isMasterAdmin = Boolean(
      (adminPayload?.email?.toLowerCase().trim() === MASTER_ADMIN_EMAIL || userPayload?.email?.toLowerCase().trim() === MASTER_ADMIN_EMAIL) &&
      (adminPayload?.role === "ADMIN" || userPayload?.role === "ADMIN") &&
      (adminPayload?.authProvider === "GOOGLE" || userPayload?.authProvider === "GOOGLE") &&
      MASTER_ADMIN_EMAIL &&
      MASTER_ADMIN_EMAIL === "arifmuneeb81@gmail.com"
    );

    if (!isMasterAdmin) {
      // Throw any unauthorized visitor, bot, attacker, or non-Google session straight to /dashboard
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // 3. Security Headers Injection (Hacker hardening across all pages)
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  const cspHeader = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https:; frame-src 'self' https://js.stripe.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self';";
  response.headers.set("Content-Security-Policy", cspHeader);

  // Strict CORS Header (Never wildcard *)
  if (origin && isOriginAllowed) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
