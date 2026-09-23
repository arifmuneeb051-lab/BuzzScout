import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BuzzScout — Real-Time Social Listening & High-Intent Buyer Radar",
  description:
    "Monitor Reddit & X for high-intent buyer discussions in real-time. Get sub-60s Telegram & Discord alerts with 1-click AI sales pitches. Disruptive $5/mo or $25 Lifetime Deal.",
  keywords: [
    "BuzzScout",
    "social listening",
    "reddit monitor",
    "twitter monitor",
    "buyer leads radar",
    "brand24 alternative",
    "mention alternative",
    "lead conversion",
  ],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#070a12] text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}
