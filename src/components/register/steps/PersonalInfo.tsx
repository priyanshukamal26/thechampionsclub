"use client";

import { RegisterFormData } from "../RegistrationWizard";
import { ShieldAlert } from "lucide-react";
import { StatusPill } from "@/components/ui/kit";

interface Props {
  formData: RegisterFormData;
  updateFormData: (fields: Partial<RegisterFormData>) => void;
  isMinor: boolean;
}

export default function PersonalInfo({ formData, updateFormData, isMinor }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <div className="u-eyebrow text-muted">Step 01 · Identity</div>
        <h3 className="u-display mt-1.5 text-xl text-ink sm:text-2xl">Personal details</h3>
        <p className="mt-1.5 max-w-lg text-[12px] leading-relaxed text-muted">
          As printed on your government ID. This is the name carried on your member pass and club
          ledger.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="reg-full-name" className="u-label">
            Full name (as on Govt ID)
          </label>
          <input
            id="reg-full-name"
            type="text"
            required
            autoComplete="name"
            placeholder="e.g. Vikramaditya Rathore"
            value={formData.fullName}
            onChange={(e) => updateFormData({ fullName: e.target.value })}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="reg-email" className="u-label">
            Email address (primary login)
          </label>
          <input
            id="reg-email"
            type="email"
            required
            autoComplete="email"
            placeholder="vikram@example.com"
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value })}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="reg-phone" className="u-label">
            Phone number (OTP & slot alerts)
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 border-r border-line pr-2 font-mono text-[11px] tracking-wide text-muted">
              +91
            </span>
            <input
              id="reg-phone"
              type="tel"
              required
              autoComplete="tel-national"
              placeholder="98765 43210"
              value={formData.phone}
              onChange={(e) => updateFormData({ phone: e.target.value })}
              className="input pl-[64px]"
            />
          </div>
        </div>

        <div>
          <label htmlFor="reg-dob" className="u-label">
            Date of birth
          </label>
          <input
            id="reg-dob"
            type="date"
            required
            autoComplete="bday"
            value={formData.dob}
            onChange={(e) => updateFormData({ dob: e.target.value })}
            className="input"
          />
        </div>
      </div>

      {isMinor && (
        <div className="flex items-start gap-3 rounded-xl border border-gold/40 bg-gold/10 px-3.5 py-3">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink">
                Junior member detected
              </span>
              <StatusPill tone="warn">Under 18</StatusPill>
            </div>
            <p className="mt-1 text-[11.5px] leading-snug text-ink/75">
              Under India&apos;s DPDP Act 2023, this account needs verifiable parent or guardian
              consent before court booking and transaction privileges activate. We will add a
              guardian step to this application.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
