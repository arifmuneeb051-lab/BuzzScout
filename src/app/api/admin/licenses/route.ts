import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized admin access" }, { status: 401 });
  }

  try {
    const licenses = await prisma.licenseKey.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ licenses });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized admin access" }, { status: 401 });
  }

  try {
    const { customCode, plan } = await req.json().catch(() => ({}));

    // Generate random 16-char code if custom code not provided
    const randomSuffix = crypto.randomBytes(4).toString("hex").toUpperCase();
    const code = customCode && customCode.trim().length > 0
      ? customCode.trim().toUpperCase()
      : `PULSE-LTD-${randomSuffix}`;

    const existing = await prisma.licenseKey.findUnique({
      where: { code },
    });

    if (existing) {
      return NextResponse.json({ error: "A license key with this code already exists" }, { status: 400 });
    }

    const created = await prisma.licenseKey.create({
      data: {
        code,
        plan: plan || "LTD",
        isUsed: false,
      },
    });

    return NextResponse.json({ success: true, license: created });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
