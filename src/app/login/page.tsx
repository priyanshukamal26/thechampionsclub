"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Trophy, Mail, Lock, ArrowRight, ShieldCheck, Sparkles, AlertCircle, Eye, EyeOff, UserCheck } from "lucide-react";
import { useAuth, DEMO_USERS } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, switchDemoUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    if (!email) {
      setErrorMsg("Please enter your registered email address.");
      setLoading(false);
      return;
    }

    const result = await signIn(email, password);
    setLoading(false);

    if (result.success) {
      // Check if user is pending consent
      if (email.toLowerCase().includes("junior") || email.toLowerCase().includes("aarav")) {
        router.push("/pending-consent");
      } else {
        router.push("/dashboard");
      }
    } else {
      setErrorMsg(result.error || "Login failed. Please check your credentials.");
    }
  };

  const handleSelectDemo = (key: keyof typeof DEMO_USERS) => {
    switchDemoUser(key);
    const demo = DEMO_USERS[key];
    if (demo.status === "pending_consent") {
      router.push("/pending-consent");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#FAFAFA] flex flex-col justify-between relative overflow-hidden py-8">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[650px] h-[320px] bg-[#CCFF00]/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute -bottom-20 right-10 w-[400px] h-[300px] bg-[#CCFF00]/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-4xl mx-auto px-6 w-full flex items-center justify-between mb-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#CCFF00] flex items-center justify-center text-[#0A0A0A] font-black text-lg shadow-[0_0_20px_rgba(204,255,0,0.4)] group-hover:scale-105 transition-transform">
            <Trophy className="w-4 h-4 fill-current" />
          </div>
          <span className="font-extrabold tracking-tight text-white text-base md:text-lg uppercase font-[family-name:var(--font-space-grotesk)]">
            The Champions <span className="text-[#CCFF00]">Club</span>
          </span>
        </Link>

        <Link
          href="/"
          className="text-xs uppercase tracking-wider font-semibold text-[#888888] hover:text-[#CCFF00] transition-colors"
        >
          ← Return to Club Home
        </Link>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-lg mx-auto px-6 w-full flex-grow flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-[#141414] border border-[#1F1F1F] rounded-3xl p-8 sm:p-10 shadow-2xl relative"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#CCFF00] block mb-1">
              Member & Staff Portal
            </span>
            <h1 className="font-[family-name:var(--font-space-grotesk)] text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
              Sign In To Your Account
            </h1>
            <p className="text-xs text-[#888888] mt-2">
              Access real-time court booking, pro gear orders, and club tabs.
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#AAAAAA] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="athlete@championsclub.in"
                  className="w-full bg-[#0D0D0D] border border-[#222222] focus:border-[#CCFF00] rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-[#444444] outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#AAAAAA]">
                  Password
                </label>
                <Link
                  href="/reset-password"
                  className="text-[11px] font-semibold text-[#888888] hover:text-[#CCFF00] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#0D0D0D] border border-[#222222] focus:border-[#CCFF00] rounded-xl pl-11 pr-11 py-3 text-sm text-white placeholder-[#444444] outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666666] hover:text-white transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-[#CCFF00] text-[#0A0A0A] font-extrabold text-xs uppercase tracking-wider py-4 rounded-xl hover:bg-[#a8cc00] transition-all shadow-[0_0_25px_rgba(204,255,0,0.3)] disabled:opacity-50"
            >
              <span>{loading ? "Authenticating..." : "Sign In to Club"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Role Switcher */}
          <div className="mt-8 pt-6 border-t border-[#1F1F1F]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#777777] flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#CCFF00]" />
                One-Click Demo Switcher
              </span>
              <span className="text-[10px] text-[#555555]">6 System Roles</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectDemo("owner")}
                className="p-2.5 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] hover:border-[#CCFF00] text-left transition-colors group"
              >
                <div className="text-[11px] font-bold text-white group-hover:text-[#CCFF00]">Owner</div>
                <div className="text-[9px] text-[#666666] truncate">Rajesh V.</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDemo("manager")}
                className="p-2.5 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] hover:border-[#CCFF00] text-left transition-colors group"
              >
                <div className="text-[11px] font-bold text-white group-hover:text-[#CCFF00]">Manager</div>
                <div className="text-[9px] text-[#666666] truncate">Simran K.</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDemo("front_desk")}
                className="p-2.5 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] hover:border-[#CCFF00] text-left transition-colors group"
              >
                <div className="text-[11px] font-bold text-white group-hover:text-[#CCFF00]">Front Desk</div>
                <div className="text-[9px] text-[#666666] truncate">Amit S.</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDemo("bar_staff")}
                className="p-2.5 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] hover:border-[#CCFF00] text-left transition-colors group"
              >
                <div className="text-[11px] font-bold text-white group-hover:text-[#CCFF00]">Bar / Kitchen</div>
                <div className="text-[9px] text-[#666666] truncate">Chef Vikram</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDemo("gold_member")}
                className="p-2.5 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] hover:border-[#CCFF00] text-left transition-colors group"
              >
                <div className="text-[11px] font-bold text-white group-hover:text-[#CCFF00]">Gold Member</div>
                <div className="text-[9px] text-[#666666] truncate">Rohan M.</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDemo("junior_minor")}
                className="p-2.5 rounded-xl bg-[#0A0A0A] border border-amber-500/40 hover:border-amber-400 text-left transition-colors group"
              >
                <div className="text-[11px] font-bold text-amber-400 group-hover:text-amber-300">Junior (Minor)</div>
                <div className="text-[9px] text-[#777777] truncate">Pending Consent</div>
              </button>
            </div>
          </div>

          {/* Registration link */}
          <div className="mt-8 text-center text-xs text-[#888888]">
            Don&apos;t have a membership yet?{" "}
            <Link href="/register" className="text-[#CCFF00] font-bold hover:underline">
              Join The Club
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-xs text-[#555555]">
        © {new Date().getFullYear()} The Champions Club. All sessions encrypted. India DPDP Act 2023 compliant.
      </footer>
    </div>
  );
}
