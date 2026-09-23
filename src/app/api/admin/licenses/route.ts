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
    const licenses = await prisma.licenseKey.findMany({
      orderBy: { createdAt: "desc" },
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
    const { customCode, plan, count } = await req.json().catch(() => ({}));
    const targetPlan = plan ? plan.toUpperCase().trim() : "LTD";
    const batchCount = Math.min(Math.max(1, parseInt(count, 10) || 1), 500);

    // Bulk License Key Generation (Up to 500 keys in one click)
    if (batchCount > 1) {
      const keysToCreate: { code: string; plan: string; isUsed: boolean }[] = [];
      const generatedCodes = new Set<string>();

      while (generatedCodes.size < batchCount) {
        const randomSuffix = crypto.randomBytes(4).toString("hex").toUpperCase();
        const code = `BUZZ-${targetPlan}-${randomSuffix}`;
        if (!generatedCodes.has(code)) {
          generatedCodes.add(code);
          keysToCreate.push({ code, plan: targetPlan, isUsed: false });
        }
      }

      const created = await prisma.licenseKey.createMany({
        data: keysToCreate,
        skipDuplicates: true,
      });

      return NextResponse.json({
        success: true,
        message: `Successfully generated ${created.count} license keys for plan ${targetPlan}!`,
        count: created.count,
        keys: keysToCreate.map((k) => k.code),
      });
    }

    // Single Key Generation
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

    const created = await prisma.licenseKey.create({
      data: {
        code,
        plan: targetPlan,
        isUsed: false,
      },
    });

    return NextResponse.json({ success: true, license: created });
  } catch (err: any) {
    const safeErr = formatSafeError(err);
    return NextResponse.json(safeErr, { status: 500 });
  }
}
