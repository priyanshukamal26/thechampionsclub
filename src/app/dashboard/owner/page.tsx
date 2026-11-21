"use client";

import { useEffect, useMemo, useState, type ElementType } from "react";
import Link from "next/link";
import {
  BadgeIndianRupee,
  BarChart3,
  CalendarDays,
  Check,
  Copy,
  Download,
  FileText,
  Landmark,
  Link2,
  Package,
  Plus,
  Printer,
  ReceiptText,
  Share2,
  ShieldCheck,
  Users,
  Wallet,
  X,
} from "lucide-react";
import {
  EmptyState,
  Meter,
  PageHeader,
  Panel,
  Rule,
  Stat,
  StatusPill,
} from "@/components/ui/kit";
import { Modal, Segmented, Tabs } from "@/components/ui/overlay";
import { useAuth } from "@/lib/auth-context";
import { loadConsoleData, type OwnerTab } from "@/components/owner/console-data";
import {
  BreakdownRow,
  DataNote,
  GrowthTag,
  Money,
  PanelHeading,
  TableScroll,
} from "@/components/owner/bits";
import {
  createInvoice,
  createShareLink,
  decideLeave,
  exportGstCsv,
  exportInvoicesCsv,
  exportSummaryCsv,
  formatShareValidity,
  getGstSummary,
  getLedger,
  getZReport,
  growth,
  markInvoicePaid,
  markPayablePaid,
  markPayrollPaid,
  monthLabel,
  previousMonth,
  shareUrl,
  sourceBreakdown,
  summarize,
} from "@/lib/finance";
import { getProducts, restockProduct } from "@/lib/orders";
import { recordAuditLog } from "@/lib/audit";
import {
  formatDate,
  formatDateLong,
  inr,
  monthKey,
  offsetDate,
  todayISO,
} from "@/lib/store";
import { cn } from "@/lib/utils";

const TABS: { value: OwnerTab; label: string; icon: ElementType }[] = [
  { value: "overview", label: "Overview", icon: BarChart3 },
  { value: "zreport", label: "Z-report", icon: ReceiptText },
  { value: "gst", label: "GST", icon: FileText },
  { value: "payables", label: "Payables", icon: Wallet },
  { value: "invoices", label: "Invoices", icon: Landmark },
  { value: "payroll", label: "People", icon: Users },
  { value: "share", label: "Share", icon: Share2 },
];

