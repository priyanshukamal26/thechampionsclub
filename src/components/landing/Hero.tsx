"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

/* ─── word data ─── */
const WORDS = [
  {
    word: "Play.",
    icon: "https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/83de7c35-dd91-4e56-bfb8-0ffafc83d0e0.webp",
    tint: "#D4A017",
    panelFrom: "#F4EBC6",
    panelTo: "#F2ECDF",
    glow: "246,222,104",
  },
  {
    word: "Compete.",
    icon: "https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/4d952211-0474-48cc-af48-58f68b3b7525.webp",
    tint: "#E06020",
    panelFrom: "#F9CBA9",
    panelTo: "#F8DCC7",
    glow: "249,150,84",
  },
  {
    word: "Dominate.",
    icon: "https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/e2e91fca-5b3f-4e0e-a437-8a581592e407.webp",
    tint: "#2A9B58",
    panelFrom: "#DFE9D4",
    panelTo: "#E9EBE0",
    glow: "150,206,150",
  },
  {
    word: "Train.",
    icon: "https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/6b32bb47-4ad6-4938-a637-c997b373c68b.webp",
    tint: "#A040A0",
    panelFrom: "#ECD6E2",
    panelTo: "#F0E4E6",
    glow: "222,150,200",
  },
];

const SLOT_MS = 2000;
const ENTER_MS = 500;
const LEAVE_MS = 400;

function easeOut(t: number) { return 1 - Math.pow(1 - t, 3); }
function easeIn(t: number) { return t * t * t; }

