"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  Sliders,
  Key,
  LogOut,
  ExternalLink,
  Database,
  Activity,
  Sparkles,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  const handleAdminLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const navItems = [
    { href: "/admin", label: "Executive Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: "User Database", icon: Users },
    { href: "/admin/settings", label: "Frontend Site Config (CMS)", icon: Sliders },
    { href: "/admin/licenses", label: "License Key Manager", icon: Key },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex selection:bg-amber-500/30 selection:text-amber-200">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-[#0a0d15] border-r border-white/10 flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          {/* Logo & Admin Badge */}
          <div className="p-6 border-b border-white/10">
            <Link href="/admin" className="flex items-center space-x-3 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-400/30">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-base text-white tracking-tight block">
                  SignalPulse
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block font-bold">
                  Admin Command
                </span>
              </div>
            </Link>
          </div>

          {/* Database Health Badge */}
          <div className="p-4 mx-4 mt-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>DB Engine</span>
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400">
              Prisma + MongoDB Ready
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-amber-600 to-indigo-600 text-white shadow-lg shadow-amber-600/20 font-bold"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            href="/dashboard"
            target="_blank"
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900/80 transition-colors"
          >
            <span>Open Client Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleAdminLogout}
            className="w-full flex items-center space-x-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Admin Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-[#080b12] border-b border-white/10 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono text-amber-400 flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              Master Mode: Active
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/"
              target="_blank"
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <span>View Landing Page</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Mobile Navigation */}
        <div className="md:hidden flex overflow-x-auto border-b border-white/10 bg-[#0a0d15] px-2 py-1 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${
                  isActive ? "bg-amber-600 text-white font-bold" : "text-slate-400"
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
