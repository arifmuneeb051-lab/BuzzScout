"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Radar,
  LayoutDashboard,
  Tag,
  Flame,
  Bell,
  CreditCard,
  LogOut,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Settings,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  googleId?: string | null;
  productName: string;
  plan: string;
  planStatus: string;
  role?: string;
  createdAt?: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [planForbidden, setPlanForbidden] = useState(false);

  // Initial user fetch
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          const active = data.user.role === "ADMIN" || data.user.planStatus === "ACTIVE";
          if (!active) {
            setPlanForbidden(true);
            if (pathname !== "/dashboard/billing") {
              router.replace("/dashboard/billing?notice=subscription_required&forbidden=1");
            }
          }
        }
      })
      .catch(() => router.push("/login"));
  }, [router, pathname]);

  // CONTINUOUS 5-7 SECOND PLAN VERIFICATION HEARTBEAT (Active Plan Enforcement & Anti-Scam Guard)
  useEffect(() => {
    let isMounted = true;

    const checkPlanStatus = async () => {
      try {
        const res = await fetch("/api/auth/plan-guard");
        if (!res.ok) {
          // HTTP 403 Forbidden received
          if (isMounted) {
            setPlanForbidden(true);
            if (pathname !== "/dashboard/billing") {
              router.replace("/dashboard/billing?notice=subscription_required&forbidden=1");
            }
          }
        } else {
          const data = await res.json();
          if (isMounted) {
            if (!data.active) {
              setPlanForbidden(true);
              if (pathname !== "/dashboard/billing") {
                router.replace("/dashboard/billing?notice=subscription_required&forbidden=1");
              }
            } else {
              if (pathname === "/dashboard/billing" && typeof window !== "undefined" && window.location.search.includes("notice=subscription_required")) {
                router.replace("/dashboard");
              }
              setPlanForbidden(false);
            }
          }
        }
      } catch {
        // Network or fetch abort
      }
    };

    // Run every 6 seconds (within the 5-7 second window)
    const interval = setInterval(checkPlanStatus, 6000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [pathname, router]);

  // STEALTH SUPERUSER TRIGGER: #admin in URL
  useEffect(() => {
    const handleHashCheck = () => {
      if (typeof window === "undefined") return;
      const hash = window.location.hash.toLowerCase().trim();
      if (hash === "#admin") {
        if (
          user &&
          user.email?.toLowerCase().trim() === "arifmuneeb81@gmail.com" &&
          user.googleId
        ) {
          // Master Admin authorized via Google OAuth -> Transition immediately to Admin Command Center
          window.location.href = "/admin";
        } else if (user) {
          // Unauthorized user or non-Google session -> Purge the trigger immediately and remain safely on dashboard
          window.history.replaceState(null, "", window.location.pathname);
        }
      }
    };

    handleHashCheck();
    window.addEventListener("hashchange", handleHashCheck);
    return () => window.removeEventListener("hashchange", handleHashCheck);
  }, [user]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const handleManualScan = async () => {
    setScanning(true);
    setScanResult(null);
    try {
      const res = await fetch("/api/cron/monitor", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setScanResult(`Scan complete! Discovered ${data.newLeadsDiscovered || 0} new leads.`);
        // Dispatch custom event to notify child components to refresh
        window.dispatchEvent(new Event("buzzscout:refresh"));
      } else {
        setScanResult(data.error || "Scan failed.");
      }
    } catch {
      setScanResult("Network error triggering scan.");
    } finally {
      setScanning(false);
      setTimeout(() => setScanResult(null), 4000);
    }
  };

  const isPlanActive = Boolean(
    user && (user.role === "ADMIN" || user.planStatus === "ACTIVE")
  );

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard, requiresPlan: true },
    { href: "/dashboard/keywords", label: "Tracked Keywords", icon: Tag, requiresPlan: true },
    { href: "/dashboard/leads", label: "Leads Feed & Pitch", icon: Flame, requiresPlan: true },
    { href: "/dashboard/billing", label: "Billing", icon: CreditCard, requiresPlan: false },
    { href: "/dashboard/settings", label: "Settings", icon: Settings, requiresPlan: false },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] flex text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a101d] border-r border-white/5 flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Radar className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white">BuzzScout</span>
            </Link>
          </div>

          {/* User & Plan Card */}
          <div className="p-3.5 mx-4 mt-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2.5 shadow-lg shadow-black/20">
            <div className="flex items-center gap-3">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name || "User Avatar"}
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/40 shrink-0 shadow-sm"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-sm">
                  {(user?.name || user?.email || "F").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">
                  {user?.name || "Founder"}
                </p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
              <span className="text-slate-400 text-[10px] font-medium">Plan Tier:</span>
              <span
                className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  user?.plan === "LTD"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : user?.plan === "AGENCY"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : user?.plan === "PRO"
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                }`}
              >
                {user?.plan === "LTD" ? "LTD Pass" : user?.plan === "AGENCY" ? "Agency" : user?.plan === "PRO" ? "Pro Tier" : "Pending Payment"}
              </span>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="p-4 space-y-1 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const isLocked = !isPlanActive && item.requiresPlan;

              return (
                <Link
                  key={item.href}
                  href={isLocked ? "/dashboard/billing?notice=subscription_required&forbidden=1" : item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 font-semibold"
                      : isLocked
                      ? "text-slate-500 hover:text-slate-400 hover:bg-slate-900/30 opacity-75"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : isLocked ? "text-slate-600" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {isLocked && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      Locked
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom actions */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 sm:h-16 bg-[#090e1b] border-b border-white/5 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Radar Active
            </span>
            {scanResult && (
              <span className="text-xs text-indigo-300 font-medium bg-indigo-950/60 px-3 py-1 rounded-md border border-indigo-500/30 animate-fade-in">
                {scanResult}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleManualScan}
              disabled={scanning}
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-all shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${scanning ? "animate-spin" : ""}`} />
              <span>{scanning ? "Scanning Social..." : "Scan Radar Now"}</span>
            </button>
          </div>
        </header>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex overflow-x-auto no-scrollbar border-b border-white/5 bg-[#0a101d] px-3 py-1.5 gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const isLocked = !isPlanActive && item.requiresPlan;

            return (
              <Link
                key={item.href}
                href={isLocked ? "/dashboard/billing?notice=subscription_required&forbidden=1" : item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${
                  isActive ? "bg-indigo-600 text-white font-semibold" : isLocked ? "text-slate-500 opacity-60" : "text-slate-400"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {isLocked && <Lock className="w-2.5 h-2.5 text-rose-400 ml-0.5" />}
              </Link>
            );
          })}
        </div>

        {/* Content body */}
        <main className="flex-1 px-3 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl w-full mx-auto min-w-0 overflow-x-hidden">
          {/* Continuous Live Plan Guard Error 403 Forbidden Banner UI Removed as requested (Background check still runs) */}

          {children}
        </main>
      </div>
    </div>
  );
}
