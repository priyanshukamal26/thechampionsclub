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
  ScanLine,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-react";
import { EmptyState, Meter, PageHeader, Panel, Stat, StatusPill } from "@/components/ui/kit";
import { useAuth } from "@/lib/auth-context";
import {
  DAILY_BOOKING_CAP,
  activeBookingsForMemberOnDate,
  getFacility,
  nextSocialSession,
  upcomingBookingsForMember,
} from "@/lib/bookings";
import { getOpenTabs, kitchenQueue, activeOrdersForMember } from "@/lib/orders";
import { getTodayWeekMonth, getZReport } from "@/lib/finance";
import {
  MEMBERSHIP_PLANS,
  SEED_MEMBERS,
  getLocalMembers,
  getMemberById,
  type ClubMember,
} from "@/lib/membership";
import { formatDate, formatTime, inr, labelToMinutes, minutesToLabel, offsetDate, todayISO } from "@/lib/store";

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const data = useMemo(() => {
    if (!mounted || !user) return null;
    const member: ClubMember | undefined =
      (user.email && getMemberById(user.email)) ||
      getLocalMembers().find((m) => m.email.toLowerCase() === user.email.toLowerCase()) ||
      (user.planId ? SEED_MEMBERS.find((m) => m.planId === user.planId) : undefined) ||
      SEED_MEMBERS[0];

    const upcoming = upcomingBookingsForMember(member.id).slice(0, 4);
    const tabs = getOpenTabs();
    const tab = tabs.find((t) => t.memberName.toLowerCase() === member.fullName.toLowerCase());
    const orders = activeOrdersForMember(member.fullName);
    const plays = activeBookingsForMemberOnDate(member.id, todayISO()).length;
    const expiringDays = Math.ceil(
      (new Date(`${member.membershipEnd}T00:00:00`).getTime() - Date.now()) / 86_400_000
    );

    const twm = getTodayWeekMonth();
    const report = getZReport();
    const kitchen = kitchenQueue();
    return { member, upcoming, tab, orders, plays, expiringDays, twm, report, kitchen, tabs };
  }, [mounted, user]);

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

  if (user && user.role !== "member") {
    return <StaffOverview user={user} data={data} />;
  }

  const { member, upcoming, tab, orders, plays, expiringDays } = data;
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
              <div className="u-eyebrow text-muted">Order status</div>
              <ul className="mt-2 divide-y divide-line-soft">
                {orders.slice(0, 3).map((order) => (
                  <li key={order.id} className="flex items-center justify-between py-2 text-[11px]">
                    <span className="u-mono text-[9.5px] text-muted">{order.code}</span>
                    <span className="capitalize text-ink">{order.status}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

function StaffOverview({
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
        eyebrow={`${user.role.replace("_", " ")} console`}
        title={`Good to see you, ${user.fullName.split(" ")[0]}.`}
        description="A live read of the club: takings, the pass, tabs and the kitchen. Jump into the counter or the ledger from here."
        actions={
          <>
            <Link href="/dashboard/desk" className="btn btn-clay btn-sm">
              <ScanLine className="h-3.5 w-3.5" />
              Front desk
            </Link>
            <Link href={user.role === "owner" || user.role === "manager" ? "/dashboard/owner" : "/dashboard/pos"} className="btn btn-ink btn-sm">
              {user.role === "owner" || user.role === "manager" ? "Owner ledger" : "Counter POS"}
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat label="Today" value={inr(twm.today.gross)} unit="gross" note={`${twm.today.count} transactions`} />
        <Stat label="This week" value={inr(twm.week.gross)} unit="gross" note={`${twm.week.count} transactions`} />
        <Stat label="Open tabs" value={inr(openValue)} unit="unsettled" note={`${tabs.length} members`} />
        <Stat label="Kitchen" value={String(kitchen.length)} unit="tickets" note="Placed or preparing" />
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
            <div className="u-eyebrow text-muted">Jump to</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                { href: "/dashboard/pos", label: "Counter sale", icon: Wallet },
                { href: "/dashboard/kitchen", label: "Kitchen", icon: ChefHat },
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

          <Panel tone="deep">
            <div className="flex items-center justify-between">
              <div>
                <div className="u-eyebrow text-muted">Kitchen</div>
                <div className="u-display mt-1 text-[13px]">{kitchen.length} open tickets</div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted" />
            </div>
            <ul className="mt-2 space-y-1">
              {kitchen.slice(0, 3).map((order) => (
                <li key={order.id} className="flex items-center justify-between text-[10.5px] text-muted">
                  <span className="u-mono">{order.code}</span>
                  <span>{formatTime(order.placedAt)}</span>
                  <span>{inr(order.total)}</span>
                </li>
              ))}
              {kitchen.length === 0 && <li className="text-[10.5px] text-muted">The pass is clear.</li>}
            </ul>
            <Link href="/dashboard/kitchen" className="btn btn-ink btn-sm btn-block mt-3">
              Open KDS
            </Link>
          </Panel>
        </div>
      </div>

      <p className="flex items-center gap-1.5 text-[10px] text-muted">
        <IndianRupee className="h-3 w-3" />
        Amounts are GST-inclusive and computed from the same ledger the owner console reads.
        <Clock className="ml-2 h-3 w-3" />
        {offsetDate(0)} · {todayISO()}
      </p>
    </div>
  );
}


