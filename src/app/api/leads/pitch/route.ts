import { NextResponse } from "next/server";
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

    const lead = await prisma.lead.findFirst({
      where: { id: leadId, userId: user.id },
    });

    if (!lead) {
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
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
