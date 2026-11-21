"use client";

import React from "react";
import Link from "next/link";
import { Lock, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader, Panel, StatusPill, type PillTone } from "@/components/ui/kit";
import { inr } from "@/lib/store";
import type { ClubTable, Order, OrderStatus } from "@/lib/orders";
import { orderStatusLabel } from "@/lib/orders";

/* ─────────────────────────── quantity stepper ─────────────────────────── */

export function QtyStepper({
  qty,
  onAdd,
  onRemove,
  canAdd = true,
  addLabel = "Add one",
  removeLabel = "Remove one",
  className,
}: {
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
  canAdd?: boolean;
  addLabel?: string;
  removeLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-1 rounded-full border border-line bg-chalk p-1", className)}>
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeLabel}
        className="flex h-7 w-7 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink hover:text-chalk"
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="u-value w-6 text-center text-[12px] text-ink" aria-live="polite">
        {qty}
      </span>
      <button
        type="button"
        onClick={onAdd}
        disabled={!canAdd}
        aria-label={addLabel}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-chalk transition-colors hover:bg-clay disabled:opacity-30"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}

/* ─────────────────────────── food markers ─────────────────────────────── */

export function VegMark({ veg, className }: { veg: boolean; className?: string }) {
  return (
    <span
      role="img"
      aria-label={veg ? "Vegetarian" : "Non-vegetarian"}
      title={veg ? "Vegetarian" : "Non-vegetarian"}
      className={cn(
        "inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border",
        veg ? "border-court" : "border-clay",
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", veg ? "bg-court" : "bg-clay")} />
    </span>
  );
}

/* ─────────────────────────── money breakdown ──────────────────────────── */

function Row({ label, value, tone = "muted" }: { label: React.ReactNode; value: React.ReactNode; tone?: "muted" | "court" | "clay" }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={cn("text-[11.5px]", tone === "muted" ? "text-muted" : tone === "court" ? "text-court" : "text-clay")}>{label}</span>
      <span className={cn("u-value text-[12.5px]", tone === "muted" ? "text-ink" : tone === "court" ? "text-court" : "text-clay")}>{value}</span>
    </div>
  );
}

export function PriceRows({
  subtotal,
  discountPct,
  discount,
  gst,
  deliveryFee = 0,
  total,
  discountLabel = "Privilege discount",
  className,
}: {
  subtotal: number;
  discountPct?: number;
  discount?: number;
  gst?: number;
  deliveryFee?: number;
  total: number;
  discountLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Row label="Subtotal" value={inr(subtotal)} />
      {discountPct && discount ? <Row label={`${discountLabel} · ${discountPct}%`} value={`− ${inr(discount)}`} tone="court" /> : null}
      {typeof gst === "number" ? <Row label="GST · 18%" value={inr(gst)} /> : null}
      {deliveryFee > 0 ? <Row label="Delivery fee" value={inr(deliveryFee)} /> : null}
      <div className="flex items-center justify-between gap-3 border-t border-line pt-2.5">
        <span className="u-eyebrow text-muted">Total payable</span>
        <span className="u-value text-[17px] text-ink">{inr(total)}</span>
      </div>
    </div>
  );
}

/* ─────────────────────────── order status ─────────────────────────────── */

const ORDER_TONE: Record<OrderStatus, PillTone> = {
  placed: "info",
  preparing: "warn",
  ready: "success",
  dispatched: "info",
  delivered: "success",
  completed: "neutral",
  cancelled: "danger",
};

export function OrderStatusPill({ status }: { status: OrderStatus }) {
  return <StatusPill tone={ORDER_TONE[status]}>{orderStatusLabel(status)}</StatusPill>;
}

/** Kitchen / bar tickets: placed → preparing → ready → completed. */
export function nextKitchenStatus(status: OrderStatus): OrderStatus | null {
  if (status === "placed") return "preparing";
  if (status === "preparing") return "ready";
  if (status === "ready") return "completed";
  return null;
}

/** Shop orders: delivery runs through dispatch, pickup is completed at the counter. */
export function nextShopStatus(order: Pick<Order, "status" | "fulfilment">): OrderStatus | null {
  if (order.status === "placed") return "preparing";
  if (order.status === "preparing") return "ready";
  if (order.status === "ready") return order.fulfilment === "delivery" ? "dispatched" : "completed";
  if (order.status === "dispatched") return "delivered";
  return null;
}

/* ─────────────────────────── helpers ──────────────────────────────────── */

export function elapsedLabel(iso: string, nowMs: number = Date.now()): string {
  const mins = Math.max(0, Math.round((nowMs - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  return `${h}h ${mins % 60}m`;
}

export function elapsedMinutes(iso: string, nowMs: number = Date.now()): number {
  return Math.max(0, Math.round((nowMs - new Date(iso).getTime()) / 60000));
}

export function tableLabel(tables: ClubTable[], tableId?: string): string {
  if (!tableId) return "Counter";
  const table = tables.find((t) => t.id === tableId);
  return table ? `${table.label} · ${table.zone}` : "Table";
}

/* ─────────────────────────── role guard ───────────────────────────────── */

export function RestrictedPanel({
  eyebrow,
  title,
  description,
  allowedText,
  currentRole,
  homeHref = "/dashboard",
  homeLabel = "Back to overview",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  allowedText: string;
  currentRole: string;
  homeHref?: string;
  homeLabel?: string;
}) {
  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-5 sm:p-6 lg:p-8">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <Panel tone="deep" className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-chalk text-clay">
            <Lock className="h-4 w-4" />
          </span>
          <div>
            <div className="u-eyebrow text-muted">Restricted surface</div>
            <div className="u-display mt-1 text-lg text-ink">This console is not on your account</div>
            <p className="mt-2 max-w-xl text-[12.5px] leading-relaxed text-muted">
              You are signed in as{" "}
              <span className="u-mono text-[10px] uppercase tracking-[0.14em] text-ink">{currentRole}</span>. {allowedText}
            </p>
          </div>
        </div>
        <Link href={homeHref} className="btn btn-ink btn-sm">
          {homeLabel}
        </Link>
      </Panel>
    </div>
  );
}
