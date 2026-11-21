"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MemberRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/pass");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#CCFF00] text-sm uppercase tracking-widest font-bold">
      Redirecting to Member Pass...
    </div>
  );
}
