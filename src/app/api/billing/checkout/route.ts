import { NextResponse } from "next/server";
import { formatSafeError } from "@/lib/security";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createLemonCheckout } from "@/lib/lemonsqueezy";

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
      ? (config?.monthlyPrice || 9) 
      : (config?.ltdPrice || 49);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://buzz-scout.vercel.app";

    // 1. Process via Lemon Squeezy (Primary Gateway)
    if (method === "LEMON_SQUEEZY" || method === "STRIPE") {
      const variantId = plan === "LTD"
        ? (process.env.LEMON_SQUEEZY_LTD_VARIANT_ID || "2166966")
        : (process.env.LEMON_SQUEEZY_MONTHLY_VARIANT_ID || "2167022");

      try {
        const checkoutUrl = await createLemonCheckout({
          variantId,
          userId: user.id,
          userEmail: user.email,
          userName: user.name || undefined,
          plan: plan as "PRO" | "LTD",
          redirectUrl: `${appUrl}/dashboard/billing?status=success`,
        });

        return NextResponse.json({ success: true, url: checkoutUrl });
      } catch (err: any) {
        console.error("Lemon Squeezy checkout error:", err);
        return NextResponse.json(
          { error: err.message || "Failed to initialize Lemon Squeezy checkout" },
          { status: 500 }
        );
      }
    }

    // 2. Direct Mock Credit / Debit Card Processing (For testing)
    const cleanCard = cardNumber ? cardNumber.replace(/[\s-]/g, "") : "";

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

    // Update user plan in database
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        plan,
        planStatus: "ACTIVE",
        trialEndsAt: null,
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
        paymentMethod: "CARD",
        cardLast4,
      },
    });

    return NextResponse.json({
      success: true,
      plan: updatedUser.plan,
      transactionId: transaction.id,
      amount,
      message: `Payment of $${amount} approved! You have been upgraded to ${plan === "LTD" ? "Lifetime Founder Pass" : "Pro Monthly"}.`,
    });
  } catch (err: any) {
    console.error("Checkout processing error:", err);
    const safeErr = formatSafeError(err);
    return NextResponse.json(safeErr, { status: 500 });
  }
}
