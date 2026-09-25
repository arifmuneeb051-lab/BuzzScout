import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyLemonWebhookSignature } from "@/lib/lemonsqueezy";

export async function POST(req: Request) {
  try {
    const signature = req.headers.get("x-signature");
    const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
    }

    const rawBody = await req.text();
    const isValid = verifyLemonWebhookSignature(rawBody, signature, webhookSecret);

    if (!isValid) {
      console.error("Lemon Squeezy signature verification failed.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload?.meta?.event_name;
    const customData = payload?.meta?.custom_data || {};
    const attributes = payload?.data?.attributes || {};

    console.log(`[LemonSqueezy Webhook] Received event: ${eventName}`, {
      userId: customData.user_id,
      plan: customData.plan,
    });

    const userEmail = attributes.user_email || attributes.customer_email;
    let userId = customData.user_id;

    // Fallback: Find user by email if user_id wasn't in custom_data
    if (!userId && userEmail) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userEmail.toLowerCase().trim() },
      });
      if (existingUser) {
        userId = existingUser.id;
      }
    }

    if (!userId) {
      console.warn(`[LemonSqueezy Webhook] No matching user found for email: ${userEmail}`);
      return NextResponse.json({ received: true, note: "User not found" });
    }

    // Determine Plan: Custom data takes precedence, otherwise determine by variant ID or price
    let targetPlan: "PRO" | "LTD" = customData.plan || "PRO";
    const variantId = String(
      attributes.first_order_item?.variant_id || attributes.variant_id || ""
    );

    if (variantId === String(process.env.LEMON_SQUEEZY_LTD_VARIANT_ID || "2166966")) {
      targetPlan = "LTD";
    } else if (variantId === String(process.env.LEMON_SQUEEZY_MONTHLY_VARIANT_ID || "2167022")) {
      targetPlan = "PRO";
    }

    // Handle Order Created or Subscription Created (Payment success)
    if (
      eventName === "order_created" ||
      eventName === "subscription_created" ||
      eventName === "subscription_payment_success"
    ) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          plan: targetPlan,
          planStatus: "ACTIVE",
          trialEndsAt: null,
        },
      });

      const amountTotal = (attributes.total || attributes.subtotal || 0) / 100;
      const finalAmount = amountTotal > 0 ? amountTotal : (targetPlan === "LTD" ? 49 : 9);

      // Prevent duplicate transactions for the same payment by checking recent transactions
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      const recentTx = await prisma.paymentTransaction.findFirst({
        where: {
          userId,
          amount: finalAmount,
          plan: targetPlan,
          createdAt: { gte: twoMinutesAgo },
        },
      });

      if (!recentTx) {
        await prisma.paymentTransaction.create({
          data: {
            userId,
            userEmail: userEmail || `user_${userId.slice(0, 8)}@buzzscout.io`,
            amount: finalAmount,
            currency: (attributes.currency || "usd").toLowerCase(),
            plan: targetPlan,
            status: "COMPLETED",
            paymentMethod: "LEMON_SQUEEZY",
            cardLast4: "LEMON",
            stripeSessionId: String(payload.data?.id || ""),
          },
        });
      }

      console.log(`[LemonSqueezy Webhook] Successfully activated ${targetPlan} for user ${userId}`);
    }

    // Handle Subscription Cancellations or Expirations
    if (eventName === "subscription_cancelled" || eventName === "subscription_expired") {
      // Don't downgrade LTD users
      const currentUser = await prisma.user.findUnique({ where: { id: userId } });
      if (currentUser?.plan !== "LTD") {
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: "INACTIVE",
            planStatus: "SUSPENDED",
          },
        });
        console.log(`[LemonSqueezy Webhook] Suspended subscription for user ${userId}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("[LemonSqueezy Webhook] Processing error:", err);
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }
}
