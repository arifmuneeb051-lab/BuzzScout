import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, signJwt, COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  try {
    const demoEmail = "demo@signalpulse.io";
    let user = await prisma.user.findUnique({
      where: { email: demoEmail },
    });

    if (!user) {
      const hashedPassword = await hashPassword("password123");
      user = await prisma.user.create({
        data: {
          email: demoEmail,
          password: hashedPassword,
          name: "Demo Founder",
          productName: "EchoLaunch",
          productUrl: "https://echolaunch.io",
          productPitch: "A clean, affordable social media scheduling and analytics tool for indie makers.",
          plan: "LTD",
          planStatus: "ACTIVE",
        },
      });

      // Seed initial demo keywords
      await prisma.keyword.createMany({
        data: [
          {
            userId: user.id,
            phrase: "alternative to brand24",
            platform: "ALL",
            negativeKeywords: "free, crack, pirate",
            targetSubreddits: "SaaS, startups, Entrepreneur",
            active: true,
          },
          {
            userId: user.id,
            phrase: "recommend twitter monitor",
            platform: "TWITTER",
            negativeKeywords: "bot, crypto",
            active: true,
          },
          {
            userId: user.id,
            phrase: "best tool for social listening",
            platform: "REDDIT",
            targetSubreddits: "marketing, growthhacking",
            active: true,
          },
        ],
      });
    }

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
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Demo login error:", err);
    return NextResponse.json({ error: "Failed to initialize demo session" }, { status: 500 });
  }
}
