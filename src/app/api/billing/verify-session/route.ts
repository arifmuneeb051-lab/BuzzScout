import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getStripeInstance } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { formatSafeError } from "@/lib/security";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sessionId } = await req.json();
    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "Valid sessionId is required" }, { status: 400 });
    }

    const { stripe } = await getStripeInstance();
    if (!stripe) {
      return NextResponse.json({ error: "Stripe service not initialized" }, { status: 500 });
    }

    // Retrieve checkout session directly from Stripe API
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Cryptographic server-side verification: Check payment status and owner identity
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment has not been completed or is still pending", verified: false },
        { status: 400 }
      );
    }

    const targetUserId = session.client_reference_id || session.metadata?.userId;
    if (targetUserId !== user.id) {
      return NextResponse.json(
        { error: "Session does not belong to the current authenticated user", verified: false },
        { status: 403 }
      );
    }

    const plan = session.metadata?.plan || "PRO";

    // Grant access server-side
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        plan,
        planStatus: "ACTIVE",
        trialEndsAt: null,
      },
    });

    // Record verified payment transaction if not already recorded
    const existingTx = await prisma.paymentTransaction.findFirst({
      where: {
        userId: user.id,
        status: "COMPLETED",
        paymentMethod: "STRIPE",
        createdAt: { gte: new Date(Date.now() - 3600000) },
      },
    });

    if (!existingTx) {
      await prisma.paymentTransaction.create({
        data: {
          userId: user.id,
          userEmail: user.email,
          amount: (session.amount_total || 0) / 100,
          currency: session.currency || "usd",
          plan,
          status: "COMPLETED",
          paymentMethod: "STRIPE",
          cardLast4: "STRIPE",
        },
      });
    }

    return NextResponse.json({
      verified: true,
      plan: updated.plan,
      message: "Payment successfully verified! Your subscription is active.",
    });
  } catch (err: any) {
    const safeErr = formatSafeError(err, "POST /api/billing/verify-session");
    return NextResponse.json(safeErr, { status: 500 });
  }
}
