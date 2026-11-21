"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Trophy, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff, Sparkles, TrendingUp } from "lucide-react";
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
    <div className="h-screen max-h-screen bg-gradient-to-br from-[#EEF4FF] via-[#F5F8FF] to-[#E8F0FE] text-[#0F172A] flex flex-col justify-between relative overflow-hidden py-3 sm:py-4 px-4 sm:px-6">
      {/* Soft Ambient Ethereal Glows */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-[#DDE9FD] rounded-full blur-[140px] pointer-events-none opacity-60" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-[#E3DEFD] rounded-full blur-[140px] pointer-events-none opacity-60" />

      {/* Top Header */}
      <header className="relative z-10 max-w-5xl mx-auto w-full flex items-center justify-between shrink-0 mb-2">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#3B82F6] to-[#6366F1] flex items-center justify-center text-white font-black text-base shadow-[0_8px_20px_-4px_rgba(59,130,246,0.3)] group-hover:scale-105 transition-transform">
            <Trophy className="w-4 h-4 fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-tight text-[#0F172A] text-sm sm:text-base uppercase font-[family-name:var(--font-space-grotesk)] leading-none">
              The Champions <span className="text-[#3B82F6]">Club</span>
            </span>
            <span className="text-[9px] tracking-[0.2em] text-[#64748B] uppercase font-semibold">
              Athletic Excellence
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="text-[11px] uppercase tracking-wider font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors bg-white/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/60 shadow-sm"
        >
          ← Return to Club Home
        </Link>
      </header>

      {/* Main Single-View Two-Panel Layout */}
      <main className="relative z-10 max-w-5xl mx-auto w-full flex-1 flex items-center justify-center min-h-0 py-1">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch max-h-[calc(100vh-96px)]">

          {/* Left Form Card (Floating White Box) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="lg:col-span-7 bg-white rounded-[26px] p-5 sm:p-7 shadow-[0_20px_50px_-15px_rgba(59,130,246,0.08),0_0_1px_1px_rgba(226,232,240,0.8)] border border-slate-100 flex flex-col justify-between overflow-hidden"
          >
            <div>
              {/* Header */}
              <div className="mb-3.5">
                <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-[#3B82F6] mb-0.5">
                  Member & Staff Portal
                </span>
                <h1 className="font-[family-name:var(--font-space-grotesk)] text-xl sm:text-2xl font-extrabold tracking-tight text-[#0F172A] leading-tight">
                  Sign In To Your Account
                </h1>
                <p className="text-[11px] sm:text-xs text-[#64748B] mt-0.5 leading-tight">
                  Access real-time court booking, pro gear orders, and club tabs.
                </p>
              </div>

              {/* Error Banner */}
              {errorMsg && (
                <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center gap-2 text-xs text-rose-600">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#334155] mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="athlete@championsclub.in"
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-[#3B82F6]/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#334155]">
                      Password
                    </label>
                    <Link
                      href="/reset-password"
                      className="text-[11px] font-semibold text-[#3B82F6] hover:underline transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-[#3B82F6]/10 rounded-xl pl-9 pr-9 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] transition-colors"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Primary Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1.5 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#DDE7FF] to-[#E7E2FF] hover:from-[#D2DEFF] hover:to-[#DDD7FF] text-[#1E293B] font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl border border-blue-200/60 shadow-sm active:scale-[0.99] transition-all disabled:opacity-50"
                >
                  <span>{loading ? "Authenticating..." : "Sign In to Club"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Quick Demo Role Switcher */}
            <div className="mt-3.5 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-[#64748B] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#3B82F6]" />
                  One-Click Demo Switcher
                </span>
                <span className="text-[9px] font-medium text-[#94A3B8]">6 System Roles</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSelectDemo("owner")}
                  className="p-1.5 rounded-lg bg-[#F8FAFC] border border-slate-200/80 hover:border-[#3B82F6] hover:bg-white text-left transition-all"
                >
                  <div className="text-[10px] font-bold text-[#0F172A] leading-tight">Owner</div>
                  <div className="text-[8.5px] text-[#64748B] truncate">Rajesh V.</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectDemo("manager")}
                  className="p-1.5 rounded-lg bg-[#F8FAFC] border border-slate-200/80 hover:border-[#3B82F6] hover:bg-white text-left transition-all"
                >
                  <div className="text-[10px] font-bold text-[#0F172A] leading-tight">Manager</div>
                  <div className="text-[8.5px] text-[#64748B] truncate">Simran K.</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectDemo("front_desk")}
                  className="p-1.5 rounded-lg bg-[#F8FAFC] border border-slate-200/80 hover:border-[#3B82F6] hover:bg-white text-left transition-all"
                >
                  <div className="text-[10px] font-bold text-[#0F172A] leading-tight">Front Desk</div>
                  <div className="text-[8.5px] text-[#64748B] truncate">Amit S.</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectDemo("bar_staff")}
                  className="p-1.5 rounded-lg bg-[#F8FAFC] border border-slate-200/80 hover:border-[#3B82F6] hover:bg-white text-left transition-all"
                >
                  <div className="text-[10px] font-bold text-[#0F172A] leading-tight">Bar / Kitchen</div>
                  <div className="text-[8.5px] text-[#64748B] truncate">Chef Vikram</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectDemo("gold_member")}
                  className="p-1.5 rounded-lg bg-[#F8FAFC] border border-slate-200/80 hover:border-[#3B82F6] hover:bg-white text-left transition-all"
                >
                  <div className="text-[10px] font-bold text-[#0F172A] leading-tight">Gold Member</div>
                  <div className="text-[8.5px] text-[#64748B] truncate">Rohan M.</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectDemo("junior_minor")}
                  className="p-1.5 rounded-lg bg-amber-50/60 border border-amber-200 hover:border-amber-400 hover:bg-amber-50 text-left transition-all"
                >
                  <div className="text-[10px] font-bold text-amber-700 leading-tight">Junior (Minor)</div>
                  <div className="text-[8.5px] text-amber-600/90 truncate">Pending Consent</div>
                </button>
              </div>
            </div>

            {/* Registration link */}
            <div className="mt-3 text-center text-[11px] text-[#64748B]">
              Don&apos;t have a membership yet?{" "}
              <Link href="/register" className="text-[#3B82F6] font-bold hover:underline">
                Join The Club
              </Link>
            </div>
          </motion.div>

          {/* Right Showcase Panel (Fintora Soft Blue & Analytics Visuals) */}
          <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#DCE8FC] via-[#E2EDFF] to-[#C9DCFD] rounded-[26px] p-5 sm:p-6 border border-blue-100/70 flex-col justify-between shadow-[0_20px_50px_-15px_rgba(59,130,246,0.12)] relative overflow-hidden">
            {/* Visual Glass Cards */}
            <div className="space-y-3">

              {/* Card 1: Improvement Rate / Active Court Usage */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3.5 border border-white/60 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10.5px] font-semibold text-[#64748B]">Court utilization rate</span>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-[#10B981] bg-emerald-50 px-2 py-0.5 rounded-full">
                    <TrendingUp className="w-2.5 h-2.5" />
                    <span>+126.6%</span>
                  </div>
                </div>
                <div className="text-xl font-extrabold text-[#0F172A] font-[family-name:var(--font-space-grotesk)]">
                  98.4%
                </div>

                {/* SVG Curve graph */}
                <div className="mt-2 h-10 w-full">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 240 60" fill="none">
                    <path
                      d="M0 45 C30 40, 50 48, 80 32 C110 16, 130 38, 160 20 C190 2, 210 12, 240 5"
                      stroke="#3B82F6"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx="80" cy="32" r="3" fill="#3B82F6" />
                    <circle cx="160" cy="20" r="3" fill="#3B82F6" />
                    <circle cx="240" cy="5" r="3.5" fill="#2563EB" />
                  </svg>
                </div>
              </div>

              {/* Card 2: Peak Hours & Conflict-Free Lock */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3.5 border border-white/60 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10.5px] font-semibold text-[#64748B]">Today&apos;s Slots</span>
                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#3B82F6] bg-blue-50 px-2 py-0.5 rounded-full">
                    100% Conflict Free
                  </span>
                </div>

                {/* Bar Columns */}
                <div className="flex items-end justify-between gap-1.5 h-12 pt-1">
                  {[40, 65, 30, 85, 95, 70, 55, 90].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                      <div
                        className={`w-full rounded-t-sm transition-all ${i === 4 ? "bg-[#3B82F6]" : "bg-[#93C5FD]/60"
                          }`}
                        style={{ height: `${h}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[8.5px] text-[#94A3B8] font-semibold mt-1 px-0.5">
                  <span>6AM</span>
                  <span>12PM</span>
                  <span>6PM</span>
                  <span>11PM</span>
                </div>
              </div>
            </div>

            {/* Bottom Insight Copy */}
            <div className="pt-2">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-base font-bold text-[#0F172A] leading-snug">
                A Unified Hub for Smarter Club Operations
              </h2>
              <p className="text-[11px] text-[#475569] mt-1 leading-relaxed">
                The Champions Club empowers you with a unified sports command centre — delivering real-time court availability, instant gear checkout, and automated cafeteria tabs.
              </p>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-1 text-[11px] text-[#64748B] shrink-0">
        © {new Date().getFullYear()} The Champions Club. All sessions encrypted. India DPDP Act 2023 compliant.
      </footer>
    </div>
  );
}