export default function OwnerConsolePage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [version, setVersion] = useState(0);
  const [tab, setTab] = useState<OwnerTab>("overview");
  const [zDate, setZDate] = useState(todayISO());
  const [gstMonth, setGstMonth] = useState(monthKey(todayISO()));
  const [countedCash, setCountedCash] = useState("");
  const [flash, setFlash] = useState<string | null>(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const refresh = () => setVersion((v) => v + 1);

  const note = (message: string) => {
    setFlash(message);
    window.setTimeout(() => setFlash(null), 3200);
  };

  const data = useMemo(() => (mounted ? loadConsoleData() : null), [mounted, version]);
  const z = useMemo(() => (mounted ? getZReport(zDate) : null), [mounted, zDate, version]);
  const monthGst = useMemo(
    () => (mounted ? getGstSummary(gstMonth) : null),
    [mounted, gstMonth, version]
  );
  const series = useMemo(() => {
    if (!mounted) return [];
    const ledger = getLedger();
    return Array.from({ length: 14 }, (_, i) => {
      const date = offsetDate(-(13 - i));
      const gross = summarize(ledger.filter((t) => t.date === date)).gross;
      return { date, gross };
    });
  }, [mounted, version]);

  if (!mounted || !data) {
    return (
      <div className="mx-auto max-w-[1200px] space-y-6 p-5 sm:p-6 lg:p-8">
        <div className="h-8 w-64 animate-pulse rounded bg-ink/10" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-ink/[0.06]" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-2xl bg-ink/[0.05]" />
      </div>
    );
  }

  const {
    todayWeekMonth: twm,
    payables,
    payablesDue,
    staff,
    leave,
    payroll,
    payrollTotal,
    invoices,
    shareLinks,
    openTabs,
    lowStock,
  } = data;
  const modeTotal = twm.month.gross || 1;
  const overdueInvoices = invoices.filter((i) => i.status === "overdue");
  const pendingLeave = leave.filter((l) => l.status === "pending");
  const pendingPayroll = payroll.filter((p) => !p.paid);
  const drawerExpected = z ? z.expectedDrawer : 0;
  const counted = Number(countedCash.replace(/[^\d.]/g, "")) || 0;
  const variance = counted - drawerExpected;
  const maxSeries = Math.max(...series.map((s) => s.gross), 1);
  const products = getProducts();

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-5 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Owner console · finance & operations"
        title="The month, in one place."
        description="Revenue by source and payment mode, the daily Z-report, GST working papers, payables, invoices, payroll and leave. Every number is computed from the club's own ledgers."
        actions={
          <>
            <button className="btn btn-outline btn-sm" onClick={() => exportSummaryCsv()}>
              <Download className="h-3.5 w-3.5" />
              Export summary
            </button>
            <button className="btn btn-ink btn-sm" onClick={() => setTab("zreport")}>
              <ReceiptText className="h-3.5 w-3.5" />
              Close the day
            </button>
          </>
        }
        meta={
          <>
            <StatusPill tone="success">
              <ShieldCheck className="h-3 w-3" /> Ledger reconciled from source tables
            </StatusPill>
            <span className="u-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              {formatDateLong(todayISO())}
            </span>
            <span className="u-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              Signed in as {user?.fullName ?? "Owner"}
            </span>
          </>
        }
      />

      {flash && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-court/30 bg-court/10 px-4 py-2.5 text-[12px] text-court">
          <span className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5" /> {flash}
          </span>
          <button onClick={() => setFlash(null)} aria-label="Dismiss" className="text-court/70 hover:text-court">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {/*  OVERVIEW  */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <Stat
              label="Today"
              value={inr(twm.today.gross)}
              unit="gross"
              note={<GrowthTag value={growth(twm.today.gross, twm.yesterday.gross)} suffix="vs yesterday" />}
            />
            <Stat
              label="This week"
              value={inr(twm.week.gross)}
              unit="gross"
              note={<GrowthTag value={growth(twm.week.gross, twm.lastWeek.gross)} suffix="vs last week" />}
            />
            <Stat
              label="This month"
              value={inr(twm.month.gross)}
              unit="gross"
              note={<GrowthTag value={growth(twm.month.gross, twm.lastMonth.gross)} suffix="vs last month" />}
            />
            <Stat
              tone="ink"
              label="Owed out"
              value={inr(payablesDue)}
              unit="payables"
              note={`${payables.filter((p) => p.status !== "paid").length} open bills · GST ${inr(twm.month.gst)}`}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-12">
            <Panel className="lg:col-span-7">
              <PanelHeading
                index="F1"
                kicker="Revenue by source"
                title="Where the money came from"
                description={`${monthLabel(monthKey(todayISO()))} · GST-inclusive. Court, social and membership income settle under SAC 998413/999723; shop goods under HSN 9506.`}
                actions={
                  <button className="btn btn-outline btn-sm" onClick={() => setTab("gst")}>
                    GST working
                  </button>
                }
              />
              <div className="mt-3">
                {sourceBreakdown(twm.month).map((row) => (
                  <BreakdownRow
                    key={row.source}
                    label={row.label}
                    amount={row.amount}
                    share={row.share}
                    tone={
                      row.source === "court"
                        ? "court"
                        : row.source === "bar"
                          ? "clay"
                          : row.source === "shop"
                            ? "ink"
                            : "gold"
                    }
                    meta={`${((row.amount / (twm.month.net || 1)) * 100).toFixed(0)}% of net revenue`}
                  />
                ))}
              </div>
              <Rule label="14-day run rate" className="mt-4" />
              <div className="mt-3 flex h-24 items-end gap-1">
                {series.map((point) => (
                  <div key={point.date} className="group relative flex-1">
                    <div
                      className="w-full rounded-t-sm bg-court/70 transition-colors group-hover:bg-clay"
                      style={{ height: `${Math.max(3, (point.gross / maxSeries) * 92)}px` }}
                    />
                    <span className="pointer-events-none absolute -top-7 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink px-1.5 py-0.5 text-[9px] text-chalk group-hover:block">
                      {formatDate(point.date)} · {inr(point.gross)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-1 flex justify-between text-[9px] uppercase tracking-[0.14em] text-muted">
                <span>{formatDate(series[0]?.date ?? todayISO())}</span>
                <span>Today</span>
              </div>
            </Panel>

            <div className="space-y-5 lg:col-span-5">
              <Panel tone="deep">
                <PanelHeading
                  index="F2"
                  kicker="Payment modes"
                  title="How they paid"
                  description="Cash must reconcile against the drawer at close."
                />
                <div className="mt-3 space-y-2">
                  {(["upi", "card", "cash", "tab"] as const).map((mode) => (
                    <div
                      key={mode}
                      className="flex items-center justify-between border-b border-line-soft py-1.5 last:border-b-0"
                    >
                      <span className="u-mono text-[10px] uppercase tracking-[0.14em] text-muted">{mode}</span>
                      <div className="flex items-center gap-2">
                        <Meter
                          value={(twm.month.byMode[mode] / modeTotal) * 100}
                          tone={mode === "cash" ? "gold" : mode === "tab" ? "clay" : "court"}
                          className="w-20"
                        />
                        <Money value={twm.month.byMode[mode]} className="text-[12px]" />
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel>
                <PanelHeading index="F8" kicker="Needs you" title="Open items" />
                <ul className="mt-2 divide-y divide-line-soft">
                  {[
                    { label: "Bills due this week", value: payables.filter((p) => p.status === "due").length, tab: "payables" as OwnerTab },
                    { label: "Leave requests pending", value: pendingLeave.length, tab: "payroll" as OwnerTab },
                    { label: "Invoices overdue", value: overdueInvoices.length, tab: "invoices" as OwnerTab },
                    { label: "Open member tabs", value: openTabs.length, tab: "zreport" as OwnerTab },
                    { label: "Products below reorder", value: lowStock.length, tab: "overview" as OwnerTab },
                  ].map((item) => (
                    <li key={item.label}>
                      <button
                        onClick={() => setTab(item.tab)}
                        className="flex w-full items-center justify-between py-2 text-left text-[12px] text-ink hover:text-clay"
                      >
                        <span>{item.label}</span>
                        <span className={cn("u-value", item.value > 0 ? "text-clay" : "text-muted")}>{item.value}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>
          </div>

          <Panel>
            <PanelHeading
              index="C2/C3"
              kicker="Shelf watch"
              title="Stock that needs a decision"
              description="Counter and online sales share one inventory count. Restocking here updates the shop immediately."
              actions={
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    refresh();
                    note("Stock levels refreshed from the shelf ledger.");
                  }}
                >
                  Refresh
                </button>
              }
            />
            {lowStock.length === 0 ? (
              <EmptyState title="Nothing below reorder level" description="Every product is above its reorder point." className="mt-4" />
            ) : (
              <TableScroll label="Low stock products">
                <table className="u-table mt-3">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th className="text-right">On shelf</th>
                      <th className="text-right">Reorder at</th>
                      <th className="text-right">Restock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.map((product) => (
                      <tr key={product.id}>
                        <td className="font-medium">{product.name}</td>
                        <td className="u-mono text-[10.5px] text-muted">{product.sku}</td>
                        <td className="u-value text-right text-clay">{product.stock}</td>
                        <td className="u-value text-right text-muted">{product.lowStockAt}</td>
                        <td className="text-right">
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => {
                              restockProduct(product.id, 12);
                              recordAuditLog({
                                action: "stock.restocked",
                                entity: "products",
                                entityId: product.id,
                                details: { qty: 12 },
                              });
                              refresh();
                              note(`${product.name} restocked by 12.`);
                            }}
                          >
                            +12 units
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableScroll>
            )}
            <DataNote>{products.length} products on the shelf · restock lead time 3–5 working days.</DataNote>
          </Panel>
        </div>
      )}

      {/*  Z-REPORT  */}
      {tab === "zreport" && z && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="u-eyebrow text-clay">F1 · D8 · daily close</div>
              <h2 className="u-display mt-1 text-[clamp(1.2rem,2.2vw,1.6rem)]">End-of-day Z-report</h2>
              <p className="mt-1 text-[11.5px] text-muted">
                Aggregates courts, shop, bar, social and membership income for the selected IST day.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                className="input max-w-[170px]"
                value={zDate}
                max={todayISO()}
                onChange={(event) => setZDate(event.target.value)}
              />
              <button className="btn btn-outline btn-sm" onClick={() => window.print()}>
                <Printer className="h-3.5 w-3.5" />
                Print
              </button>
              <button
                className="btn btn-ink btn-sm"
                onClick={() => {
                  exportSummaryCsv();
                  note("Z-report exported as CSV.");
                }}
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </button>
            </div>
          </div>

          <Panel tone="ink">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="u-eyebrow text-clay-soft">The Champions Club · New Delhi</div>
                <div className="u-display mt-2 text-2xl text-chalk">Z-REPORT</div>
                <div className="u-mono mt-1 text-[11px] uppercase tracking-[0.14em] text-chalk/50">
                  {formatDateLong(z.date)} · generated{" "}
                  {new Date(z.generatedAt).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
              <div className="text-right">
                <StatusPill tone={z.reconciled ? "success" : "warn"}>
                  {z.reconciled ? "Reconciled" : "Awaiting count"}
                </StatusPill>
                <div className="u-value mt-2 text-3xl text-chalk">{inr(z.summary.gross)}</div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-chalk/50">gross takings</div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-line-inverse pt-4 sm:grid-cols-4">
              {[
                ["Cash", z.cashCollected],
                ["Card", z.cardCollected],
                ["UPI", z.upiCollected],
                ["On tabs", z.tabCollected],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <div className="u-eyebrow text-chalk/45">{label as string}</div>
                  <div className="u-value mt-1 text-[15px] text-chalk">{inr(value as number)}</div>
                </div>
              ))}
            </div>
          </Panel>

          <div className="grid gap-5 lg:grid-cols-12">
            <Panel className="lg:col-span-7">
              <PanelHeading index="F1" kicker="Sales by source" title="What was sold" />
              <TableScroll label="Sales by source">
                <table className="u-table mt-3">
                  <thead>
                    <tr>
                      <th>Source</th>
                      <th className="text-right">Net</th>
                      <th className="text-right">GST</th>
                      <th className="text-right">Gross</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sourceBreakdown(z.summary).map((row) => (
                      <tr key={row.source}>
                        <td className="font-medium">{row.label}</td>
                        <td className="u-value text-right">{inr(z.summary.bySource[row.source] / 1.18)}</td>
                        <td className="u-value text-right text-muted">
                          {inr(z.summary.bySource[row.source] - z.summary.bySource[row.source] / 1.18)}
                        </td>
                        <td className="u-value text-right font-medium">{inr(row.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td>Total</td>
                      <td className="u-value text-right">{inr(z.summary.net)}</td>
                      <td className="u-value text-right">{inr(z.summary.gst)}</td>
                      <td className="u-value text-right">{inr(z.summary.gross)}</td>
                    </tr>
                  </tfoot>
                </table>
              </TableScroll>
              <DataNote>
                {z.summary.count} transactions · {z.staffOnDuty.length} staff on duty · {z.openTabs} member tabs
                still open at close.
              </DataNote>
            </Panel>

            <Panel className="lg:col-span-5">
              <PanelHeading index="F2" kicker="Cash reconciliation" title="Count the drawer" />
              <div className="mt-3 space-y-2 text-[12px]">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Opening float</span>
                  <Money value={z.openingFloat} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Cash collected</span>
                  <Money value={z.cashCollected} />
                </div>
                <div className="flex items-center justify-between border-t border-line pt-2 font-medium">
                  <span>Expected in drawer</span>
                  <Money value={drawerExpected} />
                </div>
              </div>

              <label className="u-label mt-4" htmlFor="counted-cash">
                Counted cash
              </label>
              <input
                id="counted-cash"
                className="input"
                inputMode="decimal"
                placeholder="e.g. 18400"
                value={countedCash}
                onChange={(event) => setCountedCash(event.target.value)}
              />
              {countedCash.trim() !== "" && (
                <div
                  className={cn(
                    "mt-2 flex items-center justify-between rounded-lg border px-3 py-2 text-[11.5px]",
                    Math.abs(variance) <= 1
                      ? "border-court/30 bg-court/10 text-court"
                      : "border-clay/40 bg-clay/10 text-clay-deep"
                  )}
                >
                  <span>{Math.abs(variance) <= 1 ? "Drawer balances" : variance > 0 ? "Surplus" : "Shortfall"}</span>
                  <span className="u-value">
                    {variance > 0 ? "+" : ""}
                    {inr(variance)}
                  </span>
                </div>
              )}

              <div className="mt-4 border-t border-line pt-3">
                <div className="u-eyebrow mb-2">On shift at close</div>
                <div className="flex flex-wrap gap-1.5">
                  {z.staffOnDuty.map((person) => (
                    <StatusPill key={person.id} tone="info">
                      {person.name.split(" ")[0]} · {person.shift}
                    </StatusPill>
                  ))}
                </div>
              </div>
              <DataNote>
                A Z-report is immutable once the day is closed. Corrections are posted as new ledger entries,
                never edits.
              </DataNote>
            </Panel>
          </div>

          <Panel>
            <PanelHeading index="F7" kicker="Tax working" title="GST collected today" />
            <TableScroll label="GST collected today">
              <table className="u-table mt-3">
                <thead>
                  <tr>
                    <th>Tax code</th>
                    <th>Description</th>
                    <th className="text-right">Taxable value</th>
                    <th className="text-right">GST</th>
                    <th className="text-right">Gross</th>
                    <th className="text-right">Invoices</th>
                  </tr>
                </thead>
                <tbody>
                  {z.gstRows.map((row) => (
                    <tr key={row.taxCode}>
                      <td className="u-mono text-[10.5px]">{row.taxCode}</td>
                      <td>{row.label}</td>
                      <td className="u-value text-right">{inr(row.taxable)}</td>
                      <td className="u-value text-right">{inr(row.gst)}</td>
                      <td className="u-value text-right">{inr(row.gross)}</td>
                      <td className="u-value text-right text-muted">{row.count}</td>
                    </tr>
                  ))}
                  {z.gstRows.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-muted">
                        No transactions on this date.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </TableScroll>
          </Panel>
        </div>
      )}

      {/*  GST  */}
      {tab === "gst" && monthGst && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="u-eyebrow text-clay">F7 · statutory</div>
              <h2 className="u-display mt-1 text-[clamp(1.2rem,2.2vw,1.6rem)]">GST summary</h2>
              <p className="mt-1 text-[11.5px] text-muted">
                Monthly working paper by SAC/HSN code, ready for GSTR-1 and GSTR-3B.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button className="btn btn-outline btn-sm" onClick={() => setGstMonth(previousMonth(gstMonth))}>
                ← Prev
              </button>
              <input
                type="month"
                className="input max-w-[160px]"
                value={gstMonth}
                max={monthKey(todayISO())}
                onChange={(event) => event.target.value && setGstMonth(event.target.value)}
              />
              <button
                className="btn btn-outline btn-sm"
                disabled={gstMonth >= monthKey(todayISO())}
                onClick={() => setGstMonth(monthKey(offsetDate(31, new Date(`${gstMonth}-15T00:00:00`))))}
              >
                Next 
              </button>
              <button className="btn btn-ink btn-sm" onClick={() => exportGstCsv(gstMonth)}>
                <Download className="h-3.5 w-3.5" />
                Export GSTR working
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <Stat label="Taxable value" value={inr(monthGst.total.taxable)} unit="net" note={monthLabel(gstMonth)} />
            <Stat label="GST payable" value={inr(monthGst.total.gst)} unit="output" note="18% blended · 5% on food" />
            <Stat label="Gross billed" value={inr(monthGst.total.gross)} unit="gross" note={`${monthGst.total.count} transactions`} />
            <Stat tone="court" label="ITC estimate" value={inr(monthGst.total.gst * 0.32)} unit="credit" note="Purchases & services (estimate)" />
          </div>

          <Panel>
            <PanelHeading index="F7" kicker="By tax code" title={`Tax collected · ${monthLabel(gstMonth)}`} />
            <TableScroll label="GST summary table">
              <table className="u-table mt-3">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Description</th>
                    <th className="text-right">Transactions</th>
                    <th className="text-right">Taxable</th>
                    <th className="text-right">GST</th>
                    <th className="text-right">Gross</th>
                    <th className="text-right">Effective rate</th>
                  </tr>
                </thead>
                <tbody>
                  {monthGst.rows.map((row) => (
                    <tr key={row.taxCode}>
                      <td className="u-mono text-[10.5px]">{row.taxCode}</td>
                      <td>{row.label}</td>
                      <td className="u-value text-right">{row.count}</td>
                      <td className="u-value text-right">{inr(row.taxable)}</td>
                      <td className="u-value text-right">{inr(row.gst)}</td>
                      <td className="u-value text-right">{inr(row.gross)}</td>
                      <td className="u-value text-right text-muted">
                        {row.taxable > 0 ? `${((row.gst / row.taxable) * 100).toFixed(1)}%` : "—"}
                      </td>
                    </tr>
                  ))}
                  {monthGst.rows.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted">
                        No taxable transactions in this month.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3}>Total</td>
                    <td className="u-value text-right">{inr(monthGst.total.taxable)}</td>
                    <td className="u-value text-right">{inr(monthGst.total.gst)}</td>
                    <td className="u-value text-right">{inr(monthGst.total.gross)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </TableScroll>
            <DataNote>
              Rates are seeded configuration, not hard-coded law: court and social hire at 18% (SAC 998413),
              sporting goods at 18% (HSN 9506), café food at 5% and beverages at 18% (SAC 996331), membership
              subscriptions at 18% (SAC 999723). Verify current slabs on the GST portal before filing.
            </DataNote>
          </Panel>
        </div>
      )}

      {/*  PAYABLES  */}
      {tab === "payables" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <Stat label="Total due" value={inr(payablesDue)} unit="payables" note="Excludes paid bills" />
            <Stat
              label="Due this week"
              value={inr(payables.filter((p) => p.status === "due").reduce((s, p) => s + p.amount, 0))}
              unit="cash out"
            />
            <Stat
              label="Scheduled"
              value={inr(payables.filter((p) => p.status === "scheduled").reduce((s, p) => s + p.amount, 0))}
              unit="committed"
            />
            <Stat label="GST payable" value={inr(twm.month.gst)} unit="statutory" note="Current month output tax" />
          </div>

          <Panel>
            <PanelHeading
              index="F3"
              kicker="Accounts payable"
              title="What the club owes"
              description="Vendor bills, statutory dues and committed costs. Marking a bill paid is an audited action."
            />
            <TableScroll label="Payables table">
              <table className="u-table mt-3">
                <thead>
                  <tr>
                    <th>Vendor</th>
                    <th>Category</th>
                    <th>Reference</th>
                    <th>Due</th>
                    <th className="text-right">Amount</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payables.map((bill) => (
                    <tr key={bill.id}>
                      <td className="font-medium">{bill.vendor}</td>
                      <td className="text-muted">{bill.category}</td>
                      <td className="u-mono text-[10.5px] text-muted">{bill.reference}</td>
                      <td className="u-mono text-[10.5px]">{formatDate(bill.dueDate)}</td>
                      <td className="u-value text-right">{inr(bill.amount)}</td>
                      <td>
                        <StatusPill
                          tone={bill.status === "paid" ? "success" : bill.status === "due" ? "warn" : "neutral"}
                        >
                          {bill.status}
                        </StatusPill>
                      </td>
                      <td className="text-right">
                        {bill.status !== "paid" ? (
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => {
                              markPayablePaid(bill.id);
                              recordAuditLog({
                                actor: user?.fullName,
                                role: user?.role,
                                action: "payable.paid",
                                entity: "payables",
                                entityId: bill.id,
                                details: { vendor: bill.vendor, amount: bill.amount },
                              });
                              refresh();
                              note(`${bill.vendor} marked paid · ${inr(bill.amount)}.`);
                            }}
                          >
                            Mark paid
                          </button>
                        ) : (
                          <span className="text-[10.5px] text-muted">Settled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4}>Outstanding</td>
                    <td className="u-value text-right">{inr(payablesDue)}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </TableScroll>
          </Panel>
        </div>
      )}

      {/*  INVOICES  */}
      {tab === "invoices" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <StatusPill tone="warn">{invoices.filter((i) => i.status === "pending").length} pending</StatusPill>
              <StatusPill tone="danger">{overdueInvoices.length} overdue</StatusPill>
              <StatusPill tone="success">{invoices.filter((i) => i.status === "paid").length} paid</StatusPill>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-outline btn-sm" onClick={() => exportInvoicesCsv()}>
                <Download className="h-3.5 w-3.5" />
                Export
              </button>
              <button className="btn btn-ink btn-sm" onClick={() => setInvoiceOpen(true)}>
                <Plus className="h-3.5 w-3.5" />
                New invoice
              </button>
            </div>
          </div>

          <Panel>
            <PanelHeading
              index="F4"
              kicker="Invoicing"
              title="Memberships & business clients"
              description="GST invoices with GSTIN capture. Membership invoices are SAC 999723; corporate blocks mix court hire and catering."
            />
            <TableScroll label="Invoices table">
              <table className="u-table mt-3">
                <thead>
                  <tr>
                    <th>Number</th>
                    <th>Client</th>
                    <th>Description</th>
                    <th>Issued</th>
                    <th>Due</th>
                    <th className="text-right">Net</th>
                    <th className="text-right">GST</th>
                    <th className="text-right">Gross</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="u-mono text-[10.5px]">{invoice.number}</td>
                      <td>
                        <div className="font-medium">{invoice.client}</div>
                        {invoice.gstin && <div className="u-mono text-[9.5px] text-muted">{invoice.gstin}</div>}
                      </td>
                      <td className="max-w-[220px] text-muted">{invoice.description}</td>
                      <td className="u-mono text-[10.5px]">{formatDate(invoice.issuedAt)}</td>
                      <td className="u-mono text-[10.5px]">{formatDate(invoice.dueAt)}</td>
                      <td className="u-value text-right">{inr(invoice.net)}</td>
                      <td className="u-value text-right text-muted">{inr(invoice.gst)}</td>
                      <td className="u-value text-right font-medium">{inr(invoice.gross)}</td>
                      <td>
                        <StatusPill
                          tone={
                            invoice.status === "paid" ? "success" : invoice.status === "overdue" ? "danger" : "warn"
                          }
                        >
                          {invoice.status}
                        </StatusPill>
                      </td>
                      <td className="text-right">
                        {invoice.status !== "paid" ? (
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => {
                              markInvoicePaid(invoice.id);
                              recordAuditLog({
                                actor: user?.fullName,
                                role: user?.role,
                                action: "invoice.paid",
                                entity: "invoices",
                                entityId: invoice.id,
                                details: { gross: invoice.gross },
                              });
                              refresh();
                              note(`${invoice.number} settled.`);
                            }}
                          >
                            Mark paid
                          </button>
                        ) : (
                          <span className="text-[10.5px] text-muted">Settled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={7}>Receivable (pending + overdue)</td>
                    <td className="u-value text-right">
                      {inr(invoices.filter((i) => i.status !== "paid").reduce((s, i) => s + i.gross, 0))}
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </TableScroll>
          </Panel>
        </div>
      )}

      {/*  PEOPLE  */}
      {tab === "payroll" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <Stat label="Payroll this month" value={inr(payrollTotal)} unit="net" note={`${payroll.length} employees`} />
            <Stat
              label="Paid"
              value={inr(payroll.filter((p) => p.paid).reduce((s, p) => s + p.net, 0))}
              unit="disbursed"
            />
            <Stat
              label="Pending"
              value={inr(pendingPayroll.reduce((s, p) => s + p.net, 0))}
              unit="due"
              note={`${pendingPayroll.length} payslips`}
            />
            <Stat
              label="On duty now"
              value={String(staff.filter((s) => s.status === "on_duty").length)}
              unit="staff"
              note={`${staff.length} on the roster`}
            />
          </div>

          <Panel>
            <PanelHeading
              index="F5"
              kicker="Payroll"
              title="Salaries, overtime and deductions"
              description="Attendance-based payroll with overtime at 1.5× and statutory deductions. One click marks a payslip disbursed."
              actions={
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    refresh();
                    note("Payroll recalculated from attendance.");
                  }}
                >
                  Recalculate
                </button>
              }
            />
            <TableScroll label="Payroll table">
              <table className="u-table mt-3">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th className="text-right">Base</th>
                    <th className="text-right">Overtime</th>
                    <th className="text-right">Deductions</th>
                    <th className="text-right">Net pay</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payroll.map((row) => (
                    <tr key={row.staffId}>
                      <td className="font-medium">{row.name}</td>
                      <td className="text-muted">{row.role}</td>
                      <td className="text-muted">{row.department}</td>
                      <td className="u-value text-right">{inr(row.base)}</td>
                      <td className="u-value text-right">{inr(row.overtimePay)}</td>
                      <td className="u-value text-right text-clay-deep">−{inr(row.deductions)}</td>
                      <td className="u-value text-right font-medium">{inr(row.net)}</td>
                      <td>
                        <StatusPill tone={row.paid ? "success" : "warn"}>{row.paid ? "Paid" : "Pending"}</StatusPill>
                      </td>
                      <td className="text-right">
                        {!row.paid ? (
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => {
                              markPayrollPaid(row.staffId);
                              recordAuditLog({
                                actor: user?.fullName,
                                role: user?.role,
                                action: "payroll.paid",
                                entity: "payroll",
                                entityId: row.staffId,
                                details: { net: row.net },
                              });
                              refresh();
                              note(`${row.name} paid ${inr(row.net)}.`);
                            }}
                          >
                            Pay
                          </button>
                        ) : (
                          <span className="text-[10.5px] text-muted">Done</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={6}>Total net</td>
                    <td className="u-value text-right">{inr(payrollTotal)}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </TableScroll>
          </Panel>

          <Panel>
            <PanelHeading
              index="F6"
              kicker="Leave"
              title="Leave requests"
              description="Approving leave updates the roster and the leave balance. Rejections keep the balance intact."
            />
            {leave.length === 0 ? (
              <EmptyState title="No leave requests" description="The team is fully available." className="mt-4" />
            ) : (
              <ul className="mt-3 divide-y divide-line-soft">
                {leave.map((request) => (
                  <li
                    key={request.id}
                    className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[12.5px] font-medium">{request.staffName}</span>
                        <StatusPill tone="neutral">{request.type}</StatusPill>
                        <span className="u-mono text-[10px] text-muted">
                          {request.days} day{request.days === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted">
                        {formatDate(request.from)}  {formatDate(request.to)} · {request.reason}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {request.status === "pending" ? (
                        <>
                          <button
                            className="btn btn-court btn-sm"
                            onClick={() => {
                              decideLeave(request.id, "approved", user?.fullName ?? "Owner");
                              recordAuditLog({
                                actor: user?.fullName,
                                role: user?.role,
                                action: "leave.approved",
                                entity: "leave_requests",
                                entityId: request.id,
                              });
                              refresh();
                              note(`${request.staffName}'s leave approved.`);
                            }}
                          >
                            <Check className="h-3 w-3" /> Approve
                          </button>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => {
                              decideLeave(request.id, "rejected", user?.fullName ?? "Owner");
                              recordAuditLog({
                                actor: user?.fullName,
                                role: user?.role,
                                action: "leave.rejected",
                                entity: "leave_requests",
                                entityId: request.id,
                              });
                              refresh();
                              note(`${request.staffName}'s leave declined.`);
                            }}
                          >
                            Decline
                          </button>
                        </>
                      ) : (
                        <StatusPill tone={request.status === "approved" ? "success" : "danger"}>
                          {request.status}
                        </StatusPill>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      )}

      {/*  SHARE  */}
      {tab === "share" && (
        <div className="space-y-6">
          <Panel>
            <PanelHeading
              index="F9"
              kicker="Share the numbers"
              title="A read-only link for your accountant"
              description="Create a link that expires in 72 hours. It shows a revenue summary, payment modes and GST working — no member data, no editing."
            />
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {(["day", "week", "month"] as const).map((period) => (
                <button
                  key={period}
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    createShareLink(`range:${period === "day" ? "last7" : period === "week" ? "last30" : "last90"}`);
                    refresh();
                    note(`Share link created for the ${period} view.`);
                  }}
                >
                  <Link2 className="h-3.5 w-3.5" />
                  Create {period} link
                </button>
              ))}
              <span className="text-[10.5px] text-muted">
                Links expire automatically and can be revoked by creating a new one.
              </span>
            </div>

            <div className="mt-5">
              {shareLinks.length === 0 ? (
                <EmptyState
                  title="No share links yet"
                  description="Create one above and send it to your accountant or auditor."
                />
              ) : (
                <ul className="divide-y divide-line-soft">
                  {shareLinks.map((link) => {
                    const url = shareUrl(link.token);
                    return (
                      <li
                        key={link.id}
                        className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <div className="u-mono truncate text-[11px] text-ink">{url}</div>
                          <div className="mt-0.5 text-[10.5px] text-muted">
                            {link.scope} · {formatShareValidity(link)}
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(url);
                                setCopied(link.id);
                                window.setTimeout(() => setCopied(null), 1800);
                              } catch {
                                note("Copy failed — select the link manually.");
                              }
                            }}
                          >
                            {copied === link.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            {copied === link.id ? "Copied" : "Copy"}
                          </button>
                          <Link href={`/share/${link.token}`} className="btn btn-ink btn-sm" target="_blank">
                            Open
                          </Link>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <DataNote>
              A share link is a bearer token: anyone with the URL can see the summary until it expires. No
              payment, member or contact detail is exposed.
            </DataNote>
          </Panel>

          <Panel tone="deep">
            <PanelHeading index="F8" kicker="Today, this week, this month" title="The three numbers you asked for" />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                ["Today", twm.today],
                ["This week", twm.week],
                ["This month", twm.month],
              ].map(([label, summary]) => {
                const s = summary as typeof twm.today;
                return (
                  <div key={label as string} className="border border-line bg-chalk p-4">
                    <div className="u-eyebrow text-muted">{label as string}</div>
                    <div className="u-value mt-1 text-xl text-ink">{inr(s.gross)}</div>
                    <div className="mt-1 text-[10.5px] text-muted">
                      {s.count} txns · GST {inr(s.gst)}
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      )}

      <Modal
        open={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        eyebrow="F4 · invoicing"
        title="Raise an invoice"
        footer={
          <div className="flex justify-end gap-2">
            <button className="btn btn-outline btn-sm" onClick={() => setInvoiceOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-clay btn-sm" type="submit" form="invoice-form">
              <BadgeIndianRupee className="h-3.5 w-3.5" />
              Create invoice
            </button>
          </div>
        }
      >
        <InvoiceForm
          onSubmit={(values) => {
            const invoice = createInvoice(values);
            recordAuditLog({
              actor: user?.fullName,
              role: user?.role,
              action: "invoice.created",
              entity: "invoices",
              entityId: invoice.id,
              details: { gross: invoice.gross, client: invoice.client },
            });
            setInvoiceOpen(false);
            refresh();
            note(`${invoice.number} raised for ${invoice.client}.`);
          }}
        />
      </Modal>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-[10.5px] text-muted">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          Period view is IST (Asia/Kolkata). All amounts INR.
        </span>
        <span className="flex items-center gap-1.5">
          <Package className="h-3.5 w-3.5" />
          Data is synthetic · export works offline
        </span>
      </div>
    </div>
  );
}

function InvoiceForm({
  onSubmit,
}: {
  onSubmit: (values: {
    client: string;
    type: "membership" | "business";
    description: string;
    net: number;
    gstin?: string;
    dueAt: string;
  }) => void;
}) {
  const [client, setClient] = useState("");
  const [type, setType] = useState<"membership" | "business">("membership");
  const [description, setDescription] = useState("");
  const [net, setNet] = useState("");
  const [gstin, setGstin] = useState("");
  const [dueAt, setDueAt] = useState(offsetDate(15));

  return (
    <form
      id="invoice-form"
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (!client.trim() || !description.trim() || !Number(net)) return;
        onSubmit({
          client,
          type,
          description,
          net: Number(net),
          gstin: type === "business" ? gstin : undefined,
          dueAt,
        });
      }}
    >
      <div>
        <span className="u-label">Client type</span>
        <Segmented
          value={type}
          onChange={setType}
          options={[
            { value: "membership", label: "Member" },
            { value: "business", label: "Business" },
          ]}
        />
      </div>
      <div>
        <label className="u-label" htmlFor="inv-client">
          Client name
        </label>
        <input
          id="inv-client"
          className="input"
          value={client}
          onChange={(e) => setClient(e.target.value)}
          placeholder="Infosys BPM Ltd."
        />
      </div>
      {type === "business" && (
        <div>
          <label className="u-label" htmlFor="inv-gstin">
            GSTIN
          </label>
          <input
            id="inv-gstin"
            className="input u-mono"
            value={gstin}
            onChange={(e) => setGstin(e.target.value)}
            placeholder="07AABCI1234F1Z5"
          />
        </div>
      )}
      <div>
        <label className="u-label" htmlFor="inv-desc">
          Description
        </label>
        <input
          id="inv-desc"
          className="input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Corporate tennis league · 16 court hours"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="u-label" htmlFor="inv-net">
            Taxable value (₹)
          </label>
          <input
            id="inv-net"
            className="input"
            inputMode="decimal"
            value={net}
            onChange={(e) => setNet(e.target.value)}
            placeholder="120000"
          />
        </div>
        <div>
          <label className="u-label" htmlFor="inv-due">
            Due date
          </label>
          <input id="inv-due" type="date" className="input" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
        </div>
      </div>
      {Number(net) > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-line bg-paper-deep/60 px-3 py-2 text-[11.5px]">
          <span className="text-muted">GST @ 18%</span>
          <span className="u-value">{inr(Number(net) * 0.18)}</span>
          <span className="text-muted">Total</span>
          <span className="u-value font-medium">{inr(Number(net) * 1.18)}</span>
        </div>
      )}
    </form>
  );
}


