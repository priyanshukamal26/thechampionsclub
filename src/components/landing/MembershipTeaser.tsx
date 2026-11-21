"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { MEMBERSHIP_PLANS } from "@/lib/membership";
import { inr } from "@/lib/store";
import { SectionIntro } from "@/components/ui/kit";
import { cn } from "@/lib/utils";

const PLAN_ORDER = ["silver", "gold", "junior"] as const;
const PLAN_COPY: Record<string, { tag: string; line: string; cta: string }> = {
  silver: { tag: "Standard", line: "The everyday player's card.", cta: "Choose Silver" },
  gold: { tag: "Premium", line: "Zero court fees, all season.", cta: "Choose Gold" },
  junior: { tag: "Under 18", line: "For the next generation.", cta: "Register a junior" },
};

export default function MembershipTeaser() {
  const { user } = useAuth();
  const [annual, setAnnual] = useState(false);

  return (
    <section id="membership" className="border-b border-line bg-paper-deep py-16 md:py-24">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionIntro
            index="03"
            kicker="Membership"
            title={<>Choose your <span className="u-serif italic text-clay">standing.</span></>}
            description="Three tiers, one club. Every plan sets your court rate, your shop and bar discount, and your place on the Friday social roster."
          />
          <div className="inline-flex items-center gap-1 self-start rounded-full border border-ink p-1">
            <button
              onClick={() => setAnnual(false)}
              className={cn(
                "rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition",
                !annual ? "bg-ink text-chalk" : "text-muted hover:text-ink"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition",
                annual ? "bg-ink text-chalk" : "text-muted hover:text-ink"
              )}
            >
              Annual <span className="rounded-full bg-clay px-1.5 py-0.5 text-[8px] text-chalk">save 20%</span>
            </button>
          </div>
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-ink bg-chalk">
          <div className="grid grid-cols-1 divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
            {PLAN_ORDER.map((id) => {
              const plan = MEMBERSHIP_PLANS[id];
              const copy = PLAN_COPY[id];
              const price = annual ? Math.round(plan.priceAnnual / 12) : plan.priceMonthly;
              const isGold = id === "gold";
              return (
                <div
                  key={id}
                  className={cn(
                    "relative flex flex-col justify-between p-6 sm:p-8",
                    isGold ? "bg-ink text-chalk" : "bg-chalk text-ink"
                  )}
                >
                  {isGold && (
                    <span className="absolute right-5 top-5 rounded-full border border-clay-soft/40 px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.16em] text-clay-soft">
                      Most chosen
                    </span>
                  )}
                  <div>
                    <div className={cn("u-eyebrow", isGold ? "text-clay-soft" : "text-clay")}>{copy.tag}</div>
                    <h3 className={cn("u-display mt-3 text-3xl", isGold ? "text-chalk" : "text-ink")}>{plan.name}</h3>
                    <p className={cn("mt-1 text-[12px]", isGold ? "text-chalk/50" : "text-muted")}>{copy.line}</p>

                    <div className="mt-7 flex items-end gap-1.5">
                      <span className={cn("u-value text-[clamp(2rem,3.6vw,2.9rem)] leading-none", isGold ? "text-chalk" : "text-ink")}>
                        {inr(price)}
                      </span>
                      <span className={cn("mb-1 font-mono text-[9px] uppercase tracking-[0.14em]", isGold ? "text-chalk/40" : "text-muted")}>
                        / month
                      </span>
                    </div>
                    <div className={cn("mt-1 font-mono text-[8.5px] uppercase tracking-[0.14em]", isGold ? "text-chalk/35" : "text-muted/80")}>
                      {annual ? "Billed annually · " + inr(plan.priceAnnual) : "Billed monthly · + GST"}
                    </div>

                    <div className={cn("mt-6 space-y-2.5 border-t pt-5", isGold ? "border-line-inverse" : "border-line")}>
                      <Row label="Court rate" value={plan.courtDiscountText} dark={isGold} accent />
                      <Row label="Pro shop" value={plan.shopDiscountPct + "% privilege discount"} dark={isGold} />
                      <Row label="Bar & café" value={plan.barDiscountPct + "% off every tab"} dark={isGold} />
                      <Row label="Friday social" value={plan.freeFridaySocial ? "Included" : "₹400 guest pass"} dark={isGold} />
                      <Row label="Daily cap" value={plan.dailyCap + " sessions / day"} dark={isGold} />
                    </div>

                    <ul className="mt-5 space-y-2">
                      {plan.features.slice(0, 3).map((feature) => (
                        <li key={feature} className={cn("flex items-start gap-2 text-[11.5px] leading-snug", isGold ? "text-chalk/65" : "text-muted")}>
                          <Check className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", isGold ? "text-clay-soft" : "text-court")} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href={user ? "/dashboard/pass" : "/register?plan=" + id}
                    className={cn(
                      "btn btn-block mt-8",
                      isGold ? "btn-clay" : id === "junior" ? "btn-outline" : "btn-ink"
                    )}
                  >
                    {user ? "View in dashboard" : copy.cta} <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-col justify-between gap-3 border-t border-line pt-5 text-[11px] text-muted sm:flex-row sm:items-center">
          <p>
            <span className="font-semibold text-ink">Not ready for a plan?</span> Walk-in courts are available at a
            15% premium, subject to member bookings.
          </p>
          <span className="font-mono text-[9px] uppercase tracking-[0.14em]">GST-compliant invoicing · DPDP consent for juniors</span>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value, dark, accent }: { label: string; value: string; dark?: boolean; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className={cn("font-mono text-[9px] uppercase tracking-[0.12em]", dark ? "text-chalk/40" : "text-muted")}>{label}</span>
      <span className={cn("text-right text-[11.5px] font-medium", accent ? (dark ? "text-clay-soft" : "text-clay") : dark ? "text-chalk/80" : "text-ink/80")}>
        {value}
      </span>
    </div>
  );
}