/* SVG grain */
const GRAIN_B64 = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export default function Hero() {
  const { user } = useAuth();
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"enter" | "hold" | "leave">("hold");
  const [prog, setProg] = useState(1);
  const [panelIdx, setPanelIdx] = useState(0); // which gradient is fully shown
  const [panelBlend, setPanelBlend] = useState(0); // 0=prev 1=current
  const [bobY, setBobY] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);
  const slotStartRef = useRef<number>(0);
  const idxRef = useRef(0);
  const phaseRef = useRef<"enter" | "hold" | "leave">("hold");
  const progRef = useRef(1);
  const panelIdxRef = useRef(0);
  const panelBlendRef = useRef(0);

  useEffect(() => {
    // Check reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const start = performance.now();
    startRef.current = start;
    slotStartRef.current = start;

    function loop(now: number) {
      const elapsed = now - slotStartRef.current;
      const totalSlot = SLOT_MS;

      let newPhase: "enter" | "hold" | "leave";
      let newProg: number;

      if (elapsed < ENTER_MS) {
        newPhase = "enter";
        newProg = elapsed / ENTER_MS;
      } else if (elapsed > totalSlot - LEAVE_MS) {
        newPhase = "leave";
        newProg = (elapsed - (totalSlot - LEAVE_MS)) / LEAVE_MS;
      } else {
        newPhase = "hold";
        newProg = 1;
      }

      if (elapsed >= totalSlot) {
        // advance
        const nextIdx = (idxRef.current + 1) % WORDS.length;
        idxRef.current = nextIdx;
        panelIdxRef.current = nextIdx;
        panelBlendRef.current = 1;
        slotStartRef.current = now;
        newPhase = "enter";
        newProg = 0;
      }

      // panel crossfade: when entering, blend from 0→1 over first ENTER_MS
      if (newPhase === "enter") {
        panelBlendRef.current = newProg;
      } else {
        panelBlendRef.current = 1;
      }

      // bob
      const t = (now - start) / 1000;
      const by = Math.sin(t * 1.1) * 5;

      phaseRef.current = newPhase;
      progRef.current = newProg;

      setIdx(idxRef.current);
      setPhase(newPhase);
      setProg(newProg);
      setPanelIdx(panelIdxRef.current);
      setPanelBlend(panelBlendRef.current);
      setBobY(by);

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const cur = WORDS[idx];
  const prev = WORDS[(idx - 1 + WORDS.length) % WORDS.length];

  // text animation values
  let opacity = 1, ty = 0, blur = 0, scale = 1;
  let iconOpacity = 1, iconScale = 1, iconRot = 0;

  if (phase === "enter") {
    const e = easeOut(prog);
    opacity = e;
    ty = (1 - e) * 24;
    blur = (1 - e) * 10;
    scale = 0.95 + e * 0.05;
    const ip = Math.max(0, (prog - 0.08) / 0.92);
    const ie = easeOut(ip);
    iconOpacity = ie;
    iconScale = 0.65 + ie * 0.35;
    iconRot = -16 * (1 - ie);
  } else if (phase === "leave") {
    const e = easeIn(prog);
    opacity = 1 - e;
    ty = -e * 18;
    blur = e * 8;
    iconOpacity = 1 - e;
  }

  // stats strip notch path
  const notchPath = "M0 62 H1062 C1092 62 1098 54 1116 34 C1138 9 1146 1 1178 1 H1440 V62 Z";

  const stats = [
    { value: "18", label: "World-Class Courts" },
    { value: "100%", label: "Conflict-Free Guarantee" },
    { value: "6AM–11PM", label: "Daily Availability" },
  ];

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: "100svh", minHeight: 620 }}
    >
        {/* ════ MAIN GRADIENT PANEL: 84% height ════ */}
        <div className="relative overflow-hidden" style={{ height: "84%" }}>

          {/* Previous panel layer (fades out as new one comes in) */}
          <div
            className="absolute inset-0"
            style={{
              opacity: 1 - panelBlend,
              background: `
              radial-gradient(ellipse 60% 55% at 88% 80%, rgba(${prev.glow},0.6) 0%, transparent 65%),
              radial-gradient(ellipse 50% 50% at 20% 110%, rgba(${prev.glow},0.3) 0%, transparent 60%),
              linear-gradient(160deg, ${prev.panelFrom}, ${prev.panelTo})
            `,
              transition: "opacity 0.6s ease",
            }}
          />

          {/* Current panel layer */}
          <div
            className="absolute inset-0"
            style={{
              opacity: panelBlend,
              background: `
              radial-gradient(ellipse 60% 55% at 88% 80%, rgba(${cur.glow},0.6) 0%, transparent 65%),
              radial-gradient(ellipse 50% 50% at 20% 110%, rgba(${cur.glow},0.3) 0%, transparent 60%),
              linear-gradient(160deg, ${cur.panelFrom}, ${cur.panelTo})
            `,
              transition: "opacity 0.6s ease",
            }}
          />

          {/* Grain overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: GRAIN_B64,
              backgroundSize: "180px 180px",
              opacity: 0.15,
              mixBlendMode: "multiply",
              zIndex: 2,
            }}
          />

          {/* Content */}
          <div
            className="relative flex flex-col h-full"
            style={{ zIndex: 10 }}
          >
            {/* Navbar spacer & Top Breathing Room */}
            <div style={{ height: "clamp(96px, 14vh, 160px)", flexShrink: 0 }} />

            {/* ════ HEADLINE ════ */}
            <div
              className="flex-1 flex flex-col justify-start px-5 sm:px-10 md:px-16 lg:px-24 pt-2 md:pt-4"
            >
              <h1
                className="font-[family-name:var(--font-space-grotesk)] font-extrabold uppercase leading-[0.86] tracking-[-0.03em] select-none"
                style={{
                  fontSize: "clamp(44px, 9.5vw, 130px)",
                  color: "#0D0D0C",
                }}
              >
                {/* Line 1: animated word */}
                <span
                  className="flex items-center gap-[0.06em]"
                  style={{
                    opacity,
                    transform: `translateY(${ty}px) scale(${scale})`,
                    filter: `blur(${blur}px)`,
                    willChange: "transform, opacity, filter",
                  }}
                >
                  {/* 3D Icon */}
                  <span
                    className="relative inline-flex shrink-0"
                    style={{
                      width: "0.9em",
                      height: "0.9em",
                      isolation: "isolate",
                      transform: `translateY(${bobY}px) rotate(${iconRot}deg) scale(${iconScale})`,
                      opacity: iconOpacity,
                      willChange: "transform, opacity",
                      flexShrink: 0,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cur.icon}
                      alt=""
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        filter: "grayscale(1) brightness(1.15) contrast(1.1)",
                      }}
                      draggable={false}
                    />
                    {/* Hue tint layer */}
                    <span
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: cur.tint,
                        mixBlendMode: "color",
                        mask: `url(${cur.icon}) center/contain no-repeat`,
                        WebkitMask: `url(${cur.icon}) center/contain no-repeat`,
                      }}
                    />
                  </span>
                  <span>{cur.word}</span>
                </span>

                {/* Line 2: static */}
                <span
                  className="block mt-[0.02em]"
                  style={{ color: "#0D0D0C" }}
                >
                  in your court.
                </span>
              </h1>

              {/* CTA row */}
              <div
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-6 md:mt-8"
              >
                {/* Primary CTA */}
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center gap-2 font-bold text-sm uppercase tracking-wider px-7 py-3.5 rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-95"
                      style={{ background: "#0D0D0C", color: "#FBF6EF" }}
                    >
                      Go to Dashboard <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/dashboard/courts"
                      className="inline-flex items-center gap-2 font-bold text-sm uppercase tracking-wider px-7 py-3.5 rounded-full transition-all duration-200 hover:bg-[#0D0D0C] hover:text-[#FBF6EF]"
                      style={{ border: "1.4px solid rgba(13,13,12,0.28)", color: "#0D0D0C" }}
                    >
                      <Calendar className="w-4 h-4" /> Book Courts Now
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-2 font-bold text-sm uppercase tracking-wider px-7 py-3.5 rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-95"
                      style={{ background: "#0D0D0C", color: "#FBF6EF" }}
                    >
                      Get Your Membership <ArrowRight className="w-4 h-4" />
                    </Link>
                    <a
                      href="#availability"
                      className="inline-flex items-center gap-2 font-bold text-sm uppercase tracking-wider px-7 py-3.5 rounded-full transition-all duration-200 hover:bg-[#0D0D0C] hover:text-[#FBF6EF]"
                      style={{ border: "1.4px solid rgba(13,13,12,0.28)", color: "#0D0D0C" }}
                    >
                      <Calendar className="w-4 h-4" /> View Live Slots
                    </a>
                  </>
                )}

                {/* Caption */}
                <p
                  className="hidden lg:block text-sm leading-relaxed max-w-xs"
                  style={{ color: "rgba(13,13,12,0.52)" }}
                >
                  New Delhi&apos;s high-performance sports sanctuary.{" "}
                  <span style={{ color: "#0D0D0C", fontWeight: 500 }}>Tennis</span>,{" "}
                  <span style={{ color: "#0D0D0C", fontWeight: 500 }}>Padel</span>,{" "}
                  <span style={{ color: "#0D0D0C", fontWeight: 500 }}>Badminton</span> &amp;{" "}
                  <span style={{ color: "#0D0D0C", fontWeight: 500 }}>Cricket Nets</span>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ════ CREAM STATS STRIP: bottom 16% height ════ */}
        <div
          className="relative"
          style={{ height: "16%", minHeight: 105, background: "#FBF6EF" }}
        >
          {/* S-curve notch */}
          <div
            className="absolute left-0 right-0 w-full overflow-hidden pointer-events-none"
            style={{ top: 0, transform: "translateY(-100%)", height: 42 }}
          >
            <svg
              viewBox="0 0 1440 62"
              preserveAspectRatio="none"
              className="w-full h-full"
            >
              <path d={notchPath} fill="#FBF6EF" />
            </svg>
          </div>

          {/* Scroll hint on the raised edge */}
          <div
            className="absolute hidden md:flex items-center gap-1.5"
            style={{
              right: "9%",
              top: 0,
              transform: "translateY(-30px)",
              color: "rgba(13,13,12,0.4)",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.03em",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 1v8M2 6l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Scroll to discover
          </div>

          {/* Strip content */}
          <div
            className="h-full flex items-center px-5 sm:px-10 md:px-16 lg:px-24"
          >
              <div className="w-full flex flex-wrap md:flex-nowrap items-center justify-between gap-3 md:gap-6">
                {/* Tagline */}
                <p
                  className="font-[family-name:var(--font-space-grotesk)] text-base md:text-xl font-medium leading-tight tracking-tight shrink-0"
                  style={{ color: "#0D0D0C" }}
                >
                  Nothing great is<br />made alone
                </p>

                {/* Stats */}
                  <div className="flex gap-6 md:gap-10 flex-wrap">
                    {stats.map((s) => (
                      <div key={s.label} className="flex flex-col">
                        <span
                          className="font-[family-name:var(--font-space-grotesk)] font-medium leading-none tracking-tight"
                          style={{ fontSize: "clamp(20px, 2.5vw, 36px)", color: "#0D0D0C" }}
                        >
                          {s.value}
                        </span>
                        <span
                          className="text-[11px] mt-0.5 font-medium"
                          style={{ color: "rgba(13,13,12,0.5)" }}
                        >
                          {s.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Sprout */}
                  <div className="hidden md:block shrink-0" style={{ color: "rgba(13,13,12,0.2)" }}>
                      <svg width="30" height="40" viewBox="0 0 36 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="46" x2="18" y2="22" />
                        <path d="M18 32 C10 28 5 20 7 12 C13 14 18 20 18 28" />
                        <path d="M18 27 C26 23 31 15 29 7 C23 9 18 15 18 23" />
                        <line x1="10" y1="46" x2="26" y2="46" />
                      </svg>
                  </div>
                </div>
              </div>
            </div>
          </section>
          );
}
