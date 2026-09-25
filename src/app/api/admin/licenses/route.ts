import { NextResponse } from "next/server";
import { formatSafeError } from "@/lib/security";
import { getAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized admin access" }, { status: 401 });
  }

  try {
    // Keep only last 100 used keys
    const usedKeys = await prisma.licenseKey.findMany({
      where: { isUsed: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true }
    });

    if (usedKeys.length > 100) {
      const keysToDelete = usedKeys.slice(100).map(k => k.id);
      await prisma.licenseKey.deleteMany({
        where: { id: { in: keysToDelete } }
      });
    }

    const licenses = await prisma.licenseKey.findMany({
      orderBy: [
        { isPinned: "desc" },
        { createdAt: "desc" }
      ],
    });

    return NextResponse.json({ licenses });
  } catch (err: any) {
    const safeErr = formatSafeError(err);
    return NextResponse.json(safeErr, { status: 500 });
  }
}

export async function POST(req: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized admin access" }, { status: 401 });
  }

  try {
    const { customCode, plan, lockedToEmail, validDays } = await req.json().catch(() => ({}));
    const targetPlan = plan ? plan.toUpperCase().trim() : "LTD";
    
    const randomSuffix = crypto.randomBytes(4).toString("hex").toUpperCase();
    const code = customCode && customCode.trim().length > 0
      ? customCode.trim().toUpperCase()
      : `BUZZ-${targetPlan}-${randomSuffix}`;

    const existing = await prisma.licenseKey.findUnique({
      where: { code },
    });

    if (existing) {
      return NextResponse.json({ error: "A license key with this code already exists" }, { status: 400 });
    }

    let expiresAt = null;
    if (validDays) {
      const days = parseInt(validDays, 10);
      if (days > 0) {
        expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      }
    }

    const created = await prisma.licenseKey.create({
      data: {
        code,
        plan: targetPlan,
        isUsed: false,
        lockedToEmail: lockedToEmail ? lockedToEmail.toLowerCase().trim() : null,
        expiresAt: expiresAt,
      },
    });

    return NextResponse.json({ success: true, license: created });
  } catch (err: any) {
    const safeErr = formatSafeError(err);
    return NextResponse.json(safeErr, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized admin access" }, { status: 401 });
  }

  try {
    const { id, isPinned } = await req.json();
    if (!id) return NextResponse.json({ error: "Key ID required" }, { status: 400 });

    const updated = await prisma.licenseKey.update({
      where: { id },
      data: { isPinned: Boolean(isPinned) }
    });

    return NextResponse.json({ success: true, license: updated });
  } catch (err: any) {
    const safeErr = formatSafeError(err);
    return NextResponse.json(safeErr, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized admin access" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) return NextResponse.json({ error: "Key ID required" }, { status: 400 });

    await prisma.licenseKey.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    const safeErr = formatSafeError(err);
    return NextResponse.json(safeErr, { status: 500 });
  }
}
