"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Check,
  Clock,
  Dices,
  MapPin,
  Plus,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { EmptyState, Meter, PageHeader, Panel, Stat, StatusPill } from "@/components/ui/kit";
import { useAuth } from "@/lib/auth-context";
import {
  SOCIAL_CAPACITY,
  SOCIAL_GUEST_FEE,
  buildRotation,
  getFacility,
  getSocialSessions,
  joinSocial,
  leaveSocial,
  paySocialGuest,
  socialDateLabel,
  type SocialSession,
} from "@/lib/bookings";
import { getLocalMembers, MEMBERSHIP_PLANS } from "@/lib/membership";
import { recordAuditLog } from "@/lib/audit";
import { inr } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function FridaySocialPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [version, setVersion] = useState(0);
  const [sessionId, setSessionId] = useState<string>("");
  const [guestName, setGuestName] = useState("");
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const sessions = useMemo(() => (mounted ? getSocialSessions() : []), [mounted, version]);
  const session: SocialSession | undefined =
    sessions.find((s) => s.id === sessionId) ?? sessions[0];

  const member = useMemo(() => {
    if (!mounted || !user) return undefined;
    return getLocalMembers().find((m) => m.email.toLowerCase() === user.email.toLowerCase());
  }, [mounted, user]);

  const plan = member ? MEMBERSHIP_PLANS[member.planId] : undefined;
  const myName = member?.fullName ?? user?.fullName ?? "";
  const onRoster = session?.players.find((p) => p.name.toLowerCase() === myName.toLowerCase());
  const seatsLeft = session ? Math.max(0, session.capacity - session.players.length) : 0;
  const fee = plan?.id === "gold" ? 0 : session?.guestFee ?? SOCIAL_GUEST_FEE;

  const note = (message: string) => {
    setFlash(message);
    window.setTimeout(() => setFlash(null), 3600);
  };

  const join = (asGuest = false) => {
    if (!session) return;
    const name = asGuest ? guestName.trim() : myName;
    if (!name) return;
    const result = joinSocial(session.id, {
      name,
      memberId: asGuest ? undefined : member?.id ?? user?.id,
      type: asGuest || plan?.id !== "gold" ? "guest" : "gold",
    });
    if (!result.ok || !result.player) {
      note(result.error ?? "Could not join the session.");
      return;
    }
    if (result.fee && result.fee > 0) {
      paySocialGuest(session.id, result.player.id, "upi");
    }
    recordAuditLog({
      actor: user?.fullName,
      role: user?.role,
      action: asGuest ? "social.guest_join" : "social.join",
      entity: "social_sessions",
      entityId: session.id,
      details: { name, fee: result.fee ?? 0 },
    });
    setGuestName("");
    setVersion((v) => v + 1);
    note(
      result.fee
        ? `${name} added. Guest fee ${inr(result.fee)} collected by UPI (simulated).`
        : `${name} added to the roster. Included with Gold.`
    );
  };

  const leave = (playerId: string) => {
    if (!session) return;
    const result = leaveSocial(session.id, playerId);
    if (result.ok) {
      setVersion((v) => v + 1);
      note("Spot released to the waitlist.");
    } else {
      note(result.error ?? "Could not release the spot.");
    }
    recordAuditLog({
      actor: user?.fullName,
      role: user?.role,
      action: "social.leave",
      entity: "social_sessions",
      entityId: session.id,
      details: { playerId },
    });
  };

  if (!mounted) {
    return <div className="mx-auto max-w-[1200px] p-6"><div className="h-96 animate-pulse rounded-2xl bg-ink/[0.05]" /></div>;
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-[1200px] p-6">
        <EmptyState title="No social sessions scheduled" description="The manager creates the next Friday draw on Monday morning." />
      </div>
    );
  }

  const rotation = buildRotation(session, 3);
  const fill = (session.players.length / session.capacity) * 100;

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-5 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Friday night social · B7"
        title="Twenty players. Three courts. One draw."
        description="Rotating doubles on shared courts. Every player gets a partner and an opponent they haven't had yet — the draw is deterministic, so the argument is settled before the first ball."
        actions={
          <Link href="/dashboard/courts" className="btn btn-outline btn-sm">
            <CalendarDays className="h-3.5 w-3.5" />
            Court grid
          </Link>
        }
        meta={
          <>
            <StatusPill tone={seatsLeft > 0 ? "success" : "danger"}>
              <Users className="h-3 w-3" /> {session.players.length}/{session.capacity} on the roster
            </StatusPill>
            <span className="u-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              Guest fee {inr(session.guestFee)} · free for Gold
            </span>
            <span className="u-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              {session.courtIds.length} courts · {session.start}–{session.end}
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

      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
        {sessions.map((option) => (
          <button
            key={option.id}
            onClick={() => setSessionId(option.id)}
            className={cn(
              "min-w-[220px] shrink-0 rounded-xl border p-3 text-left transition-colors",
              option.id === session.id ? "border-ink bg-ink text-chalk" : "border-line bg-chalk hover:border-ink/40"
            )}
          >
            <div className={cn("u-eyebrow", option.id === session.id ? "text-clay-soft" : "text-clay")}>
              {socialDateLabel(option.date)}
            </div>
            <div className="u-display mt-1 text-[14px]">{option.title}</div>
            <div className={cn("mt-1 text-[10.5px]", option.id === session.id ? "text-chalk/60" : "text-muted")}>
              {option.start}–{option.end} · {option.players.length}/{option.capacity} players
            </div>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <Panel>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="u-eyebrow text-clay">{session.title}</div>
                <div className="u-display mt-1 text-[clamp(1.4rem,3vw,2rem)]">{socialDateLabel(session.date)}</div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-muted">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {session.start}–{session.end}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {session.courtIds.map((id) => getFacility(id)?.name ?? id).join(" · ")}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="u-value text-3xl">{session.players.length}</div>
                <div className="u-eyebrow text-[9px] text-muted">of {session.capacity} players</div>
              </div>
            </div>

            <div className="mt-4">
              <Meter value={fill} tone={fill >= 90 ? "clay" : "court"} />
              <div className="mt-1.5 flex items-center justify-between text-[10.5px] text-muted">
                <span>{seatsLeft} seat{seatsLeft === 1 ? "" : "s"} left</span>
                <span>{Math.round(fill)}% full</span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-end gap-2 border-t border-line pt-4">
              {onRoster ? (
                <>
                  <StatusPill tone="success">
                    <Check className="h-3 w-3" /> You&apos;re on the roster
                  </StatusPill>
                  {onRoster.paid ? (
                    <StatusPill tone="info">Spot paid</StatusPill>
                  ) : (
                    <button
                      className="btn btn-clay btn-sm"
                      onClick={() => {
                        paySocialGuest(session.id, onRoster.id, "upi");
                        setVersion((v) => v + 1);
                        note(`Guest fee ${inr(session.guestFee)} collected.`);
                      }}
                    >
                      Pay {inr(session.guestFee)}
                    </button>
                  )}
                  <button className="btn btn-outline btn-sm" onClick={() => leave(onRoster.id)}>
                    Release my spot
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn btn-clay"
                    disabled={seatsLeft === 0}
                    onClick={() => join(false)}
                  >
                    <Dices className="h-4 w-4" />
                    {fee === 0 ? "Join — included with Gold" : `Join — pay ${inr(fee)}`}
                  </button>
                  <p className="max-w-xs text-[10.5px] leading-relaxed text-muted">
                    {seatsLeft === 0
                      ? "This draw is full. Ask the desk to add you to the waitlist."
                      : `Joining counts as one of your two daily plays. There is no refund inside 12 hours.`}
                  </p>
                </>
              )}
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <div className="u-eyebrow text-muted">The roster</div>
                <div className="u-display mt-0.5 text-[13px]">Who is playing</div>
              </div>
              <StatusPill tone="neutral">{session.players.length} names</StatusPill>
            </div>
            <ul className="mt-1 divide-y divide-line-soft">
              {session.players.map((player) => {
                const mine = player.name.toLowerCase() === myName.toLowerCase();
                return (
                  <li key={player.id} className="flex items-center justify-between gap-3 py-2">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="u-mono w-6 text-[9.5px] text-muted">
                        {String(session.players.indexOf(player) + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <div className={cn("truncate text-[12px]", mine && "font-medium")}>
                          {player.name} {mine && <span className="text-[9.5px] text-muted">(you)</span>}
                        </div>
                        <div className="text-[9.5px] uppercase tracking-[0.1em] text-muted">
                          {player.type === "gold" ? "Gold member" : "Guest"}
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusPill tone={player.paid ? "success" : "warn"}>{player.paid ? "Paid" : "Unpaid"}</StatusPill>
                      {(mine || user?.role !== "member") && (
                        <button
                          onClick={() => leave(player.id)}
                          className="rounded-full border border-line p-1 text-muted hover:border-clay hover:text-clay"
                          aria-label={`Remove ${player.name}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>

        <div className="space-y-4 lg:col-span-5">
          <Panel tone="deep">
            <div className="u-eyebrow text-muted">Add a guest</div>
            <p className="mt-1 text-[11px] text-muted">
              Guests pay {inr(session.guestFee)} on the spot. Gold members play free.
            </p>
            <div className="mt-3 flex gap-2">
              <input
                className="input"
                placeholder="Guest full name"
                value={guestName}
                onChange={(event) => setGuestName(event.target.value)}
                aria-label="Guest name"
              />
              <button
                className="btn btn-ink btn-sm shrink-0"
                disabled={!guestName.trim() || seatsLeft === 0}
                onClick={() => join(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>
            <div className="mt-3 flex items-start gap-2 text-[10px] leading-relaxed text-muted">
              <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0" />
              Guest details are used for this session only and are not added to the member registry.
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center justify-between border-b border-line pb-2">
              <div>
                <div className="u-eyebrow text-muted">The draw</div>
                <div className="u-display mt-0.5 text-[13px]">Rotating doubles</div>
              </div>
              <Dices className="h-4 w-4 text-muted" />
            </div>
            {rotation.length === 0 ? (
              <p className="py-6 text-center text-[11px] text-muted">
                Four players are needed before the draw can be made.
              </p>
            ) : (
              <div className="mt-2 space-y-3">
                {rotation.map((round) => (
                  <div key={round.round}>
                    <div className="u-mono text-[9.5px] uppercase tracking-[0.14em] text-clay">
                      Round {round.round}
                    </div>
                    <ul className="mt-1 space-y-1">
                      {round.pairings.map((pairing) => (
                        <li key={`${round.round}-${pairing.court}`} className="flex items-center justify-between gap-2 text-[10.5px]">
                          <span className="u-mono shrink-0 text-[9px] text-muted">
                            {getFacility(pairing.court)?.code ?? pairing.court}
                          </span>
                          <span className="min-w-0 truncate">
                            {pairing.teamA.join(" / ")} <span className="text-muted">vs</span>{" "}
                            {pairing.teamB.join(" / ")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-3 border-t border-line-soft pt-2 text-[9.5px] leading-relaxed text-muted">
              Draw is seeded from the roster order, so refreshing the page never reshuffles the night.
            </p>
          </Panel>

          <div className="grid grid-cols-3 gap-2">
            <Stat label="Courts" value={String(session.courtIds.length)} unit="shared" />
            <Stat label="Capacity" value={String(SOCIAL_CAPACITY)} unit="players" />
            <Stat label="Guest fee" value={inr(SOCIAL_GUEST_FEE)} unit="per head" />
          </div>
        </div>
      </div>
    </div>
  );
}
