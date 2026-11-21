"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { SectionIntro } from "@/components/ui/kit";
import { cn } from "@/lib/utils";

interface Sport {
  id: string;
  index: string;
  name: string;
  short: string;
  code: string;
  count: string;
  surface: string;
  blurb: string;
  specs: string[];
  price: string;
}

const SPORTS: Sport[] = [
  {
    id: "tennis",
    index: "01",
    name: "Tennis",
    short: "Tennis",
    code: "T-01 — T-06",
    count: "6 courts",
    surface: "ITF hard, red clay & natural grass",
    blurb:
      "Centre courts lit to broadcast standard, two European clay courts for the long rallies, and a grass court that only opens in the cool months.",
    specs: ["800-lux LED floodlighting", "Ball machine & stringing desk", "Coach-led ladder every Tuesday", "From ₹800 / hour"],
    price: "₹800",
  },
  {
    id: "padel",
    index: "02",
    name: "Padel",
    short: "Padel",
    code: "P-01 — P-04",
    count: "4 courts",
    surface: "12mm panoramic glass enclosures",
    blurb:
      "The fastest-growing racket sport in the country, played behind panoramic glass on World Padel Tour-grade turf. Book a court, borrow a racket, stay for the social.",
    specs: ["Panoramic glass walls", "WPT supercourt turf", "Racket rental at the desk", "Doubles-first booking"],
    price: "₹1,200",
  },
  {
    id: "badminton",
    index: "03",
    name: "Badminton",
    short: "Badminton",
    code: "B-01 — B-06",
    count: "6 halls",
    surface: "BWF Grade 1 indoor, zero-draft",
    blurb:
      "Six air-conditioned halls with shock-absorbing wooden-vinyl floors and non-glare lighting, tuned so the shuttle flies exactly where it should.",
    specs: ["BWF-approved flooring", "Zero-draft HVAC", "Yonex shuttle hub", "Weekend junior academy"],
    price: "₹700",
  },
  {
    id: "cricket",
    index: "04",
    name: "Cricket nets",
    short: "Cricket",
    code: "C-01 — C-02",
    count: "2 nets",
    surface: "Astroturf with programmable machines",
    blurb:
      "Full run-up lanes, programmable pace and spin machines, and video-ready bays for the batting session that actually changes your game.",
    specs: ["150 kph pace machine", "Spin & swing settings", "Video analysis ready", "Coaching on request"],
    price: "₹600",
  },
];

export default function SportsShowcase() {
  const { user } = useAuth();
  const [active, setActive] = useState(0);
  const sport = SPORTS[active];
  const href = user ? "/dashboard/courts" : "/login";

  return (
    <section id="sports" className="border-b border-line bg-paper py-16 md:py-24">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionIntro
            index="01"
            kicker="Four codes, one clubhouse"
            title={<>Built for the <span className="u-serif italic text-clay">way you play.</span></>}
            description="Tennis, padel, badminton and cricket nets — each surface calibrated for its sport, each court bookable in fifteen seconds."
          />
          <div className="hidden shrink-0 border-l border-line pl-5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted md:block">
            <div className="text-ink">18 playable surfaces</div>
            <div className="mt-1">06:00 — 23:00 · floodlit</div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <div className="border-t border-line">
              {SPORTS.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => setActive(i)}
                  className={cn(
                    "group flex w-full items-center justify-between gap-4 border-b border-line py-5 text-left transition-colors",
                    i === active ? "text-ink" : "text-ink/45 hover:text-ink"
                  )}
                >
                  <span className="flex items-baseline gap-4">
                    <span className={cn("font-mono text-[10px]", i === active ? "text-clay" : "text-muted/60")}>{item.index}</span>
                    <span className="u-display text-[clamp(1.7rem,3vw,2.4rem)]">{item.name}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="hidden font-mono text-[9px] uppercase tracking-[0.16em] text-muted sm:block">{item.count}</span>
                    <span
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full border transition",
                        i === active ? "border-clay bg-clay text-chalk" : "border-line text-muted group-hover:border-ink"
                      )}
                    >
                      <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-line" />
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">Walk-in premium +15%</span>
            </div>
          </div>

          <div className="lg:col-span-7">
            <motion.div
              key={sport.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-ink bg-chalk p-6 shadow-[6px_6px_0_0_var(--color-ink)] sm:p-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="u-eyebrow text-clay">{sport.code}</div>
                  <h3 className="u-display mt-2 text-[clamp(2rem,4vw,3rem)] text-ink">{sport.name}</h3>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{sport.surface}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-muted">Member rate from</div>
                  <div className="u-value mt-1 text-2xl text-ink">{sport.price}<span className="font-mono text-[9px] text-muted"> /hr</span></div>
                </div>
              </div>

              <p className="mt-6 max-w-xl text-[13px] leading-relaxed text-muted">{sport.blurb}</p>

              <div className="mt-7 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {sport.specs.map((spec) => (
                  <div key={spec} className="flex items-center gap-2.5 border-t border-line-soft pt-2.5">
                    <Check className="h-3.5 w-3.5 shrink-0 text-court" />
                    <span className="text-[11.5px] text-ink/80">{spec}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
                <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">{sport.count} · 60-minute sessions · :00 & :30 starts</span>
                <Link href={href} className="btn btn-ink btn-sm">
                  {user ? "Book this court" : "Sign in to book"} <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
