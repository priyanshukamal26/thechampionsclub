"use client";

import React, { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PillTone } from "@/components/ui/kit";
import { leadDateLabel, type LeadSource, type LeadStatus, type LeadType } from "@/lib/leads";
import { todayISO } from "@/lib/store";
import type { ClubMember } from "@/lib/membership";

/* ─────────────────────────  SHARED DESK VOCABULARY  ───────────────────── */

export const PLAN_TONE: Record<ClubMember["planId"], PillTone> = {
  gold: "warn",
  silver: "neutral",
  junior: "clay",
};

export const MEMBER_STATUS_META: Record<ClubMember["status"], { label: string; tone: PillTone }> = {
  active: { label: "Active", tone: "success" },
  expiring_soon: { label: "Expiring soon", tone: "warn" },
  expired: { label: "Expired", tone: "danger" },
  pending_consent: { label: "Consent pending", tone: "danger" },
};

export const MEMBER_STATUS_ORDER: ClubMember["status"][] = ["active", "expiring_soon", "expired", "pending_consent"];

export const LEAD_STATUS_TONE: Record<LeadStatus, PillTone> = {
  new: "clay",
  contacted: "info",
  quoted: "warn",
  converted: "success",
  lost: "danger",
};

export const LEAD_STATUS_ORDER: LeadStatus[] = ["new", "contacted", "quoted", "converted", "lost"];
export const LEAD_TYPE_ORDER: LeadType[] = ["trial", "membership", "enquiry"];

export const LEAD_SOURCE_LABEL: Record<LeadSource, string> = {
  landing: "Landing page",
  walk_in: "Walk-in",
  phone: "Phone",
  referral: "Referral",
};

/* ─────────────────────────  FORMATTING HELPERS  ────────────────────────── */

/** "21 Nov, 06:30 pm" — for notes, audit stamps and activity timestamps. */
export function stampLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ageFromDob(dob: string): number | null {
  if (!dob) return null;
  const d = new Date(`${dob}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const monthDiff = now.getMonth() - d.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

export type FollowUpTone = "overdue" | "today" | "upcoming" | "none";

export function followUpMeta(
  date: string | undefined,
  status?: LeadStatus
): { label: string; tone: FollowUpTone } {
  if (status === "converted" || status === "lost") return { label: "Closed", tone: "none" };
  if (!date) return { label: "No follow-up", tone: "none" };
  const today = todayISO();
  if (date < today) return { label: `Overdue · ${leadDateLabel(date)}`, tone: "overdue" };
  if (date === today) return { label: "Due today", tone: "today" };
  return { label: leadDateLabel(date), tone: "upcoming" };
}

/** WhatsApp needs a country-coded number, nothing else. */
export function dialNumber(phone: string): string {
  return phone.replace(/[^0-9+]/g, "");
}

export function whatsappNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits.replace(/^0+/, "");
}

/* ─────────────────────────────  UI ATOMS  ──────────────────────────────── */

export function PanelHead({
  eyebrow,
  title,
  action,
  className,
}: {
  eyebrow?: string;
  title?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-3 border-b border-line pb-3", className)}>
      <div className="min-w-0">
        {eyebrow && <div className="u-eyebrow text-clay">{eyebrow}</div>}
        {title && <div className="u-display mt-1 text-lg text-ink">{title}</div>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
    </div>
  );
}

export function Field({
  id,
  label,
  hint,
  children,
  className,
}: {
  id?: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={id} className="u-label">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-[10.5px] leading-snug text-muted">{hint}</p>}
    </div>
  );
}

export function Fact({
  label,
  value,
  mono,
  className,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="u-label mb-1">{label}</div>
      <div className={cn("break-words leading-snug text-ink", mono ? "u-mono text-[11.5px]" : "text-[12.5px] font-medium")}>
        {value}
      </div>
    </div>
  );
}

export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  className,
}: {
  value: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      /* clipboard unavailable — the value is still selectable in the UI */
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full border border-line px-2.5 py-1.5 font-mono text-[9.5px] font-medium uppercase tracking-[0.12em] text-muted transition hover:border-ink hover:text-ink",
        className
      )}
      aria-label={copied ? copiedLabel : label}
    >
      {copied ? <Check className="h-3 w-3 text-court" /> : <Copy className="h-3 w-3" />}
      {copied ? copiedLabel : label}
    </button>
  );
}
