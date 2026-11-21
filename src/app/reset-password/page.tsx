"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, Mail, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please provide your registered email address.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      const errMsg = error?.message?.toLowerCase() || "";
      if (
        error &&
        !errMsg.includes("placeholder") &&
        !errMsg.includes("failed to fetch") &&
        !errMsg.includes("fetch failed")
      ) {
        setErrorMsg(error.message);
      } else {
        setSubmitted(true);
      }
    } catch {
      // Graceful fallback for mock mode
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF4FF] via-[#F5F8FF] to-[#E8F0FE] text-[#0F172A] flex flex-col justify-between relative overflow-hidden py-8 px-4 sm:px-6">
      {/* Soft Ambient Ethereal Glows */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#DDE9FD] rounded-full blur-[140px] pointer-events-none opacity-70" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-[#E3DEFD] rounded-full blur-[140px] pointer-events-none opacity-70" />

      {/* Header */}
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

        <Link
          href="/login"
          className="text-xs uppercase tracking-wider font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors bg-white/70 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200/60 shadow-sm"
        >
          ← Return to Sign In
        </Link>
      </header>

      {/* Main Form */}
      <main className="relative z-10 max-w-md mx-auto w-full flex-grow flex flex-col justify-center py-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] p-8 sm:p-10 shadow-[0_25px_60px_-15px_rgba(59,130,246,0.08),0_0_1px_1px_rgba(226,232,240,0.8)] border border-slate-100 relative"
        >
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5 border border-emerald-200 shadow-sm">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-extrabold text-[#0F172A] mb-2">
                Recovery Link Dispatched
              </h2>
              <p className="text-xs text-[#64748B] leading-relaxed mb-6">
                If an account exists for <span className="text-[#0F172A] font-mono font-medium">{email}</span>, you will receive password reset instructions shortly.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#DDE7FF] to-[#E7E2FF] hover:from-[#D2DEFF] hover:to-[#DDD7FF] text-[#1E293B] font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-2xl border border-blue-200/60 shadow-[0_4px_15px_rgba(59,130,246,0.1)] w-full transition-all"
              >
                <span>Back to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#3B82F6] block mb-1">
                  Security Recovery
                </span>
                <h1 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-extrabold text-[#0F172A]">
                  Reset Password
                </h1>
                <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                  Enter your registered club email address to receive password recovery instructions.
                </p>
              </div>

              {errorMsg && (
                <div className="mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center gap-2.5 text-xs text-rose-600">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#334155] mb-2">
                    Registered Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="athlete@championsclub.in"
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#3B82F6] focus:bg-white focus:ring-4 focus:ring-[#3B82F6]/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#DDE7FF] to-[#E7E2FF] hover:from-[#D2DEFF] hover:to-[#DDD7FF] text-[#1E293B] font-bold text-xs uppercase tracking-wider py-3.5 rounded-2xl border border-blue-200/60 shadow-[0_4px_15px_rgba(59,130,246,0.1)] active:scale-[0.99] transition-all disabled:opacity-50"
                >
                  <span>{loading ? "Sending link..." : "Send Reset Link"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0F172A] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-xs text-[#64748B]">
        © {new Date().getFullYear()} The Champions Club. Encrypted Identity Service.
      </footer>
    </div>
  );
}
