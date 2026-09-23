export type IntentLevel = "HIGH" | "MEDIUM" | "LOW";

export interface IntentResult {
  score: IntentLevel;
  confidence: number;
  matchedTriggers: string[];
  isNegativeMatch: boolean;
  exclusionReason?: string | null;
}

export interface AuthorMeta {
  username: string;
  karma?: number;
  followers?: number;
  accountAgeDays?: number;
}

export interface PostCandidate {
  id?: string;
  title: string;
  content: string;
  author: string;
  platform: "REDDIT" | "TWITTER";
  authorMeta?: AuthorMeta;
  url?: string;
}

export interface FilteringResult {
  passed: boolean;
  intent: IntentResult;
  isSpam: boolean;
  spamReason?: string | null;
  exclusionReason?: string | null;
}

// Phrases strongly indicating someone actively looking to purchase or find a replacement
const HIGH_INTENT_PATTERNS = [
  /looking for (an? )?(alternative|tool|software|app|service|solution) to/i,
  /recommend( me)? (an? )?(alternative|good|affordable|cheaper|better )?(tool|software|app|platform|service|solution)?( to)?/i,
  /recommend an alternative to/i,
  /best (tool|software|app|platform|service|solution) for/i,
  /alternative(s)? to ([a-z0-9_\-\.]+)/i,
  /replace ([a-z0-9_\-\.]+) with/i,
  /switching from ([a-z0-9_\-\.]+)/i,
  /tired of ([a-z0-9_\-\.]+)/i,
  /too expensive, any alternatives/i,
  /what do you guys use for/i,
  /any suggestions for/i,
  /budget friendly alternative/i,
  /who should i hire or what tool/i,
  /can anyone suggest/i,
];

const MEDIUM_INTENT_PATTERNS = [
  /how do you handle/i,
  /what is the best way to/i,
  /does anyone know/i,
  /review of/i,
  /comparison between/i,
  /is there an app that/i,
  /problem with/i,
  /frustrated with/i,
];

export function analyzeIntent(
  text: string,
  targetPhrase: string,
  negativeKeywords?: string | null
): IntentResult {
  const normalizedText = text.toLowerCase();

  // Check negative keywords first
  if (negativeKeywords) {
    const negatives = negativeKeywords
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    for (const neg of negatives) {
      if (normalizedText.includes(neg)) {
        return {
          score: "LOW",
          confidence: 0.1,
          matchedTriggers: [`Excluded by negative keyword: "${neg}"`],
          isNegativeMatch: true,
        };
      }
    }
  }

  const matchedTriggers: string[] = [];

  // Check High Intent
  for (const pattern of HIGH_INTENT_PATTERNS) {
    const match = normalizedText.match(pattern);
    if (match) {
      matchedTriggers.push(match[0]);
    }
  }

  if (matchedTriggers.length > 0) {
    return {
      score: "HIGH",
      confidence: Math.min(0.95, 0.7 + matchedTriggers.length * 0.1),
      matchedTriggers,
      isNegativeMatch: false,
    };
  }

  // Check Medium Intent
  for (const pattern of MEDIUM_INTENT_PATTERNS) {
    const match = normalizedText.match(pattern);
    if (match) {
      matchedTriggers.push(match[0]);
    }
  }

  if (matchedTriggers.length > 0) {
    return {
      score: "MEDIUM",
      confidence: 0.6,
      matchedTriggers,
      isNegativeMatch: false,
    };
  }

  // If keyword matches directly, classify as at least Medium
  if (normalizedText.includes(targetPhrase.toLowerCase())) {
    return {
      score: "MEDIUM",
      confidence: 0.5,
      matchedTriggers: [`Direct keyword: "${targetPhrase}"`],
      isNegativeMatch: false,
    };
  }

  return {
    score: "LOW",
    confidence: 0.3,
    matchedTriggers: ["General mention"],
    isNegativeMatch: false,
  };
}

/**
 * Comprehensive Lead Filter incorporating:
 * 1. Spam protection (Reddit karma <= 0 or Twitter followers < 10)
 * 2. Negative keyword exclusions (e.g. 'free', 'crack', 'open-source')
 * 3. High/Medium Intent matching ('recommend an alternative to', 'best tool for')
 */
export function filterLeadPost(
  post: PostCandidate,
  targetPhrase: string,
  negativeKeywords?: string | null
): FilteringResult {
  // 1. Spam Protection Check
  if (post.authorMeta) {
    if (post.platform === "REDDIT" && post.authorMeta.karma !== undefined && post.authorMeta.karma <= 0) {
      return {
        passed: false,
        isSpam: true,
        spamReason: `Spam Protection Triggered: Author '${post.author}' has 0 or negative karma (${post.authorMeta.karma})`,
        exclusionReason: "SPAM_ZERO_KARMA",
        intent: {
          score: "LOW",
          confidence: 0.0,
          matchedTriggers: [],
          isNegativeMatch: false,
          exclusionReason: "SPAM_ZERO_KARMA",
        },
      };
    }

    if (post.platform === "TWITTER" && post.authorMeta.followers !== undefined && post.authorMeta.followers < 10) {
      return {
        passed: false,
        isSpam: true,
        spamReason: `Spam Protection Triggered: Author '${post.author}' has less than 10 followers (${post.authorMeta.followers})`,
        exclusionReason: "SPAM_LOW_FOLLOWERS",
        intent: {
          score: "LOW",
          confidence: 0.0,
          matchedTriggers: [],
          isNegativeMatch: false,
          exclusionReason: "SPAM_LOW_FOLLOWERS",
        },
      };
    }
  }

  // 2. Intent Analysis & Negative Keywords
  const fullText = `${post.title} ${post.content}`;
  const intent = analyzeIntent(fullText, targetPhrase, negativeKeywords);

  if (intent.isNegativeMatch) {
    return {
      passed: false,
      isSpam: false,
      exclusionReason: intent.matchedTriggers[0] || "NEGATIVE_KEYWORD_MATCH",
      intent,
    };
  }

  // Passed if HIGH or MEDIUM intent
  const passed = intent.score === "HIGH" || intent.score === "MEDIUM";

  return {
    passed,
    isSpam: false,
    exclusionReason: passed ? null : "LOW_INTENT_GENERIC",
    intent,
  };
}
