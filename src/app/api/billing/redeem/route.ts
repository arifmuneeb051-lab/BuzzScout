import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { code } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "License key code is required" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // Check if license key exists
    const license = await prisma.licenseKey.findUnique({
      where: { code: cleanCode },
    });

    if (!license) {
      return NextResponse.json({ error: "Invalid license code. Please check and try again." }, { status: 404 });
    }

    if (license.isUsed) {
      return NextResponse.json({ error: "This license key has already been redeemed." }, { status: 400 });
    }

    // Mark license as used
    await prisma.licenseKey.update({
      where: { id: license.id },
      data: {
        isUsed: true,
        usedByEmail: user.email,
        redeemedAt: new Date(),
      },
    });

    // Upgrade user to LTD
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        plan: "LTD",
        planStatus: "ACTIVE",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Congratulations! Your account has been upgraded to Lifetime Deal (LTD) Pro!",
      plan: updatedUser.plan,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
