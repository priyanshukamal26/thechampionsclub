import React from "react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────  TYPOGRAPHY / SECTION  ──────────────────── */

export function SectionIntro({
  index,
  kicker,
  title,
  description,
  tone = "paper",
  align = "left",
  className,
  titleClassName,
}: {
  index?: string;
  kicker: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  tone?: "paper" | "ink";
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
}) {
  const inv = tone === "ink";
  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "center" ? "items-center text-center" : "items-start",
        className
      )}
    >
      <div className={cn("flex items-center gap-3", align === "center" && "justify-center")}>
        {index && (
          <span
            className={cn(
              "u-mono text-[10px] tracking-[0.2em] px-1.5 py-0.5 border",
              inv ? "border-line-inverse text-chalk/70" : "border-line text-muted"
            )}
          >
            {index}
          </span>
        )}
        <span className={cn("u-eyebrow", inv ? "text-clay-soft" : "text-clay")}>{kicker}</span>
        <span className={cn("h-px w-10", inv ? "bg-line-inverse" : "bg-line")} />
      </div>
      <h2
        className={cn(
          "u-display text-[clamp(2rem,4.2vw,3.6rem)]",
          inv ? "text-chalk" : "text-ink",
          titleClassName
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "max-w-xl text-[13.5px] leading-relaxed",
            inv ? "text-chalk/60" : "text-muted",
            align === "center" && "mx-auto"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────  DASHBOARD  ─────────────────────────────── */

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  meta,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-5 border-b border-line pb-6 md:flex-row md:items-end md:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow && <div className="u-eyebrow mb-2 text-clay">{eyebrow}</div>}
        <h1 className="u-display text-[clamp(1.7rem,3.2vw,2.6rem)] text-ink">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed text-muted">{description}</p>}
        {meta && <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">{meta}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({
  children,
  className,
  tone = "paper",
  padded = true,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "paper" | "ink" | "court" | "clay" | "deep";
  padded?: boolean;
  as?: React.ElementType;
}) {
  const tones: Record<string, string> = {
    paper: "card text-ink",
    deep: "bg-paper-deep border border-line text-ink",
    ink: "panel-ink",
    court: "panel-court",
    clay: "panel-clay",
  };
  return (
    <Tag className={cn("rounded-2xl", tones[tone], padded && "p-5 md:p-6", className)}>
      {children}
    </Tag>
  );
}

export function Stat({
  label,
  value,
  unit,
  note,
  tone = "paper",
  className,
}: {
  label: string;
  value: React.ReactNode;
  unit?: string;
  note?: React.ReactNode;
  tone?: "paper" | "ink" | "court" | "clay";
  className?: string;
}) {
  const inv = tone !== "paper";
  const surfaces: Record<string, string> = {
    paper: "border-line bg-paper-soft",
    ink: "border-ink bg-ink",
    court: "border-court bg-court",
    clay: "border-clay bg-clay",
  };
  return (
    <div
      className={cn(
        "flex flex-col justify-between gap-3 rounded-xl border p-4",
        surfaces[tone],
        className
      )}
    >
      <div className={cn("u-eyebrow", inv ? "text-chalk/55" : "text-muted")}>{label}</div>
      <div className="flex items-baseline gap-1.5">
        <span className={cn("u-value text-[clamp(1.5rem,2.6vw,2.1rem)] leading-none", inv ? "text-chalk" : "text-ink")}>
          {value}
        </span>
        {unit && <span className={cn("u-mono text-[10px] uppercase tracking-widest", inv ? "text-chalk/50" : "text-muted")}>{unit}</span>}
      </div>
      {note && <div className={cn("text-[11px] leading-snug", inv ? "text-chalk/50" : "text-muted")}>{note}</div>}
    </div>
  );
}

export type PillTone = "success" | "warn" | "danger" | "info" | "neutral" | "clay";

export function StatusPill({ tone = "neutral", children, className }: { tone?: PillTone; children: React.ReactNode; className?: string }) {
  const tones: Record<PillTone, string> = {
    success: "border-court/30 bg-court/10 text-court",
    warn: "border-gold/40 bg-gold/10 text-[#7d5d17]",
    danger: "border-clay/40 bg-clay/10 text-clay-deep",
    info: "border-ink/20 bg-ink/5 text-ink-soft",
    neutral: "border-line bg-transparent text-muted",
    clay: "border-clay bg-clay text-chalk",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[9.5px] font-medium uppercase tracking-[0.12em]", tones[tone], className)}>
      {children}
    </span>
  );
}

