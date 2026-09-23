import { prisma } from "./db";
import { recordSecurityIncident } from "./security-alerts";

export type AuditEventType =
  | "AUTH_LOGIN_SUCCESS"
  | "AUTH_LOGIN_FAILURE"
  | "AUTH_LOCKOUT_TRIGGERED"
  | "AUTH_REGISTER_SUCCESS"
  | "PASSWORD_RESET_REQUESTED"
  | "PASSWORD_RESET_COMPLETED"
  | "EMAIL_VERIFICATION_SENT"
  | "EMAIL_VERIFIED"
  | "IDOR_ATTEMPT_DETECTED"
  | "RATE_LIMIT_EXCEEDED"
  | "UNUSUAL_TRAFFIC_PATTERN"
  | "SENSITIVE_CONFIG_CHANGED";

export interface AuditLogEntry {
  eventType: AuditEventType;
  userId?: string | null;
  email?: string | null;
  ipAddress: string;
  userAgent?: string | null;
  details?: Record<string, any> | string;
  severity?: "INFO" | "WARNING" | "CRITICAL";
}

/**
 * Enterprise Audit Logger for authentication attempts, security incidents,
 * IDOR probes, and anomalous traffic patterns.
 */
export async function logSecurityEvent(entry: AuditLogEntry) {
  const timestamp = new Date().toISOString();
  const severity = entry.severity || "INFO";
  const sanitizedEmail = entry.email ? entry.email.toLowerCase().trim() : "anonymous";

  // Formatted server-side log
  const logPrefix = `[AUDIT_LOG][${severity}][${entry.eventType}]`;
  const meta = `IP: ${entry.ipAddress} | User: ${entry.userId || "N/A"} | Email: ${sanitizedEmail}`;
  const detailsStr = typeof entry.details === "object" ? JSON.stringify(entry.details) : entry.details || "";

  if (severity === "CRITICAL") {
    console.error(`🚨 ${logPrefix} ${meta} - ${detailsStr}`);
  } else if (severity === "WARNING") {
    console.warn(`⚠️ ${logPrefix} ${meta} - ${detailsStr}`);
  } else {
    console.log(`ℹ️ ${logPrefix} ${meta} - ${detailsStr}`);
  }

  // If severity is WARNING or CRITICAL, persist to SecurityAlert table for admin visibility
  if (severity === "WARNING" || severity === "CRITICAL") {
    let incidentType: "UNAUTHORIZED_ADMIN_ATTEMPT" | "BRUTE_FORCE_BLOCKED" | "TAMPER_PROBE" | "INVALID_CREDENTIALS" = "TAMPER_PROBE";
    if (entry.eventType === "AUTH_LOGIN_FAILURE" || entry.eventType === "AUTH_LOCKOUT_TRIGGERED") {
      incidentType = "INVALID_CREDENTIALS";
    } else if (entry.eventType === "RATE_LIMIT_EXCEEDED") {
      incidentType = "BRUTE_FORCE_BLOCKED";
    } else if (entry.eventType === "IDOR_ATTEMPT_DETECTED") {
      incidentType = "TAMPER_PROBE";
    }

    await recordSecurityIncident({
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent || null,
      attemptedEmail: sanitizedEmail,
      eventType: incidentType,
      severity: severity === "CRITICAL" ? "CRITICAL" : "HIGH",
      details: `${entry.eventType}: ${detailsStr}`,
    }).catch((err) => {
      console.error("Failed to persist security alert:", err);
    });
  }
}
