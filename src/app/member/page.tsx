"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MemberRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/pass");
  }, [router]);

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center text-clay font-mono text-[11px] uppercase tracking-[0.16em]">
      Redirecting to Member Pass...
    </div>
  );
}

