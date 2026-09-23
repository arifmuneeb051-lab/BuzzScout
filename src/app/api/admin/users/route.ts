import { NextResponse } from "next/server";
import { formatSafeError } from "@/lib/security";
import { getAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized admin access" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    const users = await prisma.user.findMany({
      where: {
        role: "USER",
        ...(query
          ? {
              OR: [
                { email: { contains: query } },
                { name: { contains: query } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        productName: true,
        productUrl: true,
        plan: true,
        planStatus: true,
        createdAt: true,
        _count: {
          select: {
            keywords: true,
            leads: true,
            channels: true,
          },
        },
      },
    });

    return NextResponse.json({ users });
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
    const { userId, plan, planStatus } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (targetUser.role === "ADMIN" || targetUser.email.toLowerCase() === admin.email.toLowerCase()) {
      return NextResponse.json({ error: "Master Administrator account is protected from modification" }, { status: 403 });
    }

    const data: any = {};
    if (plan) data.plan = plan;
    if (planStatus) data.planStatus = planStatus;

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        planStatus: true,
      },
    });

    return NextResponse.json({ success: true, user: updated });
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
    const { email, plan, name } = await req.json();

    if (!email || !plan) {
      return NextResponse.json({ error: "Email and plan are required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (user) {
      // User exists -> update plan and activate immediately
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          plan: plan,
          planStatus: "ACTIVE",
          ...(name ? { name } : {}),
        },
      });
      return NextResponse.json({
        success: true,
        message: `Updated ${cleanEmail} to plan ${plan} with ACTIVE status!`,
        user,
      });
    } else {
      // User does not exist -> create account directly with chosen plan and ACTIVE status
      const { hashPassword } = await import("@/lib/auth");
      const tempPass = await hashPassword("BuzzScoutPass2026!");
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          password: tempPass,
          name: name || "Granted User",
          role: "USER",
          plan: plan,
          planStatus: "ACTIVE",
        },
      });
      return NextResponse.json({
        success: true,
        message: `Created account for ${cleanEmail} with plan ${plan} (Password: BuzzScoutPass2026!)`,
        user,
      });
    }
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
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (targetUser.role === "ADMIN" || targetUser.email.toLowerCase() === admin.email.toLowerCase()) {
      return NextResponse.json({ error: "Master Administrator account is protected and cannot be deleted" }, { status: 403 });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    const safeErr = formatSafeError(err);
    return NextResponse.json(safeErr, { status: 500 });
  }
}
