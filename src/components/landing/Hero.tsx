"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CalendarDays, MapPin, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { availabilityFor, nextSocialSession, socialDateLabel, TIME_SLOTS } from "@/lib/bookings";
import { formatDateLong, inr } from "@/lib/store";
import { Stamp, Ticker } from "@/components/ui/kit";

const WORDS = ["Play.", "Compete.", "Dominate.", "Belong."];

const TICKER = [
  "18 floodlit courts",
  "Tennis · Padel · Badminton · Cricket nets",
  "Open 06:00 – 23:00 IST",
  "Zero double-bookings, guaranteed",
  "Friday Night Social",
  "Member pricing applied automatically",
  "Pro shop · Bar · Kitchen",
  "New Delhi",
];

function miniAvailability(): { slot: string; free: number }[] {
  try {
    const today = new Date();
    const iso = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
    const grid = availabilityFor(iso);
    const facilities = Object.keys(grid);
    const nowMin = today.getHours() * 60 + today.getMinutes();
    const preferred = TIME_SLOTS.filter((slot) => {
      const [h, m] = slot.split(":").map(Number);
      return h * 60 + m >= Math.max(nowMin + 30, 17 * 60) && h * 60 + m <= 21 * 60;
    }).slice(0, 3);
    return preferred.map((slot) => ({
      slot,
      free: facilities.filter((facility) => grid[facility]?.[slot] === "free").length,
    }));
  } catch {
    return [];
  }
}

