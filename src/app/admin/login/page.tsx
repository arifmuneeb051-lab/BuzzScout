"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DecommissionedAdminLogin() {
  const router = useRouter();

  useEffect(() => {
    // Admin Login Interface is permanently eliminated for top-notch stealth security.
    // All users and visitors are immediately redirected to the client dashboard.
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#06080e] flex items-center justify-center text-slate-400 font-mono text-xs">
      Redirecting to dashboard...
    </div>
  );
}
