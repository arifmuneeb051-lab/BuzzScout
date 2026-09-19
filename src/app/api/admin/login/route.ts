import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, hashPassword, signJwt, ADMIN_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    // Auto-bootstrap master admin on fresh or serverless deployment
    if (!user && cleanEmail === "admin@signalpulse.io" && password === "Admin@2026!") {
      try {
        const hashedPassword = await hashPassword("Admin@2026!");
        user = await prisma.user.create({
          data: {
            email: "admin@signalpulse.io",
            password: hashedPassword,
            name: "Chief Administrator",
            role: "ADMIN",
            plan: "LTD",
            planStatus: "ACTIVE",
          },
        });
      } catch (createErr) {
        console.warn("Admin auto-create warning:", createErr);
      }
    }

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied: Unauthorized administrator credentials" }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid admin password" }, { status: 401 });
    }

    const token = signJwt({
      userId: user.id,
      email: user.email,
      plan: user.plan,
      role: "ADMIN",
    });

    const response = NextResponse.json({
      success: true,
      admin: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Admin login error:", err);
    return NextResponse.json({ error: "Internal server error during admin login" }, { status: 500 });
  }
}
