"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChefHat,
  Clock,
  Coffee,
  CreditCard,
  IndianRupee,
  Package,
  ScanLine,
  ShieldAlert,
  ShoppingBag,
  Store,
  Users,
  Wallet,
} from "lucide-react";
import { EmptyState, Meter, PageHeader, Panel, Stat, StatusPill } from "@/components/ui/kit";
import { useAuth } from "@/lib/auth-context";
import {
  DAILY_BOOKING_CAP,
  activeBookingsForMemberOnDate,
  bookingsOnDate,
  getFacility,
  nextSocialSession,
  upcomingBookingsForMember,
} from "@/lib/bookings";
import {
  getOpenTabs,
  kitchenQueue,
  activeOrdersForMember,
  getCustomerActiveQueue,
  getOrderQueueStatus,
  getProducts,
  lowStockProducts,
  getOrders,
  getTables,
} from "@/lib/orders";
import { getTodayWeekMonth, getZReport } from "@/lib/finance";
import {
  MEMBERSHIP_PLANS,
  getLocalMembers,
  getMemberById,
  type ClubMember,
} from "@/lib/membership";
import { resolveMemberForUser } from "@/components/dashboard/member";
import { formatDate, formatTime, inr, labelToMinutes, minutesToLabel, offsetDate, todayISO } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setMounted(true);
    const handleUpdate = () => setTick((t) => t + 1);
    window.addEventListener("tcc_orders_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    const interval = window.setInterval(handleUpdate, 8000);
    return () => {
      window.removeEventListener("tcc_orders_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      window.clearInterval(interval);
    };
  }, []);

  const data = useMemo(() => {
    if (!mounted || !user) return null;
    const member: ClubMember = resolveMemberForUser(user);

    const upcoming = upcomingBookingsForMember(member.id).slice(0, 4);
    const tabs = getOpenTabs();
    const tab = tabs.find((t) => t.memberName.toLowerCase() === member.fullName.toLowerCase());
    const orders = activeOrdersForMember(member.fullName);
    const activeQueueData = getCustomerActiveQueue(member.fullName);
    const plays = activeBookingsForMemberOnDate(member.id, todayISO()).length;
    const expiringDays = Math.ceil(
      (new Date(`${member.membershipEnd}T00:00:00`).getTime() - Date.now()) / 86_400_000
    );

    const twm = getTodayWeekMonth();
    const report = getZReport();
    const kitchen = kitchenQueue();
    return { member, upcoming, tab, orders, plays, expiringDays, twm, report, kitchen, tabs, activeQueueData };
  }, [mounted, user, tick]);

  if (!mounted || !data) {
    return (
      <div className="mx-auto max-w-[1200px] space-y-6 p-5 sm:p-6 lg:p-8">
        <div className="h-10 w-72 animate-pulse rounded bg-ink/10" />
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-ink/[0.06]" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-ink/[0.05]" />
      </div>
    );
  }

  if (user && user.role === "shop_manager") {
    return <SportsShopOverview user={user} />;
  }
  if (user && user.role === "cafe_manager") {
    return <BarCafeOverview user={user} />;
  }
  if (user && (user.role === "front_desk" || user.role === "manager")) {
    return <FrontDeskOverview user={user} />;
  }
  if (user && user.role === "owner") {
    return <OwnerOverview user={user} data={data} />;
  }

  const { member, upcoming, tab, orders, plays, expiringDays, activeQueueData } = data;
  const plan = MEMBERSHIP_PLANS[member.planId];
  const next = upcoming[0];
  const nextFacility = next ? getFacility(next.facilityId) : undefined;
  const social = nextSocialSession();

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-5 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow={`${plan.name} · member since ${formatDate(member.membershipStart)}`}
        title={`Welcome back, ${member.fullName.split(" ")[0]}.`}
        description="Your courts, your tab, your pass. Everything here reads from the same booking and order ledgers the desk uses."
        actions={
          <>
            <Link href="/dashboard/courts" className="btn btn-clay btn-sm">
              <CalendarDays className="h-3.5 w-3.5" />
              Book a court
            </Link>
            <Link href="/dashboard/pass" className="btn btn-outline btn-sm">
              <CreditCard className="h-3.5 w-3.5" />
              Member pass
            </Link>
          </>
        }
        meta={
          <>
            <StatusPill tone={expiringDays < 0 ? "danger" : expiringDays <= 14 ? "warn" : "success"}>
              {expiringDays < 0 ? "Expired" : `${expiringDays} days left`}
            </StatusPill>
            <span className="u-mono text-[10px] uppercase tracking-[0.14em] text-muted">{member.memberCode}</span>
            <span className="u-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              {Math.max(0, DAILY_BOOKING_CAP - plays)} of {DAILY_BOOKING_CAP} plays left today
            </span>
          </>
        }
      />

      {/* Live kitchen order queue tracker banner */}
      {activeQueueData.totalCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold/40 bg-gold/[0.08] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/20 text-[#7d5d17]">
              <ChefHat className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[13px] text-ink">
                  {activeQueueData.primaryQueueInfo?.label ?? "Order in Kitchen"}
                </span>
                <span className="u-mono rounded bg-ink px-2 py-0.5 text-[9px] uppercase tracking-wider text-chalk">
                  {activeQueueData.totalCount} active ticket{activeQueueData.totalCount === 1 ? "" : "s"}
                </span>
              </div>
              <div className="mt-0.5 text-[11px] text-muted">
                Current total: <span className="font-semibold text-ink">{inr(activeQueueData.totalAmount)}</span> · Being prepared fresh under Chef Vikram
              </div>
            </div>
          </div>
          <Link href="/dashboard/bar" className="btn btn-ink btn-sm">
            Track order & floor map →
          </Link>
        </div>
      )}

      {member.duesPending > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-clay/40 bg-clay/[0.07] px-4 py-3">
          <div className="text-[12px] text-clay-deep">
            <span className="font-medium">{inr(member.duesPending)} outstanding</span> on your café tab.
            Settle it before the next booking to keep your account in good standing.
          </div>
          <Link href="/dashboard/bar" className="btn btn-ink btn-sm">
            Settle at the bar
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat
          label="Next session"
          value={next ? next.start : "—"}
          unit={next ? "today" : ""}
          note={next ? `${nextFacility?.name} · ${formatDate(next.date)}` : "Nothing booked yet"}
        />
        <Stat
          label="Plays left"
          value={`${Math.max(0, DAILY_BOOKING_CAP - plays)}/${DAILY_BOOKING_CAP}`}
          unit="today"
          note="Resets at midnight IST"
        />
        <Stat
          label="Open tab"
          value={tab ? inr(tab.total) : "₹0"}
          unit={tab ? "unsettled" : ""}
          note={tab ? `${tab.orderCodes.length} orders · ${tab.tableId ?? "counter"}` : "Nothing running"}
        />
        <Stat label="Membership" value={`${Math.max(0, expiringDays)}d`} unit="remaining" note={plan.courtDiscountText} />
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-8">
          <Panel>
            <div className="flex items-start justify-between border-b border-line pb-3">
              <div>
                <div className="u-eyebrow text-clay">Upcoming</div>
                <h2 className="u-display mt-1 text-[15px]">Your court reservations</h2>
              </div>
              <Link href="/dashboard/bookings" className="btn btn-quiet btn-sm">
                All bookings <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {upcoming.length === 0 ? (
              <EmptyState
                title="No court booked yet"
                description="The evening sheet is open. Pick a slot and you are done in two taps."
                action={
                  <Link href="/dashboard/courts" className="btn btn-ink btn-sm">
                    Open the grid
                  </Link>
                }
                className="mt-3"
              />
            ) : (
              <ul className="divide-y divide-line-soft">
                {upcoming.map((booking) => {
                  const facility = getFacility(booking.facilityId);
                  return (
                    <li key={booking.id} className="flex flex-wrap items-center gap-3 py-3">
                      <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg border border-line bg-paper-soft">
                        <span className="u-mono text-[9.5px] text-muted">{booking.start.slice(0, 2)}</span>
                        <span className="u-mono text-[9px] text-muted">:00</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[12.5px] font-medium">
                          {facility?.name} · {facility?.sport}
                        </div>
                        <div className="mt-0.5 text-[10.5px] text-muted">
                          {formatDate(booking.date)} · {booking.start}–{minutesToLabel(labelToMinutes(booking.start) + booking.durationMin)} · {booking.price === 0 ? "Included in plan" : inr(booking.price)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusPill tone="success">Confirmed</StatusPill>
                        <Link href="/dashboard/bookings" className="btn btn-outline btn-sm">
                          Manage
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel>
            <div className="flex items-start justify-between border-b border-line pb-3">
              <div>
                <div className="u-eyebrow text-clay">Activity</div>
                <h2 className="u-display mt-1 text-[15px]">Recent with the club</h2>
              </div>
              <Link href="/dashboard/pass" className="btn btn-quiet btn-sm">
                Full history <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {member.history.length === 0 ? (
              <p className="py-6 text-center text-[11.5px] text-muted">
                Nothing yet — your first booking will show up here.
              </p>
            ) : (
              <ul className="divide-y divide-line-soft">
                {member.history.slice(0, 5).map((item) => (
                  <li key={item.id} className="flex items-center gap-3 py-2.5">
                    <span className="chip chip-court">{item.type}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12px] font-medium">{item.title}</div>
                      <div className="truncate text-[10.5px] text-muted">{item.details}</div>
                    </div>
                    <div className="text-right">
                      <div className="u-value text-[11.5px]">{item.amount === 0 ? "Included" : inr(item.amount)}</div>
                      <div className="text-[9.5px] text-muted">{item.date}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="space-y-5 lg:col-span-4">
          <Panel>
            <div className="u-eyebrow text-muted">Quick actions</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                { href: "/dashboard/courts", label: "Book court", icon: CalendarDays },
                { href: "/dashboard/shop", label: "Pro shop", icon: ShoppingBag },
                { href: "/dashboard/bar", label: "Bar tab", icon: Coffee },
                { href: "/dashboard/pass", label: "Show pass", icon: CreditCard },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex flex-col gap-2 rounded-lg border border-line bg-paper-soft p-3 transition-colors hover:border-ink hover:bg-chalk"
                  >
                    <Icon className="h-4 w-4 text-muted" />
                    <span className="u-display text-[10.5px] uppercase tracking-[0.06em]">{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </Panel>

          {social && (
            <Panel>
              <div className="flex items-center justify-between">
                <div>
                  <div className="u-eyebrow text-clay">Friday social</div>
                  <div className="u-display mt-1 text-[13px]">{formatDate(social.date)}</div>
                  <div className="text-[10.5px] text-muted">
                    {social.players.length}/{social.capacity} players · {social.start}
                  </div>
                </div>
                <Users className="h-5 w-5 text-muted" />
              </div>
              <Meter value={(social.players.length / social.capacity) * 100} tone="clay" className="mt-3" />
              <Link href="/dashboard/social" className="btn btn-ink btn-sm btn-block mt-3">
                Join the draw
              </Link>
            </Panel>
          )}

          <Panel tone="deep">
            <div className="u-eyebrow text-muted">Your plan</div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="u-display text-[16px]">{plan.name}</span>
              <span className="u-value text-[13px]">{inr(plan.priceMonthly)}/mo</span>
            </div>
            <ul className="mt-3 space-y-1.5 text-[11px] text-muted">
              <li className="flex justify-between"><span>Courts</span><span className="text-ink">{plan.courtDiscountText}</span></li>
              <li className="flex justify-between"><span>Pro shop</span><span className="text-ink">{plan.shopDiscountPct}%</span></li>
              <li className="flex justify-between"><span>Bar</span><span className="text-ink">{plan.barDiscountPct}%</span></li>
              <li className="flex justify-between"><span>Daily cap</span><span className="text-ink">{plan.dailyCap} plays</span></li>
            </ul>
            <Link href="/dashboard/settings" className="btn btn-outline btn-sm btn-block mt-3">
              Manage membership
            </Link>
          </Panel>

          {orders.length > 0 && (
            <Panel>
              <div className="flex items-center justify-between border-b border-line pb-2">
                <div>
                  <div className="u-eyebrow text-clay">Kitchen & Bar Orders</div>
                  <div className="u-display text-[12.5px] mt-0.5">Live ticket status</div>
                </div>
                {activeQueueData.totalCount > 0 && (
                  <span className="u-mono text-[11px] text-ink font-semibold">
                    {inr(activeQueueData.totalAmount)}
                  </span>
                )}
              </div>
              <div className="max-h-[220px] overflow-y-auto pr-1">
                <ul className="divide-y divide-line-soft">
                  {orders.map((order) => {
                    const qInfo = getOrderQueueStatus(order.id);
                    return (
                      <li key={order.id} className="flex items-center justify-between py-2 text-[11px]">
                        <div>
                          <span className="u-mono font-medium text-ink">{order.code}</span>
                          <span className="ml-1.5 text-muted">· {inr(order.total)}</span>
                        </div>
                        <span
                          className={cn(
                            "u-mono rounded px-1.5 py-0.5 text-[9px] font-medium",
                            order.status === "ready"
                              ? "bg-court/20 text-court font-semibold"
                              : order.status === "preparing"
                                ? "bg-gold/20 text-[#7d5d17] font-semibold"
                                : "bg-ink/10 text-muted"
                          )}
                        >
                          {qInfo?.label ?? order.status}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <Link href="/dashboard/bar" className="btn btn-quiet btn-xs btn-block mt-2">
                Open Bar Floor →
              </Link>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

function SportsShopOverview({ user }: { user: { fullName: string; role: string } }) {
  const allOrders = getOrders().filter((o) => o.channel === "shop");
  const todayOrders = allOrders.filter((o) => o.placedAt.slice(0, 10) === todayISO());
  const todayGross = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const lowStock = lowStockProducts();
  const pendingOrders = allOrders.filter((o) => o.status === "placed" || o.status === "preparing");
  const products = getProducts();

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-5 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Sports Pro Shop · Inventory & sales console"
        title={`Good to see you, ${user.fullName.split(" ")[0]}.`}
        description="Counter sales, shelf stock levels and pending orders for the Champions Pro Shop."
        actions={
          <>
            <Link href="/dashboard/pos" className="btn btn-clay btn-sm">
              <Store className="h-3.5 w-3.5" />
              Shop POS
            </Link>
            <Link href="/dashboard/shop" className="btn btn-ink btn-sm">
              <ShoppingBag className="h-3.5 w-3.5" />
              Pro shop shelf
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat label="Today's Sales" value={inr(todayGross)} unit="shop" note={`${todayOrders.length} counter tickets`} />
        <Stat label="Low Stock" value={String(lowStock.length)} unit="SKUs" note="Items below reorder mark" />
        <Stat label="Pending Orders" value={String(pendingOrders.length)} unit="active" note="Pickup & delivery queue" />
        <Stat label="Shelf Inventory" value={String(products.length)} unit="products" note="Active catalogue items" />
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <Panel className="lg:col-span-7">
          <div className="flex items-start justify-between border-b border-line pb-3">
            <div>
              <div className="u-eyebrow text-clay">Inventory alerts</div>
              <h2 className="u-display mt-1 text-[15px]">Running low on shelf</h2>
            </div>
            <Link href="/dashboard/shop" className="btn btn-outline btn-sm">
              Manage stock
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="py-6 text-center text-[11.5px] text-muted">All products are healthy above reorder levels.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line-soft">
              {lowStock.slice(0, 5).map((item) => (
                <li key={item.id} className="flex items-center justify-between py-2 text-[11.5px]">
                  <div>
                    <span className="font-medium text-ink">{item.name}</span>
                    <span className="ml-2 font-mono text-[9px] uppercase tracking-wider text-muted">{item.sku}</span>
                  </div>
                  <StatusPill tone={item.stock === 0 ? "danger" : "warn"}>
                    {item.stock === 0 ? "Out of stock" : `${item.stock} remaining`}
                  </StatusPill>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="space-y-4 lg:col-span-5">
          <Panel tone="deep">
            <div className="flex items-center justify-between">
              <div>
                <div className="u-eyebrow text-muted">Order queue</div>
                <div className="u-display mt-1 text-[13px]">{pendingOrders.length} pending fulfillment</div>
              </div>
              <Package className="h-4 w-4 text-muted" />
            </div>
            <ul className="mt-3 space-y-2">
              {pendingOrders.slice(0, 4).map((order) => (
                <li key={order.id} className="flex items-center justify-between rounded-lg border border-line bg-chalk p-2 text-[10.5px]">
                  <div>
                    <span className="font-mono font-medium text-ink">{order.code}</span>
                    <span className="ml-1.5 text-muted">· {order.memberName.split(" ")[0]}</span>
                  </div>
                  <span className="u-mono text-clay-deep">{order.fulfilment === "delivery" ? `OTP: ${order.otp}` : `Code: ${order.pickupCode}`}</span>
                </li>
              ))}
              {pendingOrders.length === 0 && <li className="text-[10.5px] text-muted">No pending orders.</li>}
            </ul>
            <Link href="/dashboard/shop" className="btn btn-ink btn-sm btn-block mt-3">
              View all orders
            </Link>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function BarCafeOverview({ user }: { user: { fullName: string; role: string } }) {
  const todayBarOrders = getOrders().filter((o) => o.channel === "bar" && o.placedAt.slice(0, 10) === todayISO());
  const todayBarGross = todayBarOrders.reduce((sum, o) => sum + o.total, 0);
  const tabs = getOpenTabs();
  const openValue = tabs.reduce((sum, tab) => sum + tab.total, 0);
  const tables = getTables();
  const seatedTables = tables.filter((t) => t.status === "occupied").length;
  const kitchen = kitchenQueue();

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-5 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Bar & Cafeteria · Floor & kitchen console"
        title={`Good to see you, ${user.fullName.split(" ")[0]}.`}
        description="Live floor seating, kitchen display tickets and member tabs for the Clubhouse Bar & Lounge."
        actions={
          <>
            <Link href="/dashboard/kitchen" className="btn btn-clay btn-sm">
              <ChefHat className="h-3.5 w-3.5" />
              Kitchen ({kitchen.length})
            </Link>
            <Link href="/dashboard/bar" className="btn btn-ink btn-sm">
              <Coffee className="h-3.5 w-3.5" />
              Bar floor map
            </Link>
            <Link href="/dashboard/bookings" className="btn btn-outline btn-sm">
              <CalendarDays className="h-3.5 w-3.5" />
              Court footfall
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat label="Bar takings" value={inr(todayBarGross)} unit="today" note={`${todayBarOrders.length} bar orders`} />
        <Stat label="Open tabs" value={inr(openValue)} unit="unsettled" note={`${tabs.length} running tabs`} />
        <Stat label="Seated tables" value={String(seatedTables)} unit={`of ${tables.length}`} note="Live floor status" />
        <Stat label="Kitchen queue" value={String(kitchen.length)} unit="tickets" note="Placed or preparing" />
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <Panel className="lg:col-span-7">
          <div className="flex items-start justify-between border-b border-line pb-3">
            <div>
              <div className="u-eyebrow text-clay">Kitchen live pass</div>
              <h2 className="u-display mt-1 text-[15px]">Active tickets by station</h2>
            </div>
            <Link href="/dashboard/kitchen" className="btn btn-outline btn-sm">
              Open KDS
            </Link>
          </div>
          {kitchen.length === 0 ? (
            <p className="py-6 text-center text-[11.5px] text-muted">The kitchen pass is clear. No active tickets.</p>
          ) : (
            <div className="max-h-[260px] overflow-y-auto pr-1">
              <ul className="mt-3 divide-y divide-line-soft">
                {kitchen.map((order, idx) => (
                  <li key={order.id} className="flex items-center justify-between py-2 text-[11.5px]">
                    <div>
                      <span className="font-mono font-medium text-ink">#{idx + 1} {order.code}</span>
                      <span className="ml-2 text-muted">· {order.memberName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="u-mono text-[10px] text-muted">{formatTime(order.placedAt)}</span>
                      <StatusPill tone={order.status === "ready" ? "success" : order.status === "preparing" ? "warn" : "info"}>
                        {order.status === "ready" ? "Ready" : order.status === "preparing" ? "Cooking" : "Placed"}
                      </StatusPill>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Panel>

        <div className="space-y-4 lg:col-span-5">
          <Panel tone="deep">
            <div className="flex items-center justify-between">
              <div>
                <div className="u-eyebrow text-muted">Floor seating</div>
                <div className="u-display mt-1 text-[13px]">{seatedTables} of {tables.length} tables seated</div>
              </div>
              <Coffee className="h-4 w-4 text-muted" />
            </div>
            <div className="mt-3 grid grid-cols-4 gap-1.5 text-center font-mono text-[9px]">
              {tables.map((t) => (
                <div
                  key={t.id}
                  className={`rounded border p-1.5 ${t.status === "occupied"
                    ? "border-clay bg-clay/10 text-clay-deep"
                    : t.status === "reserved"
                      ? "border-gold bg-gold/10 text-[#7d5d17]"
                      : "border-court/30 bg-court/10 text-court"
                    }`}
                >
                  <div className="font-bold">{t.label}</div>
                  <div className="text-[8px] uppercase">{t.status.slice(0, 3)}</div>
                </div>
              ))}
            </div>
            <Link href="/dashboard/bar" className="btn btn-ink btn-sm btn-block mt-3">
              Open floor map
            </Link>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function FrontDeskOverview({ user }: { user: { fullName: string; role: string } }) {
  const todayBookings = bookingsOnDate(todayISO());
  const checkedIn = todayBookings.filter((b) => b.checkedIn).length;
  const pendingConsents = getLocalMembers().filter((m) => m.status === "pending_consent" && m.isMinor);
  const social = nextSocialSession();

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-5 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Front Desk · Operations & check-in console"
        title={`Good to see you, ${user.fullName.split(" ")[0]}.`}
        description="Player check-in, court schedule monitoring, member lookup and guardian consent verifications."
        actions={
          <>
            <Link href="/dashboard/desk" className="btn btn-clay btn-sm">
              <ScanLine className="h-3.5 w-3.5" />
              Desk console
            </Link>
            <Link href="/dashboard/courts" className="btn btn-ink btn-sm">
              <CalendarDays className="h-3.5 w-3.5" />
              Book courts
            </Link>
            <Link href="/dashboard/bookings" className="btn btn-outline btn-sm">
              Today&apos;s court sheet
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat label="Checked in" value={String(checkedIn)} unit={`of ${todayBookings.length}`} note="Players on court" />
        <Stat label="Reservations" value={String(todayBookings.length)} unit="today" note="All 18 courts" />
        <Stat label="Minor Consents" value={String(pendingConsents.length)} unit="pending" note="DPDP Act validation" />
        <Stat label="Friday Social" value={String(social ? social.players.length : 0)} unit={`of ${social ? social.capacity : 20}`} note="Roster entries" />
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <Panel className="lg:col-span-7">
          <div className="flex items-start justify-between border-b border-line pb-3">
            <div>
              <div className="u-eyebrow text-clay">Today&apos;s court arrivals</div>
              <h2 className="u-display mt-1 text-[15px]">Court schedule</h2>
            </div>
            <Link href="/dashboard/bookings" className="btn btn-outline btn-sm">
              Full sheet
            </Link>
          </div>
          {todayBookings.length === 0 ? (
            <p className="py-6 text-center text-[11.5px] text-muted">No reservations booked for today.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line-soft">
              {todayBookings.slice(0, 5).map((b) => (
                <li key={b.id} className="flex items-center justify-between py-2 text-[11.5px]">
                  <div>
                    <span className="font-medium text-ink">{b.memberName}</span>
                    <span className="ml-2 text-muted">· {getFacility(b.facilityId)?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="u-mono text-[10px] text-muted">{b.start}</span>
                    <StatusPill tone={b.checkedIn ? "success" : "info"}>{b.checkedIn ? "Checked in" : "Confirmed"}</StatusPill>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="space-y-4 lg:col-span-5">
          <Panel tone="deep">
            <div className="flex items-center justify-between">
              <div>
                <div className="u-eyebrow text-muted">DPDP Consent Queue</div>
                <div className="u-display mt-1 text-[13px]">{pendingConsents.length} minor records pending</div>
              </div>
              <ShieldAlert className="h-4 w-4 text-clay" />
            </div>
            <ul className="mt-3 space-y-1.5">
              {pendingConsents.slice(0, 3).map((m) => (
                <li key={m.id} className="flex items-center justify-between rounded-lg border border-line bg-chalk p-2 text-[10.5px]">
                  <div>
                    <span className="font-medium text-ink">{m.fullName}</span>
                    <span className="ml-1 text-muted">({m.memberCode})</span>
                  </div>
                  <span className="u-mono text-clay-deep">Pending</span>
                </li>
              ))}
              {pendingConsents.length === 0 && <li className="text-[10.5px] text-muted">All minor consents verified.</li>}
            </ul>
            <Link href="/dashboard/desk" className="btn btn-ink btn-sm btn-block mt-3">
              Open desk verification
            </Link>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function OwnerOverview({
  user,
  data,
}: {
  user: { fullName: string; role: string };
  data: {
    twm: ReturnType<typeof getTodayWeekMonth>;
    report: ReturnType<typeof getZReport>;
    tabs: ReturnType<typeof getOpenTabs>;
    kitchen: ReturnType<typeof kitchenQueue>;
  };
}) {
  const { twm, report, tabs, kitchen } = data;
  const openValue = tabs.reduce((sum, tab) => sum + tab.total, 0);

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-5 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Executive Console · Club-wide financials"
        title={`Welcome, ${user.fullName.split(" ")[0]}.`}
        description="Comprehensive read of clubhouse performance: revenue ledgers, P&L, Z-report daily close and department operations."
        actions={
          <>
            <Link href="/dashboard/owner" className="btn btn-clay btn-sm">
              <Wallet className="h-3.5 w-3.5" />
              Owner console
            </Link>
            <Link href="/dashboard/desk" className="btn btn-ink btn-sm">
              <ScanLine className="h-3.5 w-3.5" />
              Front desk
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat label="Today gross" value={inr(twm.today.gross)} unit="gross" note={`${twm.today.count} transactions`} />
        <Stat label="This week" value={inr(twm.week.gross)} unit="gross" note={`${twm.week.count} transactions`} />
        <Stat label="Open tabs" value={inr(openValue)} unit="unsettled" note={`${tabs.length} members`} />
        <Stat label="Kitchen tickets" value={String(kitchen.length)} unit="active" note="Placed or preparing" />
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <Panel className="lg:col-span-7">
          <div className="flex items-start justify-between border-b border-line pb-3">
            <div>
              <div className="u-eyebrow text-clay">D8 · daily close</div>
              <h2 className="u-display mt-1 text-[15px]">Today&apos;s Z-report snapshot</h2>
            </div>
            <Link href="/dashboard/owner" className="btn btn-outline btn-sm">
              Full report
            </Link>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {[
              ["Cash", report.cashCollected],
              ["Card", report.cardCollected],
              ["UPI", report.upiCollected],
              ["Tabs", report.tabCollected],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-lg border border-line bg-paper-soft p-3">
                <div className="u-eyebrow text-[8.5px]">{label as string}</div>
                <div className="u-value mt-1 text-[15px]">{inr(value as number)}</div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[10.5px] text-muted">
            Expected in drawer {inr(report.expectedDrawer)} · opening float {inr(report.openingFloat)} ·{" "}
            {report.reconciled ? "reconciled" : "awaiting count"}.
          </p>
        </Panel>

        <div className="space-y-4 lg:col-span-5">
          <Panel>
            <div className="u-eyebrow text-muted">Department consoles</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                { href: "/dashboard/owner", label: "P&L Ledger", icon: Wallet },
                { href: "/dashboard/desk", label: "Front Desk", icon: ScanLine },
                { href: "/dashboard/pos", label: "Shop POS", icon: Store },
                { href: "/dashboard/kitchen", label: "Kitchen KDS", icon: ChefHat },
                { href: "/dashboard/bar", label: "Bar floor", icon: Coffee },
                { href: "/dashboard/courts", label: "Court sheet", icon: CalendarDays },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 rounded-lg border border-line bg-paper-soft px-2.5 py-2 text-[11px] transition-colors hover:border-ink hover:bg-chalk"
                  >
                    <Icon className="h-3.5 w-3.5 text-muted" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}