export default function Hero() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [slots, setSlots] = useState<{ slot: string; free: number }[]>([]);
  const [socialDate, setSocialDate] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setSlots(miniAvailability());
    const social = nextSocialSession();
    if (social) setSocialDate(social.date);
    const timer = window.setInterval(() => setWordIndex((i) => (i + 1) % WORDS.length), 2600);
    return () => window.clearInterval(timer);
  }, []);

  const current = mounted ? user : null;
  const todayLabel = useMemo(() => formatDateLong(new Date().toISOString().slice(0, 10)), []);
  const firstFree = slots[0];

  return (
    <section className="relative overflow-hidden border-b border-line bg-paper pt-24 sm:pt-28 lg:pt-32">
      <div className="pointer-events-none absolute inset-0 opacity-[0.5] u-court-grid" aria-hidden />
      <div className="relative mx-auto max-w-[1320px] px-5 pb-10 sm:px-8">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <span className="u-eyebrow text-clay">Est. 2019 · New Delhi</span>
          <span className="u-eyebrow hidden text-muted sm:block">Members&apos; sports club · {todayLabel}</span>
          <span className="u-eyebrow text-muted">06:00 — 23:00</span>
        </div>

        <div className="grid grid-cols-1 gap-10 pt-8 lg:grid-cols-12 lg:gap-8 lg:pt-12">
          {/* Left: editorial headline */}
          <div className="lg:col-span-7">
            <h1 className="u-display text-[clamp(3.1rem,8.2vw,7.2rem)] leading-[0.86] text-ink">
              <span className="block overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={WORDS[wordIndex]}
                    initial={{ y: "0.6em", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "-0.5em", opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="flex items-baseline gap-[0.08em]"
                  >
                    <span className="inline-block h-[0.12em] w-[0.6em] translate-y-[-0.55em] bg-clay" />
                    {WORDS[wordIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className="mt-1 block text-ink">
                in your <span className="u-serif italic text-clay">own</span>
              </span>
              <span className="block">league.</span>
            </h1>

            <p className="mt-6 max-w-xl text-[14px] leading-relaxed text-muted">
              Eighteen floodlit courts for tennis, padel, badminton and cricket nets — plus a pro shop, a
              post-match bar and a booking system that never double-books a court. This is the clubhouse
              that finally runs itself.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              {current ? (
                <>
                  <Link href="/dashboard" className="btn btn-clay">
                    Open the clubhouse <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/dashboard/courts" className="btn btn-outline">
                    <CalendarDays className="h-4 w-4" /> Book a court
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/register" className="btn btn-clay">
                    Get your membership <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a href="#availability" className="btn btn-outline">
                    <CalendarDays className="h-4 w-4" /> See live slots
                  </a>
                </>
              )}
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-5 sm:grid-cols-4">
              {[
                { value: "18", label: "Courts & nets" },
                { value: "4", label: "Sports" },
                { value: "2/day", label: "Fair-play cap" },
                { value: "12h", label: "Free cancellation" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="u-value text-2xl text-ink">{stat.value}</div>
                  <div className="mt-0.5 font-mono text-[8.5px] uppercase tracking-[0.16em] text-muted">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: court plate + live drawer */}
          <div className="relative lg:col-span-5">
            <div className="relative overflow-hidden rounded-2xl border border-ink bg-court p-5 text-chalk shadow-[7px_7px_0_0_var(--color-ink)] sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="u-eyebrow text-clay-soft">Centre Court 1</div>
                  <div className="u-display mt-1 text-xl">Tonight&apos;s draw</div>
                </div>
                <Stamp className="h-16 w-16 text-chalk/60" />
              </div>

              <svg viewBox="0 0 360 190" fill="none" className="w-full" aria-hidden>
                <rect x="8" y="8" width="344" height="174" stroke="rgba(251,247,238,0.55)" strokeWidth="1.4" />
                <rect x="24" y="24" width="312" height="142" stroke="rgba(251,247,238,0.32)" strokeWidth="1" />
                <line x1="180" y1="8" x2="180" y2="182" stroke="rgba(251,247,238,0.4)" strokeWidth="1" strokeDasharray="4 6" />
                <line x1="110" y1="8" x2="110" y2="182" stroke="rgba(251,247,238,0.28)" strokeWidth="1" />
                <line x1="250" y1="8" x2="250" y2="182" stroke="rgba(251,247,238,0.28)" strokeWidth="1" />
                <line x1="24" y1="95" x2="336" y2="95" stroke="rgba(251,247,238,0.28)" strokeWidth="1" />
                <circle cx="0" cy="0" r="5" fill="#e9b79f">
                  <animateMotion dur="6.5s" repeatCount="indefinite" path="M180 30 C 250 60, 260 140, 180 160 C 100 140, 110 60, 180 30" />
                </circle>
                <circle cx="180" cy="95" r="3" fill="rgba(251,247,238,0.5)" />
              </svg>

              <div className="mt-4 flex items-center justify-between border-t border-chalk/20 pt-4">
                <div>
                  <div className="font-mono text-[8px] uppercase tracking-[0.18em] text-chalk/50">Member rate</div>
                  <div className="u-value mt-1 text-lg text-chalk">{inr(0)} <span className="font-mono text-[9px] uppercase tracking-widest text-clay-soft">Gold</span></div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[8px] uppercase tracking-[0.18em] text-chalk/50">Walk-in</div>
                  <div className="u-value mt-1 text-lg text-chalk">{inr(1380)}</div>
                </div>
              </div>
            </div>

            <div className="relative z-10 -mt-3 ml-6 mr-2 rounded-xl border border-ink bg-chalk p-4 shadow-[5px_5px_0_0_var(--color-ink)]">
              <div className="flex items-center justify-between">
                <span className="u-eyebrow text-clay">Live tonight</span>
                <span className="flex items-center gap-1.5 font-mono text-[8.5px] uppercase tracking-[0.14em] text-court">
                  <span className="h-1.5 w-1.5 rounded-full bg-court pulse-dot" /> Open
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(slots.length ? slots : [{ slot: "18:00", free: 0 }, { slot: "19:00", free: 0 }, { slot: "20:00", free: 0 }]).map((s) => (
                  <div key={s.slot} className="rounded-lg border border-line bg-paper-soft px-2.5 py-2">
                    <div className="u-mono text-[10px] text-muted">{s.slot}</div>
                    <div className="u-value text-base text-ink">{s.free || "—"}<span className="ml-1 font-mono text-[8px] uppercase text-muted">free</span></div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5">
                <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-muted">
                  {socialDate ? "Friday social · " + socialDateLabel(socialDate) : "Friday social open"}
                </span>
                <Link href={current ? "/dashboard/courts" : "/login"} className="font-mono text-[9px] uppercase tracking-[0.14em] text-clay u-link">
                  Reserve
                </Link>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 text-[11px] text-muted">
              <MapPin className="h-3.5 w-3.5 text-clay" />
              <span>Siri Fort Road, New Delhi · Secure parking · Showers</span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-5 font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
          <span className="flex items-center gap-1.5 text-ink"><Sparkles className="h-3 w-3 text-clay" /> Book in 15 seconds</span>
          <span>Member pricing automatic</span>
          <span>One shelf inventory</span>
          <span>UPI · Card · Cash</span>
          <span className="ml-auto hidden sm:inline">{firstFree ? firstFree.free + " courts free at " + firstFree.slot : "Live availability"}</span>
        </div>
      </div>

      <Ticker items={TICKER} tone="ink" />
    </section>
  );
}
