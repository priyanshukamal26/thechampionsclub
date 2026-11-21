"use client";

import { ShieldCheck } from "lucide-react";
import { RegisterFormData } from "../RegistrationWizard";

interface Props {
  formData: RegisterFormData;
  updateFormData: (fields: Partial<RegisterFormData>) => void;
}

export default function GuardianConsent({ formData, updateFormData }: Props) {
  return (
    <div className="space-y-3">
      <div>
        <div className="u-eyebrow text-clay">India DPDP Act 2023</div>
        <h3 className="u-display mt-1 text-lg leading-tight sm:text-xl">Guardian consent</h3>
        <p className="mt-1 text-[11.5px] leading-relaxed text-muted">
          The applicant is under 18. Verifiable parental or guardian authorisation is required
          before the account can book courts or make payments.
        </p>
      </div>

      <div className="rounded-xl border border-gold/40 bg-gold/[0.07] p-3">
        <p className="flex items-center gap-1.5 text-[11px] font-medium text-ink">
          <ShieldCheck className="h-3.5 w-3.5 text-gold" />
          What happens next
        </p>
        <p className="mt-1 text-[10.5px] leading-relaxed text-muted">
          Consent is recorded with a timestamp and the consent-text version. The account stays in{" "}
          <span className="u-mono text-[10px]">pending_consent</span> until the front desk verifies
          the guardian in person or the guardian confirms by email.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="u-label" htmlFor="guardianName">
            Guardian&apos;s full name
          </label>
          <input
            id="guardianName"
            className="input"
            value={formData.guardianName}
            onChange={(e) => updateFormData({ guardianName: e.target.value })}
            placeholder="Mahesh Patel"
          />
        </div>
        <div>
          <label className="u-label" htmlFor="guardianEmail">
            Guardian&apos;s email
          </label>
          <input
            id="guardianEmail"
            type="email"
            className="input"
            value={formData.guardianEmail}
            onChange={(e) => updateFormData({ guardianEmail: e.target.value })}
            placeholder="guardian@example.com"
          />
        </div>
        <div>
          <label className="u-label" htmlFor="guardianPhone">
            Guardian&apos;s mobile
          </label>
          <input
            id="guardianPhone"
            className="input"
            value={formData.guardianPhone}
            onChange={(e) => updateFormData({ guardianPhone: e.target.value })}
            placeholder="+91 98250 12345"
          />
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-line bg-chalk p-3">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 accent-[var(--color-court)]"
          checked={formData.guardianConsentGiven}
          onChange={(e) => updateFormData({ guardianConsentGiven: e.target.checked })}
        />
        <span className="text-[11px] leading-relaxed text-ink-soft">
          I am the parent or lawful guardian. I consent to The Champions Club collecting the
          athlete&apos;s name, date of birth, contact details and gameplay history for membership
          administration, and I understand consent can be withdrawn at any time.
        </span>
      </label>

      <p className="text-[10px] leading-relaxed text-muted">
        Withdrawal deactivates the account but past invoices are retained for the statutory tax
        period.
      </p>
    </div>
  );
}
