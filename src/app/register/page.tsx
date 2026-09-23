"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Radar,
  ArrowRight,
  Lock,
  Mail,
  User,
  Globe,
  AlertCircle,
  Key,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Tag
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    productName: "",
    productUrl: "",
    productPitch: "",
  });

  const [selectedPlan, setSelectedPlan] = useState<"PRO" | "LTD">("LTD");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [licenseKey, setLicenseKey] = useState("");
  const [validatingKey, setValidatingKey] = useState(false);
  const [keyValidation, setKeyValidation] = useState<{
    valid: boolean;
    plan?: string;
    message?: string;
    error?: string;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const notice = params.get("notice");
      if (notice === "google_setup_required") {
        setNoticeMessage("Official Google OAuth requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env. Please register with your Email and Password below, or configure your Google credentials.");
      }
    }
  }, []);

  const handleGoogleAuth = () => {
    setGoogleLoading(true);
    window.location.href = "/api/auth/google";
  };

  const handleValidateKey = async (codeToTest?: string) => {
    const code = (codeToTest !== undefined ? codeToTest : licenseKey).trim().toUpperCase();
    if (!code) {
      setKeyValidation(null);
      return;
    }

    setValidatingKey(true);
    try {
      const res = await fetch("/api/billing/validate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setKeyValidation({
          valid: true,
          plan: data.plan,
          message: data.message || `Valid Key! Grants full ${data.plan} access with $0 payment.`,
        });
      } else {
        setKeyValidation({
          valid: false,
          error: data.error || "Invalid license code. Please check and try again.",
        });
      }
    } catch {
      setKeyValidation({
        valid: false,
        error: "Network error validating key",
      });
    } finally {
      setValidatingKey(false);
    }
  };

  const [step, setStep] = useState<"REGISTER" | "OTP">("REGISTER");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!ageConfirmed) {
      setError("You must confirm that you are at least 18 years of age to register.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          selectedPlan,
          licenseKey: licenseKey.trim() || undefined,
          ageConfirmed,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to register account");
        setLoading(false);
        return;
      }

      if (data.requiresOtp) {
        setRegisteredEmail(data.email || formData.email);
        if (data.devOtp) setDevOtpHint(data.devOtp);
        setStep("OTP");
        setResendCooldown(60);
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otpCode || otpCode.trim().length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setVerifyingOtp(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registeredEmail,
          otp: otpCode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Verification failed. Please try again.");
        setVerifyingOtp(false);
        return;
      }

      // Successful verification -> proceed to dashboard!
      router.push("/dashboard");
    } catch {
      setError("Network error verifying code. Please try again.");
      setVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resendingOtp) return;
    setError(null);
    setResendingOtp(true);

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registeredEmail }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.devOtp) setDevOtpHint(data.devOtp);
        setNoticeMessage("A fresh 6-digit verification code has been dispatched!");
        setResendCooldown(60);
      } else {
        setError(data.error || "Failed to resend code");
      }
    } catch {
      setError("Network error resending code");
    } finally {
      setResendingOtp(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link href="/" className="inline-flex items-center space-x-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Radar className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            BuzzScout
          </span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {step === "OTP" ? "Verify Your Email" : "Create Founder Account"}
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          {step === "OTP"
            ? "Enter the 6-digit confirmation code sent to your email to activate your account."
            : "Register and select your plan or enter an Admin Access Key to activate."}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4 sm:px-0">
        <div className="bg-[#0e1627] border border-white/10 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl space-y-6">
          {noticeMessage && (
            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{noticeMessage}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === "OTP" ? (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400 shadow-xl shadow-indigo-500/10">
                  <Mail className="w-7 h-7 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">Enter 6-Digit Code</h3>
                <p className="text-xs text-slate-400">
                  We sent an activation code to <span className="text-indigo-400 font-semibold">{registeredEmail}</span>
                </p>
              </div>

              {devOtpHint && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-center gap-2 font-mono">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Testing Code: <strong className="text-white text-sm">{devOtpHint}</strong></span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider text-center">
                    6-Digit Security Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="••••••"
                    className="w-full text-center text-3xl font-mono font-extrabold tracking-[0.5em] py-3.5 px-4 rounded-xl bg-slate-900 border border-slate-700 text-indigo-400 focus:outline-none focus:border-indigo-500 placeholder:tracking-normal placeholder:text-slate-600 shadow-inner"
                  />
                </div>

                <button
                  type="submit"
                  disabled={verifyingOtp || otpCode.length !== 6}
                  className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{verifyingOtp ? "Activating Account..." : "Verify & Launch Radar"}</span>
                </button>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("REGISTER");
                      setError(null);
                    }}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    ← Back to Signup
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || resendingOtp}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold disabled:opacity-40 transition-colors"
                  >
                    {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : resendingOtp ? "Sending..." : "Resend Code"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              {/* Continue with Google Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={googleLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-3 shadow-md active:scale-[0.99] border border-slate-200"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>{googleLoading ? "Connecting with Google..." : "Sign up with Google"}</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0e1627] px-3 text-slate-400 font-mono">
                or register with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
            {/* User Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Your Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Product Details */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 block">
                Your Product Details (For AI Lead Pitches)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Product / Brand Name
                  </label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    placeholder="e.g. LeadPulse"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Product Website URL
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="url"
                      value={formData.productUrl}
                      onChange={(e) => setFormData({ ...formData, productUrl: e.target.value })}
                      placeholder="https://myproduct.com"
                      className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  1-Sentence Pitch
                </label>
                <textarea
                  rows={2}
                  value={formData.productPitch}
                  onChange={(e) => setFormData({ ...formData, productPitch: e.target.value })}
                  placeholder="e.g. Affordable real-time social listening for founders without $100/mo enterprise fees."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Plan Selection OR License Key */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  Choose Plan OR Enter Key
                </span>
                <span className="text-[11px] text-slate-400">
                  Select a plan or apply an Admin Key
                </span>
              </div>

              {/* License Key Redemption Box */}
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                <label className="block text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  Have an Admin Access Key / Founder Pass?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={licenseKey}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setLicenseKey(val);
                      if (!val) setKeyValidation(null);
                    }}
                    onBlur={() => {
                      if (licenseKey.trim()) handleValidateKey();
                    }}
                    placeholder="e.g. BUZZ-LTD-ABCD"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-white uppercase focus:outline-none focus:border-amber-400 placeholder:normal-case placeholder:font-sans placeholder:font-normal"
                  />
                  <button
                    type="button"
                    onClick={() => handleValidateKey()}
                    disabled={validatingKey || !licenseKey.trim()}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                  >
                    <span>{validatingKey ? "Checking..." : "Verify Key"}</span>
                  </button>
                </div>

                {keyValidation && keyValidation.valid && (
                  <div className="mt-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{keyValidation.message}</span>
                  </div>
                )}

                {keyValidation && !keyValidation.valid && (
                  <div className="mt-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{keyValidation.error}</span>
                  </div>
                )}
              </div>

              {/* Or Select Plan Cards */}
              {!keyValidation?.valid && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div
                    onClick={() => setSelectedPlan("PRO")}
                    className={`cursor-pointer p-3.5 rounded-2xl border transition-all ${
                      selectedPlan === "PRO"
                        ? "bg-indigo-600/15 border-indigo-500 shadow-md shadow-indigo-500/20"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-white">Pro Monthly</span>
                      <span className="text-xs font-extrabold text-indigo-400">$5 / mo</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Real-time social radar, instant Telegram &amp; Discord alerts.
                    </p>
                  </div>

                  <div
                    onClick={() => setSelectedPlan("LTD")}
                    className={`cursor-pointer p-3.5 rounded-2xl border transition-all relative ${
                      selectedPlan === "LTD"
                        ? "bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/20"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[9px]">
                      LIFETIME DEAL
                    </span>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-white">Founder Pass</span>
                      <span className="text-xs font-extrabold text-amber-400">$25 One-time</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Pay once, own forever. Zero recurring subscription.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 18+ Age & Terms Verification Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  required
                  checked={ageConfirmed}
                  onChange={(e) => setAgeConfirmed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs text-slate-300 leading-relaxed">
                  I confirm that I am <strong className="text-white">18 years of age or older</strong> and agree to the platform Terms of Service and Privacy Policy.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 rounded-2xl font-extrabold text-sm shadow-xl transition-all flex items-center justify-center gap-2 mt-4 ${
                keyValidation?.valid
                  ? "bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white shadow-emerald-500/25"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
              }`}
            >
              {keyValidation?.valid ? (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{loading ? "Activating Account..." : `Activate Account with ${keyValidation.plan || "Key"} ($0)`}</span>
                </>
              ) : (
                <>
                  <span>
                    {loading
                      ? "Creating Account..."
                      : `Create Account & Select ${selectedPlan === "LTD" ? "Founder Pass ($25)" : "Pro ($5/mo)"}`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-400 hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </>
      )}
    </div>
      </div>
    </div>
  );
}
