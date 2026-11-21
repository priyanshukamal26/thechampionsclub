"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BellRing,
  Check,
  ChefHat,
  Clock,
  Coffee,
  Flame,
  RefreshCw,
  Utensils,
} from "lucide-react";
import { PageHeader, Panel, Stat, StatusPill } from "@/components/ui/kit";
import { useAuth } from "@/lib/auth-context";
import {
  getTables,
  kitchenQueue,
  orderDayLabel,
  orderStatusLabel,
  updateOrderStatus,
  type Order,
} from "@/lib/orders";
import { recordAuditLog } from "@/lib/audit";
import { inr } from "@/lib/store";
import { cn } from "@/lib/utils";

const COLUMNS = [
  { status: "placed" as const, label: "New tickets", tone: "clay" as const, hint: "Sent, not started" },
  { status: "preparing" as const, label: "On the pass", tone: "gold" as const, hint: "In the kitchen" },
  { status: "ready" as const, label: "Ready to serve", tone: "court" as const, hint: "Waiting for pickup" },
];

function minutesAgo(iso: string): number {
  return Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
}

export default function KitchenDisplayPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setMounted(true);
    const id = window.setInterval(() => setTick((t) => t + 1), 30000);
    return () => window.clearInterval(id);
  }, []);

  const queue = useMemo(() => (mounted ? kitchenQueue() : []), [mounted, tick]);
  const tables = useMemo(() => (mounted ? getTables() : []), [mounted, tick]);

  const advance = (order: Order, next: "preparing" | "ready" | "completed") => {
    updateOrderStatus(order.id, next);
    recordAuditLog({
      actor: user?.fullName,
      role: user?.role,
      action: `kitchen.${next}`,
      entity: "orders",
      entityId: order.id,
      details: { code: order.code, table: order.tableId },
    });
    setTick((t) => t + 1);
  };

  const oldest = queue.length ? Math.max(...queue.map((o) => minutesAgo(o.placedAt))) : 0;
  const items = queue.reduce((sum, order) => sum + order.lines.reduce((s, l) => s + l.qty, 0), 0);
  const occupied = tables.filter((t) => t.status === "occupied").length;

  if (!mounted) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-6 p-5 sm:p-6 lg:p-8">
        <div className="h-8 w-64 animate-pulse rounded bg-ink/10" />
        <div className="grid gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-ink/[0.06]" />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-2xl bg-ink/[0.05]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-5 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Kitchen display · D2"
        title="Fire, plate, serve."
        description="Every bar and table order lands here the moment it is sent. Ticket colours follow the pass, not the pressure."
        actions={
          <>
            <button className="btn btn-outline btn-sm" onClick={() => setTick((t) => t + 1)}>
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
            <Link href="/dashboard/bar" className="btn btn-ink btn-sm">
              <Coffee className="h-3.5 w-3.5" />
              Bar floor
            </Link>
          </>
        }
        meta={
          <>
            <StatusPill tone={queue.length ? "warn" : "success"}>
              <BellRing className="h-3 w-3" />
              {queue.length} open ticket{queue.length === 1 ? "" : "s"}
            </StatusPill>
            <span className="u-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              {items} items on the pass
            </span>
            <span className="u-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              {occupied} tables seated
            </span>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Open tickets" value={String(queue.length)} unit="tickets" note="Across counter and tables" />
        <Stat label="Oldest ticket" value={`${oldest}m`} unit="waiting" note={oldest > 15 ? "Push the pass" : "Within target"} />
        <Stat label="Items to cook" value={String(items)} unit="plates" note="Quantities, not lines" />
        <Stat tone="ink" label="Tables seated" value={String(occupied)} unit={`of ${tables.length}`} note="Bar floor occupancy" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {COLUMNS.map((column) => {
          const tickets = queue.filter((order) => order.status === column.status);
          return (
            <Panel key={column.status} tone={column.status === "placed" ? "deep" : "paper"} className="flex flex-col">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div className="flex items-center gap-2">
                  {column.status === "placed" && <Flame className="h-4 w-4 text-clay" />}
                  {column.status === "preparing" && <ChefHat className="h-4 w-4 text-gold" />}
                  {column.status === "ready" && <Check className="h-4 w-4 text-court" />}
                  <span className="u-display text-[13px]">{column.label}</span>
                </div>
                <StatusPill tone={column.tone === "clay" ? "danger" : column.tone === "gold" ? "warn" : "success"}>
                  {tickets.length}
                </StatusPill>
              </div>
              <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted">{column.hint}</p>

              <div className="mt-3 flex flex-1 flex-col gap-2">
                {tickets.length === 0 && (
                  <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-line py-10 text-center">
                    <p className="text-[11px] text-muted">
                      {column.status === "placed" ? "No new tickets. The pass is clear." : "Nothing here yet."}
                    </p>
                  </div>
                )}

                {tickets.map((order) => {
                  const table = tables.find((t) => t.id === order.tableId);
                  const waited = minutesAgo(order.placedAt);
                  const late = waited > 15 && column.status !== "ready";
                  return (
                    <article
                      key={order.id}
                      className={cn(
                        "rounded-xl border bg-chalk p-3",
                        late ? "border-clay/50" : "border-line"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="u-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                            {order.code}
                          </div>
                          <div className="mt-0.5 text-[12.5px] font-medium">
                            {table ? `${table.label} · ${table.zone}` : order.tableId ? order.tableId : "Counter"}
                          </div>
                          <div className="text-[10.5px] text-muted">{order.memberName}</div>
                        </div>
                        <span
                          className={cn(
                            "u-mono shrink-0 rounded px-1.5 py-0.5 text-[9.5px]",
                            late ? "bg-clay text-chalk" : "bg-ink/5 text-muted"
                          )}
                        >
                          {waited}m
                        </span>
                      </div>

                      <ul className="mt-2 space-y-1 border-t border-line-soft pt-2">
                        {order.lines.map((line, index) => (
                          <li key={`${order.id}-${index}`} className="flex items-baseline justify-between gap-2 text-[11.5px]">
                            <span className="min-w-0 truncate">
                              <span className="u-value mr-1.5 text-ink">{line.qty}×</span>
                              {line.name}
                            </span>
                            <span className="u-mono shrink-0 text-[9.5px] text-muted">
                              {inr(line.unitPrice * line.qty)}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-2 flex items-center justify-between border-t border-line-soft pt-2">
                        <span className="flex items-center gap-1 text-[9.5px] uppercase tracking-[0.1em] text-muted">
                          <Clock className="h-3 w-3" />
                          {order.etaMin ?? 12} min target
                        </span>
                        <div className="flex gap-1.5">
                          {column.status === "placed" && (
                            <button className="btn btn-clay btn-sm" onClick={() => advance(order, "preparing")}>
                              Start
                            </button>
                          )}
                          {column.status === "preparing" && (
                            <button className="btn btn-ink btn-sm" onClick={() => advance(order, "ready")}>
                              Ready
                            </button>
                          )}
                          {column.status === "ready" && (
                            <button className="btn btn-court btn-sm" onClick={() => advance(order, "completed")}>
                              Served
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </Panel>
          );
        })}
      </div>

      <Panel tone="deep">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="u-eyebrow text-muted">Recently served</div>
            <p className="mt-1 text-[11.5px] text-muted">
              Completed tickets drop off the board; the ledger keeps the sale.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {getTables()
              .filter((t) => t.status !== "available")
              .slice(0, 8)
              .map((table) => (
                <StatusPill key={table.id} tone={table.status === "occupied" ? "danger" : "warn"}>
                  <Utensils className="h-3 w-3" />
                  {table.label} · {table.status}
                </StatusPill>
              ))}
          </div>
        </div>
      </Panel>

      <p className="text-[10.5px] text-muted">
        Kitchen display refreshes every 30 seconds and on every action. {" "}
        {queue[0] ? `Oldest open ticket placed ${orderDayLabel(queue[0].placedAt)} (${orderStatusLabel(queue[0].status)}).` : ""}
      </p>
    </div>
  );
}
