import { NextResponse } from "next/server";
import { formatSafeError } from "@/lib/security";
import { getCurrentUser, signJwt, COOKIE_NAME } from "@/lib/auth";
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

    const existing = await prisma.licenseKey.findUnique({ where: { code: cleanCode } });
    
    if (!existing) {
      return NextResponse.json({ error: "Invalid license code. Please check and try again." }, { status: 404 });
    }
    if (existing.isUsed) {
      return NextResponse.json({ error: "This license key has already been redeemed." }, { status: 400 });
    }
    if (existing.lockedToEmail && existing.lockedToEmail !== user.email.toLowerCase()) {
      return NextResponse.json({ error: "This license key is locked to a different email address." }, { status: 403 });
    }
    if (existing.expiresAt && new Date() > new Date(existing.expiresAt)) {
      return NextResponse.json({ error: "This license key has expired." }, { status: 400 });
    }

    // Atomic update to eliminate race condition / double-redemption
    const updateResult = await prisma.licenseKey.updateMany({
      where: { code: cleanCode, isUsed: false },
      data: {
        isUsed: true,
        usedByEmail: user.email,
        redeemedAt: new Date(),
      },
    });

    if (updateResult.count === 0) {
      return NextResponse.json({ error: "Race condition: Key was redeemed by someone else." }, { status: 400 });
    }

    const targetPlan = existing.plan || "LTD";
    const dataToUpdate: any = {
      plan: targetPlan,
      planStatus: "ACTIVE",
    };

    // If key has validDays (represented by expiresAt logic here from admin panel, but wait - admin panel created the key with expiresAt. So if redeemed, user's planExpiresAt becomes that exact date).
    if (existing.expiresAt) {
      dataToUpdate.planExpiresAt = existing.expiresAt;
    }

    // Upgrade user to key's plan
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: dataToUpdate,
    });

    // Create payment transaction audit
    await prisma.paymentTransaction.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        amount: 0.0,
        currency: "usd",
        plan: targetPlan,
        status: "COMPLETED",
        paymentMethod: "ADMIN_LICENSE_KEY",
        cardLast4: "KEY",
      },
    });

    const token = signJwt({
      userId: updatedUser.id,
      email: updatedUser.email,
      plan: updatedUser.plan,
      planStatus: updatedUser.planStatus,
      role: updatedUser.role,
      avatarUrl: updatedUser.avatarUrl,
    });

    const isLocalhost = req.url.includes("localhost") || req.url.includes("127.0.0.1");
    const response = NextResponse.json({
      success: true,
      message: `Congratulations! Your account has been upgraded to ${targetPlan} access!`,
      plan: updatedUser.plan,
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" && !isLocalhost,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch (err: any) {
    const safeErr = formatSafeError(err);
    return NextResponse.json(safeErr, { status: 500 });
  }
}
