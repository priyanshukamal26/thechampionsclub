"use client";

import { Check } from "lucide-react";
import { RegisterFormData } from "../RegistrationWizard";
import { MEMBERSHIP_PLANS } from "@/lib/membership";
import { inr } from "@/lib/store";
import { cn } from "@/lib/utils";

interface Props {
  formData: RegisterFormData;
  updateFormData: (fields: Partial<RegisterFormData>) => void;
  isMinor: boolean;
}

const ORDER: Array<"gold" | "silver" | "junior"> = ["silver", "gold", "junior"];

export default function ChoosePlan({ formData, updateFormData, isMinor }: Props) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="u-display text-lg sm:text-xl leading-tight">Pick your standing</h3>
        <p className="mt-1 text-[11.5px] leading-relaxed text-muted">
          Every tier is data, not paperwork — the desk can move you up or down and your next booking
          picks up the new rate.
        </p>
      </div>

      <div className="space-y-2">
        {ORDER.map((id) => {
          const plan = MEMBERSHIP_PLANS[id];
          const active = formData.planId === id;
          const recommended = isMinor && id === "junior";
          return (
            <button
              key={id}
              type="button"
              onClick={() => updateFormData({ planId: id })}
              className={cn(
                "w-full rounded-xl border p-3.5 text-left transition-colors",
                active ? "border-ink bg-paper-soft" : "border-line bg-chalk hover:border-ink/40"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="u-display text-[14px]">{plan.name}</span>
                    {id === "gold" && <span className="chip chip-clay">Most complete</span>}
                    {recommended && <span className="chip chip-court">Recommended for juniors</span>}
                  </div>
                  <p className="mt-0.5 text-[10.5px] text-muted">{plan.tagline}</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="u-value text-[15px]">{inr(plan.priceMonthly)}</div>
                  <div className="text-[9px] uppercase tracking-[0.12em] text-muted">per month</div>
                </div>
              </div>

              <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                {plan.features.slice(0, 4).map((feature) => (
                  <li key={feature} className="flex items-start gap-1.5 text-[10.5px] leading-snug text-ink-soft">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-court" strokeWidth={2.4} />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-2 flex items-center justify-between border-t border-line-soft pt-2 text-[10px]">
                <span className="text-muted">{plan.courtDiscountText}</span>
                <span className={cn("u-mono uppercase tracking-[0.12em]", active ? "text-clay" : "text-muted")}>
                  {active ? "Selected" : "Select"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-[10px] leading-relaxed text-muted">
        {isMinor
          ? "Junior membership needs a guardian's consent — the next step records it."
          : "Annual billing saves roughly 20%. You can switch to annual at the front desk later."}
      </p>
    </div>
  );
}
