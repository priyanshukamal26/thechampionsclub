"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  Dices,
  Info,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { PageHeader, Panel, Stat, StatusPill } from "@/components/ui/kit";
import { Segmented } from "@/components/ui/overlay";
import AvailabilityGrid from "@/components/courts/AvailabilityGrid";
import { useAuth } from "@/lib/auth-context";
import { resolveMemberForUser } from "@/components/dashboard/member";
import {
  DAILY_BOOKING_CAP,
  FREE_CANCELLATION_HOURS,
  OPEN_MINUTES,
  CLOSE_MINUTES,
  TIME_SLOTS,
  activeBookingsForMemberOnDate,
  availabilityFor,
  bookingsOnDate,
  canBook,
  createBooking,
  facilitiesBySport,
  getFacility,
  getSocialSessions,
  nextSocialSession,
  priceFor,
  planRateLabel,
  type Sport,
} from "@/lib/bookings";
import { getLocalMembers, MEMBERSHIP_PLANS, type ClubMember } from "@/lib/membership";
import { recordAuditLog } from "@/lib/audit";
import { formatDate, inr, labelToMinutes, minutesToLabel, offsetDate, todayISO } from "@/lib/store";
import { cn } from "@/lib/utils";

const SPORT_TABS: Array<Sport | "All"> = ["All", "Tennis", "Padel", "Badminton", "Cricket"];

