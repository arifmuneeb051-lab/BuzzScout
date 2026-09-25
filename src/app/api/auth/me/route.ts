import { NextResponse } from "next/server";
import { getCurrentUser, COOKIE_NAME, ADMIN_COOKIE_NAME, isMasterAdminEmail, verifyPassword, hashPassword } from "@/lib/auth";
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

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { name, productName, productUrl, productPitch, oldPassword, newPassword } = body;

    const dataToUpdate: any = {
      name: name !== undefined ? name : undefined,
      productName: productName !== undefined ? productName : undefined,
      productUrl: productUrl !== undefined ? productUrl : undefined,
      productPitch: productPitch !== undefined ? productPitch : undefined,
    };

    if (oldPassword && newPassword) {
      // Find full user object with password hash
      const fullUser = await prisma.user.findUnique({ where: { id: user.id } });
      if (!fullUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

      // Verify old password
      const isValid = await verifyPassword(oldPassword, fullUser.password);
      if (!isValid) {
        return NextResponse.json({ error: "Incorrect current password." }, { status: 403 });
      }

      // Hash and set new password
      dataToUpdate.password = await hashPassword(newPassword);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err: any) {
    return NextResponse.json({ error: sanitizeError(err) }, { status: 500 });
  }
}


export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Prevent Master Admin self-deletion via self-service user endpoint
  if (
    user.role === "ADMIN" ||
    isMasterAdminEmail(user.email)
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
