"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Armchair,
  Check,
  ChefHat,
  Coffee,
  Flame,
  Minus,
  Plus,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Users,
  Utensils,
  Wallet,
  X,
} from "lucide-react";
import { EmptyState, PageHeader, Panel, Stat, StatusPill } from "@/components/ui/kit";
import { Drawer, Segmented } from "@/components/ui/overlay";
import { SettleTabModal } from "@/components/commerce/SettleTabModal";
import { PaymentMethodDetails } from "@/components/commerce/PaymentMethodDetails";
import { useAuth } from "@/lib/auth-context";
import { resolveMemberForUser } from "@/components/dashboard/member";
import {
  BAR_MENU,
  createOrder,
  getOpenTabs,
  getOrderQueueStatus,
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

  useEffect(() => {
    setMounted(true);
    const handleUpdate = () => setVersion((v) => v + 1);
    window.addEventListener("tcc_orders_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    const interval = window.setInterval(handleUpdate, 8000);
    return () => {
      window.removeEventListener("tcc_orders_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      window.clearInterval(interval);
    };
  }, []);

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

  const selfMember = useMemo(() => {
    if (!mounted || !user) return undefined;
    return resolveMemberForUser(user);
  }, [mounted, user]);

  useEffect(() => {
    if (user && user.role === "member" && selfMember) {
      setMemberId(selfMember.id);
    }
  }, [user, selfMember]);

  const isStaff = user?.role !== "member";
  const member: ClubMember | undefined = isStaff
    ? members.find((m) => m.id === memberId)
    : selfMember;
  const isPendingConsent = Boolean(member && member.status === "pending_consent");

  const priced = useMemo(
    () => (mounted ? priceCart("bar", cart, member?.planId) : { items: [], subtotal: 0, discount: 0, discountPct: 0, gst: 0, total: 0, deliveryFee: 0 }),
    [mounted, cart, member?.planId, version]
  );

  const myActiveOrders = useMemo(() => {
    if (!mounted || !user) return [];
    const memberKey = member?.id ?? user?.memberId ?? user?.id;
    const nameKey = (member?.fullName ?? user?.fullName ?? "").toLowerCase();
    return getOrders()
      .filter(
        (o) =>
          o.channel === "bar" &&
          ((o.memberId && (o.memberId === memberKey || o.memberId === user?.id || o.memberId === `user-${member?.id}`)) ||
            (o.memberName && o.memberName.toLowerCase() === nameKey)) &&
          ["placed", "preparing", "ready"].includes(o.status)
      )
      .sort((a, b) => b.placedAt.localeCompare(a.placedAt));
  }, [mounted, user, member, version]);

  const activeTotal = useMemo(
    () => myActiveOrders.reduce((sum, o) => sum + o.total, 0),
    [myActiveOrders]
  );

  const primaryQueueInfo = useMemo(() => {
    if (!myActiveOrders.length) return null;
    const earliest = [...myActiveOrders].sort((a, b) => a.placedAt.localeCompare(b.placedAt))[0];
    return getOrderQueueStatus(earliest.id);
  }, [myActiveOrders, kitchen]);

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
    if (isPendingConsent) {
      note("Under DPDP Act 2023, bar ordering is locked pending parental consent verification.");
      return;
    }
    if (mode === "tab" && !member) {
      note("A tab needs a member. Pick a member or settle by cash, card or UPI.");
      return;
    }
    const guestTable = tables.find((t) => t.id === tableId);
    const orderMemberId = member?.id ?? user?.memberId ?? (user?.role === "member" ? user?.id : undefined);
    const orderMemberName = member?.fullName ?? user?.fullName ?? (guestTable ? `Guest · ${guestTable.label}` : "Counter guest");
    const orderPlanId = member?.planId ?? user?.planId;

    const result = createOrder({
      channel: "bar",
      lines: cart,
      memberId: orderMemberId,
      memberName: orderMemberName,
      planId: orderPlanId,
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
        ? `Order ${result.order?.code ?? ""} sent to kitchen · added to ${orderMemberName.split(" ")[0]}'s tab.`
        : `Order ${result.order?.code ?? ""} sent to kitchen · ${inr(result.order?.total ?? 0)} paid via ${mode.toUpperCase()}. Preparing now!`
    );
  };

  if (!mounted) {
    return <div className="mx-auto max-w-[1400px] p-6"><div className="h-[520px] animate-pulse rounded-2xl bg-ink/[0.05]" /></div>;
  }

  const openTabsTotal = tabs.reduce((sum, tab) => sum + tab.total, 0);
  const visible = BAR_MENU.filter((item) => item.category === category);
  const canAccessKitchen = ["owner", "manager", "cafe_manager", "bar_staff"].includes(user?.role ?? "");
  const myTab = tabs.find((t) => t.memberId === member?.id);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-5 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Bar & cafeteria · D1–D7"
        title="After the match, the bar."
        description="Table and counter orders reach the kitchen instantly. Member discounts apply themselves, tabs accrue, and the floor map knows which tables are sitting."
        actions={
          <>
            {canAccessKitchen && (
              <Link href="/dashboard/kitchen" className="btn btn-outline btn-sm">
                <ChefHat className="h-3.5 w-3.5" />
                Kitchen ({kitchen.length})
              </Link>
            )}
            <button className="btn btn-clay btn-sm" onClick={() => setDrawerOpen(true)}>
              <ShoppingBag className="h-3.5 w-3.5" />
              New order {cart.length ? `(${cart.length})` : ""}
            </button>
          </>
        }
        meta={
          isStaff ? (
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
          ) : (
            <>
              <StatusPill tone="success">
                <Armchair className="h-3 w-3" /> {tables.filter((t) => t.status === "available").length} tables free
              </StatusPill>
              <span className="u-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                Open 7:00 AM – 11:00 PM IST
              </span>
              <span className="u-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                {member ? `${MEMBERSHIP_PLANS[member.planId]?.barDiscountPct}% Privilege Discount` : "Member Lounge"}
              </span>
            </>
          )
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

      {isStaff ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Open tabs" value={inr(openTabsTotal)} unit="unsettled" note={`${tabs.length} members running a tab`} />
          <Stat label="Sold today" value={inr(ordersToday.reduce((s, o) => s + o.total, 0))} unit="bar" note={`${ordersToday.length} tickets`} />
          <Stat label="Tables seated" value={String(tables.filter((t) => t.status === "occupied").length)} unit={`of ${tables.length}`} note="Live floor map" />
          <Stat label="Kitchen queue" value={String(kitchen.length)} unit="tickets" note="Placed or preparing" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat
            label="Live Kitchen Queue"
            value={primaryQueueInfo ? (primaryQueueInfo.status === "ready" ? "Ready" : `#${primaryQueueInfo.position}`) : "Clear"}
            unit={primaryQueueInfo ? (primaryQueueInfo.status === "ready" ? "to serve" : primaryQueueInfo.ordersAhead === 0 ? "next up" : `${primaryQueueInfo.ordersAhead} ahead`) : "in pass"}
            note={primaryQueueInfo ? primaryQueueInfo.label : (myActiveOrders.length === 0 ? "No active orders" : "Cooking on pass")}
          />
          <Stat
            label="Active Orders Total"
            value={myActiveOrders.length > 0 ? inr(activeTotal) : (myTab ? inr(myTab.total) : "₹0")}
            unit={myActiveOrders.length > 0 ? `${myActiveOrders.length} ticket${myActiveOrders.length === 1 ? "" : "s"}` : (myTab ? "open tab" : "settled")}
            note={myActiveOrders.length > 0 ? `${myActiveOrders.filter(o => o.status === "ready").length} ready · ${myActiveOrders.filter(o => o.status === "preparing").length} preparing` : (myTab ? `${myTab.orderCodes.length} orders on tab` : "All settled")}
          />
          <Stat
            label="Available Tables"
            value={String(tables.filter((t) => t.status === "available").length)}
            unit={`of ${tables.length}`}
            note="3 dining zones"
          />
          <Stat
            label="Club Privilege"
            value={`${member ? MEMBERSHIP_PLANS[member.planId]?.barDiscountPct : 15}%`}
            unit="off food & bar"
            note={member ? MEMBERSHIP_PLANS[member.planId]?.name : "Standard discount"}
          />
        </div>
      )}

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
              {tables.map((table) => {
                const isSelected = tableId === table.id;
                const isUnavailable = (table.status === "reserved" || table.status === "occupied") && !isSelected;
                return (
                  <button
                    key={table.id}
                    type="button"
                    disabled={isUnavailable}
                    onClick={() => {
                      if (isUnavailable) return;
                      if (isSelected) {
                        setTableId("");
                      } else if (table.status === "available") {
                        setTableId(table.id);
                      }
                      setVersion((v) => v + 1);
                    }}
                    className={cn(
                      "flex flex-col items-start rounded-lg border p-2.5 text-left transition-colors",
                      isSelected
                        ? "border-ink bg-ink text-chalk"
                        : table.status === "occupied"
                          ? "border-clay/40 bg-clay/[0.07] opacity-60 cursor-not-allowed"
                          : table.status === "reserved"
                            ? "border-gold/40 bg-gold/[0.08] opacity-60 cursor-not-allowed"
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
                        isSelected
                          ? "text-chalk/70"
                          : table.status === "reserved"
                            ? "text-gold font-medium"
                            : table.status === "occupied"
                              ? "text-clay font-medium"
                              : "text-muted"
                      )}
                    >
                      {isSelected ? "Selected" : table.status === "reserved" ? "Reserved" : table.status === "occupied" ? "Seated" : "Free"}
                    </span>
                  </button>
                );
              })}
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

          {/* Chef Vikram's Kitchen Board & Pre-Match Nutrition: balances vertical space and provides useful member context */}
          <Panel className="mt-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-clay/10 text-clay">
                  <ChefHat className="h-5 w-5" />
                </div>
                <div>
                  <div className="u-eyebrow text-clay">Kitchen & pass · Chef Vikram</div>
                  <h3 className="u-display text-[14px]">Pre-Match Nutrition & Fresh Kitchen Pass</h3>
                </div>
              </div>
              <span className="chip chip-court text-[9px]">Live service</span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-line bg-paper-soft p-3">
                <div className="flex items-center gap-2 text-ink">
                  <Flame className="h-4 w-4 text-clay" />
                  <span className="text-[12px] font-semibold">Fresh On Order</span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">
                  All mains and post-match recovery meals prepared fresh on order under Chef Vikram. Average ticket prep time is 10–14 minutes.
                </p>
                <div className="mt-2 text-[10px] font-medium text-clay">
                  100% in-house sourdough & marinades
                </div>
              </div>

              <div className="rounded-xl border border-line bg-paper-soft p-3">
                <div className="flex items-center gap-2 text-ink">
                  <Sparkles className="h-4 w-4 text-gold" />
                  <span className="text-[12px] font-semibold">Athlete Recovery</span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">
                  Grass-fed whey isolate shakes (25g protein) and chilled citrus electrolyte coolers engineered for fast glycogen repletion.
                </p>
                <div className="mt-2 text-[10px] font-medium text-gold-deep">
                  Zero refined sugars in athlete coolers
                </div>
              </div>

              <div className="rounded-xl border border-line bg-paper-soft p-3">
                <div className="flex items-center gap-2 text-ink">
                  <ShieldCheck className="h-4 w-4 text-court" />
                  <span className="text-[12px] font-semibold">Court & Terrace Service</span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">
                  Order from your phone while resting between games. Runners deliver directly to Courts 1–6 benchside or Terrace tables.
                </p>
                <div className="mt-2 text-[10px] font-medium text-court">
                  Table & bench delivery included
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line-soft bg-chalk p-3 text-[11px]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 font-medium text-ink">
                  <span className="h-2 w-2 rounded-full bg-court" />
                  Kitchen Station: Active
                </span>
                <span className="text-muted">·</span>
                <span className="text-muted">Pass Dispatch: 2–4 min</span>
                <span className="text-muted">·</span>
                <span className="text-muted">Beverage Bar: Instant</span>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="btn btn-quiet btn-xs"
              >
                Order from menu →
              </button>
            </div>
          </Panel>
        </div>

        <div className="space-y-4 lg:col-span-4">
          {isStaff ? (
            <>
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
                  <div className="max-h-[280px] overflow-y-auto pr-1">
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
                  </div>
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
            </>
          ) : (
            <>
              {myActiveOrders.length > 0 && (
                <Panel tone="ink" className="space-y-3">
                  <div className="flex items-center justify-between border-b border-line-inverse pb-2">
                    <div>
                      <div className="u-eyebrow text-clay-soft">Kitchen · live</div>
                      <div className="u-display mt-0.5 text-[13px] text-chalk">
                        {myActiveOrders.length} active ticket{myActiveOrders.length === 1 ? "" : "s"} · {inr(activeTotal)}
                      </div>
                    </div>
                    <ChefHat className="h-4 w-4 text-clay-soft" />
                  </div>
                  <div className="max-h-[300px] overflow-y-auto pr-1">
                    <ul className="divide-y divide-line-inverse">
                      {myActiveOrders.map((order) => {
                        const qStatus = getOrderQueueStatus(order.id);
                        return (
                          <li key={order.id} className="py-2.5 space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="u-mono text-[11px] font-bold text-chalk">
                                {order.code}
                              </span>
                              <span
                                className={cn(
                                  "u-mono rounded px-2 py-0.5 text-[9.5px] font-medium tracking-wide",
                                  order.status === "ready"
                                    ? "bg-court text-chalk"
                                    : order.status === "preparing"
                                      ? "bg-gold text-ink"
                                      : "bg-chalk/20 text-chalk"
                                )}
                              >
                                {qStatus?.label ?? (order.status === "ready" ? "Ready to serve" : "Cooking")}
                              </span>
                            </div>
                            <div className="text-[11px] text-chalk/80">
                              {order.lines.map((l) => `${l.qty}× ${l.name}`).join(", ")}
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-chalk/60 pt-0.5">
                              <span>
                                {order.tableId ? `Table ${tables.find((t) => t.id === order.tableId)?.label ?? order.tableId}` : "Counter pickup"} · {inr(order.total)}
                              </span>
                              <span className="chip text-[8.5px] uppercase tracking-wider text-chalk">
                                {order.paymentMode === "tab" ? "On Tab" : `Paid via ${order.paymentMode.toUpperCase()}`}
                              </span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <p className="border-t border-line-inverse pt-2 text-[10px] leading-relaxed text-chalk/60">
                    Your order was received and is being prepared fresh under Chef Vikram.
                  </p>
                </Panel>
              )}

              <Panel>
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <div>
                    <div className="u-eyebrow text-muted">My Lounge Tab</div>
                    <div className="u-display mt-0.5 text-[13px]">Personal account</div>
                  </div>
                  <Wallet className="h-4 w-4 text-muted" />
                </div>
                {myTab ? (
                  <div className="mt-3 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[12px] text-muted">Current unsettled total</span>
                      <span className="u-value text-xl font-bold text-ink">{inr(myTab.total)}</span>
                    </div>
                    <div className="text-[11px] text-muted">
                      {myTab.tableId ? `Seated at ${tables.find((t) => t.id === myTab.tableId)?.label ?? myTab.tableId}` : "Counter tab"} · {myTab.orderCodes.length} order{myTab.orderCodes.length === 1 ? "" : "s"}
                    </div>
                    <button
                      className="btn btn-ink btn-sm btn-block mt-2"
                      onClick={() => setSettleTarget(myTab)}
                    >
                      Settle My Tab ({inr(myTab.total)})
                    </button>
                  </div>
                ) : (
                  <div className="mt-3">
                    <p className="text-[11.5px] text-muted leading-relaxed">
                      You have no open tab. When you order at any table or at the bar counter on tab, items are added to your personal clubhouse ledger.
                    </p>
                  </div>
                )}
                <p className="mt-3 border-t border-line-soft pt-2 text-[10px] leading-relaxed text-muted">
                  {member ? `${MEMBERSHIP_PLANS[member.planId]?.barDiscountPct}% privilege discount` : "Member discount"} is applied automatically.
                </p>
              </Panel>

              <Panel tone="deep">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="u-eyebrow text-muted">Club Dining & Lounge</div>
                    <div className="u-display mt-1 text-[13px]">Service Timings</div>
                  </div>
                  <Coffee className="h-5 w-5 text-muted" />
                </div>
                <div className="mt-3 space-y-2 text-[11px] text-muted">
                  <div className="flex justify-between border-b border-line-soft pb-1.5">
                    <span>Breakfast & Shakes</span>
                    <span className="font-mono text-ink">07:00 – 11:30 IST</span>
                  </div>
                  <div className="flex justify-between border-b border-line-soft pb-1.5">
                    <span>All-Day Athlete Meals</span>
                    <span className="font-mono text-ink">12:00 – 22:30 IST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Evening Social & Bar</span>
                    <span className="font-mono text-ink">17:00 – 23:00 IST</span>
                  </div>
                </div>
                <p className="mt-3 text-[10.5px] leading-relaxed text-muted">
                  Fresh post-match meals prepared under Chef Vikram. Orders can be delivered to courts or served at tables.
                </p>
              </Panel>
            </>
          )}
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
            {isPendingConsent && (
              <p className="rounded-lg border border-gold/40 bg-gold/10 px-2.5 py-1.5 text-[10.5px] text-[#7d5d17] leading-relaxed">
                Parental consent verification required under DPDP Act 2023. Bar ordering is locked until verified.
              </p>
            )}
            <button className="btn btn-clay btn-block" disabled={!cart.length || isPendingConsent} onClick={send}>
              <Receipt className="h-4 w-4" />
              {isPendingConsent ? "Locked (Consent Pending)" : "Send to kitchen"}
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
              {isStaff ? (
                <select id="bar-member" className="select" value={memberId} onChange={(e) => setMemberId(e.target.value)}>
                  <option value="">Guest</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} · {MEMBERSHIP_PLANS[m.planId].shortName}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="input bg-paper-soft text-[11.5px] flex items-center justify-between">
                  <span className="font-medium text-ink truncate">{member?.fullName ?? user?.fullName}</span>
                  <span className="chip chip-clay text-[8.5px] uppercase shrink-0">{member ? MEMBERSHIP_PLANS[member.planId]?.shortName : "Member"}</span>
                </div>
              )}
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

          <PaymentMethodDetails mode={mode} amount={priced.total} />

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

