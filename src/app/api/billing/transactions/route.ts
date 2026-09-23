import { NextResponse } from "next/server";
import { formatSafeError } from "@/lib/security";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Auto-clean any dummy or zero-dollar test transaction for unpaid/pending accounts
    if (user.role !== "ADMIN" && user.planStatus !== "ACTIVE") {
      await prisma.paymentTransaction.deleteMany({
        where: {
          userEmail: user.email,
          amount: 0,
        },
      });
    }

    const transactions = await prisma.paymentTransaction.findMany({
      where: {
        OR: [
          { userId: user.id },
          { userEmail: user.email },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    // If user has not completed an active payment, do not display fake completed transactions
    const safeTransactions = (user.role !== "ADMIN" && user.planStatus !== "ACTIVE")
      ? []
      : transactions.filter((t) => t.amount > 0 || user.planStatus === "ACTIVE");

    return NextResponse.json({ success: true, transactions: safeTransactions });
  } catch (err: any) {
    const safeErr = formatSafeError(err);
    return NextResponse.json(safeErr, { status: 500 });
  }
}
