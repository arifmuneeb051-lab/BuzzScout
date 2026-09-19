"use client";

import { useEffect, useState } from "react";
import { Sliders, Save, CheckCircle2, AlertCircle, Sparkles, Eye, RefreshCw } from "lucide-react";

export default function AdminSettingsPage() {
  const [formData, setFormData] = useState({
    heroHeadline: "",
    heroSubtitle: "",
    announcementText: "",
    trialDays: 7,
    monthlyPrice: 9,
    ltdPrice: 39,
    agencyPrice: 79,
    stripeSecretKey: "",
    stripePublishableKey: "",
    stripePaymentLink: "",
    paymentMode: "TEST",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/admin/config");
      const data = await res.json();
      if (res.ok && data.config) {
        setFormData({
          heroHeadline: data.config.heroHeadline,
          heroSubtitle: data.config.heroSubtitle,
          announcementText: data.config.announcementText,
          trialDays: data.config.trialDays,
          monthlyPrice: data.config.monthlyPrice,
          ltdPrice: data.config.ltdPrice,
          agencyPrice: data.config.agencyPrice || 79,
          stripeSecretKey: data.config.stripeSecretKey || "",
          stripePublishableKey: data.config.stripePublishableKey || "",
          stripePaymentLink: data.config.stripePaymentLink || "",
          paymentMode: data.config.paymentMode || "TEST",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to load current configuration." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: "success",
          text: "Frontend Site Configuration updated and published live to visitors!",
        });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save configuration" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error saving site settings" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Sliders className="w-6 h-6 text-amber-400" />
          Frontend Site Configurator (CMS)
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Modify the client landing page text, pricing, and trial limits directly without altering backend source code.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 border ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/20 text-rose-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Copy / Content Card */}
        <div className="p-6 rounded-3xl bg-[#0c101c] border border-white/10 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Hero & Messaging Content
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Top Announcement Banner Bar
            </label>
            <input
              type="text"
              value={formData.announcementText}
              onChange={(e) => setFormData({ ...formData, announcementText: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Main Hero Headline
            </label>
            <input
              type="text"
              value={formData.heroHeadline}
              onChange={(e) => setFormData({ ...formData, heroHeadline: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Hero Subtitle / Description
            </label>
            <textarea
              rows={3}
              value={formData.heroSubtitle}
              onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Pricing & Trial Limits Card */}
        <div className="p-6 rounded-3xl bg-[#0c101c] border border-white/10 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <Sliders className="w-4 h-4" />
            Pricing & Trial Durations
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Trial Window (Days)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={formData.trialDays}
                onChange={(e) => setFormData({ ...formData, trialDays: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Monthly Plan (\$)
              </label>
              <input
                type="number"
                min="1"
                value={formData.monthlyPrice}
                onChange={(e) => setFormData({ ...formData, monthlyPrice: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Lifetime Deal (\$)
              </label>
              <input
                type="number"
                min="1"
                value={formData.ltdPrice}
                onChange={(e) => setFormData({ ...formData, ltdPrice: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-emerald-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Agency Plan (\$)
              </label>
              <input
                type="number"
                min="1"
                value={formData.agencyPrice}
                onChange={(e) => setFormData({ ...formData, agencyPrice: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Payment Gateway & Stripe Owner Configuration */}
        <div className="p-6 rounded-3xl bg-[#0b0f19]/90 border border-white/10 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Stripe & Payment Gateway Settings (Owner Bank Routing)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                All customer subscription & LTD payments will be routed directly to the Stripe account configured below.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              Direct Settlement
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Payment Mode
              </label>
              <select
                value={formData.paymentMode || "TEST"}
                onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
              >
                <option value="TEST">🧪 Test Mode (Simulated / Stripe Test)</option>
                <option value="LIVE">🚀 Live Mode (Real Card Processing)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Stripe Direct Payment Link (Optional)
              </label>
              <input
                type="text"
                placeholder="https://buy.stripe.com/..."
                value={formData.stripePaymentLink || ""}
                onChange={(e) => setFormData({ ...formData, stripePaymentLink: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Stripe Secret Key (sk_live_... or sk_test_...)
              </label>
              <input
                type="password"
                placeholder="sk_test_51..."
                value={formData.stripeSecretKey || ""}
                onChange={(e) => setFormData({ ...formData, stripeSecretKey: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Stripe Publishable Key (pk_live_... or pk_test_...)
              </label>
              <input
                type="text"
                placeholder="pk_test_51..."
                value={formData.stripePublishableKey || ""}
                onChange={(e) => setFormData({ ...formData, stripePublishableKey: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Client Landing Page</span>
          </a>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Publishing Changes..." : "Publish to Live Site"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
