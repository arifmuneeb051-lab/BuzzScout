interface RateLimitBucket {
  count: number;
  expiresAt: number;
}

const rateLimitMap = new Map<string, RateLimitBucket>();

export function checkRateLimit(
  key: string,
  maxAttempts = 15,
  windowMs = 60000
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  const existing = rateLimitMap.get(key);

  if (rateLimitMap.size > 2000) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (v.expiresAt <= now) {
        rateLimitMap.delete(k);
      }
    }
  }

  if (!existing || existing.expiresAt <= now) {
    rateLimitMap.set(key, { count: 1, expiresAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, retryAfterSeconds: 0 };
  }

  if (existing.count >= maxAttempts) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.expiresAt - now) / 1000));
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  existing.count += 1;
  return { allowed: true, remaining: maxAttempts - existing.count, retryAfterSeconds: 0 };
}

const SQL_INJECTION_PATTERNS = [
  /(\b(UNION\s+ALL|UNION\s+SELECT|SELECT\s+.*FROM|DROP\s+TABLE|INSERT\s+INTO|DELETE\s+FROM)\b)/i,
  /(\bOR\b\s+['\d=]+(\s*=\s*['\d]+)?)/i,
  /(--|#|\/\*|\*\/)/,
  /(\bEXEC(\s|\+)+(SP_|XP_))/i,
  /(\bWAITFOR\s+DELAY\b)/i,
  /(\$where|\$regex|\$gt|\$ne|\$or)/i,
];

export function detectSqlInjection(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  return SQL_INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * Constant-time comparison in pure JS (Edge Runtime & Node compatible)
 */
export function timingSafeCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  let mismatch = a.length === b.length ? 0 : 1;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0 && a.length === b.length;
}

export function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  // RFC 5322 compliant regex check, length check (max 254 chars)
  if (email.length > 254 || email.length < 5) return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email);
}

export function validatePasswordStrength(password: string): { valid: boolean; reason?: string } {
  if (!password || typeof password !== "string") {
    return { valid: false, reason: "Password is required." };
  }
  if (password.length < 8) {
    return { valid: false, reason: "Password must be at least 8 characters long." };
  }
  if (password.length > 128) {
    return { valid: false, reason: "Password cannot exceed 128 characters." };
  }
  // Check for at least one number or special character
  if (!/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return { valid: false, reason: "Password must contain at least one number or special character." };
  }
  // Check for at least one alphabetical letter
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, reason: "Password must contain at least one letter." };
  }
  return { valid: true };
}

export function validateInputLength(input: string, min = 1, max = 255): boolean {
  if (typeof input !== "string") return false;
  const trimmed = input.trim();
  return trimmed.length >= min && trimmed.length <= max;
}

export function sanitizeString(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

/**
 * Formats safe production error responses with Correlation ID.
 * Logs full detailed error and stack trace ONLY to server-side logs.
 * Returns clean generic error + correlation ID to client to prevent any information leakage.
 */
export function formatSafeError(err: any, context?: string): { error: string; correlationId: string } {
  const correlationId = `err_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
  
  // Detailed error logged server-side only
  console.error(`[INTERNAL_ERROR][${correlationId}] ${context ? `[Context: ${context}] ` : ""}`, err);

  return {
    error: "An unexpected error occurred. Please contact support with this reference ID if the issue persists.",
    correlationId,
  };
}

/**
 * Strips database connection strings, passwords, API tokens, internal paths, and query fragments
 * to prevent accidental information disclosure in API responses.
 */
export function sanitizeError(err: any): string {
  if (!err) return "An unexpected error occurred.";
  const raw = typeof err === "string" ? err : err.message || "";

  // Pattern detection for sensitive internal data, stack traces, paths, and queries
  const SENSITIVE_PATTERNS = [
    /postgres(ql)?:\/\/[^\s]+/i,
    /mongodb(\+srv)?:\/\/[^\s]+/i,
    /password/i,
    /bearer\s+[a-z0-9_-]+/i,
    /token/i,
    /secret/i,
    /aws_?[a-z0-9_]+/i,
    /sk_live_[a-z0-9]+/i,
    /sk_test_[a-z0-9]+/i,
    /sbp_[a-z0-9]+/i,
    /prisma/i,
    /database\s+url/i,
    /node_modules/i,
    /^[A-Z]:\\/i,
    /^\/(Users|home|var|tmp|app)/i,
    /\bat\s+.*\(.*:\d+:\d+\)/i,
    /SELECT\s+.*FROM/i,
    /INSERT\s+INTO/i,
    /UPDATE\s+.*SET/i,
    /DELETE\s+FROM/i,
  ];

  for (const pattern of SENSITIVE_PATTERNS) {
    if (pattern.test(raw)) {
      return "An internal server error occurred. Connection and query details have been safely redacted.";
    }
  }

  return raw || "An unexpected error occurred.";
}
