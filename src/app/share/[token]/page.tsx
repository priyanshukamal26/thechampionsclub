"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { EmptyState, Panel, Stat, StatusPill } from "@/components/ui/kit";
import { DataNote, PanelHeading, TableScroll } from "@/components/owner/bits";
import {
  formatShareValidity,
  getGstSummary,
  getShareLink,
  sourceBreakdown,
  summarize,
  transactionsBetween,
} from "@/lib/finance";
import { formatDateLong, inr, offsetDate, todayISO } from "@/lib/store";

const RANGES: Record<string, number> = { last7: 7, last30: 30, last90: 90 };

export default function SharedReportPage() {
  const params = useParams<{ token: string }>();
  const token = typeof params?.token === "string" ? params.token : "";
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const link = useMemo(() => (mounted && token ? getShareLink(token) : undefined), [mounted, token]);
  const days = link ? RANGES[link.period] ?? 30 : 30;
  const from = offsetDate(-(days - 1));
  const to = todayISO();
  const summary = useMemo(
    () => (mounted ? summarize(transactionsBetween(from, to)) : null),
    [mounted, from, to]
  );
  const gst = useMemo(() => (mounted ? getGstSummary(to.slice(0, 7)) : null), [mounted, to]);
  const expired = link ? new Date(link.expiresAt).getTime() < Date.now() : false;

  if (!mounted) {
    return <div className="min-h-screen bg-paper" />;
  }

  if (!link || !summary) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20">
        <EmptyState
          title="This link is not valid"
          description="Shared summaries expire after 72 hours. Ask the club for a fresh link."
          action={
            <Link href="/" className="btn btn-ink btn-sm">
              Back to the club
            </Link>
          }
        />
      </div>
    );
  }

  if (expired) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20">
        <EmptyState
          title="This link has expired"
          description={`It was valid until ${formatShareValidity(link)}. The owner can create a new one in seconds.`}
          action={
            <Link href="/" className="btn btn-ink btn-sm">
              Back to the club
            </Link>
          }
        />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-chalk">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center bg-ink">
              <span className="u-serif text-[14px] leading-none text-chalk">CC</span>
            </span>
            <div>
              <div className="u-display text-[12px]">The Champions Club</div>
              <div className="u-mono text-[9px] uppercase tracking-[0.16em] text-muted">
                Shared financial summary
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusPill tone="info">
              <Lock className="h-3 w-3" /> Read-only
            </StatusPill>
            <Link href="/" className="btn btn-outline btn-sm">
              <ArrowLeft className="h-3.5 w-3.5" />
              Club site
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-5 py-8">
        <div>
          <div className="u-eyebrow text-clay">Owner share · expires {formatShareValidity(link)}</div>
          <h1 className="u-display mt-2 text-[clamp(1.6rem,4vw,2.4rem)]">Revenue summary</h1>
          <p className="mt-1 text-[12px] text-muted">
            {formatDateLong(from)} → {formatDateLong(to)} · {summary.count} transactions · amounts INR,
            GST inclusive.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Gross" value={inr(summary.gross)} unit="revenue" />
          <Stat label="Net" value={inr(summary.net)} unit="ex-GST" />
          <Stat label="GST" value={inr(summary.gst)} unit="output" />
          <Stat label="Transactions" value={String(summary.count)} unit="bills" />
        </div>

        <Panel>
          <PanelHeading index="F1" kicker="By source" title="Where the money came from" />
          <TableScroll label="Revenue by source">
            <table className="u-table mt-3">
              <thead>
                <tr>
                  <th>Source</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">Share</th>
                </tr>
              </thead>
              <tbody>
                {sourceBreakdown(summary).map((row) => (
                  <tr key={row.source}>
                    <td className="font-medium">{row.label}</td>
                    <td className="u-value text-right">{inr(row.amount)}</td>
                    <td className="u-value text-right text-muted">{row.share.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroll>
        </Panel>

        <div className="grid gap-5 sm:grid-cols-2">
          <Panel>
            <PanelHeading index="F2" kicker="By payment mode" title="Cash, card, UPI, tabs" />
            <div className="mt-3 space-y-2">
              {(["upi", "card", "cash", "tab"] as const).map((mode) => (
                <div key={mode} className="flex items-center justify-between border-b border-line-soft py-1.5 last:border-b-0">
                  <span className="u-mono text-[10px] uppercase tracking-[0.14em] text-muted">{mode}</span>
                  <span className="u-value text-[12px]">{inr(summary.byMode[mode])}</span>
                </div>
              ))}
            </div>
            <DataNote>Cash is verified against the drawer at closing.</DataNote>
          </Panel>

          <Panel>
            <PanelHeading index="F7" kicker="GST" title="Current month working" />
            {gst && (
              <div className="mt-3 space-y-2">
                {gst.rows.map((row) => (
                  <div key={row.taxCode} className="flex items-center justify-between border-b border-line-soft py-1.5 last:border-b-0">
                    <span className="text-[11px]">
                      <span className="u-mono mr-2 text-[9.5px] text-muted">{row.taxCode}</span>
                      {row.label}
                    </span>
                    <span className="u-value text-[11px]">{inr(row.gst)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 text-[12px] font-medium">
                  <span>Total output tax</span>
                  <span className="u-value">{inr(gst.total.gst)}</span>
                </div>
              </div>
            )}
          </Panel>
        </div>

        <div className="flex items-start gap-2 border border-line bg-chalk px-4 py-3 text-[11px] leading-relaxed text-muted">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-court" />
          <p>
            This page is a point-in-time snapshot for accounting review. It contains no member
            names, contact details, payment instruments or consents. The link stops working after
            its expiry time and cannot be renewed without the owner.
          </p>
        </div>

        <p className="pb-6 text-center text-[10px] text-muted">
          Generated by The Champions Club management system · synthetic demo data
        </p>
      </main>
    </div>
  );
}
