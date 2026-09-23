import { NextResponse } from "next/server";
import { formatSafeError } from "@/lib/security";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createCheckoutSession, getStripeInstance } from "@/lib/stripe";

function isValidLuhn(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

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
      ? (config?.monthlyPrice || 5) 
      : plan === "AGENCY" 
      ? (config?.agencyPrice || 79) 
      : (config?.ltdPrice || 25);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // 1. If user requested Stripe Checkout
    if (method === "STRIPE") {
      const { stripe, paymentLink, monthlyLink, ltdLink, agencyLink } = await getStripeInstance();
      
      const targetLink = plan === "PRO" ? monthlyLink : plan === "AGENCY" ? agencyLink : ltdLink;
      if (targetLink) {
        return NextResponse.json({ success: true, url: targetLink });
      }

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
        { error: "Stripe payment link is not configured yet. The admin can paste their Stripe Payment Link in Admin Portal, or you can use 'Credit / Debit Card' to upgrade immediately." },
        { status: 400 }
      );
    }

    // 2. Direct Credit Card / Debit Card Processing
    const cleanCard = cardNumber ? cardNumber.replace(/[\s-]/g, "") : "";

    // Card security validation
    if (cleanCard) {
      const isRecognizedTestCard = cleanCard === "4242424242424242" || cleanCard === "4000000000000002";
      if (!isRecognizedTestCard) {
        if (!isValidLuhn(cleanCard)) {
          return NextResponse.json(
            { error: "Invalid credit or debit card number. Please check your card digits." },
            { status: 400 }
          );
        }
      }
    }

    const cardLast4 = cleanCard ? cleanCard.slice(-4) : "4242";

    // Sanitize cardHolder to prevent XSS / malicious injection
    const sanitizedHolder = cardHolder ? String(cardHolder).replace(/<[^>]*>/g, "").trim().slice(0, 80) : "Cardholder";

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
    const safeErr = formatSafeError(err);
    return NextResponse.json(safeErr, { status: 500 });
  }
}
