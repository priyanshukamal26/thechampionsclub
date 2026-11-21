"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, ShieldAlert, Mail, Phone, CheckCircle2, RefreshCw, ArrowRight, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";

export default function PendingConsentPage() {
  const { user, signOut } = useAuth();
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResendConsent = () => {
    setResending(true);
    setTimeout(() => {
      setResending(false);
      setResent(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#FAFAFA] flex flex-col justify-between relative overflow-hidden py-8">
      {/* Background Amber Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[650px] h-[320px] bg-amber-500/10 rounded-full blur-[170px] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 max-w-4xl mx-auto px-6 w-full flex items-center justify-between mb-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#CCFF00] flex items-center justify-center text-[#0A0A0A] font-black text-lg shadow-[0_0_20px_rgba(204,255,0,0.4)] group-hover:scale-105 transition-transform">
            <Trophy className="w-4 h-4 fill-current" />
          </div>
          <span className="font-extrabold tracking-tight text-white text-base md:text-lg uppercase font-[family-name:var(--font-space-grotesk)]">
            The Champions <span className="text-[#CCFF00]">Club</span>
          </span>
        </Link>

        <button
          onClick={() => signOut()}
          className="text-xs uppercase tracking-wider font-semibold text-[#888888] hover:text-white transition-colors"
        >
          Sign Out
        </button>
      </header>

      {/* Main Card */}
      <main className="relative z-10 max-w-2xl mx-auto px-6 w-full flex-grow flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#141414] border border-amber-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl relative"
        >
          {/* Status Badge */}
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto mb-6 border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="text-center mb-6">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-amber-400 block mb-1">
              Account Status: Pending Consent
            </span>
            <h1 className="font-[family-name:var(--font-space-grotesk)] text-2xl sm:text-3xl font-extrabold uppercase text-white">
              Guardian Verification Required
            </h1>
            <p className="text-xs sm:text-sm text-[#888888] mt-3 leading-relaxed max-w-lg mx-auto">
              Welcome, <span className="text-white font-bold">{user?.fullName || "Junior Athlete"}</span>. Under India&apos;s <span className="text-amber-400 font-semibold">Digital Personal Data Protection (DPDP) Act 2023</span>, athletes under the age of 18 require verifiable parent/guardian consent before booking courts or making digital payments.
            </p>
          </div>

          {/* Details Box */}
          <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#222222] mb-6 space-y-3 text-xs">
            <div className="flex justify-between items-center text-[#888888]">
              <span>Athlete Account:</span>
              <span className="text-white font-mono">{user?.email || "junior@championsclub.in"}</span>
            </div>
            <div className="flex justify-between items-center text-[#888888]">
              <span>Assigned Tier:</span>
              <span className="text-[#CCFF00] font-bold uppercase">Junior Prodigy (50% Court Discount)</span>
            </div>
            <div className="flex justify-between items-center text-[#888888]">
              <span>Current Permissions:</span>
              <span className="text-amber-400 font-semibold">Browse Catalogue & Schedules Only</span>
            </div>
            <div className="flex justify-between items-center text-[#888888]">
              <span>Legal Requirement:</span>
              <span className="text-[#CCCCCC]">Parental Consent v1.0-dpdp2023</span>
            </div>
          </div>

          {/* How to activate */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 mb-8 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold">How to activate your Junior account:</div>
              <ol className="list-decimal list-inside text-amber-200/90 space-y-0.5">
                <li>Ask your parent/guardian to open the verification link emailed to them.</li>
                <li>Alternatively, visit the front desk with your guardian for instant manual authorization (Page DSK-5).</li>
              </ol>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleResendConsent}
              disabled={resending || resent}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[#1A1A1A] border border-[#2A2A2A] hover:border-amber-400 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${resending ? "animate-spin text-amber-400" : ""}`} />
              <span>{resent ? "Email Dispatched!" : resending ? "Sending..." : "Resend Guardian Email"}</span>
            </button>

            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[#CCFF00] text-[#0A0A0A] font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl hover:bg-[#a8cc00] transition-all shadow-[0_0_20px_rgba(204,255,0,0.3)]"
            >
              <span>Explore Public Pages</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-xs text-[#555555]">
        © {new Date().getFullYear()} The Champions Club. DPDP Minor Protection Framework.
      </footer>
    </div>
  );
}
