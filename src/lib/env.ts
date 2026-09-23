/**
 * Production Environment Variables Validator
 * Validates presence of critical variables on startup and refuses to boot if missing.
 */

export interface EnvConfig {
  DATABASE_URL: string;
  DIRECT_URL?: string;
  JWT_SECRET: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
  CRON_SECRET?: string;
  NEXT_PUBLIC_APP_URL: string;
  NODE_ENV: string;
}

export function validateEnv(): EnvConfig {
  const isProduction = process.env.NODE_ENV === "production";
  const missingCritical: string[] = [];

  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    missingCritical.push("DATABASE_URL - Database connection string");
  }

  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    missingCritical.push("JWT_SECRET - Auth token signing key");
  }

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.ADMIN_ID;
  if (!ADMIN_EMAIL) {
    missingCritical.push("ADMIN_EMAIL - Master administrator email");
  }

  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  if (!ADMIN_PASSWORD) {
    missingCritical.push("ADMIN_PASSWORD - Master administrator secure password");
  }

  if (missingCritical.length > 0) {
    const errorMsg =
      `\n=======================================================\n` +
      `🚨 [FATAL STARTUP ERROR] CRITICAL ENVIRONMENT VARIABLES MISSING:\n` +
      missingCritical.map((v) => `  ❌ ${v}`).join("\n") +
      `\n\nBuzzScout refuses to start in an unconfigured state.\n` +
      `Please provide these variables in your .env or cloud environment.\n` +
      `=======================================================\n`;
    console.error(errorMsg);
    if (isProduction) {
      throw new Error(errorMsg);
    }
  }

  return {
    DATABASE_URL: DATABASE_URL || "",
    DIRECT_URL: process.env.DIRECT_URL,
    JWT_SECRET: JWT_SECRET || "development-insecure-jwt-secret-placeholder",
    ADMIN_EMAIL: (ADMIN_EMAIL || "founder@buzzscout.io").toLowerCase().trim(),
    ADMIN_PASSWORD: ADMIN_PASSWORD || "",
    CRON_SECRET: process.env.CRON_SECRET,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    NODE_ENV: process.env.NODE_ENV || "development",
  };
}

export const env = validateEnv();
