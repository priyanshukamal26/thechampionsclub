"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Flame, Users } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { BAR_MENU } from "@/lib/orders";
import { nextSocialSession, socialDateLabel, getSocialSessions, type SocialSession } from "@/lib/bookings";
import { inr } from "@/lib/store";
import { SectionIntro } from "@/components/ui/kit";

const MENU_PICKS = ["mn-01", "mn-03", "mn-05", "mn-06", "mn-09", "mn-13", "mn-15"];

export default function BarSocial() {
  const { user } = useAuth();
  const [session, setSession] = useState<SocialSession | null>(null);
  const [upcoming, setUpcoming] = useState<SocialSession[]>([]);

  useEffect(() => {
    setSession(nextSocialSession() ?? null);
    setUpcoming(getSocialSessions().slice(0, 3));
  }, []);

  const menu = MENU_PICKS.map((id) => BAR_MENU.find((m) => m.id === id)).filter(Boolean);
  const socialHref = user ? "/dashboard/social" : "/register";
  const filled = session ? session.players.length : 0;

  return (
    <section id="bar" className="relative overflow-hidden border-b border-court bg-court text-chalk">
      <div className="pointer-events-none absolute inset-0 opacity-[0.5] u-court-grid-inv" aria-hidden />
      <div className="relative mx-auto max-w-[1320px] px-5 py-16 sm:px-8 md:py-24">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionIntro
            index="06"
            kicker="After the match"
            title={<>The bar, the kitchen,<br className="hidden sm:block" /> and the <span className="u-serif italic text-clay-soft">Friday social.</span></>}
            description="Order from the sofa or the counter. Run a tab and settle before you leave. And every Friday, the courts open up for rotating doubles."
            tone="ink"
          />
          <div className="flex items-center gap-4 self-start border-l border-line-inverse pl-5 font-mono text-[9px] uppercase tracking-[0.16em] text-chalk/50">
            <div>
              <div className="text-chalk">Kitchen 12:00 — 22:30</div>
              <div className="mt-1">Bar 12:00 — 23:00</div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Menu ledger */}
          <div className="lg:col-span-6">
            <div className="flex h-full flex-col justify-between rounded-2xl border border-chalk/25 bg-ink/25 p-6 sm:p-8">
              <div>
                <div className="flex items-center justify-between border-b border-line-inverse pb-3">
                  <span className="u-eyebrow text-clay-soft">From the pass</span>
                  <span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-chalk/40">Member price, GST inclusive</span>
                </div>
                <div className="mt-2">
                  {menu.map((item) => {
                    if (!item) return null;
                    return (
                      <div key={item.id} className="flex items-baseline gap-2 border-b border-line-inverse py-3 last:border-b-0">
                        <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${item.veg ? "bg-court-soft" : "bg-clay"}`} />
                        <span className="text-[12.5px] text-chalk/85">{item.name}</span>
                        <span className="mx-1 h-px flex-1 translate-y-[-2px] border-b border-dotted border-chalk/20" />
                        <span className="u-value text-[12px] text-chalk">{inr(item.price)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line-inverse pt-4">
                <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-chalk/40">Veg / non-veg marked · Tab settlement · UPI, card, cash</span>
                <Link href={user ? "/dashboard/bar" : "/login"} className="inline-flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-clay-soft u-link">
                  Open the café <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Friday social ticket */}
          <div className="lg:col-span-6">
            <div className="flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-chalk bg-chalk text-ink">
              <div className="flex items-center justify-between border-b border-dashed border-line px-6 py-4">
                <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-clay">
                  <Flame className="h-3.5 w-3.5" /> Friday night social
                </div>
                <div className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-muted">Members + guests</div>
              </div>

              <div className="px-6 py-6 sm:pm-8">
                <div className="flex items-end justify-between gap-4">
                  <h3 className="u-display text-[clamp(2rem,4vw,3rem)] leading-[0.9] text-ink">
                    The whole club,<br /><span className="u-serif italic text-clay">one court.</span>
                  </h3>
                  <div className="text-right">
                    <div className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-muted">Guest pass</div>
                    <div className="u-value text-2xl text-ink">₹400</div>
                  </div>
                </div>

                <p className="mt-3 max-w-md text-[12.5px] leading-relaxed text-muted">
                  Up to twenty players share three courts and rotate partners every twenty minutes. Gold members walk in free; guests pay ₹400 at the door.
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-line bg-paper-soft px-3 py-2.5">
                    <CalendarDays className="h-3.5 w-3.5 text-clay" />
                    <div className="mt-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-muted">Next session</div>
                    <div className="text-[11.5px] font-semibold text-ink">{session ? socialDateLabel(session.date) : "Every Friday"}</div>
                  </div>
                  <div className="rounded-lg border border-line bg-paper-soft px-3 py-2.5">
                    <Users className="h-3.5 w-3.5 text-clay" />
                    <div className="mt-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-muted">Roster</div>
                    <div className="text-[11.5px] font-semibold text-ink">{session ? filled + " / " + session.capacity : "20 players"}</div>
                  </div>
                  <div className="col-span-2 rounded-lg border border-line bg-paper-soft px-3 py-2.5 sm:col-span-1">
                    <div className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted">Time</div>
                    <div className="text-[11.5px] font-semibold text-ink">19:00 — 22:30</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-dashed border-line px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-muted">
                  {upcoming.length ? "3 sessions on the calendar" : "Roster opens Monday"}
                </span>
                <Link href={socialHref} className="btn btn-clay btn-sm">
                  {user ? "Join Friday social" : "Reserve a spot"} <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
