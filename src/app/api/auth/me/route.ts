import { NextResponse } from "next/server";
import { getCurrentUser, COOKIE_NAME, ADMIN_COOKIE_NAME, MASTER_ADMIN_EMAIL } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sanitizeError } from "@/lib/security";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user,
  });
}

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(COOKIE_NAME);
  return response;
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Prevent Master Admin self-deletion via self-service user endpoint
  if (
    user.role === "ADMIN" ||
    (MASTER_ADMIN_EMAIL && user.email.toLowerCase().trim() === MASTER_ADMIN_EMAIL.toLowerCase().trim())
  ) {
    return NextResponse.json(
      { error: "Master Administrator account cannot be deleted via self-service." },
      { status: 403 }
    );
  }

  try {
    // 1. Cascade delete all user personal keywords
    await prisma.keyword.deleteMany({ where: { userId: user.id } });

    // 2. Cascade delete all user leads
    await prisma.lead.deleteMany({ where: { userId: user.id } });

    // 3. Cascade delete alert channels (Telegram/Discord tokens)
    await prisma.alertChannel.deleteMany({ where: { userId: user.id } });

    // 4. Anonymize payment transactions (financial ledger audit trail without PII)
    await prisma.paymentTransaction.updateMany({
      where: { userId: user.id },
      data: {
        userEmail: `anonymized_${user.id.slice(0, 8)}@deleted.user`,
        cardLast4: null,
      },
    });

    // 5. Permanently delete user record
    await prisma.user.delete({ where: { id: user.id } });

    // 6. Revoke cookies
    const response = NextResponse.json({
      success: true,
      message: "Your account and all associated personal data have been permanently wiped.",
    });

    response.cookies.delete(COOKIE_NAME);
    response.cookies.delete(ADMIN_COOKIE_NAME);

    return response;
  } catch (err: any) {
    console.error("Account deletion error:", err);
    return NextResponse.json({ error: sanitizeError(err) }, { status: 500 });
  }
}
