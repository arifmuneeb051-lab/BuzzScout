import Stripe from "stripe";
import { prisma } from "./db";

export async function getStripeInstance(): Promise<{
  stripe: Stripe | null;
  paymentLink: string | null;
  monthlyLink: string | null;
  ltdLink: string | null;
  agencyLink: string | null;
  mode: string;
}> {
  try {
    const config = await prisma.siteConfig.findUnique({
      where: { id: "default" },
    });

    const secretKey = config?.stripeSecretKey || process.env.STRIPE_SECRET_KEY || "";
    const paymentLink = config?.stripePaymentLink || process.env.STRIPE_PAYMENT_LINK || null;
    const monthlyLink = config?.stripeMonthlyLink || process.env.STRIPE_MONTHLY_LINK || null;
    const ltdLink = config?.stripeLtdLink || process.env.STRIPE_LTD_LINK || null;
    const agencyLink = config?.stripeAgencyLink || process.env.STRIPE_AGENCY_LINK || null;
    const mode = config?.paymentMode || "TEST";

    if (!secretKey) {
      return { stripe: null, paymentLink, monthlyLink, ltdLink, agencyLink, mode };
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: "2024-12-18.acacia" as any,
    });

    return { stripe, paymentLink, monthlyLink, ltdLink, agencyLink, mode };
  } catch (err) {
    console.error("Failed to initialize Stripe instance:", err);
    return { stripe: null, paymentLink: null, monthlyLink: null, ltdLink: null, agencyLink: null, mode: "TEST" };
  }
}

export async function getPlanPaymentUrl(plan: "PRO" | "LTD" | "AGENCY"): Promise<string | null> {
  const { paymentLink, monthlyLink, ltdLink, agencyLink } = await getStripeInstance();
  if (plan === "PRO" && monthlyLink) return monthlyLink;
  if (plan === "LTD" && ltdLink) return ltdLink;
  if (plan === "AGENCY" && agencyLink) return agencyLink;
  return paymentLink;
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
  // Check if owner provided a direct plan link
  const directLink = await getPlanPaymentUrl(plan);
  if (directLink) {
    return { url: directLink };
  }

  const { stripe } = await getStripeInstance();

  if (!stripe) {
    return null;
  }

  const config = await prisma.siteConfig.findUnique({ where: { id: "default" } });
  const priceAmount = plan === "PRO" 
    ? (config?.monthlyPrice || 5) * 100 
    : plan === "AGENCY" 
    ? (config?.agencyPrice || 79) * 100 
    : (config?.ltdPrice || 35) * 100;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    customer_email: userEmail,
    client_reference_id: userId,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: plan === "PRO" ? "BuzzScout Pro Monthly" : plan === "AGENCY" ? "BuzzScout Agency Founder Pass" : "BuzzScout Lifetime Founder Pass (LTD)",
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
