export type IntentLevel = "HIGH" | "MEDIUM" | "LOW";

export interface IntentResult {
  score: IntentLevel;
  confidence: number;
  matchedTriggers: string[];
  isNegativeMatch: boolean;
}

// Phrases strongly indicating someone actively looking to purchase or find a replacement
const HIGH_INTENT_PATTERNS = [
  /looking for (an? )?(alternative|tool|software|app|service|solution) to/i,
  /recommend( me)? (a |an |any )?(good |affordable |cheaper |better )?(tool|software|app|platform|service)/i,
  /alternative(s)? to ([a-z0-9_\-\.]+)/i,
  /replace ([a-z0-9_\-\.]+) with/i,
  /switching from ([a-z0-9_\-\.]+)/i,
  /tired of ([a-z0-9_\-\.]+)/i,
  /too expensive, any alternatives/i,
  /best (tool|software|app|platform) for/i,
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
