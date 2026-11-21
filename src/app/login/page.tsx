"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Eye,
  EyeOff,
  Lock,
  ScanLine,
  X,
} from "lucide-react";
import { useAuth, DEMO_USERS } from "@/lib/auth-context";
import { CourtLines, Stamp } from "@/components/ui/kit";
import { AuthFooter, AuthPage, AuthTopBar, HomeLink } from "@/components/auth/AuthShell";
import DemoRoleSwitcher, { type DemoKey } from "@/components/auth/DemoRoleSwitcher";

function PosterStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-t border-line-inverse pt-2.5">
      <div className="u-value text-[18px] leading-none text-chalk">{value}</div>
      <div className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.18em] text-chalk/45">
        {label}
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { signIn, switchDemoUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [claimToken, setClaimToken] = useState<string | null>(null);
  const [claimDismissed, setClaimDismissed] = useState(false);

  useEffect(() => {
    try {
      const token = new URLSearchParams(window.location.search).get("claim");
      if (token) setClaimToken(token);
    } catch {
      // Ignore malformed query strings.
    }
  }, []);

  const routeAfterSignIn = (rawEmail: string) => {
    const cleanEmail = rawEmail.trim().toLowerCase();
    const demoKey = Object.keys(DEMO_USERS).find(
      (key) => DEMO_USERS[key].email.toLowerCase() === cleanEmail
    );
    const isPendingConsent = demoKey
      ? DEMO_USERS[demoKey].status === "pending_consent"
      : cleanEmail.includes("junior") || cleanEmail.includes("aarav");
    router.push(isPendingConsent ? "/pending-consent" : "/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email) {
      setErrorMsg("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);

    if (result.success) {
      routeAfterSignIn(email);
    } else {
      setErrorMsg(result.error || "Login failed. Please check your credentials.");
    }
  };

  const handleSelectDemo = (key: DemoKey) => {
    switchDemoUser(key);
    const demo = DEMO_USERS[key];
    routeAfterSignIn(demo.email);
  };

  return (
    <AuthPage>
      <AuthTopBar>
        <HomeLink />
      </AuthTopBar>

      <main className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-5 py-5 sm:px-6 lg:min-h-0 lg:px-8 lg:py-6">
        <div className="grid w-full flex-1 grid-cols-1 gap-5 lg:grid-cols-12 lg:items-stretch">
          {/* ── Members' club poster (desktop) ─────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="hidden lg:col-span-5 lg:flex"
            aria-label="The Champions Club"
          >
            <div className="panel-ink relative flex h-full w-full flex-col overflow-hidden rounded-2xl p-6">
              <div aria-hidden className="u-court-grid-inv pointer-events-none absolute inset-0 opacity-40" />
              <CourtLines
                className="pointer-events-none absolute -bottom-8 -right-14 w-[105%] text-chalk"
                opacity={0.14}
              />

              <div className="relative flex flex-col gap-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="u-eyebrow text-clay-soft">Est. 2019 · Siri Fort, New Delhi</div>
                    <h2 className="u-display mt-3 text-[clamp(2rem,3.4vw,2.85rem)] text-chalk">
                      Play. Compete.
                      <br />
                      <span className="u-serif italic normal-case tracking-normal text-clay-soft">
                        Belong.
                      </span>
                    </h2>
                  </div>
                  <Stamp className="h-20 w-20 shrink-0 text-chalk/60" />
                </div>

                <p className="max-w-sm text-[12.5px] leading-relaxed text-chalk/65">
                  18 courts, four sports and one clubhouse ledger. Sign in to hold your slot, settle
                  the bar tab and keep your standing in the club.
                </p>

                <ul className="space-y-2.5 border-t border-line-inverse pt-4">
                  {[
                    "Court reservations · 06:00–23:00 IST",
                    "Pro shop & bar tabs on one ledger",
                    "Friday social play · members only",
                  ].map((line, i) => (
                    <li key={line} className="flex items-baseline gap-3 text-[11.5px] text-chalk/70">
                      <span className="font-mono text-[9px] tracking-[0.14em] text-clay-soft">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {line}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto grid grid-cols-3 gap-4 pt-2">
                  <PosterStat value="18" label="Courts" />
                  <PosterStat value="04" label="Sports" />
                  <PosterStat value="1,240" label="Members" />
                </div>

                <div className="flex items-center gap-2 pt-1 font-mono text-[8.5px] uppercase tracking-[0.2em] text-chalk/40">
                  <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-clay-soft" aria-hidden />
                  Clubhouse open · 06:00–23:00 IST
                </div>
              </div>
            </div>
          </motion.section>

          {/* ── Sign-in form ───────────────────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut", delay: 0.05 }}
            className="flex min-h-0 lg:col-span-7"
            aria-label="Sign in"
          >
            <div className="card flex w-full flex-col p-5 sm:p-6 lg:overflow-y-auto">
              {/* Compact poster band for phones */}
              <div className="panel-ink relative mb-4 overflow-hidden rounded-xl p-4 lg:hidden">
                <CourtLines
                  className="pointer-events-none absolute -bottom-6 -right-8 w-[70%] text-chalk"
                  opacity={0.16}
                />
                <div className="relative flex items-center justify-between gap-3">
                  <div>
                    <div className="u-eyebrow text-clay-soft">Member & staff portal</div>
                    <div className="u-display mt-2 text-xl leading-tight text-chalk">
                      The clubhouse{" "}
                      <span className="u-serif italic normal-case tracking-normal text-clay-soft">
                        ledger.
                      </span>
                    </div>
                  </div>
                  <Stamp className="h-14 w-14 shrink-0 text-chalk/60" />
                </div>
              </div>

              <div>
                <div className="u-eyebrow text-clay">Member & staff sign-in</div>
                <h1 className="u-display mt-2 text-[clamp(1.55rem,2.4vw,2.15rem)] text-ink">
                  Sign in to the clubhouse
                </h1>
                <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
                  Court bookings, pro-shop tabs and club notices — one account for the whole club.
                </p>
              </div>

              {claimToken && !claimDismissed && (
                <div
                  role="status"
                  className="mt-3.5 flex items-start gap-2.5 rounded-xl border border-clay/40 bg-clay/5 px-3 py-2.5"
                >
                  <ScanLine className="mt-0.5 h-4 w-4 shrink-0 text-clay" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="u-eyebrow text-clay">Desk registration found</div>
                    <p className="mt-0.5 text-[11.5px] leading-snug text-ink/80">
                      Sign in with the email you gave at the front desk to claim your membership.
                      Reference{" "}
                      <span className="u-mono break-all text-ink">
                        {claimToken.length > 22 ? `${claimToken.slice(0, 22)}…` : claimToken}
                      </span>
                      .
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setClaimDismissed(true)}
                    aria-label="Dismiss desk registration notice"
                    className="rounded-full p-1 text-muted transition hover:bg-ink/5 hover:text-ink"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {errorMsg && (
                <div
                  role="alert"
                  className="mt-3.5 flex items-start gap-2.5 rounded-xl border border-clay/40 bg-clay/5 px-3 py-2.5 text-[11.5px] leading-snug text-clay-deep"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
                <div>
                  <label htmlFor="login-email" className="u-label">
                    Email address
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="athlete@championsclub.in"
                    className="input"
                  />
                </div>

                <div>
                  <div className="flex items-baseline justify-between gap-3">
                    <label htmlFor="login-password" className="u-label mb-0">
                      Password
                    </label>
                    <Link
                      href="/reset-password"
                      className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-clay transition hover:text-clay-deep"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative mt-1.5">
                    <Lock
                      aria-hidden
                      className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted/70"
                    />
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="input pl-9 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition hover:bg-ink/5 hover:text-ink"
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-clay btn-block">
                  {loading ? "Signing in…" : "Sign in"}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </button>
              </form>

              <div className="u-rule my-4" />

              <DemoRoleSwitcher onSelect={handleSelectDemo} />

              <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3.5">
                <span className="text-[11.5px] text-muted">New to the club?</span>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-clay transition hover:text-clay-deep"
                >
                  Join the club
                  <ArrowUpRight className="h-3 w-3" aria-hidden />
                </Link>
              </div>
            </div>
          </motion.section>
        </div>
      </main>

      <AuthFooter />
    </AuthPage>
  );
}
