"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, MailCheck } from "lucide-react";
import {
  AuthCard,
  AuthEyebrow,
  AuthFooter,
  AuthPage,
  AuthTopBar,
} from "@/components/auth/AuthShell";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleReset = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) {
      setErrorMsg("Enter the email on your membership.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/login`,
        });
      }
      setSubmitted(true);
    } catch {
      // Demo fallback: never reveal whether the address exists.
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPage>
      <AuthTopBar />
      <main className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-12 sm:px-6">
        <AuthEyebrow>Password reset</AuthEyebrow>
        <h1 className="u-display mt-2 text-[clamp(1.8rem,4vw,2.4rem)] leading-[1.02]">
          {submitted ? "Check your inbox." : "Let's get you back in."}
        </h1>
        <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
          {submitted
            ? "If the address belongs to a membership, a single-use reset link is on its way. It expires in 30 minutes."
            : "Enter the email on your membership and we'll send a single-use reset link."}
        </p>

        <div className="mt-6">
          {submitted ? (
            <AuthCard>
              <div className="flex items-start gap-3">
                <MailCheck className="mt-0.5 h-4 w-4 shrink-0 text-court" />
                <div>
                  <div className="u-display text-[13px]">Reset link requested</div>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-muted">
                    Sent to <span className="u-mono text-[10.5px] text-ink">{email}</span>. For security we
                    never reveal whether an address exists.
                  </p>
                </div>
              </div>
              <p className="mt-3 border-t border-line pt-3 text-[10.5px] leading-relaxed text-muted">
                Demo build: no email is actually sent. Use the one-click role switcher on the sign-in
                page, or sign in with your email and any password.
              </p>
              <Link href="/login" className="btn btn-ink btn-block mt-4">
                Return to sign in
                <ArrowRight className="h-4 w-4" />
              </Link>
            </AuthCard>
          ) : (
            <AuthCard>
              <form onSubmit={handleReset} className="space-y-3" noValidate>
                {errorMsg && (
                  <p className="rounded-lg border border-clay/40 bg-clay/10 px-3 py-2 text-[11px] text-clay-deep">
                    {errorMsg}
                  </p>
                )}
                <div>
                  <label className="u-label" htmlFor="reset-email">
                    Email
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    className="input"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@championsclub.in"
                    autoComplete="email"
                  />
                </div>
                <button type="submit" className="btn btn-clay btn-block" disabled={loading}>
                  {loading ? "Sending…" : "Send reset link"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-[11px]">
                <Link href="/login" className="u-link text-muted">
                  Back to sign in
                </Link>
                <Link href="/register" className="u-link text-muted">
                  Create an account
                </Link>
              </div>
            </AuthCard>
          )}
        </div>
      </main>
      <AuthFooter note="Front desk can also reset access in person" />
    </AuthPage>
  );
}
