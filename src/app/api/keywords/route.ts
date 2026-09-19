import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const keywords = await prisma.keyword.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { leads: true },
        },
      },
    });

    return NextResponse.json({ keywords });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { phrase, platform, negativeKeywords, targetSubreddits } = await req.json();

    if (!phrase || phrase.trim().length === 0) {
      return NextResponse.json({ error: "Keyword phrase is required" }, { status: 400 });
    }

    // Check plan limits: Free plan allows up to 2 keywords, Pro/LTD allows unlimited
    if (user.plan === "FREE") {
      const count = await prisma.keyword.count({ where: { userId: user.id } });
      if (count >= 2) {
        return NextResponse.json(
          {
            error: "Free plan is limited to 2 active keywords. Upgrade to Pro ($9/mo) or LTD ($39) for unlimited tracking!",
            upgradeRequired: true,
          },
          { status: 403 }
        );
      }
    }

    const keyword = await prisma.keyword.create({
      data: {
        userId: user.id,
        phrase: phrase.trim().toLowerCase(),
        platform: platform || "ALL",
        negativeKeywords: negativeKeywords ? negativeKeywords.trim() : null,
        targetSubreddits: targetSubreddits ? targetSubreddits.trim() : null,
        active: true,
      },
    });

    return NextResponse.json({ success: true, keyword });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Keyword ID is required" }, { status: 400 });
    }

    await prisma.keyword.deleteMany({
      where: { id, userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, active } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Keyword ID is required" }, { status: 400 });
    }

    const updated = await prisma.keyword.updateMany({
      where: { id, userId: user.id },
      data: { active: Boolean(active) },
    });

    return NextResponse.json({ success: true, updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
