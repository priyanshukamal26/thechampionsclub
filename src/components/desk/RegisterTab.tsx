"use client";

import { useState } from "react";
import { Check, CheckCircle2, ShieldAlert, ShieldCheck, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Panel, StatusPill } from "@/components/ui/kit";
import { MEMBERSHIP_PLANS, registerMemberAtDesk, type ClubMember } from "@/lib/membership";
import { recordAuditLog } from "@/lib/audit";
import { useAuth } from "@/lib/auth-context";
import { inr } from "@/lib/store";
import { CopyButton, Field, PanelHead, ageFromDob, stampLabel } from "./shared";

type PlanId = "gold" | "silver" | "junior";
const PLAN_ORDER: PlanId[] = ["gold", "silver", "junior"];

interface Receipt {
  member: ClubMember;
  claimToken: string;
  claimUrl: string;
}

function dayLabel(dateOnly: string) {
  const d = new Date(`${dateOnly}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateOnly;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function RegisterTab({
  onMutate,
  onOpenConsent,
}: {
  onMutate?: () => void;
  onOpenConsent?: () => void;
}) {
  const { user } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [planId, setPlanId] = useState<PlanId>("gold");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [guardianVerified, setGuardianVerified] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [error, setError] = useState<string | null>(null);

  const age = ageFromDob(dob);
  const isMinor = age !== null && age < 18;
  const effectivePlan: PlanId = isMinor ? "junior" : planId;
  const plan = MEMBERSHIP_PLANS[effectivePlan];

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim() || !dob) {
      setError("Name, email, phone and date of birth are required to open a member record.");
      return;
    }
    if (isMinor && (!guardianName.trim() || !guardianPhone.trim())) {
      setError("Under DPDP Act 2023 a guardian name and phone number are required for a minor.");
      return;
    }

    setError(null);
    const result = registerMemberAtDesk({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      dob,
      planId: effectivePlan,
      guardianName: isMinor ? guardianName.trim() : undefined,
      guardianPhone: isMinor ? guardianPhone.trim() : undefined,
      guardianEmail: isMinor ? guardianEmail.trim() : undefined,
      guardianVerifiedInPerson: isMinor ? guardianVerified : false,
    });

    void recordAuditLog({
      action: "desk_register_member",
      entity: "members",
      entityId: result.member.id,
      details: { code: result.member.memberCode, plan: result.member.planId, staff: user?.fullName ?? "Front desk" },
    });

    setReceipt({
      member: result.member,
      claimToken: result.claimToken,
      claimUrl: `${window.location.origin}/login?claim=${result.claimToken}`,
    });

    setFullName("");
    setEmail("");
    setPhone("");
    setDob("");
    setGuardianName("");
    setGuardianPhone("");
    setGuardianEmail("");
    setGuardianVerified(false);
    onMutate?.();
  };

  const resetReceipt = () => setReceipt(null);

  if (receipt) {
    const member = receipt.member;
    const memberPlan = MEMBERSHIP_PLANS[member.planId];
    return (
      <div className="space-y-4">
        <Panel tone="court" className="space-y-5">
          <div className="flex items-start gap-3">
            <span className="rounded-full border border-line-inverse bg-white/5 p-2">
              <CheckCircle2 className="h-5 w-5 text-clay-soft" />
            </span>
            <div className="min-w-0">
              <div className="u-eyebrow text-chalk/55">Registration complete</div>
              <div className="u-display mt-1 text-2xl text-chalk">{member.fullName}</div>
              <div className="u-mono mt-1 text-[11px] text-chalk/60">
                {member.memberCode} · {memberPlan.name}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-line-inverse pt-4 sm:grid-cols-4">
            {[
              { label: "Plan", value: memberPlan.name },
              {
                label: "Status",
                value: member.status === "pending_consent" ? "Consent pending" : "Active",
              },
              { label: "Valid from", value: dayLabel(member.membershipStart) },
              { label: "Valid thru", value: dayLabel(member.membershipEnd) },
            ].map((fact) => (
              <div key={fact.label}>
                <div className="u-mono text-[9.5px] uppercase tracking-[0.16em] text-chalk/45">{fact.label}</div>
                <div className={cn("mt-1 text-[12px] font-medium", member.status === "pending_consent" && fact.label === "Status" ? "text-clay-soft" : "text-chalk")}>
                  {fact.value}
                </div>
              </div>
            ))}
          </div>

          <p className="u-mono text-[10px] leading-relaxed text-chalk/50">
            Opened {stampLabel(new Date().toISOString())} by {user?.fullName ?? "Front desk"}.
          </p>
        </Panel>

        <Panel className="space-y-4">
          <PanelHead
            eyebrow="Claim link"
            title="Hand this to the athlete"
            action={<span className="chip chip-court">One-time use</span>}
          />
          <p className="max-w-2xl text-[11.5px] leading-relaxed text-muted">
            The athlete opens this link once to claim the account and load the digital pass. The member record is
            already live for court bookings, lookup and billing.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              readOnly
              value={receipt.claimUrl}
              aria-label="Member claim link"
              onFocus={(event) => event.currentTarget.select()}
              className="input u-mono text-[11px]"
            />
            <CopyButton
              value={receipt.claimUrl}
              label="Copy link"
              copiedLabel="Link copied"
              className="shrink-0 justify-center py-2.5"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={receipt.claimUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
              Open link
            </a>
            <button type="button" className="btn btn-clay btn-sm" onClick={resetReceipt}>
              <UserPlus className="h-3.5 w-3.5" /> Enroll next athlete
            </button>
          </div>
        </Panel>

        {member.status === "pending_consent" && (
          <Panel tone="deep" className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-clay-deep" />
              <div>
                <div className="text-[12px] font-semibold text-ink">Junior pass locked pending guardian consent</div>
                <p className="mt-0.5 text-[10.5px] leading-snug text-muted">
                  Without in-person verification the record waits in the consent queue. Verify now, or let the
                  guardian sign online through the claim link.
                </p>
              </div>
            </div>
            {onOpenConsent && (
              <button type="button" className="btn btn-ink btn-sm" onClick={onOpenConsent}>
                Open consent queue
              </button>
            )}
          </Panel>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <Panel className="space-y-5">
        <PanelHead
          eyebrow="A1 · Walk-in"
          title="Register an athlete"
          action={<span className="chip">Counter enrolment</span>}
        />

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="reg-name" label="Full name">
              <input
                id="reg-name"
                type="text"
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="e.g. Ananya Iyer"
                className="input"
                autoComplete="name"
              />
            </Field>
            <Field id="reg-email" label="Email">
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="email@domain.com"
                className="input"
                autoComplete="email"
              />
            </Field>
            <Field id="reg-phone" label="Phone (+91)">
              <input
                id="reg-phone"
                type="tel"
                required
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+91 98110 00000"
                className="input"
                autoComplete="tel"
              />
            </Field>
            <Field id="reg-dob" label="Date of birth" hint="Under-18 records need guardian consent.">
              <input
                id="reg-dob"
                type="date"
                required
                value={dob}
                onChange={(event) => setDob(event.target.value)}
                className="input"
                max={new Date().toISOString().split("T")[0]}
              />
            </Field>
          </div>

          <div>
            <div className="u-label">Membership plan</div>
            <div role="radiogroup" aria-label="Membership plan" className="grid gap-2 sm:grid-cols-3">
              {PLAN_ORDER.map((id) => {
                const option = MEMBERSHIP_PLANS[id];
                const active = effectivePlan === id;
                const locked = isMinor && id !== "junior";
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    disabled={locked}
                    onClick={() => setPlanId(id)}
                    className={cn(
                      "rounded-xl border p-3 text-left transition",
                      active ? "border-ink bg-ink text-chalk" : "border-line bg-chalk text-ink hover:border-ink/50",
                      locked && "cursor-not-allowed opacity-40 hover:border-line"
                    )}
                  >
                    <div className="u-mono text-[9.5px] uppercase tracking-[0.14em] opacity-70">{option.name}</div>
                    <div className="u-value mt-1 text-[15px] leading-none">
                      {inr(option.priceMonthly)}
                      <span className="ml-1 font-normal text-[9px] uppercase tracking-wider opacity-60">/ mo</span>
                    </div>
                    <div className="mt-1.5 text-[10px] leading-snug opacity-70">{option.courtDiscountText}</div>
                  </button>
                );
              })}
            </div>
            {isMinor && (
              <p className="mt-1.5 text-[10.5px] text-muted">
                Detected age {age} — Junior Prodigy is locked in for under-18s under the DPDP Act.
              </p>
            )}
          </div>

          {isMinor && (
            <div className="space-y-3 rounded-xl border border-gold/40 bg-gold/[0.07] p-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-[#7d5d17]" />
                <div className="u-eyebrow text-[#7d5d17]">Guardian consent · DPDP Act 2023</div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="reg-guardian-name" label="Guardian name">
                  <input
                    id="reg-guardian-name"
                    type="text"
                    required={isMinor}
                    value={guardianName}
                    onChange={(event) => setGuardianName(event.target.value)}
                    placeholder="e.g. Mahesh Patel"
                    className="input"
                  />
                </Field>
                <Field id="reg-guardian-phone" label="Guardian phone">
                  <input
                    id="reg-guardian-phone"
                    type="tel"
                    required={isMinor}
                    value={guardianPhone}
                    onChange={(event) => setGuardianPhone(event.target.value)}
                    placeholder="+91 98250 12345"
                    className="input"
                  />
                </Field>
                <Field id="reg-guardian-email" label="Guardian email" className="sm:col-span-2">
                  <input
                    id="reg-guardian-email"
                    type="email"
                    value={guardianEmail}
                    onChange={(event) => setGuardianEmail(event.target.value)}
                    placeholder="guardian@domain.com"
                    className="input"
                  />
                </Field>
              </div>
              <label className="flex cursor-pointer items-start gap-2.5 text-[11.5px] leading-snug text-ink">
                <input
                  type="checkbox"
                  checked={guardianVerified}
                  onChange={(event) => setGuardianVerified(event.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-clay"
                />
                <span>
                  Guardian is present and has verified consent in person at the counter.
                  <span className="mt-0.5 block text-[10.5px] text-muted">
                    Leave unticked and the junior pass stays pending in the consent queue.
                  </span>
                </span>
              </label>
            </div>
          )}

          {error && (
            <div role="alert" className="rounded-xl border border-clay/40 bg-clay/10 px-4 py-2.5 text-[11.5px] font-medium text-clay-deep">
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-clay btn-block">
            Register &amp; issue digital pass
          </button>
          <p className="text-center text-[10.5px] leading-snug text-muted">
            A claim link is generated on success. No password is set at the counter.
          </p>
        </form>
      </Panel>

      <Panel className="space-y-4">
        <PanelHead eyebrow="Issuing" title={plan.name} />
        <div>
          <div className="u-value text-[28px] leading-none text-ink">
            {inr(plan.priceMonthly)}
            <span className="ml-1.5 font-normal text-[10px] uppercase tracking-[0.14em] text-muted">/ month</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between border-b border-line py-2">
            <span className="u-mono text-[10px] uppercase tracking-[0.14em] text-muted">Annual</span>
            <span className="u-value text-[12px] text-ink">{inr(plan.priceAnnual)}</span>
          </div>
        </div>

        <ul className="space-y-1.5">
          {plan.features.map((feature) => (
            <li key={feature} className="flex gap-2 text-[11.5px] leading-snug text-muted">
              <Check className="mt-0.5 h-3 w-3 shrink-0 text-court" />
              {feature}
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-line bg-paper-soft p-3">
            <div className="u-label mb-1">Court rate</div>
            <div className="u-value text-[12.5px] text-ink">
              {plan.courtMultiplier === 0 ? "Included" : `${Math.round((1 - plan.courtMultiplier) * 100)}% off`}
            </div>
          </div>
          <div className="rounded-lg border border-line bg-paper-soft p-3">
            <div className="u-label mb-1">Daily cap</div>
            <div className="u-value text-[12.5px] text-ink">{plan.dailyCap} hrs</div>
          </div>
          <div className="rounded-lg border border-line bg-paper-soft p-3">
            <div className="u-label mb-1">Pro shop</div>
            <div className="u-value text-[12.5px] text-ink">{plan.shopDiscountPct}% off</div>
          </div>
          <div className="rounded-lg border border-line bg-paper-soft p-3">
            <div className="u-label mb-1">Bar & lounge</div>
            <div className="u-value text-[12.5px] text-ink">{plan.barDiscountPct}% off</div>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-paper-soft p-3">
          <div className="u-eyebrow mb-1.5 text-muted">What happens next</div>
          <ol className="space-y-1.5 text-[11px] leading-snug text-muted">
            <li>1 · Member record opens immediately for bookings and billing.</li>
            <li>2 · Hand over the one-time claim link to load the digital pass.</li>
            <li>3 · Minors stay locked until guardian consent is verified.</li>
          </ol>
        </div>

        {isMinor && (
          <div className="flex items-start gap-2 rounded-xl border border-court/25 bg-court/5 p-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-court" />
            <p className="text-[10.5px] leading-snug text-muted">
              Guardian details are stored on the member record and quoted in the consent audit trail.
            </p>
          </div>
        )}
      </Panel>
    </div>
  );
}
