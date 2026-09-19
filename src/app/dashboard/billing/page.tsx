"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  Zap,
  Key,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export default function BillingPage() {
  const [userPlan, setUserPlan] = useState<string>("FREE");
  const [loading, setLoading] = useState(true);
  const [ltdCode, setLtdCode] = useState("");
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemStatus, setRedeemStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (res.ok && data.user) {
        setUserPlan(data.user.plan);
      }
    } catch {
      console.error("Failed to load user plan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setRedeemStatus(null);
    setRedeemLoading(true);

    try {
      const res = await fetch("/api/billing/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: ltdCode }),
      });

      const data = await res.json();
      if (res.ok) {
        setRedeemStatus({ type: "success", text: data.message });
        setUserPlan(data.plan || "LTD");
        setLtdCode("");
      } else {
        setRedeemStatus({ type: "error", text: data.error || "Failed to redeem code" });
      }
    } catch {
      setRedeemStatus({ type: "error", text: "Network error redeeming license" });
    } finally {
      setRedeemLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <CreditCard className="w-6 h-6 text-indigo-400" />
          Subscription & Lifetime Deal (LTD)
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your plan, upgrade to Pro, or activate your Lifetime Founder Pass.
        </p>
      </div>

      {/* Current Plan Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#121b30] to-[#0c1322] border border-indigo-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
              Current Active Tier
            </span>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-extrabold text-white">
                {userPlan === "LTD" ? "Lifetime Founder Pass (LTD)" : userPlan === "PRO" ? "Pro Monthly (\$9/mo)" : "Free Starter"}
              </h2>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  userPlan === "LTD"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : userPlan === "PRO"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {userPlan === "LTD" ? "Lifetime Access" : "Active"}
              </span>
            </div>
          </div>

          {userPlan === "LTD" ? (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>You have unlocked unlimited lifetime access! No monthly bills.</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLtdCode("SIGNAL-LTD-PRO-2026")}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Upgrade to \$39 LTD</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* LTD License Key Activation Box */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0c1322] border border-white/5 space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Redeem Lifetime License Key</h3>
            <p className="text-xs text-slate-400">Purchased on AppSumo, Product Hunt, or LemonSqueezy?</p>
          </div>
        </div>

        {redeemStatus && (
          <div
            className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              redeemStatus.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                : "bg-rose-500/10 border border-rose-500/20 text-rose-300"
            }`}
          >
            {redeemStatus.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{redeemStatus.text}</span>
          </div>
        )}

        <form onSubmit={handleRedeemCode} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              16-Character License Code
            </label>
            <input
              type="text"
              required
              value={ltdCode}
              onChange={(e) => setLtdCode(e.target.value.toUpperCase())}
              placeholder="SIGNAL-LTD-PRO-2026"
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono uppercase tracking-wider"
            />
          </div>

          <button
            type="submit"
            disabled={redeemLoading || !ltdCode}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>{redeemLoading ? "Verifying..." : "Activate Lifetime Deal"}</span>
          </button>
        </form>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
          <span className="font-semibold text-slate-300">💡 Test Promo Codes (Pre-Seeded):</span>
          <p className="font-mono text-indigo-300">
            • <code>SIGNAL-LTD-PRO-2026</code> &nbsp;|&nbsp; • <code>LTD-FOUNDER-39</code>
          </p>
        </div>
      </div>
    </div>
  );
}
