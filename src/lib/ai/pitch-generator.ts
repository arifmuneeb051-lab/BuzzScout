export interface PitchContext {
  postTitle: string;
  postContent: string;
  postAuthor: string;
  productName: string;
  productUrl: string;
  productPitch?: string;
  platform: "REDDIT" | "TWITTER";
}

export interface GeneratedPitchResult {
  style: string;
  text: string;
  recommendedAngle: string;
}

export function generatePitchTemplates(ctx: PitchContext): GeneratedPitchResult[] {
  const prod = ctx.productName || "our tool";
  const url = ctx.productUrl || "https://example.com";
  const pitchDesc =
    ctx.productPitch ||
    "a lightweight, affordable solution built specifically for indie founders and small teams without the $100+/mo enterprise bloat.";
  const authorHandle = ctx.platform === "TWITTER" ? `@${ctx.postAuthor} ` : `u/${ctx.postAuthor}: `;

  return [
    {
      style: "Helpful & Value-First (Recommended)",
      recommendedAngle: "Great for technical subreddits and founder communities where hard selling gets downvoted.",
      text:
        ctx.platform === "REDDIT"
          ? `Hey ${ctx.postAuthor}! Totally understand where you're coming from. Most legacy tools in this space are overpriced and bloated with features indie founders don't actually need.\n\n` +
            `If you haven't checked it out yet, take a look at [${prod}](${url}) — ${pitchDesc}.\n\n` +
            `It focuses specifically on doing the core job simply and reliably without locking you into a \$100+/mo contract. Hope this helps point you in the right direction!`
          : `${authorHandle} Saw you're looking for a better alternative. We built ${prod} (${url}) for this exact reason — ${pitchDesc}. No enterprise bloat or crazy pricing. Hope it helps!`,
    },
    {
      style: "Founder Story (High Conversion)",
      recommendedAngle: "Builds instant trust and rapport as a peer indie maker rather than a faceless corporate bot.",
      text:
        ctx.platform === "REDDIT"
          ? `Hey! Solo maker here. I ran into the exact same frustration last year when looking for a reliable solution that wouldn't drain \$1,200/year.\n\n` +
            `Ended up building ${prod} (${url}) to solve this. It's ${pitchDesc}.\n\n` +
            `Would love for you to give it a spin, and I'm happy to answer any questions or set up whatever custom workflow you need!`
          : `${authorHandle} Hey! I built ${prod} (${url}) after getting frustrated with the exact same issue. Super lightweight & affordable. Happy to help if you have any questions!`,
    },
    {
      style: "Direct & Concise",
      recommendedAngle: "Perfect for Twitter/X replies or quick Reddit threads that want immediate recommendations.",
      text:
        ctx.platform === "REDDIT"
          ? `Check out ${prod} (${url}). It gives you ${pitchDesc}.\n\n` +
            `Much simpler setup and significantly more budget-friendly than the legacy alternatives.`
          : `${authorHandle} Check out ${prod} (${url}) — ${pitchDesc}. Clean, fast, and founder-friendly pricing.`,
    },
  ];
}
