"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Coffee,
  CreditCard,
  Download,
  QrCode as QrIcon,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
} from "lucide-react";
import { EmptyState, Meter, PageHeader, Panel, Stat, StatusPill } from "@/components/ui/kit";
import QRCode from "@/components/common/QRCode";
import { useAuth } from "@/lib/auth-context";
import { resolveMemberForUser } from "@/components/dashboard/member";
import {
  MEMBERSHIP_PLANS,
  type ClubMember,
} from "@/lib/membership";
import { getOpenTabs } from "@/lib/orders";
import { formatDate, inr } from "@/lib/store";

export default function MemberPassPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const member: ClubMember | undefined = useMemo(() => {
    if (!mounted || !user) return undefined;
    return resolveMemberForUser(user);
  }, [mounted, user]);

  const tab = useMemo(
    () => (mounted && member ? getOpenTabs().find((t) => t.memberName === member.fullName) : undefined),
    [mounted, member]
  );

  if (!mounted || !member) {
    return (
      <div className="mx-auto max-w-[1000px] space-y-6 p-5 sm:p-6 lg:p-8">
        <div className="h-8 w-56 animate-pulse rounded bg-ink/10" />
        <div className="h-72 animate-pulse rounded-2xl bg-ink/[0.05]" />
      </div>
    );
  }

  const plan = MEMBERSHIP_PLANS[member.planId];
  const daysLeft = Math.ceil(
    (new Date(`${member.membershipEnd}T00:00:00`).getTime() - Date.now()) / 86_400_000
  );
  const spend = member.history.reduce((sum, item) => sum + item.amount, 0);
  const bookings = member.history.filter((h) => h.type === "booking").length;

  const downloadPass = () => {
    const svg = document.querySelector<SVGSVGElement>("[data-pass-qr] svg");
    if (!svg) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${member.memberCode}-pass.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-[1000px] space-y-6 p-5 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Digital member pass · A5"
        title="Your pass lives here."
        description="Show this at the counter, or let the desk search your code. It renders offline, so a dead battery on the metro is the only real risk."
        actions={
          <>
            <button className="btn btn-outline btn-sm" onClick={downloadPass}>
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
            <Link href="/dashboard/courts" className="btn btn-clay btn-sm">
              <CalendarDays className="h-3.5 w-3.5" />
              Book a court
            </Link>
          </>
        }
        meta={
          <>
            {member.status === "pending_consent" ? (
              <StatusPill tone="warn">Parental Consent Pending</StatusPill>
            ) : (
              <StatusPill tone={daysLeft < 0 ? "danger" : daysLeft <= 14 ? "warn" : "success"}>
                {daysLeft < 0 ? "Expired" : `${daysLeft} days valid`}
              </StatusPill>
            )}
            <span className="u-mono text-[10px] uppercase tracking-[0.14em] text-muted">{member.memberCode}</span>
            <span className="u-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              {plan.name} · since {formatDate(member.membershipStart)}
            </span>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="overflow-hidden rounded-2xl border border-ink bg-ink text-chalk shadow-[8px_8px_0_0_rgba(23,21,15,0.16)]">
            <div className="u-court-grid-inv relative px-5 py-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="u-eyebrow text-clay-soft">The Champions Club</div>
                  <div className="u-mono mt-1 text-[9px] uppercase tracking-[0.22em] text-chalk/45">
                    Member · New Delhi
                  </div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-chalk/25 font-mono text-[9px] tracking-widest">
                  TC
                </div>
              </div>

              <div className="mt-6">
                <div className="u-display text-[24px] leading-none">{member.fullName}</div>
                <div className="u-mono mt-1.5 text-[10.5px] tracking-[0.14em] text-chalk/60">
                  {member.memberCode}
                </div>
              </div>

              <div className="mt-5 flex items-end justify-between gap-4">
                <div className="space-y-2 text-[10px] uppercase tracking-[0.14em] text-chalk/50">
                  <div>
                    Plan <span className="ml-1 text-chalk">{plan.shortName ?? plan.name}</span>
                  </div>
                  <div>
                    Valid till <span className="ml-1 text-chalk">{formatDate(member.membershipEnd)}</span>
                  </div>
                  <div>
                    Status{" "}
                    <span className={member.status === "pending_consent" ? "text-clay-soft" : "text-[#a9b49b]"}>
                      {member.status === "pending_consent" ? "Consent pending" : "Active"}
                    </span>
                  </div>
                </div>
                <div data-pass-qr className="rounded-lg bg-chalk p-1.5">
                  <QRCode value={member.memberCode} size={116} />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-line-inverse px-5 py-2.5 text-[9px] uppercase tracking-[0.16em] text-chalk/40">
              <span>Scan at the front desk</span>
              <span>{plan.shortName} · 2026–27</span>
            </div>
          </div>

          <div className="mt-3 flex items-start gap-2 rounded-xl border border-line bg-paper-deep px-3 py-2.5 text-[10.5px] leading-relaxed text-muted">
            <Smartphone className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Installable: add the club to your home screen and the pass is cached for offline use.
          </div>

          <div className="mt-3.5 grid grid-cols-3 gap-2">
            <div className="flex flex-col justify-between rounded-xl border border-line bg-paper-soft p-3 min-w-0">
              <div className="u-eyebrow text-muted text-[9.5px]">Visits</div>
              <div className="mt-1.5 flex items-baseline gap-1 min-w-0">
                <span className="u-value text-[16px] sm:text-[18px] text-ink leading-tight font-semibold">
                  {bookings}
                </span>
                <span className="u-mono text-[9px] uppercase tracking-wider text-muted truncate">
                  courts
                </span>
              </div>
              <div className="mt-1 text-[9.5px] text-muted truncate">Bookings</div>
            </div>

            <div className="flex flex-col justify-between rounded-xl border border-line bg-paper-soft p-3 min-w-0">
              <div className="u-eyebrow text-muted text-[9.5px]">Spend</div>
              <div className="mt-1.5 flex items-baseline gap-1 min-w-0">
                <span className="u-value text-[16px] sm:text-[18px] text-ink leading-tight font-semibold truncate">
                  {inr(spend)}
                </span>
              </div>
              <div className="mt-1 text-[9.5px] text-muted truncate">Lifetime</div>
            </div>

            <div className="flex flex-col justify-between rounded-xl border border-line bg-paper-soft p-3 min-w-0">
              <div className="u-eyebrow text-muted text-[9.5px]">Plan</div>
              <div className="mt-1.5 flex items-baseline gap-1 min-w-0">
                <span className="u-value text-[16px] sm:text-[18px] text-ink leading-tight font-semibold truncate">
                  {plan.shortName ?? plan.name}
                </span>
              </div>
              <div className="mt-1 text-[9.5px] text-muted truncate">{plan.shopDiscountPct}% Privilege</div>
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-7">
          <Panel>
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <div className="u-eyebrow text-muted">A3 · entitlements</div>
                <div className="u-display mt-0.5 text-[13px]">What your plan unlocks</div>
              </div>
              <CreditCard className="h-4 w-4 text-muted" />
            </div>
            <div className="mt-3 space-y-3">
              {[
                { label: "Court rate", value: plan.courtDiscountText, pct: 100 - plan.courtMultiplier * 100, tone: "court" as const },
                { label: "Pro Shop discount", value: `${plan.shopDiscountPct}% off every purchase`, pct: plan.shopDiscountPct * 4, tone: "clay" as const },
                { label: "Bar & café discount", value: `${plan.barDiscountPct}% off food and drinks`, pct: plan.barDiscountPct * 4, tone: "gold" as const },
                {
                  label: "Friday social",
                  value: plan.freeFridaySocial ? "Included, no guest fee" : `₹400 guest rate`,
                  pct: plan.freeFridaySocial ? 100 : 45,
                  tone: "ink" as const,
                },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex items-baseline justify-between gap-3 text-[11.5px]">
                    <span className="text-muted">{row.label}</span>
                    <span className="text-ink">{row.value}</span>
                  </div>
                  <Meter value={Math.min(100, row.pct)} tone={row.tone} className="mt-1" />
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-3 text-[10.5px] text-muted">
              <span>Daily cap: {plan.dailyCap} plays</span>
              <span className="text-right">Booking window: 7 days</span>
            </div>
          </Panel>

          {tab && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-clay/40 bg-clay/[0.06] px-4 py-3">
              <div className="text-[11.5px] text-clay-deep">
                <span className="font-medium">{inr(tab.total)} open tab</span> · {tab.orderCodes.length} orders
              </div>
              <Link href="/dashboard/bar" className="btn btn-ink btn-sm">
                <Coffee className="h-3.5 w-3.5" />
                Settle at the bar
              </Link>
            </div>
          )}

          <Panel padded={false}>
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div>
                <div className="u-eyebrow text-muted">A6 · lifetime record</div>
                <div className="u-display mt-0.5 text-[13px]">History with the club</div>
              </div>
              <span className="u-mono text-[10px] text-muted">{member.history.length} entries</span>
            </div>
            {member.history.length === 0 ? (
              <EmptyState title="No history yet" description="Your first booking will appear here." className="m-3" />
            ) : (
              <ul className="divide-y divide-line-soft">
                {member.history.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="chip chip-muted">{item.type}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[11.5px] font-medium">{item.title}</div>
                      <div className="truncate text-[10px] text-muted">{item.details}</div>
                    </div>
                    <div className="text-right">
                      <div className="u-value text-[11px]">{item.amount === 0 ? "Included" : inr(item.amount)}</div>
                      <div className="text-[9px] text-muted">{item.date}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-[10.5px] text-muted">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5" />
          Your pass never exposes contact details or payment data.
        </span>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/shop" className="u-link inline-flex items-center gap-1.5">
            <ShoppingBag className="h-3.5 w-3.5" />
            Pro Shop
          </Link>
          <Link href="/dashboard/settings" className="u-link inline-flex items-center gap-1.5">
            <QrIcon className="h-3.5 w-3.5" />
            Manage privacy
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