export default function CourtsPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [version, setVersion] = useState(0);
  const [date, setDate] = useState(() => (new Date().getHours() >= 19 ? offsetDate(1) : todayISO()));
  const [sport, setSport] = useState<Sport | "All">("All");
  const [memberId, setMemberId] = useState("");
  const [selected, setSelected] = useState<{ facilityId: string; slot: string } | null>(null);
  const [flash, setFlash] = useState<{ tone: "court" | "clay"; message: string } | null>(null);

  useEffect(() => setMounted(true), []);

  const members = useMemo(() => (mounted ? getLocalMembers() : []), [mounted]);
  const selfMember = useMemo(() => {
    if (!user) return undefined;
    return resolveMemberForUser(user);
  }, [user]);

  useEffect(() => {
    if (memberId) return;
    setMemberId(selfMember?.id ?? members[0]?.id ?? "");
  }, [selfMember, members, memberId]);

  const member: ClubMember | undefined = members.find((m) => m.id === memberId) ?? selfMember;
  const plan = member ? MEMBERSHIP_PLANS[member.planId] : undefined;
  const isStaff = user ? user.role !== "member" : false;
  const isPendingConsent = Boolean(member && member.status === "pending_consent");

  const facilities = useMemo(() => (mounted ? facilitiesBySport(sport) : []), [mounted, sport]);
  const availability = useMemo(
    () => (mounted ? availabilityFor(date) : {}),
    [mounted, date, version]
  );
  const bookings = useMemo(() => (mounted ? bookingsOnDate(date) : []), [mounted, date, version]);

  const socialBlocks = useMemo(() => {
    if (!mounted) return {};
    const blocks: Record<string, string> = {};
    getSocialSessions()
      .filter((session) => session.date === date)
      .forEach((session) => {
        session.courtIds.forEach((courtId) => {
          TIME_SLOTS.forEach((slot) => {
            const start = labelToMinutes(slot);
            if (start >= labelToMinutes(session.start) && start < labelToMinutes(session.end)) {
              blocks[`${courtId}|${slot}`] = `${session.title} · shared court`;
            }
          });
        });
      });
    return blocks;
  }, [mounted, date, version]);

  const usedToday = member ? activeBookingsForMemberOnDate(member.id, date).length : 0;
  const facility = selected ? getFacility(selected.facilityId) : undefined;
  const price =
    facility && member ? priceFor(facility, member.planId) : facility ? priceFor(facility, "walk_in") : 0;
  const quote = selected && member ? canBook(member.id, date, selected.slot, selected.facilityId) : null;
  const social = mounted ? nextSocialSession() : undefined;

  const select = (facilityId: string, slot: string) => {
    setSelected({ facilityId, slot });
    setFlash(null);
  };

  const confirm = () => {
    if (!selected || !member || !facility) return;
    if (isPendingConsent) {
      setFlash({ tone: "clay", message: "Under DPDP Act 2023, court bookings are locked until guardian consent is verified." });
      return;
    }
    const result = createBooking({
      facilityId: selected.facilityId,
      date,
      start: selected.slot,
      memberId: member.id,
      memberName: member.fullName,
      planId: member.planId,
      source: isStaff ? "front_desk" : "member",
      paymentMode: price === 0 ? "plan" : "upi",
    });
    if (!result.ok) {
      setFlash({ tone: "clay", message: result.error ?? "Could not complete the booking." });
      return;
    }
    recordAuditLog({
      actor: user?.fullName,
      role: user?.role,
      action: "booking.created",
      entity: "bookings",
      entityId: result.booking?.id,
      details: { facility: facility.name, date, start: selected.slot, price },
    });
    setFlash({
      tone: "court",
      message: `${facility.name} · ${formatDate(date)} at ${selected.slot} booked for ${member.fullName.split(" ")[0]} (${price === 0 ? "included in plan" : inr(price)}).`,
    });
    setSelected(null);
    setVersion((v) => v + 1);
  };

  if (!mounted) {
    return (
      <div className="mx-auto max-w-[1400px] p-6">
        <div className="h-[520px] animate-pulse rounded-2xl bg-ink/[0.05]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-5 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Court booking · B1–B9"
        title="Eighteen arenas. One sheet."
        description="Sessions are sixty minutes and start every half hour. The grid already knows what is taken, so nobody can double-book a court."
        actions={
          <Link href="/dashboard/social" className="btn btn-outline btn-sm">
            <Dices className="h-3.5 w-3.5" />
            Friday social
          </Link>
        }
        meta={
          <>
            <StatusPill tone={usedToday >= DAILY_BOOKING_CAP ? "danger" : "success"}>
              {usedToday}/{DAILY_BOOKING_CAP} plays used today
            </StatusPill>
            <span className="u-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              {member ? planRateLabel(member.planId) : "Walk-in rate (+15%)"}
            </span>
            <span className="u-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              Open {String(OPEN_MINUTES / 60).padStart(2, "0")}:00–{String(CLOSE_MINUTES / 60).padStart(2, "0")}:00
            </span>
          </>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
          {Array.from({ length: 7 }).map((_, i) => {
            const day = offsetDate(i);
            const active = day === date;
            return (
              <button
                key={day}
                onClick={() => {
                  setDate(day);
                  setSelected(null);
                }}
                className={cn(
                  "flex min-w-[78px] shrink-0 flex-col items-start rounded-lg border px-3 py-2 text-left transition-colors",
                  active ? "border-ink bg-ink text-chalk" : "border-line bg-chalk hover:border-ink/40"
                )}
              >
                <span
                  className={cn(
                    "u-mono text-[8.5px] uppercase tracking-[0.12em]",
                    active ? "text-chalk/60" : "text-muted"
                  )}
                >
                  {i === 0
                    ? "Today"
                    : new Date(`${day}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short" })}
                </span>
                <span className="u-value mt-0.5 text-[12px]">
                  {new Date(`${day}T00:00:00`).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isStaff && (
            <select
              className="select max-w-[240px]"
              value={member?.id ?? ""}
              onChange={(event) => {
                setMemberId(event.target.value);
                setSelected(null);
              }}
              aria-label="Book on behalf of a member"
            >
              <option value="">Select a member…</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName} · {MEMBERSHIP_PLANS[m.planId].shortName}
                </option>
              ))}
            </select>
          )}
          <Segmented
            value={sport}
            onChange={(value) => {
              setSport(value);
              setSelected(null);
            }}
            size="sm"
            options={SPORT_TABS.map((item) => ({ value: item, label: item }))}
          />
        </div>
      </div>

      {flash && (
        <div
          className={cn(
            "flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-[12px]",
            flash.tone === "court"
              ? "border-court/30 bg-court/10 text-court"
              : "border-clay/40 bg-clay/10 text-clay-deep"
          )}
        >
          <span className="flex items-center gap-2">
            {flash.tone === "court" ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5" />
            )}
            {flash.message}
          </span>
          <button onClick={() => setFlash(null)} aria-label="Dismiss" className="opacity-70 hover:opacity-100">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-9">
          <Panel padded={false}>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2.5">
              <div className="u-eyebrow text-muted">
                {formatDate(date)} · {facilities.length} facilities
              </div>
              <div className="flex items-center gap-3 text-[9.5px] uppercase tracking-[0.1em] text-muted">
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-3 border border-court/30 bg-court/10" />
                  Free
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-3 bg-ink/10" />
                  Booked
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-3 bg-gold/25" />
                  Social
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-3 border border-line bg-paper-deep/70" />
                  Past
                </span>
              </div>
            </div>
            <div className="p-2 sm:p-3">
              <AvailabilityGrid
                facilities={facilities}
                availability={availability}
                bookings={bookings}
                selected={selected}
                onSelect={select}
                priceLabel={(f) => {
                  const p = priceFor(f, member?.planId ?? "walk_in");
                  return p === 0 ? "Included" : `${inr(p)}/hr`;
                }}
                socialBlocks={socialBlocks}
              />
            </div>
          </Panel>
        </div>

        <div className="space-y-4 xl:col-span-3 xl:sticky xl:top-6 self-start">
          <Panel>
            <div className="u-eyebrow text-muted">{selected ? "Confirm the slot" : "Pick a slot"}</div>
            {selected && facility ? (
              <div className="mt-2">
                <div className="u-display text-[16px] leading-tight">{facility.name}</div>
                <div className="mt-1 text-[11px] text-muted">
                  {facility.sport} · {facility.surface}
                </div>
                <div className="mt-3 rounded-lg border border-line bg-paper-soft p-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted">Date</span>
                    <span className="u-mono">{formatDate(date)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px]">
                    <span className="text-muted">Session</span>
                    <span className="u-mono">
                      {selected.slot}–{minutesToLabel(labelToMinutes(selected.slot) + 60)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px]">
                    <span className="text-muted">
                      {member ? MEMBERSHIP_PLANS[member.planId].shortName : "Walk-in"} rate
                    </span>
                    <span className="u-value text-[12.5px]">{price === 0 ? "Included" : inr(price)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px]">
                    <span className="text-muted">Daily cap</span>
                    <span className="u-mono">
                      {usedToday + 1}/{DAILY_BOOKING_CAP}
                    </span>
                  </div>
                </div>

                {isPendingConsent && (
                  <div className="mt-2 rounded-lg border border-gold/40 bg-gold/10 p-2.5 text-[10.5px] text-[#7d5d17] leading-relaxed">
                    <div className="font-semibold">DPDP Act 2023 · Parental Consent Required</div>
                    Court reservations are locked until your guardian verifies consent on file or at the front desk.
                  </div>
                )}

                {quote && !quote.ok && !isPendingConsent && (
                  <p className="mt-2 rounded-lg border border-clay/30 bg-clay/10 px-2.5 py-1.5 text-[10.5px] text-clay-deep">
                    {quote.reason}
                  </p>
                )}

                <button
                  className="btn btn-clay btn-block mt-3"
                  disabled={!member || isPendingConsent || (quote ? !quote.ok : true)}
                  onClick={confirm}
                >
                  <Check className="h-4 w-4" />
                  {isPendingConsent ? "Locked (Consent Pending)" : "Confirm booking"}
                </button>
                <button className="btn btn-quiet btn-sm btn-block mt-1" onClick={() => setSelected(null)}>
                  Clear
                </button>
                <p className="mt-2 text-center text-[9.5px] leading-relaxed text-muted">
                  Free cancellation up to {FREE_CANCELLATION_HOURS} hours before play.
                </p>
              </div>
            ) : (
              <div className="mt-2">
                <CalendarDays className="h-6 w-6 text-muted/50" />
                <p className="mt-2 text-[11px] leading-relaxed text-muted">
                  Tap any open cell. You will see the exact price and the daily-cap position before
                  anything is confirmed.
                </p>
                <div className="mt-3 border-t border-line pt-3 text-[10.5px] text-muted">
                  <div className="flex items-center justify-between">
                    <span>Plan</span>
                    <span className="text-ink">{plan?.name ?? "Walk-in"}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span>Rate</span>
                    <span className="text-ink">
                      {member ? planRateLabel(member.planId) : "Base +15%"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Panel>

          <div className="grid grid-cols-2 gap-2">
            <Stat label="Arenas" value="18" unit="bookable" />
            <Stat label="Session" value="60" unit="minutes" />
          </div>

          <Panel tone="deep">
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-court" />
              <div>
                <div className="u-display text-[12px]">No double bookings</div>
                <p className="mt-1 text-[10.5px] leading-relaxed text-muted">
                  Overlap is checked as a time range, not a start time: a 6:30 session cannot sit on
                  top of a 6:00 booking. The database enforces the same rule in production.
                </p>
              </div>
            </div>
          </Panel>

          {social && (
            <Panel>
              <div className="flex items-center justify-between">
                <div>
                  <div className="u-eyebrow text-clay">Friday social</div>
                  <div className="u-display mt-1 text-[12px]">{formatDate(social.date)}</div>
                  <div className="text-[10px] text-muted">
                    {social.players.length}/{social.capacity} players
                  </div>
                </div>
                <Users className="h-5 w-5 text-muted" />
              </div>
              <Link href="/dashboard/social" className="btn btn-ink btn-sm btn-block mt-3">
                Join the draw
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Panel>
          )}

          <div className="flex items-start gap-1.5 text-[10px] leading-relaxed text-muted">
            <Info className="mt-0.5 h-3 w-3 shrink-0" />
            Cancellations inside {FREE_CANCELLATION_HOURS} hours release the court but forfeit the fee.
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4 text-[10.5px] text-muted">
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          Slots open every 30 minutes
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {DAILY_BOOKING_CAP} plays per member per day
        </span>
        <span className="flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          Book up to 7 days ahead
        </span>
      </div>
    </div>
  );
}

