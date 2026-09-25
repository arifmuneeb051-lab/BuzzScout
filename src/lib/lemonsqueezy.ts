import crypto from "crypto";

export interface CreateCheckoutOptions {
  variantId: string;
  userId: string;
  userEmail: string;
  userName?: string;
  plan: "PRO" | "LTD";
  redirectUrl?: string;
}

export async function createLemonCheckout(options: CreateCheckoutOptions): Promise<string> {
  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
  const storeId = process.env.LEMON_SQUEEZY_STORE_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://buzz-scout.vercel.app";

  if (!apiKey || !storeId) {
    throw new Error("Lemon Squeezy API credentials are not configured.");
  }

  const payload = {
    data: {
      type: "checkouts",
      attributes: {
        checkout_data: {
          email: options.userEmail,
          name: options.userName || "",
          custom: {
            user_id: options.userId,
            plan: options.plan,
          },
        },
        product_options: {
          redirect_url: options.redirectUrl || `${appUrl}/dashboard/billing?status=success`,
        },
      },
      relationships: {
        store: {
          data: {
            type: "stores",
            id: String(storeId),
          },
        },
        variant: {
          data: {
            type: "variants",
            id: String(options.variantId),
          },
        },
      },
    },
  };

  const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/vnd.api+json",
      Accept: "application/vnd.api+json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorDetails = await response.text();
    console.error("Lemon Squeezy checkout error:", response.status, errorDetails);
    throw new Error(`Failed to generate checkout link (${response.status})`);
  }

  const result = await response.json();
  const checkoutUrl = result?.data?.attributes?.url;

  if (!checkoutUrl) {
    throw new Error("Checkout URL was not returned by Lemon Squeezy.");
  }

  return checkoutUrl;
}

export function verifyLemonWebhookSignature(rawBody: string, signature: string, secret: string): boolean {
  try {
    const hmac = crypto.createHmac("sha256", secret);
    const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
    const signatureBuffer = Buffer.from(signature, "utf8");

    if (digest.length !== signatureBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(digest, signatureBuffer);
  } catch (err) {
    console.error("Error verifying webhook signature:", err);
    return false;
  }
}
