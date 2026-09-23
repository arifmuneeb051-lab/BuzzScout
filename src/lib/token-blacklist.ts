/**
 * JWT Token Revocation Blacklist (In-Memory + Expiry TTL)
 * Prevents re-use of signed JWT tokens after user clicks Logout.
 */

const revokedTokens = new Map<string, number>(); // signature -> expiry timestamp ms

export function revokeToken(token: string): void {
  if (!token || typeof token !== "string") return;
  try {
    const parts = token.split(".");
    if (parts.length < 3) return;
    const signature = parts[2]; // Use cryptographic signature as unique identifier

    // Decode expiry timestamp from payload
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = Buffer.from(base64, "base64").toString("utf-8");
    const payload = JSON.parse(jsonStr);
    const expMs = (payload.exp ? payload.exp * 1000 : Date.now() + 30 * 24 * 60 * 60 * 1000);

    revokedTokens.set(signature, expMs);

    // Garbage collect expired tokens periodically
    if (revokedTokens.size > 3000) {
      const now = Date.now();
      for (const [sig, expiresAt] of revokedTokens.entries()) {
        if (expiresAt <= now) {
          revokedTokens.delete(sig);
        }
      }
    }
  } catch (err) {
    console.warn("Failed to parse token for revocation:", err);
  }
}

export function isTokenRevoked(token: string): boolean {
  if (!token || typeof token !== "string") return false;
  try {
    const parts = token.split(".");
    if (parts.length < 3) return false;
    const signature = parts[2];

    const expiresAt = revokedTokens.get(signature);
    if (!expiresAt) return false;

    if (expiresAt <= Date.now()) {
      revokedTokens.delete(signature);
      return false;
    }

    return true; // Token is revoked / blacklisted
  } catch {
    return false;
  }
}
