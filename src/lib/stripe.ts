import Stripe from "stripe";
import { prisma } from "./db";

export async function getStripeInstance(): Promise<{ stripe: Stripe | null; paymentLink: string | null; mode: string }> {
  try {
    const config = await prisma.siteConfig.findUnique({
      where: { id: "default" },
    });

    const secretKey = config?.stripeSecretKey || process.env.STRIPE_SECRET_KEY || "";
    const paymentLink = config?.stripePaymentLink || process.env.STRIPE_PAYMENT_LINK || null;
    const mode = config?.paymentMode || "TEST";

    if (!secretKey) {
      return { stripe: null, paymentLink, mode };
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: "2024-12-18.acacia" as any,
    });

    return { stripe, paymentLink, mode };
  } catch (err) {
    console.error("Failed to initialize Stripe instance:", err);
    return { stripe: null, paymentLink: null, mode: "TEST" };
  }
}

export async function createCheckoutSession({
  userId,
  userEmail,
  plan,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  userEmail: string;
  plan: "PRO" | "LTD" | "AGENCY";
  successUrl: string;
  cancelUrl: string;
}) {
  const { stripe, paymentLink } = await getStripeInstance();

  // If owner configured a direct Stripe Payment Link (e.g. https://buy.stripe.com/...)
  if (paymentLink) {
    return { url: paymentLink };
  }

  if (!stripe) {
    return null;
  }

  const config = await prisma.siteConfig.findUnique({ where: { id: "default" } });
  const priceAmount = plan === "PRO" 
    ? (config?.monthlyPrice || 9) * 100 
    : plan === "AGENCY" 
    ? (config?.agencyPrice || 79) * 100 
    : (config?.ltdPrice || 39) * 100;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    customer_email: userEmail,
    client_reference_id: userId,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: plan === "PRO" ? "SignalPulse Pro Monthly" : plan === "AGENCY" ? "SignalPulse Agency Founder Pass" : "SignalPulse Lifetime Founder Pass (LTD)",
            description: plan === "PRO" ? "Monthly access to real-time Reddit & X keyword monitoring" : "Lifetime access with zero recurring fees",
          },
          unit_amount: priceAmount,
          ...(plan === "PRO" ? { recurring: { interval: "month" } } : {}),
        },
        quantity: 1,
      },
    ],
    mode: plan === "PRO" ? "subscription" : "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      plan,
    },
  });

  return { url: session.url };
}
