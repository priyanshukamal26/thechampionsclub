"use client";

import { Edit3 } from "lucide-react";
import { RegisterFormData } from "../RegistrationWizard";
import { MEMBERSHIP_PLANS } from "@/lib/membership";
import { inr } from "@/lib/store";

interface Props {
  formData: RegisterFormData;
  updateFormData: (fields: Partial<RegisterFormData>) => void;
  jumpToStep: (index: number) => void;
  isMinor: boolean;
}

export default function Confirmation({ formData, updateFormData, jumpToStep, isMinor }: Props) {
  const plan = MEMBERSHIP_PLANS[formData.planId];

  const rows = [
    { label: "Full name", value: formData.fullName || "—", step: 0 },
    { label: "Email", value: formData.email || "—", step: 0 },
    { label: "Mobile", value: formData.phone || "—", step: 0 },
    { label: "Date of birth", value: formData.dob || "—", step: 0 },
    { label: "Plan", value: `${plan.name} · ${inr(plan.priceAnnual)}/yr`, step: 2 },
  ];
  if (isMinor) {
    rows.push({
      label: "Guardian",
      value: formData.guardianName ? `${formData.guardianName} · ${formData.guardianEmail}` : "—",
      step: 3,
    });
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="u-display text-lg leading-tight sm:text-xl">One last look</h3>
        <p className="mt-1 text-[11.5px] text-muted">
          Check the details before they are written to the member register.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-line">
        <div className="flex items-center justify-between border-b border-line bg-paper-soft px-3 py-2">
          <span className="u-eyebrow text-muted">Application summary</span>
          <span className={`chip ${isMinor ? "chip-clay" : "chip-court"}`}>
            {isMinor ? "Junior · consent required" : "Adult"}
          </span>
        </div>
        <dl className="divide-y divide-line-soft">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-3 px-3 py-2">
              <dt className="text-[10.5px] text-muted">{row.label}</dt>
              <dd className="flex min-w-0 items-center gap-2">
                <span className="truncate text-right text-[11.5px] text-ink">{row.value}</span>
                <button
                  type="button"
                  onClick={() => jumpToStep(row.step)}
                  className="text-muted hover:text-clay"
                  aria-label={`Edit ${row.label}`}
                >
                  <Edit3 className="h-3 w-3" />
                </button>
              </dd>
            </div>
          ))}
        </dl>
        <div className="flex items-center justify-between border-t border-line bg-ink px-3 py-2.5 text-chalk">
          <div>
            <div className="u-eyebrow text-clay-soft">Due today · simulated</div>
            <div className="mt-0.5 text-[10px] text-chalk/50">{plan.name} · 12 months · GST included</div>
          </div>
          <div className="u-value text-[16px]">{inr(plan.priceAnnual)}</div>
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-2.5">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 accent-[var(--color-court)]"
          checked={formData.termsAccepted}
          onChange={(e) => updateFormData({ termsAccepted: e.target.checked })}
        />
        <span className="text-[11px] leading-relaxed text-ink-soft">
          I accept the club rules, the twelve-hour cancellation policy and the two-plays-a-day
          limit. Payments in this build are simulated and no card is charged.
        </span>
      </label>

      {isMinor && (
        <p className="rounded-lg border border-gold/40 bg-gold/[0.07] px-3 py-2 text-[10.5px] leading-relaxed text-muted">
          After submitting, this account waits in the consent queue. A guardian can verify at the
          front desk with a photo ID, or confirm through the email link. Bookings and payments
          unlock the moment consent is recorded.
        </p>
      )}
    </div>
  );
}
