"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DeskRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/desk");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#CCFF00] text-sm uppercase tracking-widest font-bold">
      Redirecting to Desk Console...
    </div>
  );
}
