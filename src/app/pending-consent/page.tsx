"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, ShieldAlert, RefreshCw, ArrowRight, AlertTriangle } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-[#EEF4FF] via-[#F5F8FF] to-[#E8F0FE] text-[#0F172A] flex flex-col justify-between relative overflow-hidden py-8 px-4 sm:px-6">
      {/* Soft Ambient Ethereal Glows */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#DDE9FD] rounded-full blur-[140px] pointer-events-none opacity-70" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-amber-100/60 rounded-full blur-[140px] pointer-events-none opacity-60" />

      {/* Top Header */}
      <header className="relative z-10 max-w-5xl mx-auto w-full flex items-center justify-between mb-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#3B82F6] to-[#6366F1] flex items-center justify-center text-white font-black text-xl shadow-[0_10px_25px_-5px_rgba(59,130,246,0.3)] group-hover:scale-105 transition-transform">
            <Trophy className="w-5 h-5 fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-tight text-[#0F172A] text-base md:text-lg uppercase font-[family-name:var(--font-space-grotesk)] leading-none">
              The Champions <span className="text-[#3B82F6]">Club</span>
            </span>
            <span className="text-[10px] tracking-[0.2em] text-[#64748B] uppercase font-semibold mt-0.5">
              Athletic Excellence
            </span>
          </div>
        </Link>

        <button
          onClick={() => signOut()}
          className="text-xs uppercase tracking-wider font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors bg-white/70 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200/60 shadow-sm"
        >
          Sign Out
        </button>
      </header>

      {/* Main Card */}
      <main className="relative z-10 max-w-2xl mx-auto w-full flex-grow flex flex-col justify-center py-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[32px] p-8 sm:p-12 shadow-[0_25px_60px_-15px_rgba(59,130,246,0.08),0_0_1px_1px_rgba(226,232,240,0.8)] border border-slate-100 relative"
        >
          {/* Status Badge */}
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-6 border border-amber-200 shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="text-center mb-6">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-amber-600 block mb-1">
              Account Status: Pending Consent
            </span>
            <h1 className="font-[family-name:var(--font-space-grotesk)] text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
              Guardian Verification Required
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-3 leading-relaxed max-w-lg mx-auto">
              Welcome, <span className="text-[#0F172A] font-bold">{user?.fullName || "Junior Athlete"}</span>. Under India&apos;s <span className="text-amber-600 font-semibold">Digital Personal Data Protection (DPDP) Act 2023</span>, athletes under the age of 18 require verifiable parent/guardian consent before booking courts or making digital payments.
            </p>
          </div>

          {/* Details Box */}
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 mb-6 space-y-3 text-xs">
            <div className="flex justify-between items-center text-[#64748B]">
              <span>Athlete Account:</span>
              <span className="text-[#0F172A] font-mono font-medium">{user?.email || "junior@championsclub.in"}</span>
            </div>
            <div className="flex justify-between items-center text-[#64748B]">
              <span>Assigned Tier:</span>
              <span className="text-[#3B82F6] font-bold uppercase">Junior Prodigy (50% Court Discount)</span>
            </div>
            <div className="flex justify-between items-center text-[#64748B]">
              <span>Current Permissions:</span>
              <span className="text-amber-600 font-semibold">Browse Catalogue & Schedules Only</span>
            </div>
            <div className="flex justify-between items-center text-[#64748B]">
              <span>Legal Requirement:</span>
              <span className="text-[#334155]">Parental Consent v1.0-dpdp2023</span>
            </div>
          </div>

          {/* How to activate */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 mb-8 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-amber-950">How to activate your Junior account:</div>
              <ol className="list-decimal list-inside text-amber-900/90 space-y-0.5">
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
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[#F8FAFC] border border-slate-200 hover:border-amber-400 text-[#0F172A] font-bold text-xs uppercase tracking-wider py-3.5 rounded-2xl transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${resending ? "animate-spin text-amber-500" : ""}`} />
              <span>{resent ? "Email Dispatched!" : resending ? "Sending..." : "Resend Guardian Email"}</span>
            </button>

            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#DDE7FF] to-[#E7E2FF] hover:from-[#D2DEFF] hover:to-[#DDD7FF] text-[#1E293B] font-bold text-xs uppercase tracking-wider py-3.5 rounded-2xl border border-blue-200/60 shadow-[0_4px_15px_rgba(59,130,246,0.12)] transition-all"
            >
              <span>Explore Public Pages</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-xs text-[#64748B]">
        © {new Date().getFullYear()} The Champions Club. DPDP Minor Protection Framework.
      </footer>
    </div>
  );
}
