"use client";

import { useState } from "react";
import { RegisterFormData } from "../RegistrationWizard";
import { Check, Eye, EyeOff, Lock, X } from "lucide-react";
import { Meter } from "@/components/ui/kit";
import { cn } from "@/lib/utils";

interface Props {
  formData: RegisterFormData;
  updateFormData: (fields: Partial<RegisterFormData>) => void;
}

type StrengthTone = "clay" | "court" | "ink" | "gold";

export default function CreatePassword({ formData, updateFormData }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Compute password strength score (0 to 4)
  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = calculateStrength(formData.password);

  const getStrengthLabel = (score: number): { text: string; tone: StrengthTone } => {
    if (!formData.password) return { text: "Enter password", tone: "ink" };
    if (score <= 1) return { text: "Weak", tone: "clay" };
    if (score === 2) return { text: "Fair", tone: "gold" };
    if (score === 3) return { text: "Strong", tone: "court" };
    return { text: "Very strong", tone: "court" };
  };

  const strengthInfo = getStrengthLabel(strength);
  const passwordsMatch = Boolean(
    formData.password && formData.confirmPassword && formData.password === formData.confirmPassword
  );
  const passwordsMismatch = Boolean(
    formData.confirmPassword && formData.password !== formData.confirmPassword
  );

  const rules = [
    { label: "At least 8 characters", met: formData.password.length >= 8 },
    { label: "At least one number", met: /[0-9]/.test(formData.password) },
    { label: "At least one special character", met: /[^A-Za-z0-9]/.test(formData.password) },
    { label: "Upper and lower case", met: /[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password) },
  ];

  return (
    <div className="space-y-4">
      <div>
        <div className="u-eyebrow text-muted">Step 02 · Security</div>
        <h3 className="u-display mt-1.5 text-xl text-ink sm:text-2xl">Account security</h3>
        <p className="mt-1.5 max-w-lg text-[12px] leading-relaxed text-muted">
          One password guards your bookings, tabs and payments. Use something you have not reused
          at another club.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="reg-password" className="u-label">
            Create password
          </label>
          <div className="relative">
            <Lock
              aria-hidden
              className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted/70"
            />
            <input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              placeholder="••••••••••••"
              value={formData.password}
              onChange={(e) => updateFormData({ password: e.target.value })}
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

          <div className="mt-2">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
                Strength
              </span>
              <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink">
                {strengthInfo.text}
              </span>
            </div>
            <Meter value={strength * 25} tone={strengthInfo.tone} className="mt-1.5" />
          </div>
        </div>

        <div>
          <label htmlFor="reg-confirm-password" className="u-label">
            Confirm password
          </label>
          <div className="relative">
            <Lock
              aria-hidden
              className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted/70"
            />
            <input
              id="reg-confirm-password"
              type={showConfirm ? "text" : "password"}
              required
              autoComplete="new-password"
              placeholder="••••••••••••"
              value={formData.confirmPassword}
              onChange={(e) => updateFormData({ confirmPassword: e.target.value })}
              className="input pl-9 pr-11"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? "Hide password confirmation" : "Show password confirmation"}
              className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition hover:bg-ink/5 hover:text-ink"
            >
              {showConfirm ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>

          {passwordsMatch && (
            <div className="mt-2 flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-court">
              <Check className="h-3 w-3" aria-hidden />
              Passwords match
            </div>
          )}
          {passwordsMismatch && (
            <div className="mt-2 flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-clay">
              <X className="h-3 w-3" aria-hidden />
              Passwords do not match
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-line bg-paper-soft p-3.5">
        <div className="u-eyebrow text-muted">Password checklist</div>
        <ul className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {rules.map((rule) => (
            <li key={rule.label} className="flex items-center gap-2 text-[11.5px]">
              <span
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                  rule.met ? "border-court/40 bg-court/10 text-court" : "border-line text-muted/50"
                )}
              >
                {rule.met ? <Check className="h-2.5 w-2.5" aria-hidden /> : null}
              </span>
              <span className={rule.met ? "text-ink" : "text-muted"}>{rule.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
