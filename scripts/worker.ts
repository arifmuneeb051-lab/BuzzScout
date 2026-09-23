/**
 * Standalone Background Monitoring Worker for BuzzScout
 * Usage: npm run worker
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const CRON_SECRET = process.env.CRON_SECRET;
if (!CRON_SECRET) {
  console.error("❌ CRON_SECRET environment variable is missing. Worker aborted.");
  process.exit(1);
}
const INTERVAL_MS = 1000 * 60 * 5; // Every 5 minutes

async function runMonitorCycle() {
  console.log(`[${new Date().toISOString()}] 🔍 Starting BuzzScout radar scan...`);
  try {
    const res = await fetch(`${APP_URL}/api/cron/monitor`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CRON_SECRET}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      console.log(
        `[${new Date().toISOString()}] ✅ Scan complete: ${data.keywordsScanned} keywords scanned, ${data.newLeadsDiscovered} new leads discovered, ${data.alertsDispatched} alerts dispatched.`
      );
    } else {
      const err = await res.text();
      console.warn(`[${new Date().toISOString()}] ⚠️ Scan warning (${res.status}): ${err}`);
    }
  } catch (err: any) {
    console.error(`[${new Date().toISOString()}] ❌ Failed to execute monitor cycle:`, err?.message);
  }
}

console.log("🚀 BuzzScout Background Worker active.");
console.log(`📡 Polling ${APP_URL}/api/cron/monitor every 5 minutes.`);

// Initial run
runMonitorCycle();

// Interval loop
setInterval(runMonitorCycle, INTERVAL_MS);
