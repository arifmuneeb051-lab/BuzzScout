import { NextResponse } from "next/server";
import { getStripeInstance } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { stripe } = await getStripeInstance();
    if (!stripe) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
    }

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json(
        { error: "STRIPE_WEBHOOK_SECRET environment variable is missing" },
        { status: 500 }
      );
    }

    const rawBody = await req.text();
    let event: any;

    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err: any) {
      console.error("Stripe webhook signature verification failed:", err.message);
      return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
    }

    // Cryptographically verified event processing
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      if (session.payment_status === "paid") {
        const userId = session.client_reference_id || session.metadata?.userId;
        const plan = session.metadata?.plan || "PRO";

        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan,
              planStatus: "ACTIVE",
              trialEndsAt: null,
            },
          });

          await prisma.paymentTransaction.create({
            data: {
              userId,
              userEmail: session.customer_email || `customer_${userId.slice(0, 8)}@buzzscout.io`,
              amount: (session.amount_total || 0) / 100,
              currency: session.currency || "usd",
              plan,
              status: "COMPLETED",
              paymentMethod: "STRIPE",
              cardLast4: "STRIPE",
            },
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Stripe webhook processing error:", err);
    return NextResponse.json({ error: "Internal webhook processing error" }, { status: 500 });
  }
}
