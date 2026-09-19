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
  Clock,
  ArrowRight,
  Lock,
  Receipt,
  X,
  Check,
  Building,
  RefreshCw,
} from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  plan: string;
  status: string;
  paymentMethod: string;
  cardLast4?: string;
  createdAt: string;
}

export default function BillingPage() {
  const [userPlan, setUserPlan] = useState<string>("TRIAL");
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  
  // Checkout Modal State
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<"PRO" | "LTD" | "AGENCY" | null>(null);
  const [checkoutMethod, setCheckoutMethod] = useState<"CARD" | "STRIPE">("CARD");
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExp, setCardExp] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("888");
  const [cardHolder, setCardHolder] = useState("Founding Builder");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // License Code State
  const [ltdCode, setLtdCode] = useState("");
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemStatus, setRedeemStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Transaction History State
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchUserAndTransactions = async () => {
    try {
      const [resUser, resTx] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/billing/transactions"),
      ]);

      const dataUser = await resUser.json();
      if (resUser.ok && dataUser.user) {
        setUserPlan(dataUser.user.plan);
        setUserEmail(dataUser.user.email);
      }

      const dataTx = await resTx.json();
      if (resTx.ok && dataTx.transactions) {
        setTransactions(dataTx.transactions);
      }
    } catch {
      console.error("Failed to load billing details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAndTransactions();
  }, []);

  const handleOpenCheckout = (plan: "PRO" | "LTD" | "AGENCY") => {
    setSelectedPlanForUpgrade(plan);
    setCheckoutError(null);
    setCheckoutSuccess(null);
  };

  const handleExecuteCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForUpgrade) return;

    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlanForUpgrade,
          method: checkoutMethod,
          cardNumber,
          cardHolder,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCheckoutError(data.error || "Payment transaction could not be completed.");
        setCheckoutLoading(false);
        return;
      }

      if (data.url) {
        // Redirect to external Stripe checkout session or payment link
        window.location.href = data.url;
        return;
      }

      // Success direct upgrade
      setUserPlan(data.plan);
      setCheckoutSuccess(data.message || "Payment processed successfully!");
      fetchUserAndTransactions();
      setTimeout(() => {
        setSelectedPlanForUpgrade(null);
      }, 2500);
    } catch {
      setCheckoutError("Network error communicating with payment gateway.");
    } finally {
      setCheckoutLoading(false);
    }
  };

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
        fetchUserAndTransactions();
      } else {
        setRedeemStatus({ type: "error", text: data.error || "Failed to redeem code" });
      }
    } catch {
      setRedeemStatus({ type: "error", text: "Network error redeeming license" });
    } finally {
      setRedeemLoading(false);
    }
  };

  const planPrices = {
    PRO: 9,
    LTD: 39,
    AGENCY: 79,
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <CreditCard className="w-6 h-6 text-indigo-400" />
          Subscription & Payment Center
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Select a founder tier, complete card payment via Stripe, or activate an LTD license key.
        </p>
      </div>

      {/* Current Plan Overview Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#121b30] to-[#0c1322] border border-indigo-500/30 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
              Current Active Account Status
            </span>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {userPlan === "LTD" 
                  ? "Lifetime Founder Pass (LTD)" 
                  : userPlan === "AGENCY"
                  ? "Agency Team Pass"
                  : userPlan === "PRO" 
                  ? "Pro Monthly ($9/mo)" 
                  : "7-Day Full Access Trial"}
              </h2>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  userPlan === "LTD" || userPlan === "AGENCY"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : userPlan === "PRO"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                }`}
              >
                {userPlan === "LTD" || userPlan === "AGENCY" ? "Permanent Lifetime" : "Active Tier"}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Registered email: <span className="text-slate-200 font-mono">{userEmail || "user@signalpulse.io"}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenCheckout("LTD")}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Upgrade Plan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Plan Selection Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          Choose Your Plan & Pay
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Plan 1: Pro Monthly */}
          <div className="p-6 rounded-3xl bg-[#0b101d]/90 border border-slate-800 flex flex-col justify-between space-y-6 hover:border-slate-700 transition-colors">
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wide">
                Flexible Subscription
              </span>
              <div>
                <h4 className="text-xl font-bold text-white">Pro Monthly</h4>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">$9</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>10 active keywords tracked</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Sub-60s Telegram & Discord pings</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>AI Pitch generator unlimited</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Cancel anytime with 1 click</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleOpenCheckout("PRO")}
              disabled={userPlan === "PRO"}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors border border-slate-700 disabled:opacity-50"
            >
              {userPlan === "PRO" ? "Currently Active" : "Subscribe $9/Month"}
            </button>
          </div>

          {/* Plan 2: Lifetime Founder Pass (Featured) */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#16233e] to-[#0c1426] border-2 border-indigo-500 shadow-2xl shadow-indigo-600/30 flex flex-col justify-between space-y-6 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md">
              Most Popular
            </span>
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wide">
                One-Time Payment
              </span>
              <div>
                <h4 className="text-xl font-extrabold text-white">Lifetime Founder Pass</h4>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold text-white">$39</span>
                  <span className="text-xs text-indigo-300">one-time payment</span>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-200 font-medium">
                <li className="flex items-center gap-2 font-bold">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Unlimited keywords tracked forever</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Reddit & Twitter 24/7 scanning</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Instant Telegram bot pings</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Zero monthly subscription fees forever</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleOpenCheckout("LTD")}
              disabled={userPlan === "LTD"}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/40 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{userPlan === "LTD" ? "Founder Pass Active" : "Get Lifetime Access ($39)"}</span>
            </button>
          </div>

          {/* Plan 3: Agency Pass */}
          <div className="p-6 rounded-3xl bg-[#0b101d]/90 border border-slate-800 flex flex-col justify-between space-y-6 hover:border-slate-700 transition-colors">
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wide">
                Agencies & Power Users
              </span>
              <div>
                <h4 className="text-xl font-bold text-white">Agency License</h4>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">$79</span>
                  <span className="text-xs text-slate-400">/ lifetime</span>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Everything in Lifetime Pass</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Multi-brand profiles for clients</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Multiple Discord/Telegram webhooks</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleOpenCheckout("AGENCY")}
              disabled={userPlan === "AGENCY"}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors border border-slate-700 disabled:opacity-50"
            >
              {userPlan === "AGENCY" ? "Agency Tier Active" : "Get Agency Pass ($79)"}
            </button>
          </div>
        </div>
      </div>

      {/* Credit Card / Stripe Checkout Modal */}
      {selectedPlanForUpgrade && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0c1220] border border-white/10 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedPlanForUpgrade(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase text-indigo-400">
                Secure Checkout
              </span>
              <h3 className="text-xl font-extrabold text-white">
                Upgrade to {selectedPlanForUpgrade === "LTD" ? "Lifetime Founder Pass" : selectedPlanForUpgrade === "AGENCY" ? "Agency Pass" : "Pro Monthly"}
              </h3>
              <p className="text-xs text-slate-400">
                Total due: <span className="text-white font-bold text-sm">${planPrices[selectedPlanForUpgrade]} USD</span>
              </p>
            </div>

            {checkoutError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{checkoutError}</span>
              </div>
            )}

            {checkoutSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{checkoutSuccess}</span>
              </div>
            )}

            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setCheckoutMethod("CARD")}
                className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  checkoutMethod === "CARD"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Credit / Debit Card</span>
              </button>
              <button
                type="button"
                onClick={() => setCheckoutMethod("STRIPE")}
                className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  checkoutMethod === "STRIPE"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Stripe Gateway</span>
              </button>
            </div>

            <form onSubmit={handleExecuteCheckout} className="space-y-4">
              {checkoutMethod === "CARD" ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      required
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4242 •••• •••• 4242"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        required
                        value={cardExp}
                        onChange={(e) => setCardExp(e.target.value)}
                        placeholder="12/28"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        CVC Security
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="888"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-slate-300 space-y-2">
                  <p className="font-semibold text-white">Stripe Hosted Checkout:</p>
                  <p className="text-[11px] text-slate-400">
                    You will be securely routed to Stripe's encrypted payment page. Funds are settled directly to the platform owner.
                  </p>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={checkoutLoading}
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {checkoutLoading 
                      ? "Processing Payment..." 
                      : `Pay $${planPrices[selectedPlanForUpgrade]} & Activate Now`}
                  </span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>256-bit SSL Encrypted • Direct Stripe Merchant Settlement</span>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction & Receipt History */}
      <div className="p-6 rounded-3xl bg-[#0b101d]/90 border border-slate-800 space-y-4">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <Receipt className="w-4 h-4 text-indigo-400" />
          Payment History & Receipts
        </h3>

        {transactions.length === 0 ? (
          <p className="text-xs text-slate-400 italic">
            No previous payments recorded yet. Active trial or promo tier.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 text-slate-500 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Plan</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="py-3 px-3 text-slate-400 font-mono">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 font-bold text-white">{tx.plan}</td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                      ${tx.amount} {tx.currency.toUpperCase()}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">
                      {tx.paymentMethod} {tx.cardLast4 ? `•••• ${tx.cardLast4}` : ""}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Redeem License Key Box */}
      <div className="p-6 rounded-3xl bg-[#0b101d]/90 border border-slate-800 space-y-4">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-amber-400" />
          Redeem Partner or Lifetime Deal (LTD) License Key
        </h3>
        <p className="text-xs text-slate-400">
          Purchased a Lifetime Founder Pass or received a gift code? Enter your license key to instantly unlock unlimited access.
        </p>

        {redeemStatus && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
              redeemStatus.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/20 text-rose-300"
            }`}
          >
            {redeemStatus.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{redeemStatus.text}</span>
          </div>
        )}

        <form onSubmit={handleRedeemCode} className="flex flex-col sm:flex-row gap-3 max-w-xl">
          <input
            type="text"
            required
            value={ltdCode}
            onChange={(e) => setLtdCode(e.target.value)}
            placeholder="e.g. SIGNAL-LTD-PRO-2026"
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={redeemLoading}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all whitespace-nowrap"
          >
            {redeemLoading ? "Verifying..." : "Redeem License"}
          </button>
        </form>
      </div>
    </div>
  );
}
