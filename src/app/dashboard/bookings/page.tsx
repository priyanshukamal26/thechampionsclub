"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Check,
  Clock,
  Info,
  MapPin,
  ShieldCheck,
  X,
} from "lucide-react";
import { EmptyState, PageHeader, Panel, Stat, StatusPill } from "@/components/ui/kit";
import { Modal, Segmented } from "@/components/ui/overlay";
import { useAuth } from "@/lib/auth-context";
import { resolveMemberForUser } from "@/components/dashboard/member";
import {
  DAILY_BOOKING_CAP,
  FREE_CANCELLATION_HOURS,
  bookingsForMember,
  bookingsOnDate,
  cancelBooking,
  cancellationQuote,
  checkInBooking,
  getFacility,
  upcomingBookingsForMember,
  type Booking,
} from "@/lib/bookings";
import { getLocalMembers, MEMBERSHIP_PLANS, type ClubMember } from "@/lib/membership";
import { recordAuditLog } from "@/lib/audit";
import { formatDate, inr, labelToMinutes, minutesToLabel, todayISO } from "@/lib/store";
import { cn } from "@/lib/utils";

type View = "upcoming" | "past" | "all";

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [version, setVersion] = useState(0);
  const [view, setView] = useState<View>("upcoming");
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const member: ClubMember | undefined = useMemo(() => {
    if (!mounted || !user) return undefined;
    return resolveMemberForUser(user);
  }, [mounted, user]);

  const isStaff = user ? user.role !== "member" : false;
  const isDeskAdmin = user ? ["owner", "manager", "front_desk"].includes(user.role) : false;
  const isCafeManager = user?.role === "cafe_manager";

  const rows = useMemo(() => {
    if (!mounted) return [];
    if (isStaff) return bookingsOnDate(todayISO()).sort((a, b) => a.start.localeCompare(b.start));
    if (!member) return [];
    const all = bookingsForMember(member.id);
    if (view === "upcoming") return upcomingBookingsForMember(member.id);
    if (view === "past") return all.filter((b) => `${b.date}T${b.start}` < new Date().toISOString().slice(0, 16)).reverse();
    return all.sort((a, b) => `${b.date}T${b.start}`.localeCompare(`${a.date}T${a.start}`));
  }, [mounted, isStaff, member, view, version]);

  const next = useMemo(
    () => (mounted && member ? upcomingBookingsForMember(member.id)[0] : undefined),
    [mounted, member, version]
  );

  const note = (message: string) => {
    setFlash(message);
    window.setTimeout(() => setFlash(null), 3600);
  };

  const confirmCancel = () => {
    if (!cancelTarget) return;
    const result = cancelBooking(cancelTarget.id, "Cancelled from the member bookings screen");
    if (result.ok) {
      recordAuditLog({
        actor: user?.fullName,
        role: user?.role,
        action: "booking.cancelled",
        entity: "bookings",
        entityId: cancelTarget.id,
        details: { free: result.free, fee: result.fee },
      });
      note(
        result.free
          ? "Cancelled inside the free window. The court is back on the sheet."
          : `Late cancellation. The court is released and ${inr(result.fee ?? 0)} is forfeited.`
      );
      setVersion((v) => v + 1);
    } else {
      note(result.error ?? "Could not cancel that booking.");
    }
    setCancelTarget(null);
  };

  if (!mounted) {
    return <div className="mx-auto max-w-[1100px] p-6"><div className="h-80 animate-pulse rounded-2xl bg-ink/[0.05]" /></div>;
  }

  const plan = member ? MEMBERSHIP_PLANS[member.planId] : undefined;

  return (
    <div className="mx-auto max-w-[1100px] space-y-6 p-5 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow={
          isCafeManager
            ? "Bar & cafeteria · court footfall schedule"
            : isStaff
              ? "Front desk · today's courts"
              : "My bookings · B6"
        }
        title={isStaff ? "Today's court sheet." : "Your court, your time."}
        description={
          isCafeManager
            ? "Real-time schedule of all court sessions today. Track match completions to prepare table turnaround and post-match beverage orders."
            : isStaff
              ? "Every session booked for today, across all members. Check a player in when they arrive at the counter."
              : "Bookings, cancellations and the twelve-hour rule in one place. The court is released the moment you cancel."
        }
        actions={
          <Link href="/dashboard/courts" className="btn btn-clay btn-sm">
            <CalendarDays className="h-3.5 w-3.5" />
            Book another
          </Link>
        }
        meta={
          <>
            <StatusPill tone="info">
              <Clock className="h-3 w-3" /> {FREE_CANCELLATION_HOURS}h free cancellation
            </StatusPill>
            <span className="u-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              {isStaff ? `${rows.length} sessions today` : `${DAILY_BOOKING_CAP} plays per day`}
            </span>
            {member && (
              <span className="u-mono text-[10px] uppercase tracking-[0.14em] text-muted">{member.memberCode}</span>
            )}
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

      {!isStaff && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Upcoming" value={String(upcomingBookingsForMember(member?.id ?? "").length)} unit="sessions" note="Confirmed ahead" />
          <Stat
            label="Next up"
            value={next ? next.start : "—"}
            unit={next ? formatDate(next.date) : ""}
            note={next ? getFacility(next.facilityId)?.name : "Nothing booked"}
          />
          <Stat label="Plays left" value={`${DAILY_BOOKING_CAP - (member ? bookingsOnDate(todayISO()).filter((b) => b.memberId === member.id && b.status === "confirmed").length : 0)}`} unit={`of ${DAILY_BOOKING_CAP}`} note="Today" />
          <Stat label="Plan rate" value={plan?.shortName ?? "—"} unit="member" note={plan?.courtDiscountText} />
        </div>
      )}

      <Panel padded={false}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2.5">
          <div className="u-eyebrow text-muted">
            {isStaff ? "Today · all members" : "Your sessions"}
          </div>
          {!isStaff && (
            <Segmented
              size="sm"
              value={view}
              onChange={(value) => setView(value)}
              options={[
                { value: "upcoming", label: "Upcoming" },
                { value: "past", label: "Past" },
                { value: "all", label: "All" },
              ]}
            />
          )}
        </div>

        {rows.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title={isStaff ? "No sessions booked today" : "No sessions booked yet"}
              description={
                isStaff
                  ? "The sheet is clear. Walk-ins can be booked from the court grid."
                  : "When you book a court it will appear here, with the exact cancellation terms."
              }
              action={
                <Link href="/dashboard/courts" className="btn btn-ink btn-sm">
                  Open the grid
                </Link>
              }
            />
          </div>
        ) : (
          <ul className="divide-y divide-line-soft">
            {rows.map((booking) => {
              const facility = getFacility(booking.facilityId);
              const quote = cancellationQuote(booking);
              const isPast = new Date(`${booking.date}T${booking.start}:00`).getTime() < Date.now();
              return (
                <li key={booking.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className={cn("flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg border", isPast ? "border-line bg-paper-deep/50" : "border-court/30 bg-court/[0.06]")}>
                      <span className="u-mono text-[9px] uppercase text-muted">{formatDate(booking.date).split(" ")[1] ?? ""}</span>
                      <span className="u-mono text-[10px] font-medium text-ink">{booking.start}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-[12.5px] font-medium">{facility?.name}</span>
                        <StatusPill tone={booking.status === "confirmed" ? (isPast ? "neutral" : "success") : "danger"}>
                          {booking.status === "confirmed" ? (isPast ? "Played" : "Confirmed") : booking.status}
                        </StatusPill>
                        {booking.checkedIn && <StatusPill tone="info">Checked in</StatusPill>}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10.5px] text-muted">
                        <span>{formatDate(booking.date)}</span>
                        <span>
                          {booking.start}–{minutesToLabel(labelToMinutes(booking.start) + booking.durationMin)}
                        </span>
                        <span>{facility?.sport} · {facility?.surface}</span>
                        {isStaff && <span>{booking.memberName}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <div className="text-right">
                      <div className="u-value text-[12.5px]">{booking.price === 0 ? "Included" : inr(booking.price)}</div>
                      {booking.status === "confirmed" && !isPast && (
                        <div className={cn("text-[9.5px]", quote.free ? "text-court" : "text-clay-deep")}>
                          {quote.free ? "Free cancellation" : `Late fee ${inr(quote.fee)}`}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      {isDeskAdmin && booking.status === "confirmed" && !booking.checkedIn && !isPast && (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => {
                            checkInBooking(booking.id);
                            recordAuditLog({
                              actor: user?.fullName,
                              role: user?.role,
                              action: "booking.checked_in",
                              entity: "bookings",
                              entityId: booking.id,
                            });
                            setVersion((v) => v + 1);
                            note(`${booking.memberName.split(" ")[0]} checked in.`);
                          }}
                        >
                          Check in
                        </button>
                      )}
                      {booking.status === "confirmed" && (isDeskAdmin || (!isStaff && !isPast)) && (
                        <button className="btn btn-quiet btn-sm" onClick={() => setCancelTarget(booking)}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      {!isStaff && (
        <Panel tone="deep">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
            <div>
              <div className="u-display text-[12px]">The twelve-hour rule</div>
              <p className="mt-1 text-[10.5px] leading-relaxed text-muted">
                Cancel at least {FREE_CANCELLATION_HOURS} hours before the session and the court is released
                with no charge. Inside that window the court still reopens for someone else, but the fee is
                forfeited. Front desk staff can waive the fee for medical or travel reasons.
              </p>
            </div>
          </div>
        </Panel>
      )}

      <Modal
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        eyebrow="Cancellation"
        title={cancelTarget ? `${getFacility(cancelTarget.facilityId)?.name} · ${cancelTarget.start}` : ""}
        footer={
          <div className="flex justify-end gap-2">
            <button className="btn btn-outline btn-sm" onClick={() => setCancelTarget(null)}>
              Keep booking
            </button>
            <button className="btn btn-clay btn-sm" onClick={confirmCancel}>
              Cancel session
            </button>
          </div>
        }
      >
        {cancelTarget && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-[11.5px]">
              <div className="rounded-lg border border-line bg-paper-soft p-2.5">
                <div className="u-eyebrow text-[8.5px]">Session</div>
                <div className="mt-1">{formatDate(cancelTarget.date)}</div>
                <div className="u-mono text-[10.5px] text-muted">{cancelTarget.start}–{minutesToLabel(labelToMinutes(cancelTarget.start) + cancelTarget.durationMin)}</div>
              </div>
              <div className="rounded-lg border border-line bg-paper-soft p-2.5">
                <div className="u-eyebrow text-[8.5px]">Charge if cancelled</div>
                <div className="mt-1 u-value">
                  {cancellationQuote(cancelTarget).free ? inr(0) : inr(cancellationQuote(cancelTarget).fee)}
                </div>
                <div className={cn("text-[10px]", cancellationQuote(cancelTarget).free ? "text-court" : "text-clay-deep")}>
                  {cancellationQuote(cancelTarget).free ? "Inside free window" : "Late cancellation"}
                </div>
              </div>
            </div>
            <p className="text-[11px] leading-relaxed text-muted">
              The slot is released immediately and the next member on the sheet can take it.
              {!cancellationQuote(cancelTarget).free &&
                " Because this is inside twelve hours, the club keeps the fee."}
            </p>
            <p className="flex items-center gap-1.5 text-[10px] text-muted">
              <MapPin className="h-3 w-3" />
              Opening hours 06:00–23:00 · front desk +91 80 4123 8800
            </p>
          </div>
        )}
      </Modal>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4 text-[10.5px] text-muted">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5" />
          Overlaps are impossible: the booking engine checks the full time range.
        </span>
        <Link href="/dashboard/social" className="u-link">Friday social draw →</Link>
      </div>
    </div>
  );
}
