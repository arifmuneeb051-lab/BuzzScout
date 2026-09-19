import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SignalPulse — High-Intent Reddit & X Buyer Lead Monitor",
  description:
    "Monitor Reddit & X for high-intent buyer phrases in real-time. Get instant Telegram & Discord alerts with one-click AI sales pitches. Only $9/mo or $39 Lifetime Deal.",
  keywords: [
    "social listening",
    "reddit monitor",
    "twitter monitor",
    "indie hacker leads",
    "brand24 alternative",
    "mention alternative",
    "lead generation",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}