export function EmptyState({ title, description, action, className }: { title: string; description?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line px-6 py-12 text-center", className)}>
      <div className="u-eyebrow text-muted">Nothing here yet</div>
      <div className="u-display text-lg text-ink">{title}</div>
      {description && <p className="max-w-sm text-xs text-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function Avatar({ name, tone = "ink", size = 38 }: { name: string; tone?: "ink" | "clay" | "court"; size?: number }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
  const tones = { ink: "bg-ink text-chalk", clay: "bg-clay text-chalk", court: "bg-court text-chalk" };
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-semibold tracking-wider", tones[tone])}
      style={{ width: size, height: size }}
    >
      {initials || "TC"}
    </span>
  );
}

export function Meter({ value, tone = "clay", className }: { value: number; tone?: "clay" | "court" | "ink" | "gold"; className?: string }) {
  const tones = { clay: "bg-clay", court: "bg-court", ink: "bg-ink", gold: "bg-gold" };
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-ink/10", className)}>
      <div className={cn("h-full rounded-full transition-all", tones[tone])} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

/* ─────────────────────────────  DECORATIVE  ────────────────────────────── */

export function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[70] opacity-[0.035] mix-blend-multiply"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  );
}

export function Ticker({ items, tone = "ink", className }: { items: string[]; tone?: "ink" | "paper" | "clay" | "court"; className?: string }) {
  const tones = {
    ink: "bg-ink text-chalk border-t border-b border-ink",
    paper: "bg-paper-deep text-ink border-t border-b border-line",
    clay: "bg-clay text-chalk border-t border-b border-clay",
    court: "bg-court text-chalk border-t border-b border-court",
  };
  const doubled = [...items, ...items];
  return (
    <div className={cn("overflow-hidden py-2.5", tones[tone], className)} aria-hidden>
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.18em]">
            <span className="px-5">{item}</span>
            <span className="opacity-40">✳</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function Stamp({ text = "THE CHAMPIONS CLUB · EST. 2019 · NEW DELHI ·", className }: { text?: string; className?: string }) {
  return (
    <div className={cn("spin-slow", className)} aria-hidden>
      <svg viewBox="0 0 120 120" className="h-full w-full">
        <defs>
          <path id="stamp-circle" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
        </defs>
        <circle cx="60" cy="60" r="58" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
        <circle cx="60" cy="60" r="33" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
        <text className="fill-current" style={{ fontSize: 8, letterSpacing: 2.4, fontFamily: "var(--font-mono)" }}>
          <textPath href="#stamp-circle">{text}</textPath>
        </text>
        <text x="60" y="58" textAnchor="middle" className="fill-current" style={{ fontSize: 13, fontFamily: "var(--font-display)", fontWeight: 700 }}>
          TCC
        </text>
        <text x="60" y="70" textAnchor="middle" className="fill-current" style={{ fontSize: 6, letterSpacing: 1.4, fontFamily: "var(--font-mono)" }}>
          PLAY · COMPETE
        </text>
      </svg>
    </div>
  );
}

export function CourtLines({ className, stroke = "currentColor", opacity = 0.25 }: { className?: string; stroke?: string; opacity?: number }) {
  return (
    <svg viewBox="0 0 400 220" fill="none" className={className} aria-hidden style={{ opacity }}>
      <rect x="18" y="18" width="364" height="184" stroke={stroke} strokeWidth="1.4" />
      <rect x="34" y="34" width="332" height="152" stroke={stroke} strokeWidth="1" />
      <line x1="200" y1="18" x2="200" y2="202" stroke={stroke} strokeWidth="1" strokeDasharray="3 6" />
      <line x1="120" y1="18" x2="120" y2="202" stroke={stroke} strokeWidth="1" />
      <line x1="280" y1="18" x2="280" y2="202" stroke={stroke} strokeWidth="1" />
      <line x1="34" y1="110" x2="366" y2="110" stroke={stroke} strokeWidth="1" />
      <line x1="18" y1="58" x2="34" y2="58" stroke={stroke} strokeWidth="1" />
      <line x1="18" y1="162" x2="34" y2="162" stroke={stroke} strokeWidth="1" />
      <line x1="366" y1="58" x2="382" y2="58" stroke={stroke} strokeWidth="1" />
      <line x1="366" y1="162" x2="382" y2="162" stroke={stroke} strokeWidth="1" />
    </svg>
  );
}

export function Rule({ label, tone = "paper", className }: { label?: string; tone?: "paper" | "ink"; className?: string }) {
  const inv = tone === "ink";
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className={cn("h-px flex-1", inv ? "bg-line-inverse" : "bg-line")} />
      {label && <span className={cn("u-eyebrow", inv ? "text-chalk/50" : "text-muted")}>{label}</span>}
      <span className={cn("h-px flex-1", inv ? "bg-line-inverse" : "bg-line")} />
    </div>
  );
}
