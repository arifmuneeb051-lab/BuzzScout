"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  CreditCard,
  Flame,
  Tag,
  ShieldCheck,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Sliders,
  Key,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Trash2,
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  trialUsers: number;
  ltdUsers: number;
  proUsers: number;
  totalLeads: number;
  highIntentLeadsCount: number;
  totalKeywords: number;
  totalLicenses: number;
  estimatedRevenue: number;
}

interface RecentUser {
  id: string;
  email: string;
  name: string;
  plan: string;
  planStatus: string;
  createdAt: string;
  _count: { keywords: number; leads: number };
}

interface SecurityAlertItem {
  id: string;
  ipAddress: string;
  attemptedEmail: string;
  eventType: string;
  severity: string;
  details: string | null;
  resolved: boolean;
  ipBlocked?: boolean;
  createdAt: string;
}

export default function AdminOverviewPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlertItem[]>([]);
  const [alertSummary, setAlertSummary] = useState({ totalAlerts: 0, criticalCount: 0, unauthorizedCount: 0, blockedIpCount: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.status === 401) {
        router.push("/dashboard");
        return;
      }
      const data = await res.json();
      if (res.ok && data.stats) {
        setStats(data.stats);
        setRecentUsers(data.recentUsers || []);
      }

      // Fetch Security Alerts
      const alertsRes = await fetch("/api/admin/security-alerts");
      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setAlerts(alertsData.alerts || []);
        if (alertsData.summary) {
          setAlertSummary(alertsData.summary);
        }
      }
    } catch {
      console.error("Failed to load admin stats or alerts");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlockIp = async (ipAddress: string, action: "BLOCK" | "UNBLOCK") => {
    try {
      await fetch("/api/admin/security-alerts/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ipAddress, action }),
      });
      fetchStats();
    } catch (err) {
      console.error("Failed to block/unblock IP", err);
    }
  };

  const handleResolveAlert = async (alertId?: string) => {
    try {
      await fetch("/api/admin/security-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alertId ? { alertId } : { action: "CLEAR_ALL" }),
      });
      fetchStats();
    } catch (err) {
      console.error("Failed to resolve alert", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [router]);


  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#141b2c] via-[#101624] to-[#0d121e] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Master Admin View
            </span>
            <span className="text-xs text-slate-400">• Private Company Oversight</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            BuzzScout Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Full database authority, user management, and dynamic frontend configuration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/settings"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Frontend Site Config (CMS)</span>
          </Link>
          <Link
            href="/admin/licenses"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700 transition-all flex items-center gap-2"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>Generate LTD Key</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="p-5 rounded-2xl bg-[#0c101c] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Registered Users</span>
            <div className="h-8 w-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {loading ? "..." : stats?.totalUsers || 0}
            </span>
            <span className="text-xs text-indigo-300 font-medium">Customer Accounts</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Active Customers &amp; Platform Members
          </p>
        </div>

        {/* Pro Subscribers */}
        <div className="p-5 rounded-2xl bg-[#0c101c] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Pro Monthly Members</span>
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {loading ? "..." : stats?.proUsers || 0}
            </span>
            <span className="text-xs text-amber-400 font-medium">$5/mo Active</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Monthly Recurring Revenue
          </p>
        </div>

        {/* LTD Lifetime Customers */}
        <div className="p-5 rounded-2xl bg-[#0c101c] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">LTD Lifetime Deals Paid</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {loading ? "..." : stats?.ltdUsers || 0}
            </span>
            <span className="text-xs text-emerald-400 font-bold">$25 Passes</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Gross LTD: ${(stats?.ltdUsers || 0) * 25}
          </p>
        </div>

        {/* Total Captured Leads */}
        <div className="p-5 rounded-2xl bg-[#0c101c] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">System Leads Ingested</span>
            <div className="h-8 w-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {loading ? "..." : stats?.totalLeads || 0}
            </span>
            <span className="text-xs text-rose-400 font-medium">From Reddit & X</span>
          </div>
          <p className="text-[11px] text-slate-500">
            🔥 {stats?.highIntentLeadsCount || 0} High Intent Leads
          </p>
        </div>
      </div>

      {/* Executive Security & Intrusion Warning Center */}
      <div className="rounded-3xl bg-[#0c101c] border border-white/10 overflow-hidden shadow-xl">
        <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                alerts.some((a) => !a.resolved && a.severity === "CRITICAL")
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              }`}>
                {alerts.some((a) => !a.resolved && a.severity === "CRITICAL")
                  ? "Active Intrusion Alerts Detected"
                  : "Gateway Perimeter Secure"}
              </span>
              <span className="text-xs text-slate-400">• Anti-Intruder Sentry</span>
            </div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className={`w-5 h-5 ${alerts.some((a) => !a.resolved) ? "text-rose-400" : "text-emerald-400"}`} />
              Security Intrusion & Warning Logs
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live tracking of unauthorized access attempts, non-owner admin probes, and blocked brute-force attempts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right sm:block hidden">
              <div className="text-xs font-bold text-white font-mono flex items-center justify-end gap-2">
                <span>{alertSummary.unauthorizedCount} Probes Blocked</span>
                <span className="text-rose-400">• {alertSummary.blockedIpCount || 0} IPs Banned</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Exclusive Owner: Single-Admin Protected
              </div>
            </div>
            {alerts.length > 0 && (
              <button
                onClick={() => handleResolveAlert()}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Clear All Logs</span>
              </button>
            )}
          </div>
        </div>

        {alerts.length === 0 ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-white">Perimeter Safe</p>
            <p className="text-[11px] text-slate-400 mt-0.5">No unauthorized intrusion attempts detected on Admin Gateway.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-6">Attempted Email</th>
                  <th className="py-3 px-6">Client IP Address</th>
                  <th className="py-3 px-6">Current Status</th>
                  <th className="py-3 px-6">Attempted At</th>
                  <th className="py-3 px-6 text-right">Access Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                {alerts.slice(0, 15).map((a) => (
                  <tr key={a.id} className={`hover:bg-slate-900/40 transition-colors ${a.ipBlocked ? "bg-rose-950/20" : ""}`}>
                    <td className="py-3.5 px-6 font-bold text-white flex items-center gap-2">
                      <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${a.ipBlocked ? "text-rose-400" : "text-amber-400"}`} />
                      <span className="text-amber-300">{a.attemptedEmail}</span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-300">
                      {a.ipAddress}
                    </td>
                    <td className="py-3.5 px-6 font-sans">
                      {a.ipBlocked ? (
                        <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-bold">
                          🔴 BLOCKED
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
                          🟢 ALLOWED
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-slate-400 text-[11px]">
                      {new Date(a.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-6 text-right font-sans">
                      {a.ipBlocked ? (
                        <button
                          onClick={() => handleToggleBlockIp(a.ipAddress, "UNBLOCK")}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 ml-auto"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Unblock</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleBlockIp(a.ipAddress, "BLOCK")}
                          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 ml-auto"
                        >
                          <span>🚫 Block</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Users Table */}
      <div className="rounded-3xl bg-[#0c101c] border border-white/10 overflow-hidden shadow-xl">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              Recent Registered Users
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Client accounts created in database.
            </p>
          </div>
          <Link
            href="/admin/users"
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
          >
            <span>Manage All Users</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Loading database records...
          </div>
        ) : recentUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No user accounts found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-6">User</th>
                  <th className="py-3 px-6">Email</th>
                  <th className="py-3 px-6">Tier</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Keywords Tracked</th>
                  <th className="py-3 px-6 text-right">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {recentUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-white">
                      {u.name || "Founder"}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-300">
                      {u.email}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          u.plan === "LTD"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : u.plan === "PRO"
                            ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {u.plan}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          u.planStatus === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {u.planStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-300">
                      {u._count?.keywords || 0} keywords ({u._count?.leads || 0} leads)
                    </td>
                    <td className="py-4 px-6 text-right text-slate-400 font-mono text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
