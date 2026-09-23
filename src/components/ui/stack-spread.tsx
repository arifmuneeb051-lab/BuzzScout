"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Radar, 
  Sparkles, 
  ArrowUpRight, 
  Bell, 
  MessageSquare, 
  ShieldCheck, 
  Layers, 
  ChevronDown, 
  DollarSign, 
  Send,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface StackItem {
  id: string;
  category: string;
  platform: "REDDIT" | "TWITTER" | "AI" | "ALERT" | "PAYMENT";
  author: string;
  timeAgo: string;
  badge: string;
  badgeColor: string;
  title: string;
  body: string;
  metric: string;
  rotation: number;
  spreadX: number;
  spreadY: number;
  shortLabel: string;
}

const STACK_ITEMS: StackItem[] = [
  {
    id: "card-1",
    category: "High Intent Buyer Lead",
    platform: "REDDIT",
    author: "u/SaaS_Founder99",
    timeAgo: "24s ago",
    badge: "98% Buyer Intent",
    badgeColor: "bg-rose-500/10 text-rose-500 border-rose-500/30",
    title: "Looking for an alternative to overpriced monitoring tools",
    body: "Tired of paying $150+/month for enterprise tools just to track 3 Reddit keywords. Need a fast indie tool with instant notifications.",
    metric: "r/startups • 4.2k members",
    rotation: -4,
    spreadX: -240,
    spreadY: -40,
    shortLabel: "1. Reddit Lead",
  },
  {
    id: "card-2",
    category: "Real-Time X Signal",
    platform: "TWITTER",
    author: "@tech_founder_kim",
    timeAgo: "1m ago",
    badge: "95% Buyer Intent",
    badgeColor: "bg-sky-500/10 text-sky-500 border-sky-500/30",
    title: "Who makes a clean social listening tool for solo founders?",
    body: "Want something lightweight that pings Telegram when someone asks for recommendations. Flat fee preferred!",
    metric: "X / Twitter Stream",
    rotation: 6,
    spreadX: 240,
    spreadY: -35,
    shortLabel: "2. X Signal",
  },
  {
    id: "card-3",
    category: "1-Click AI Sales Pitch",
    platform: "AI",
    author: "BuzzScout AI Drafter",
    timeAgo: "Just now",
    badge: "3 Conversion Tones Ready",
    badgeColor: "bg-indigo-500/10 text-indigo-500 border-indigo-500/30",
    title: "Helpful & Founder Story Angle Generated",
    body: "\"Hey! Built BuzzScout to solve this exact pricing gouging. Flat $5/mo or $25 lifetime pass. Zero enterprise bloat, instant alerts.\"",
    metric: "Under 30s Response Time",
    rotation: -2,
    spreadX: -120,
    spreadY: 90,
    shortLabel: "3. AI Pitch",
  },
  {
    id: "card-4",
    category: "Instant Discord Alert",
    platform: "ALERT",
    author: "BuzzScout Webhook Bot",
    timeAgo: "12s ago",
    badge: "Sub-60s Push",
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
    title: "🚨 Alert Sent to Your Private Discord Server",
    body: "High-intent buyer detected for keyword 'alternative to'. One click to copy ready-made response and view original thread.",
    metric: "Discord & Telegram Connected",
    rotation: 5,
    spreadX: 120,
    spreadY: 85,
    shortLabel: "4. Alerts",
  },
  {
    id: "card-5",
    category: "Direct Stripe Bank Deposit",
    platform: "PAYMENT",
    author: "Stripe Gateway",
    timeAgo: "2m ago",
    badge: "$25 LTD Claimed",
    badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    title: "Founder Claimed Lifetime Pass ($25.00)",
    body: "Payment routed directly to owner's connected bank account via custom Stripe payment link. Zero intermediary hold.",
    metric: "100% Owner Margin",
    rotation: 0,
    spreadX: 0,
    spreadY: -80,
    shortLabel: "5. Payout",
  },
];

