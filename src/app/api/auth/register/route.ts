import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, signJwt, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password, name, productName, productUrl, productPitch } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || email.split("@")[0],
        productName: productName || "My Product",
        productUrl: productUrl || "https://myproduct.io",
        productPitch: productPitch || "An affordable and fast modern solution for founders.",
        plan: "FREE",
      },
    });

    const token = signJwt({
      userId: user.id,
      email: user.email,
      plan: user.plan,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
      },
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Registration error:", err);
    return NextResponse.json({ error: "Internal server error during registration" }, { status: 500 });
  }
}
