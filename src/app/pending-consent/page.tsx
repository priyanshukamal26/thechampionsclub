"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail, ShieldCheck, ShieldX } from "lucide-react";
import {
  AuthCard,
  AuthEyebrow,
  AuthFooter,
  AuthPage,
  AuthTopBar,
  HomeLink,
} from "@/components/auth/AuthShell";
import { StatusPill } from "@/components/ui/kit";
import { useAuth } from "@/lib/auth-context";
import { getLocalMembers, MEMBERSHIP_PLANS } from "@/lib/membership";
import { formatDate } from "@/lib/store";

export default function PendingConsentPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [resent, setResent] = useState(false);

  const member = useMemo(() => {
    if (!user) return undefined;
    return getLocalMembers().find((m) => m.email.toLowerCase() === user.email.toLowerCase());
  }, [user]);

  const verified = member ? member.status !== "pending_consent" : false;

  return (
    <AuthPage>
      <AuthTopBar>
        <HomeLink />
        <button
          className="rounded-full border border-line bg-chalk/60 px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted transition hover:border-ink hover:text-ink"
          onClick={() => {
            signOut();
            router.push("/");
          }}
        >
          Sign out
        </button>
      </AuthTopBar>

      <main className="relative mx-auto w-full max-w-2xl flex-1 px-5 py-10 sm:px-6">
        <AuthEyebrow>{verified ? "Consent recorded" : "Consent pending"}</AuthEyebrow>
        <h1 className="u-display mt-2 text-[clamp(1.8rem,4vw,2.6rem)] leading-[1.02]">
          {verified ? "You're cleared to play." : "One signature from the court."}
        </h1>
        <p className="mt-2 max-w-lg text-[12.5px] leading-relaxed text-muted">
          {verified
            ? "Guardian consent is on file, so bookings and payments are unlocked."
            : "Junior accounts stay read-only until a parent or guardian verifies consent. Nothing is lost — the account simply waits."}
        </p>

        <div className="mt-6 space-y-4">
          <AuthCard>
            <div className="flex items-start justify-between gap-3 border-b border-line pb-3">
              <div>
                <div className="u-eyebrow text-muted">Athlete</div>
                <div className="u-display mt-1 text-[17px]">{member?.fullName ?? user?.fullName ?? "—"}</div>
                <div className="u-mono mt-0.5 text-[10px] text-muted">
                  {member?.memberCode ?? "—"} · {member ? MEMBERSHIP_PLANS[member.planId].name : "Junior"}
                </div>
              </div>
              <StatusPill tone={verified ? "success" : "warn"}>{verified ? "Active" : "Pending"}</StatusPill>
            </div>

            <dl className="divide-y divide-line-soft">
              <div className="flex items-center justify-between py-2 text-[11.5px]">
                <dt className="text-muted">Guardian</dt>
                <dd>{member?.guardianName ?? "Not recorded"}</dd>
              </div>
              <div className="flex items-center justify-between py-2 text-[11.5px]">
                <dt className="text-muted">Guardian mobile</dt>
                <dd className="u-mono">{member?.guardianPhone ?? "—"}</dd>
              </div>
              <div className="flex items-center justify-between py-2 text-[11.5px]">
                <dt className="text-muted">Guardian email</dt>
                <dd className="max-w-[60%] truncate">{member?.guardianEmail ?? "—"}</dd>
              </div>
              <div className="flex items-center justify-between py-2 text-[11.5px]">
                <dt className="text-muted">Consent recorded</dt>
                <dd>
                  {member?.consentVerifiedAt
                    ? `${formatDate(member.consentVerifiedAt.slice(0, 10))} · ${member.consentVerifiedBy ?? ""}`
                    : "—"}
                </dd>
              </div>
            </dl>
          </AuthCard>

          {verified ? (
            <div className="flex items-start gap-3 rounded-xl border border-court/40 bg-court/[0.07] px-4 py-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-court" />
              <p className="text-[11.5px] leading-relaxed text-ink-soft">
                A guardian&apos;s consent was recorded on file. Court bookings, shop orders and bar
                tabs are now available on this account.
              </p>
            </div>
          ) : (
            <>
              <AuthCard>
                <div className="u-eyebrow text-muted">Locked until consent</div>
                <ul className="mt-2 grid gap-1.5 text-[11.5px] text-muted sm:grid-cols-2">
                  <li>· Court bookings and Friday social</li>
                  <li>· Pro Shop orders and bar tabs</li>
                  <li>· Any payment, simulated or otherwise</li>
                  <li>· Still open: dashboard, grid and profile</li>
                </ul>
              </AuthCard>

              <AuthCard>
                <div className="u-display text-[13px]">How this gets verified</div>
                <ol className="mt-2 flex flex-col gap-2 text-[11.5px] leading-relaxed text-muted">
                  <li>
                    <span className="u-mono mr-1.5 text-clay">01</span>
                    A guardian comes to the front desk with a photo ID.
                  </li>
                  <li>
                    <span className="u-mono mr-1.5 text-clay">02</span>
                    Staff confirm the guardian&apos;s name and number against this application.
                  </li>
                  <li>
                    <span className="u-mono mr-1.5 text-clay">03</span>
                    Consent is recorded with a timestamp and the account unlocks instantly.
                  </li>
                </ol>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setResent(true)}
                    disabled={resent}
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {resent ? "Email queued" : "Resend guardian email"}
                  </button>
                  <Link href="/dashboard/desk" className="btn btn-ink btn-sm">
                    Verify at the desk
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                {resent && (
                  <p className="mt-2 text-[10.5px] text-court">
                    A consent link would be sent to {member?.guardianEmail ?? "the guardian"} in the live build.
                  </p>
                )}
              </AuthCard>
            </>
          )}

          <div className="flex items-start gap-2 text-[10.5px] leading-relaxed text-muted">
            <ShieldX className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Consent can be withdrawn at any time at the front desk. Withdrawal deactivates the account;
            invoices are retained for the statutory tax period.
          </div>
        </div>
      </main>

      <AuthFooter note="DPDP Act 2023 · guardian consent recorded with timestamp and text version" />
    </AuthPage>
  );
}
