"use client";

import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/store";
import type { Order, OrderStatus } from "@/lib/orders";
import { orderStatusLabel } from "@/lib/orders";

const PICKUP_STEPS: OrderStatus[] = ["placed", "preparing", "ready", "completed"];
const DELIVERY_STEPS: OrderStatus[] = ["placed", "preparing", "ready", "dispatched", "delivered"];

export function OrderTimeline({ order, className }: { order: Order; className?: string }) {
  if (order.status === "cancelled") {
    return <p className={cn("u-mono text-[10px] uppercase tracking-[0.14em] text-clay-deep", className)}>Order cancelled</p>;
  }
  const steps = order.fulfilment === "delivery" ? DELIVERY_STEPS : PICKUP_STEPS;
  const current = steps.indexOf(order.status);
  return (
    <ol className={cn("relative space-y-3 border-l border-line pl-4", className)}>
      {steps.map((step, index) => {
        const done = index < current || (order.status === "completed" && index <= current);
        const active = index === current && order.status !== "completed";
        return (
          <li key={step} className="relative">
            <span
              className={cn(
                "absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border",
                done ? "border-court bg-court" : active ? "border-clay bg-clay" : "border-line bg-chalk"
              )}
            />
            <div
              className={cn(
                "u-mono text-[10px] uppercase tracking-[0.14em]",
                active ? "text-ink" : done ? "text-court" : "text-muted/70"
              )}
            >
              {orderStatusLabel(step)}
            </div>
            {index === 0 && <div className="mt-0.5 text-[10.5px] text-muted">{formatTime(order.placedAt)} IST</div>}
            {active && <div className="mt-0.5 text-[10.5px] text-muted">Current stage</div>}
          </li>
        );
      })}
    </ol>
  );
}
