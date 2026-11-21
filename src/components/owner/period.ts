// =============================================================================
// Share-link period encoding
// -----------------------------------------------------------------------------
// A ShareLink only stores a free-text "period" string. We encode the accounting
// window into that string ("day:YYYY-MM-DD" | "week:YYYY-MM-DD" |
// "month:YYYY-MM") so a link stays self-describing: the owner console writes it,
// and the public /share/[token] page reads it back with no extra storage keys
// and no server round trip.
// =============================================================================

import {
  getLedger,
  gstRowsFor,
  monthLabel,
  summarize,
  type GstRow,
  type LedgerSummary,
  type Transaction,
} from "@/lib/finance";
import { addDaysISO, formatDate, formatDateLong, monthKey, offsetDate, todayISO } from "@/lib/store";

export type SharePeriodKind = "day" | "week" | "month";

export interface ResolvedPeriod {
  kind: SharePeriodKind;
  from: string;
  to: string;
  /** Human readable window, e.g. "November 2026" or "17 Nov – 23 Nov 2026". */
  label: string;
  /** Small qualifier printed under the label. */
  detail: string;
}

const ENCODED_PERIOD = /^(day|week|month):(\d{4}-\d{2}(?:-\d{2})?)$/;

function weekStartOf(iso: string): string {
  const day = new Date(`${iso}T00:00:00`);
  const mondayOffset = (day.getDay() + 6) % 7;
  return offsetDate(-mondayOffset, day);
}

function monthBounds(month: string): { from: string; to: string } {
  const year = Number(month.slice(0, 4));
  const monthNumber = Number(month.slice(5, 7));
  const lastDay = new Date(year, monthNumber, 0).getDate();
  return { from: `${month}-01`, to: `${month}-${String(lastDay).padStart(2, "0")}` };
}

/** Decode a ShareLink period. Unknown / legacy strings fall back to this month. */
export function resolvePeriod(period: string): ResolvedPeriod {
  const match = ENCODED_PERIOD.exec((period || "").trim());
  const kind: SharePeriodKind = match ? (match[1] as SharePeriodKind) : "month";
  const rawAnchor = match ? match[2] : todayISO();
  const anchor = rawAnchor.length === 7 ? `${rawAnchor}-01` : rawAnchor;

  if (kind === "day") {
    return { kind, from: anchor, to: anchor, label: formatDateLong(anchor), detail: "Single-day closing" };
  }
  if (kind === "week") {
    const from = weekStartOf(anchor);
    const to = addDaysISO(from, 6);
    const short = (iso: string) => formatDate(iso, { day: "numeric", month: "short" });
    return { kind, from, to, label: `${short(from)} – ${short(to)} ${to.slice(0, 4)}`, detail: "Monday to Sunday" };
  }
  const month = anchor.slice(0, 7);
  const bounds = monthBounds(month);
  return { kind, from: bounds.from, to: bounds.to, label: monthLabel(month), detail: "Calendar month" };
}

export interface ShareStatement {
  resolved: ResolvedPeriod;
  summary: LedgerSummary;
  gstRows: GstRow[];
}

/** Aggregate the ledger for the period a share link points at. */
export function statementForPeriod(period: string): ShareStatement {
  const resolved = resolvePeriod(period);
  const transactions: Transaction[] = getLedger().filter((t) => t.date >= resolved.from && t.date <= resolved.to);
  const summary = summarize(transactions);
  return { resolved, summary, gstRows: gstRowsFor(transactions) };
}

/** Encode the window chosen in the owner console into a link-safe period string. */
export function encodeSharePeriod(kind: SharePeriodKind, anchor = todayISO()): string {
  if (kind === "month") return `month:${monthKey(anchor)}`;
  return `${kind}:${anchor.slice(0, 10)}`;
}

/** Friendly label for the console's list of existing links. */
export function periodLabel(period: string): string {
  return resolvePeriod(period).label;
}
