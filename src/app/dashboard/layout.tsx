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
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  productName: string;
  plan: string;
  planStatus: string;
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
        }
      })
      .catch(() => router.push("/login"));
  }, [router]);

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
        window.dispatchEvent(new Event("signalpulse:refresh"));
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

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/keywords", label: "Tracked Keywords", icon: Tag },
    { href: "/dashboard/leads", label: "Leads Feed & Pitch", icon: Flame },
    { href: "/dashboard/channels", label: "Alert Channels", icon: Bell },
    { href: "/dashboard/billing", label: "Billing & LTD", icon: CreditCard },
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
              <span className="font-bold text-lg text-white">SignalPulse</span>
            </Link>
          </div>

          {/* User & Plan Card */}
          <div className="p-4 mx-4 mt-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 truncate max-w-[120px]">
                {user?.name || user?.email || "Founder"}
              </span>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  user?.plan === "LTD"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : user?.plan === "PRO"
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {user?.plan === "LTD" ? "LTD Pass" : user?.plan || "FREE"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate">
              Product: <span className="text-slate-400">{user?.productName || "My SaaS"}</span>
            </p>
          </div>

          {/* Navigation links */}
          <nav className="p-4 space-y-1 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
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
        <header className="h-16 bg-[#090e1b] border-b border-white/5 px-6 flex items-center justify-between sticky top-0 z-30">
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
            <Link
              href="/"
              target="_blank"
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <span>Landing</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex overflow-x-auto border-b border-white/5 bg-[#0a101d] px-2 py-1 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${
                  isActive ? "bg-indigo-600 text-white font-semibold" : "text-slate-400"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Content body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
