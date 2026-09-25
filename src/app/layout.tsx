import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BuzzScout — Real-Time Social Listening & High-Intent Buyer Radar",
  description:
    "Monitor Reddit & X for high-intent buyer discussions in real-time. Get sub-60s Telegram & Discord alerts with 1-click AI sales pitches. Disruptive $9/mo or $49 Lifetime Deal.",
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
      { url: "/favicon.ico?v=2", sizes: "any" },
      { url: "/icon.svg?v=2", type: "image/svg+xml" },
      { url: "/icon.png?v=2", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/favicon.ico?v=2",
    apple: "/apple-icon.png?v=2",
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
        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg?v=2" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon.png?v=2" />
        <link rel="apple-touch-icon" href="/apple-icon.png?v=2" />
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