export function StackSpread({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const [isSpread, setIsSpread] = useState(false);
  const [activeCardId, setActiveCardId] = useState<string>("card-1");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const activeIndex = STACK_ITEMS.findIndex((item) => item.id === activeCardId);

  const handleNext = () => {
    const nextIndex = (activeIndex + 1) % STACK_ITEMS.length;
    setActiveCardId(STACK_ITEMS[nextIndex].id);
  };

  const handlePrev = () => {
    const prevIndex = (activeIndex - 1 + STACK_ITEMS.length) % STACK_ITEMS.length;
    setActiveCardId(STACK_ITEMS[prevIndex].id);
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto py-10 px-3 sm:px-6 overflow-hidden">
      {/* Clean Pipeline Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold mb-3 shadow-md ${
            theme === "dark"
              ? "bg-slate-900/90 border-indigo-500/30 text-indigo-300"
              : "bg-white border-slate-300 text-slate-900 shadow-slate-200"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Real-Time Buyer Pipeline</span>
        </div>
        <h3
          className={`text-2xl sm:text-3xl font-black tracking-tight ${
            theme === "dark" ? "text-white" : "text-slate-950"
          }`}
        >
          The Live Revenue Machine in Action
        </h3>
        <p
          className={`mt-2 text-xs sm:text-sm max-w-xl px-2 ${
            theme === "dark" ? "text-slate-400" : "text-slate-600"
          }`}
        >
          Tap or hover any card below to bring it directly front and center. Inspect how BuzzScout captures buyers from Reddit &amp; X to bank payouts.
        </p>

        {/* Stage Selector Pills (Touch & Click friendly) */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap mt-4 max-w-full px-2">
          {STACK_ITEMS.map((item) => {
            const isCurrent = activeCardId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveCardId(item.id);
                  setIsSpread(true);
                }}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all border shrink-0 ${
                  isCurrent
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30 scale-105"
                    : theme === "dark"
                    ? "bg-slate-900/80 hover:bg-slate-800 text-slate-400 border-white/10"
                    : "bg-white hover:bg-slate-100 text-slate-700 border-slate-300"
                }`}
              >
                {item.shortLabel}
              </button>
            );
          })}
        </div>

        {/* Toggle Spread Button (Desktop) & Next/Prev Controls (Mobile) */}
        <div className="flex items-center gap-2 mt-4">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous Stage"
            className={`p-2 rounded-xl border text-xs font-bold transition-all shadow-sm active:scale-95 ${
              theme === "dark"
                ? "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-white/10"
                : "bg-white hover:bg-slate-100 text-slate-800 border-slate-300"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsSpread(!isSpread)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all shadow-md active:scale-95 ${
              isSpread
                ? "bg-indigo-600 text-white border-indigo-500"
                : theme === "dark"
                ? "bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700"
                : "bg-white hover:bg-slate-100 text-slate-900 border-slate-300"
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>{isSpread ? "Focus Centered Card" : "Fan Out Stack"}</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Stage"
            className={`p-2 rounded-xl border text-xs font-bold transition-all shadow-sm active:scale-95 ${
              theme === "dark"
                ? "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-white/10"
                : "bg-white hover:bg-slate-100 text-slate-800 border-slate-300"
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Stack Spread Canvas */}
      <div
        className="relative h-[440px] sm:h-[460px] w-full flex items-center justify-center select-none"
        onMouseEnter={() => {
          if (!isMobile) setIsSpread(true);
        }}
      >
        {/* Background ambient lighting */}
        <div
          className={`absolute inset-0 rounded-3xl opacity-50 blur-3xl transition-opacity pointer-events-none ${
            isSpread ? "opacity-100" : "opacity-30"
          } ${
            theme === "dark"
              ? "bg-gradient-to-r from-indigo-900/20 via-purple-900/20 to-pink-900/20"
              : "bg-gradient-to-r from-indigo-200/40 via-purple-100/30 to-sky-200/40"
          }`}
        />

        {/* Stack Items Array */}
        {STACK_ITEMS.map((item, index) => {
          const isSelected = activeCardId === item.id;
          const offsetFromActive = index - activeIndex;

          let targetX = 0;
          let targetY = 0;
          let targetRotate = 0;
          let zIndex = 20;

          if (isMobile) {
            // Mobile layout: active card is centered (0,0) without exceeding viewport width.
            // Inactive cards peek gently underneath.
            if (isSelected) {
              targetX = 0;
              targetY = 0;
              targetRotate = 0;
              zIndex = 40;
            } else {
              targetX = offsetFromActive * 8;
              targetY = Math.abs(offsetFromActive) * 10;
              targetRotate = offsetFromActive * 3;
              zIndex = 30 - Math.abs(offsetFromActive);
            }
          } else {
            // Desktop layout:
            if (isSelected) {
              // Bring selected/clicked card directly to front center
              targetX = 0;
              targetY = -15;
              targetRotate = 0;
              zIndex = 50;
            } else if (isSpread) {
              // Spread out cards
              targetX = item.spreadX;
              targetY = item.spreadY;
              targetRotate = item.rotation;
              zIndex = 20 - Math.abs(index - 2);
            } else {
              // Stacked cards
              targetX = (index - 2) * 8;
              targetY = (index - 2) * 6;
              targetRotate = (index - 2) * 3;
              zIndex = 20 - Math.abs(index - 2);
            }
          }

          return (
            <motion.div
              key={item.id}
              onClick={(e) => {
                e.stopPropagation();
                setActiveCardId(item.id);
                setIsSpread(true);
              }}
              animate={{
                x: targetX,
                y: targetY,
                rotate: targetRotate,
                scale: isSelected ? (isMobile ? 1 : 1.05) : 0.96,
                zIndex,
                opacity: isMobile && !isSelected ? 0.45 : 1,
              }}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 26,
                mass: 0.7,
              }}
              whileHover={{
                scale: isSelected ? 1.06 : 1.02,
                zIndex: 45,
                transition: { duration: 0.15 },
              }}
              className={`absolute w-[calc(100vw-2.5rem)] sm:w-[340px] max-w-[340px] rounded-2xl border p-4 sm:p-5 shadow-2xl transition-colors cursor-pointer ${
                theme === "dark"
                  ? "bg-[#0b101d]/95 border-white/[0.12] shadow-black/80 backdrop-blur-2xl"
                  : "bg-white border-slate-200 shadow-slate-400/25 backdrop-blur-2xl"
              } ${isSelected ? "ring-2 ring-indigo-500 shadow-indigo-500/20" : ""}`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-7 w-7 rounded-lg flex items-center justify-center ${
                      item.platform === "REDDIT"
                        ? "bg-rose-500/10 text-rose-500"
                        : item.platform === "TWITTER"
                        ? "bg-sky-500/10 text-sky-500"
                        : item.platform === "AI"
                        ? "bg-indigo-500/10 text-indigo-500"
                        : item.platform === "ALERT"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-amber-500/10 text-amber-500"
                    }`}
                  >
                    {item.platform === "REDDIT" && <MessageSquare className="w-3.5 h-3.5" />}
                    {item.platform === "TWITTER" && <Send className="w-3.5 h-3.5" />}
                    {item.platform === "AI" && <Sparkles className="w-3.5 h-3.5" />}
                    {item.platform === "ALERT" && <Bell className="w-3.5 h-3.5" />}
                    {item.platform === "PAYMENT" && <DollarSign className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <span
                      className={`text-xs font-bold block leading-tight truncate ${
                        theme === "dark" ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {item.author}
                    </span>
                    <span className="text-[10px] text-slate-400 block leading-none mt-0.5">
                      {item.timeAgo}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              </div>

              {/* Title & Body */}
              <div className="space-y-1.5">
                <h4
                  className={`text-xs sm:text-sm font-bold leading-snug line-clamp-2 ${
                    theme === "dark" ? "text-slate-100" : "text-slate-950"
                  }`}
                >
                  {item.title}
                </h4>
                <p
                  className={`text-xs leading-relaxed line-clamp-3 ${
                    theme === "dark" ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  {item.body}
                </p>
              </div>

              {/* Card Footer */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <span className="truncate pr-2">{item.metric}</span>
                <span className="flex items-center gap-0.5 text-indigo-500 hover:text-indigo-600 font-bold shrink-0">
                  <span>{isSelected ? "Active Focus" : "Click to View"}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination Dot Indicators */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {STACK_ITEMS.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-label={`Go to stage ${index + 1}`}
            onClick={() => {
              setActiveCardId(item.id);
              setIsSpread(true);
            }}
            className={`h-2 rounded-full transition-all ${
              activeCardId === item.id
                ? "w-6 bg-indigo-500 shadow-sm shadow-indigo-500/50"
                : "w-2 bg-slate-600/40 hover:bg-slate-500"
            }`}
          />
        ))}
      </div>

      {/* Helper text */}
      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
        <ChevronDown className="w-4 h-4 animate-bounce text-indigo-500" />
        <span>Click or tap any card to focus right in front</span>
      </div>
    </div>
  );
}

export default StackSpread;
