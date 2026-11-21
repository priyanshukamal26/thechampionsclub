"use client";

import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Info, Minus } from "lucide-react";
import { Meter } from "@/components/ui/kit";
import { cn } from "@/lib/utils";
import { inr } from "@/lib/store";

/** Panel heading used by every owner-console section. */
export function PanelHeading({
  index,
  kicker,
  title,
  description,
  actions,
}: {
  index?: string;
  kicker: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-line pb-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          {index && (
            <span className="u-mono border border-line px-1.5 py-0.5 text-[9.5px] tracking-[0.18em] text-muted">{index}</span>
          )}
          <span className="u-eyebrow text-clay">{kicker}</span>
        </div>
        <h2 className="u-display mt-2 text-[clamp(1.15rem,2.2vw,1.5rem)] leading-[1.1] text-ink">{title}</h2>
        {description && <p className="mt-1.5 max-w-2xl text-[11.5px] leading-relaxed text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Period-over-period change tag: +12.4% vs yesterday. */
export function GrowthTag({ value, suffix = "" }: { value: number; suffix?: string }) {
  const flat = Math.abs(value) < 0.05;
  const up = value > 0;
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      <Icon className={cn("h-3 w-3 shrink-0", flat ? "text-muted" : up ? "text-court" : "text-clay-deep")} aria-hidden />
      <span className={cn("u-value text-[11px]", flat ? "text-muted" : up ? "text-court" : "text-clay-deep")}>
        {flat ? "0.0" : `${up ? "+" : ""}${value.toFixed(1)}`}%
      </span>
      {suffix && <span className="text-[10.5px] text-muted">{suffix}</span>}
    </span>
  );
}

/** Labelled money value, right aligned inside tables. */
export function Money({ value, className }: { value: number; className?: string }) {
  return <span className={cn("u-value whitespace-nowrap", className)}>{inr(value)}</span>;
}

/** Horizontal breakdown bar used for revenue sources and payment modes. */
export function BreakdownRow({
  label,
  amount,
  share,
  tone = "clay",
  meta,
}: {
  label: string;
  amount: number;
  share: number;
  tone?: "clay" | "court" | "ink" | "gold";
  meta?: string;
}) {
  return (
    <div className="border-b border-line-soft py-2.5 last:border-b-0">
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 truncate text-[12px] text-ink">{label}</span>
        <span className="u-value shrink-0 text-[12px] text-ink">{inr(amount)}</span>
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <Meter value={share} tone={tone} className="flex-1" />
        <span className="u-mono w-11 shrink-0 text-right text-[10px] tabular-nums text-muted">{share.toFixed(1)}%</span>
      </div>
      {meta && <div className="mt-0.5 text-[10px] text-muted">{meta}</div>}
    </div>
  );
}

/** Quiet footnote for synthetic-data and statutory notices. */
export function DataNote({ children, tone = "paper" }: { children: ReactNode; tone?: "paper" | "ink" }) {
  return (
    <p className={cn("mt-3 flex items-start gap-1.5 text-[10.5px] leading-relaxed", tone === "ink" ? "text-chalk/55" : "text-muted")}>
      <Info className="mt-px h-3 w-3 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

/** Horizontally scrollable table region — keeps 360px viewports clean. */
export function TableScroll({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="overflow-x-auto" role="region" aria-label={label} tabIndex={0}>
      {children}
    </div>
  );
}
