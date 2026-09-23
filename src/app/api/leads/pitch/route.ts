import { NextResponse } from "next/server";
import { formatSafeError } from "@/lib/security";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generatePitchTemplates } from "@/lib/ai/pitch-generator";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { leadId, customProduct, customUrl, customPitch } = await req.json();

    if (!leadId) {
      return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });
    }

    // Subscription Check: Inactive users cannot generate AI pitches
    const isPlanActive = user.role === "ADMIN" || user.planStatus === "ACTIVE";
    if (!isPlanActive) {
      return NextResponse.json(
        {
          error: "An active Pro subscription or Lifetime Founder Pass is required to generate AI pitches.",
          upgradeRequired: true,
        },
        { status: 403 }
      );
    }

    const lead = await prisma.lead.findFirst({
      where: { id: leadId, userId: user.id },
    });

    if (!lead) {
      const existsForOther = await prisma.lead.findFirst({ where: { id: leadId } });
      if (existsForOther && existsForOther.userId !== user.id) {
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "127.0.0.1";
        const { logSecurityEvent } = await import("@/lib/audit-logger");
        await logSecurityEvent({
          eventType: "IDOR_ATTEMPT_DETECTED",
          userId: user.id,
          email: user.email,
          ipAddress: ip,
          details: `Unauthorized attempt to generate pitch for lead [${leadId}] belonging to another user`,
          severity: "CRITICAL",
        });
      }

      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const pitches = generatePitchTemplates({
      postTitle: lead.title,
      postContent: lead.content,
      postAuthor: lead.author,
      productName: customProduct || user.productName || "our tool",
      productUrl: customUrl || user.productUrl || "https://example.com",
      productPitch: customPitch || user.productPitch || undefined,
      platform: lead.platform as "REDDIT" | "TWITTER",
    });

    // Automatically update lead with the first recommended pitch
    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        pitchDraft: pitches[0].text,
      },
    });

    return NextResponse.json({ success: true, pitches });
  } catch (err: any) {
    const safeErr = formatSafeError(err);
    return NextResponse.json(safeErr, { status: 500 });
  }
}
