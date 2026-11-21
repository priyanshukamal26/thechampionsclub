"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Armchair,
  Check,
  ChefHat,
  Coffee,
  Minus,
  Plus,
  Receipt,
  ShoppingBag,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { EmptyState, PageHeader, Panel, Stat, StatusPill } from "@/components/ui/kit";
import { Drawer, Segmented } from "@/components/ui/overlay";
import { SettleTabModal } from "@/components/commerce/SettleTabModal";
import { useAuth } from "@/lib/auth-context";
import {
  BAR_MENU,
  createOrder,
  getOpenTabs,
  getOrders,
  getTables,
  kitchenQueue,
  priceCart,
  setTableStatus,
  type MemberTab,
  type MenuItem,
  type PaymentMode,
} from "@/lib/orders";
import { getLocalMembers, MEMBERSHIP_PLANS, type ClubMember } from "@/lib/membership";
import { recordAuditLog } from "@/lib/audit";
import { formatTime, inr, todayISO } from "@/lib/store";
import { cn } from "@/lib/utils";

type CartLine = { refId: string; qty: number };
const CATEGORIES = ["Beverages", "Mains", "Snacks", "Bar"] as const;

export default function BarPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [version, setVersion] = useState(0);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Mains");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [tableId, setTableId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [mode, setMode] = useState<PaymentMode>("tab");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settleTarget, setSettleTarget] = useState<MemberTab | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const tables = useMemo(() => (mounted ? getTables() : []), [mounted, version]);
  const tabs = useMemo(() => (mounted ? getOpenTabs() : []), [mounted, version]);
  const members = useMemo(() => (mounted ? getLocalMembers() : []), [mounted]);
  const ordersToday = useMemo(
    () =>
      mounted
        ? getOrders().filter((o) => o.channel === "bar" && o.placedAt.slice(0, 10) === todayISO())
        : [],
    [mounted, version]
  );
  const kitchen = useMemo(() => (mounted ? kitchenQueue() : []), [mounted, version]);

  const member: ClubMember | undefined = members.find((m) => m.id === memberId);
  const priced = useMemo(
    () => (mounted ? priceCart("bar", cart, member?.planId) : { items: [], subtotal: 0, discount: 0, discountPct: 0, gst: 0, total: 0, deliveryFee: 0 }),
    [mounted, cart, member?.planId, version]
  );

  const note = (message: string) => {
    setFlash(message);
    window.setTimeout(() => setFlash(null), 3600);
  };

  const add = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.refId === item.id);
      return existing
        ? prev.map((l) => (l.refId === item.id ? { ...l, qty: l.qty + 1 } : l))
        : [...prev, { refId: item.id, qty: 1 }];
    });
    setDrawerOpen(true);
  };

  const remove = (refId: string) => {
    setCart((prev) =>
      prev.flatMap((line) =>
        line.refId !== refId ? [line] : line.qty > 1 ? [{ ...line, qty: line.qty - 1 }] : []
      )
    );
  };

  const send = () => {
    if (!cart.length) return;
    if (mode === "tab" && !member) {
      note("A tab needs a member. Pick a member or settle by cash, card or UPI.");
      return;
    }
    const guestTable = tables.find((t) => t.id === tableId);
    const result = createOrder({
      channel: "bar",
      lines: cart,
      memberId: member?.id,
      memberName: member?.fullName ?? (guestTable ? `Guest · ${guestTable.label}` : "Counter guest"),
      planId: member?.planId,
      paymentMode: mode,
      fulfilment: tableId ? "dine_in" : undefined,
      tableId: tableId || undefined,
      staff: user?.fullName,
    });
    if (!result.ok) {
      note(result.error ?? "Could not send the order.");
      return;
    }
    recordAuditLog({
      actor: user?.fullName,
      role: user?.role,
      action: mode === "tab" ? "bar.tab_order" : "bar.order",
      entity: "orders",
      entityId: result.order?.id,
      details: { total: result.order?.total, table: tableId, mode },
    });
    setCart([]);
    setDrawerOpen(false);
    setVersion((v) => v + 1);
    note(
      mode === "tab"
        ? `Sent to the kitchen · added to ${member?.fullName.split(" ")[0]}'s tab.`
        : `Sent to the kitchen · ${inr(result.order?.total ?? 0)} collected by ${mode.toUpperCase()}.`
    );
  };

  if (!mounted) {
    return <div className="mx-auto max-w-[1400px] p-6"><div className="h-[520px] animate-pulse rounded-2xl bg-ink/[0.05]" /></div>;
  }

  const openTabsTotal = tabs.reduce((sum, tab) => sum + tab.total, 0);
  const visible = BAR_MENU.filter((item) => item.category === category);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-5 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Bar & cafeteria · D1–D7"
        title="After the match, the bar."
        description="Table and counter orders reach the kitchen instantly. Member discounts apply themselves, tabs accrue, and the floor map knows which tables are sitting."
        actions={
          <>
            <Link href="/dashboard/kitchen" className="btn btn-outline btn-sm">
              <ChefHat className="h-3.5 w-3.5" />
              Kitchen ({kitchen.length})
            </Link>
            <button className="btn btn-clay btn-sm" onClick={() => setDrawerOpen(true)}>
              <ShoppingBag className="h-3.5 w-3.5" />
              New order {cart.length ? `(${cart.length})` : ""}
            </button>
          </>
        }
        meta={
          <>
            <StatusPill tone={tabs.length ? "warn" : "success"}>
              <Wallet className="h-3 w-3" /> {tabs.length} open tab{tabs.length === 1 ? "" : "s"} · {inr(openTabsTotal)}
            </StatusPill>
            <span className="u-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              {ordersToday.length} orders today
            </span>
            <span className="u-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              {tables.filter((t) => t.status === "occupied").length}/{tables.length} tables seated
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Open tabs" value={inr(openTabsTotal)} unit="unsettled" note={`${tabs.length} members running a tab`} />
        <Stat label="Sold today" value={inr(ordersToday.reduce((s, o) => s + o.total, 0))} unit="bar" note={`${ordersToday.length} tickets`} />
        <Stat label="Tables seated" value={String(tables.filter((t) => t.status === "occupied").length)} unit={`of ${tables.length}`} note="Live floor map" />
        <Stat label="Kitchen queue" value={String(kitchen.length)} unit="tickets" note="Placed or preparing" />
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Panel padded={false}>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line p-3">
              <div className="no-scrollbar flex gap-1 overflow-x-auto">
                {CATEGORIES.map((item) => (
                  <button
                    key={item}
                    onClick={() => setCategory(item)}
                    className={cn(
                      "shrink-0 rounded-full border px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.1em]",
                      category === item ? "border-ink bg-ink text-chalk" : "border-line text-muted hover:text-ink"
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <span className="u-mono text-[9.5px] uppercase tracking-[0.12em] text-muted">
                {visible.length} items
              </span>
            </div>

            <div className="grid gap-2 p-3 sm:grid-cols-2">
              {visible.map((item) => {
                const qty = cart.find((l) => l.refId === item.id)?.qty ?? 0;
                return (
                  <button
                    key={item.id}
                    onClick={() => add(item)}
                    className={cn(
                      "flex items-start justify-between gap-3 rounded-xl border bg-paper-soft p-3 text-left transition-colors hover:border-ink hover:bg-chalk",
                      qty > 0 && "border-clay/40 bg-clay/[0.04]"
                    )}
                  >
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "inline-flex h-3 w-3 shrink-0 items-center justify-center border",
                            item.veg ? "border-court" : "border-clay"
                          )}
                          title={item.veg ? "Vegetarian" : "Non-vegetarian"}
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full", item.veg ? "bg-court" : "bg-clay")} />
                        </span>
                        <span className="truncate text-[12px] font-medium">{item.name}</span>
                      </span>
                      <span className="mt-0.5 block truncate text-[10.5px] text-muted">{item.description}</span>
                      <span className="mt-1 flex items-center gap-2 text-[9.5px] uppercase tracking-[0.1em] text-muted">
                        <span>{item.prepMin} min</span>
                        <span>·</span>
                        <span>{item.station}</span>
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="u-value block text-[12.5px]">{inr(item.price)}</span>
                      {qty > 0 ? (
                        <span className="u-mono mt-1 inline-block rounded-full bg-clay px-1.5 py-0.5 text-[9px] text-chalk">
                          {qty}
                        </span>
                      ) : (
                        <Plus className="ml-auto mt-1 h-3.5 w-3.5 text-muted" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel className="mt-4" padded={false}>
            <div className="flex items-center justify-between border-b border-line px-3 py-2.5">
              <div>
                <div className="u-eyebrow text-muted">D7 · floor map</div>
                <div className="u-display mt-0.5 text-[12.5px]">Twelve tables, three zones</div>
              </div>
              <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.1em] text-muted">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-court" />Free</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-gold" />Reserved</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-clay" />Seated</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 p-3 sm:grid-cols-4">
              {tables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => {
                    setTableId(table.id === tableId ? "" : table.id);
                    if (table.status === "available") setTableStatus(table.id, "reserved");
                    setVersion((v) => v + 1);
                  }}
                  className={cn(
                    "flex flex-col items-start rounded-lg border p-2.5 text-left transition-colors",
                    tableId === table.id
                      ? "border-ink bg-ink text-chalk"
                      : table.status === "occupied"
                        ? "border-clay/40 bg-clay/[0.07]"
                        : table.status === "reserved"
                          ? "border-gold/40 bg-gold/[0.08]"
                          : "border-line bg-paper-soft hover:border-ink/40"
                  )}
                >
                  <span className="flex w-full items-center justify-between">
                    <span className="u-mono text-[10px]">{table.label}</span>
                    <Armchair className="h-3 w-3 opacity-50" />
                  </span>
                  <span className="mt-0.5 text-[9.5px] uppercase tracking-[0.1em] opacity-70">
                    {table.zone} · {table.seats} seats
                  </span>
                  <span
                    className={cn(
                      "mt-1 text-[9px] uppercase tracking-[0.1em]",
                      tableId === table.id ? "text-chalk/70" : "text-muted"
                    )}
                  >
                    {tableId === table.id ? "Selected" : table.status}
                  </span>
                </button>
              ))}
            </div>
            {tableId && (
              <div className="flex items-center justify-between border-t border-line px-3 py-2 text-[11px]">
                <span className="text-muted">
                  Ordering for {tables.find((t) => t.id === tableId)?.label}. The table is marked reserved.
                </span>
                <button
                  className="btn btn-quiet btn-sm"
                  onClick={() => {
                    setTableStatus(tableId, "available");
                    setTableId("");
                    setVersion((v) => v + 1);
                  }}
                >
                  Clear table
                </button>
              </div>
            )}
          </Panel>
        </div>

        <div className="space-y-4 lg:col-span-4">
          <Panel>
            <div className="flex items-center justify-between border-b border-line pb-2">
              <div>
                <div className="u-eyebrow text-muted">D3 · running tabs</div>
                <div className="u-display mt-0.5 text-[13px]">Settle before they leave</div>
              </div>
              <Wallet className="h-4 w-4 text-muted" />
            </div>
            {tabs.length === 0 ? (
              <EmptyState title="No open tabs" description="Tabs appear when a member orders on account." className="mt-3" />
            ) : (
              <ul className="mt-1 divide-y divide-line-soft">
                {tabs.map((tab) => (
                  <li key={tab.id} className="flex items-center justify-between gap-2 py-2.5">
                    <div className="min-w-0">
                      <div className="truncate text-[12px] font-medium">{tab.memberName}</div>
                      <div className="u-mono text-[9.5px] text-muted">
                        {tab.tableId ? tables.find((t) => t.id === tab.tableId)?.label ?? tab.tableId : "Counter"} · opened{" "}
                        {formatTime(tab.openedAt)}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="u-value text-[12px]">{inr(tab.total)}</span>
                      <button className="btn btn-ink btn-sm" onClick={() => setSettleTarget(tab)}>
                        Settle
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 border-t border-line-soft pt-2 text-[10px] leading-relaxed text-muted">
              Member discounts are already applied inside each tab total. Settling records the payment mode
              and closes the table.
            </p>
          </Panel>

          <Panel tone="deep">
            <div className="flex items-center justify-between">
              <div>
                <div className="u-eyebrow text-muted">Kitchen</div>
                <div className="u-display mt-1 text-[13px]">{kitchen.length} tickets live</div>
              </div>
              <ChefHat className="h-5 w-5 text-muted" />
            </div>
            <p className="mt-1 text-[10.5px] text-muted">
              Oldest: {kitchen[0] ? `${formatTime(kitchen[0].placedAt)} · ${kitchen[0].memberName}` : "pass is clear"}
            </p>
            <Link href="/dashboard/kitchen" className="btn btn-ink btn-sm btn-block mt-3">
              Open kitchen display
            </Link>
          </Panel>
        </div>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        eyebrow="Bar order"
        title={cart.length ? `${cart.length} line${cart.length === 1 ? "" : "s"} on the order` : "Start an order"}
        footer={
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-muted">Total</span>
              <span className="u-value text-[18px]">{inr(priced.total)}</span>
            </div>
            <button className="btn btn-clay btn-block" disabled={!cart.length} onClick={send}>
              <Receipt className="h-4 w-4" />
              Send to kitchen
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="u-label" htmlFor="bar-table">Table</label>
              <select id="bar-table" className="select" value={tableId} onChange={(e) => setTableId(e.target.value)}>
                <option value="">Counter</option>
                {tables.map((table) => (
                  <option key={table.id} value={table.id}>
                    {table.label} · {table.zone}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="u-label" htmlFor="bar-member">Member</label>
              <select id="bar-member" className="select" value={memberId} onChange={(e) => setMemberId(e.target.value)}>
                <option value="">Guest</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} · {MEMBERSHIP_PLANS[m.planId].shortName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <span className="u-label">Payment</span>
            <Segmented
              value={mode}
              onChange={setMode}
              size="sm"
              options={[
                { value: "tab", label: "Tab" },
                { value: "upi", label: "UPI" },
                { value: "card", label: "Card" },
                { value: "cash", label: "Cash" },
              ]}
            />
          </div>

          {cart.length === 0 ? (
            <p className="py-8 text-center text-[11.5px] text-muted">
              Pick something from the menu. The order goes straight to the kitchen display.
            </p>
          ) : (
            <ul className="divide-y divide-line-soft">
              {priced.items.map((line) => (
                <li key={line.refId} className="flex items-center gap-2 py-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12px] font-medium">{line.name}</div>
                    <div className="u-mono text-[9.5px] text-muted">{inr(line.unitPrice)} each</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="rounded-full border border-line p-1 text-muted hover:border-ink hover:text-ink" onClick={() => remove(line.refId)} aria-label={`Remove ${line.name}`}>
                      {line.qty > 1 ? <Minus className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    </button>
                    <span className="u-value w-5 text-center text-[11.5px]">{line.qty}</span>
                    <button
                      className="rounded-full border border-line p-1 text-muted hover:border-ink hover:text-ink"
                      onClick={() => {
                        const item = BAR_MENU.find((m) => m.id === line.refId);
                        if (item) add(item);
                      }}
                      aria-label={`Add ${line.name}`}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="u-value w-16 text-right text-[11.5px]">{inr(line.unitPrice * line.qty)}</span>
                </li>
              ))}
            </ul>
          )}

          {cart.length > 0 && (
            <div className="space-y-1.5 border-t border-line pt-2 text-[11.5px]">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span className="u-value text-ink">{inr(priced.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Discount {priced.discountPct ? `(${priced.discountPct}%)` : ""}</span>
                <span className="u-value text-court">−{inr(priced.discount)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>GST</span>
                <span className="u-value text-ink">{inr(priced.gst)}</span>
              </div>
            </div>
          )}

          {mode === "tab" && !member && (
            <p className="rounded-lg border border-gold/40 bg-gold/10 px-2.5 py-1.5 text-[10.5px] text-[#7d5d17]">
              Pick a member to run a tab. Guests settle by cash, card or UPI.
            </p>
          )}

          <div className="flex items-center gap-2 border-t border-line pt-2 text-[10px] text-muted">
            <Coffee className="h-3 w-3" />
            Orders are timed from the moment you send, not from payment.
          </div>
        </div>
      </Drawer>

      <SettleTabModal
        tab={settleTarget}
        tableLabelText={
          settleTarget?.tableId ? tables.find((t) => t.id === settleTarget.tableId)?.label : undefined
        }
        onClose={() => setSettleTarget(null)}
        onSettled={() => {
          setSettleTarget(null);
          setVersion((v) => v + 1);
          note("Tab settled and the table released.");
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4 text-[10.5px] text-muted">
        <span className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          Counter and table orders feed one kitchen display.
        </span>
        <span className="flex items-center gap-1.5">
          <Wallet className="h-3.5 w-3.5" />
          Cash, card and UPI settle through the same ledger.
        </span>
      </div>
    </div>
  );
}

