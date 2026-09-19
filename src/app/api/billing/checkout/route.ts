import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createCheckoutSession, getStripeInstance } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Please sign in to upgrade" }, { status: 401 });
    }

    const body = await req.json();
    const { plan, method, cardNumber, cardHolder } = body;

    if (!plan || !["PRO", "LTD", "AGENCY"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    const config = await prisma.siteConfig.findUnique({ where: { id: "default" } });
    const amount = plan === "PRO" 
      ? (config?.monthlyPrice || 9) 
      : plan === "AGENCY" 
      ? (config?.agencyPrice || 79) 
      : (config?.ltdPrice || 39);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://arifmuneeb051-lab-signalpulse-saas.vercel.app";

    // 1. If user requested Stripe Checkout
    if (method === "STRIPE") {
      const { stripe, paymentLink } = await getStripeInstance();
      
      if (paymentLink) {
        return NextResponse.json({ success: true, url: paymentLink });
      }

      if (stripe) {
        const session = await createCheckoutSession({
          userId: user.id,
          userEmail: user.email,
          plan,
          successUrl: `${appUrl}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}&success=true`,
          cancelUrl: `${appUrl}/dashboard/billing?canceled=true`,
        });

        if (session && session.url) {
          return NextResponse.json({ success: true, url: session.url });
        }
      }

      return NextResponse.json(
        { error: "Stripe gateway keys have not been configured by the admin yet. Please select 'Credit / Debit Card' or configure keys in Admin Portal." },
        { status: 400 }
      );
    }

    // 2. Direct Credit Card / Debit Card Processing
    const cardLast4 = cardNumber ? cardNumber.replace(/\s+/g, "").slice(-4) : "4242";

    // Update user plan in database
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        plan,
        planStatus: "ACTIVE",
        trialEndsAt: null, // Removed trial limit upon paid plan
      },
    });

    // Record Payment Transaction in DB
    const transaction = await prisma.paymentTransaction.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        amount,
        currency: "usd",
        plan,
        status: "COMPLETED",
        paymentMethod: method === "STRIPE" ? "STRIPE" : "CARD",
        cardLast4,
      },
    });

    return NextResponse.json({
      success: true,
      plan: updatedUser.plan,
      transactionId: transaction.id,
      amount,
      message: `Payment of $${amount} approved! You have been upgraded to ${plan === "LTD" ? "Lifetime Founder Pass" : plan === "AGENCY" ? "Agency Pass" : "Pro Monthly"}.`,
    });
  } catch (err: any) {
    console.error("Checkout processing error:", err);
    return NextResponse.json({ error: err.message || "Failed to process payment" }, { status: 500 });
  }
}
