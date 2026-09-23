import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

async function validateCode(code?: any) {
  if (!code || typeof code !== "string" || code.trim().length === 0) {
    return NextResponse.json({ valid: false, error: "Please enter a license key code" }, { status: 400 });
  }

  const cleanCode = code.trim().toUpperCase();

  const license = await prisma.licenseKey.findUnique({
    where: { code: cleanCode },
  });

  if (!license) {
    return NextResponse.json({ valid: false, error: "Invalid license key. Please check and try again." }, { status: 404 });
  }

  if (license.isUsed) {
    return NextResponse.json({
      valid: false,
      error: `This license key has already been redeemed on ${license.redeemedAt ? new Date(license.redeemedAt).toLocaleDateString() : "earlier"}.`,
    }, { status: 400 });
  }

  return NextResponse.json({
    valid: true,
    code: license.code,
    plan: license.plan,
    message: `Verified! Grants full ${license.plan} access with $0 payment.`,
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    return await validateCode(code);
  } catch (err: any) {
    console.error("Key validation GET error:", err);
    return NextResponse.json({ valid: false, error: "Failed to validate license key" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { code } = await req.json().catch(() => ({}));
    return await validateCode(code);
  } catch (err: any) {
    console.error("Key validation error:", err);
    return NextResponse.json({ valid: false, error: "Failed to validate license key" }, { status: 500 });
  }
}
