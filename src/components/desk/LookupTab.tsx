"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Coffee,
  Mail,
  Phone,
  QrCode,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  StickyNote,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, EmptyState, Panel, StatusPill } from "@/components/ui/kit";
import {
  getLocalMembers,
  getMemberById,
  MEMBERSHIP_PLANS,
  saveLocalMembers,
  searchMembers,
  type ClubMember,
  type MemberHistoryItem,
} from "@/lib/membership";
import { recordAuditLog } from "@/lib/audit";
import { useAuth } from "@/lib/auth-context";
import { inr } from "@/lib/store";
import {
  CopyButton,
  Fact,
  MEMBER_STATUS_META,
  PanelHead,
  PLAN_TONE,
  ageFromDob,
  dialNumber,
  stampLabel,
} from "./shared";

const HISTORY_ICON: Record<MemberHistoryItem["type"], React.ElementType> = {
  booking: CalendarDays,
  shop: ShoppingBag,
  bar: Coffee,
};

function dobLabel(dob: string) {
  const d = new Date(`${dob}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dob || "—";
  const age = ageFromDob(dob);
  return `${d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}${age !== null ? ` · ${age} yrs` : ""}`;
}

function dayLabel(dateOnly: string) {
  const d = new Date(`${dateOnly}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateOnly;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function LookupTab({
  initialQuery = "",
  onMutate,
  onOpenConsent,
}: {
  initialQuery?: string;
  onMutate?: () => void;
  onOpenConsent?: () => void;
}) {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [version, setVersion] = useState(0);
  const [query, setQuery] = useState(initialQuery);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(null), 2600);
    return () => clearTimeout(timer);
  }, [flash]);

  const results = useMemo(
    () => (mounted ? searchMembers(query) : []),
    [mounted, query, version]
  );
  const total = useMemo(() => (mounted ? searchMembers("").length : 0), [mounted, version]);
  const selected = useMemo(
    () => (selectedId ? getMemberById(selectedId) ?? null : null),
    [selectedId, version]
  );

  // A clean QR scan yields exactly one record — open it without a second tap.
  useEffect(() => {
    if (!mounted) return;
    if (selectedId && results.some((m) => m.id === selectedId)) return;
    if (results.length === 1) setSelectedId(results[0].id);
  }, [mounted, results, selectedId]);

  const refresh = () => {
    setVersion((v) => v + 1);
    onMutate?.();
  };

  const handleArrival = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected || !user) return;
    const members = getLocalMembers();
    const target = members.find((m) => m.id === selected.id);
    if (!target) return;
    const text = noteText.trim() || "Arrived at the front desk.";
    target.staffNotes = [
      ...(target.staffNotes ?? []),
      `[${stampLabel(new Date().toISOString())}] ${text} — logged by ${user.fullName}`,
    ];
    saveLocalMembers(members);
    void recordAuditLog({
      action: "desk_arrival_note",
      entity: "members",
      entityId: target.id,
      details: { note: text, staff: user.fullName },
    });
    setNoteText("");
    setNoteOpen(false);
    setFlash("Arrival note saved to the member record.");
    refresh();
  };

  const plan = selected ? MEMBERSHIP_PLANS[selected.planId] : null;
  const statusMeta = selected ? MEMBER_STATUS_META[selected.status] : null;

  const entitlements = plan
    ? [
        {
          label: "Court rate",
          value: plan.courtMultiplier === 0 ? "Included" : `${Math.round((1 - plan.courtMultiplier) * 100)}% off`,
        },
        { label: "Pro shop", value: `${plan.shopDiscountPct}% off` },
        { label: "Bar & lounge", value: `${plan.barDiscountPct}% off` },
        { label: "Friday social", value: plan.freeFridaySocial ? "Included" : "Guest rate" },
      ]
    : [];

  const daysLeft = selected
    ? (() => {
        const end = new Date(`${selected.membershipEnd}T00:00:00`).getTime();
        if (Number.isNaN(end)) return null;
        return Math.ceil((end - Date.now()) / 86400000);
      })()
    : null;

  return (
    <div className="space-y-4">
      {flash && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-court/30 bg-court/10 px-4 py-2.5 text-[11.5px] font-medium text-court"
        >
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> {flash}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        {/* ── results column ─────────────────────────────────────────── */}
        <Panel className="space-y-4">
          <PanelHead
            eyebrow="A5 · Lookup & scan"
            title="Find a member"
            action={<span className="chip">{mounted ? `${results.length} / ${total}` : "…"}</span>}
          />

          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search members by QR pass, member code, phone, email or name"
              placeholder="Scan QR pass or search code, phone (+91), email, name…"
              className="input pl-10"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <p className="-mt-1 text-[10.5px] leading-snug text-muted">
            A pass scan reads as the member code. Try{" "}
            <span className="u-mono text-ink">TCC-2026-GOLD-001</span>, a phone number, or an email.
          </p>

          <div className="-mr-1 max-h-[520px] space-y-2 overflow-y-auto pr-1">
            {!mounted ? (
              <div className="u-eyebrow py-10 text-center text-muted">Reading the register…</div>
            ) : results.length === 0 ? (
              <EmptyState
                title="No member matched"
                description="Check the spelling, or register this person as a walk-in to open a new record."
                action={
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setQuery("")}>
                    Clear search
                  </button>
                }
              />
            ) : (
              results.map((member) => {
                const memberPlan = MEMBERSHIP_PLANS[member.planId];
                const active = selectedId === member.id;
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setSelectedId(member.id)}
                    aria-pressed={active}
                    className={cn(
                      "w-full rounded-xl border px-3.5 py-3 text-left transition",
                      active
                        ? "border-clay bg-clay/[0.06]"
                        : "border-line bg-chalk hover:border-ink/40"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-semibold text-ink">{member.fullName}</div>
                        <div className="u-mono mt-0.5 text-[10.5px] text-muted">{member.memberCode}</div>
                      </div>
                      <StatusPill tone={PLAN_TONE[member.planId]}>
                        {memberPlan.name.split(" ")[0]}
                      </StatusPill>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <StatusPill tone={MEMBER_STATUS_META[member.status].tone}>
                        {MEMBER_STATUS_META[member.status].label}
                      </StatusPill>
                      <span className="u-mono text-[10px] text-muted">{member.phone}</span>
                      {member.duesPending > 0 && (
                        <span className="u-mono text-[10px] font-semibold uppercase tracking-wider text-clay-deep">
                          Dues {inr(member.duesPending)}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Panel>

        {/* ── detail column ──────────────────────────────────────────── */}
        {selected && plan && statusMeta ? (
          <Panel className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
              <div className="flex min-w-0 items-start gap-3">
                <Avatar name={selected.fullName} tone={selected.planId === "gold" ? "clay" : "ink"} size={46} />
                <div className="min-w-0">
                  <div className="u-display text-xl text-ink">{selected.fullName}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="u-mono text-[11px] text-muted">{selected.memberCode}</span>
                    <CopyButton value={selected.memberCode} label="Copy code" />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <StatusPill tone={PLAN_TONE[selected.planId]}>{plan.name}</StatusPill>
                <StatusPill tone={statusMeta.tone}>{statusMeta.label}</StatusPill>
              </div>
            </div>

            {selected.duesPending > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-clay/40 bg-clay/10 p-4">
                <div className="flex items-start gap-2.5">
                  <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-clay-deep" />
                  <div>
                    <div className="text-[12px] font-semibold text-clay-deep">
                      Unsettled dues {inr(selected.duesPending, 2)}
                    </div>
                    <p className="mt-0.5 text-[10.5px] leading-snug text-muted">
                      Collect at the bar counter before the next court booking. Tabs are cleared by the bar team.
                    </p>
                  </div>
                </div>
                <span className="chip chip-clay">Settle at bar</span>
              </div>
            )}

            {selected.status === "pending_consent" && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold/40 bg-gold/10 p-4">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#7d5d17]" />
                  <div>
                    <div className="text-[12px] font-semibold text-[#7d5d17]">Guardian consent pending</div>
                    <p className="mt-0.5 text-[10.5px] leading-snug text-muted">
                      DPDP Act 2023 — this minor's pass stays locked until a guardian verifies in person at the desk.
                    </p>
                  </div>
                </div>
                {onOpenConsent && (
                  <button type="button" className="btn btn-outline btn-sm" onClick={onOpenConsent}>
                    Open consent queue
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Fact
                label="Phone"
                value={
                  <a href={`tel:${dialNumber(selected.phone)}`} className="u-link">
                    {selected.phone}
                  </a>
                }
              />
              <Fact
                label="Email"
                value={
                  <a href={`mailto:${selected.email}`} className="u-link break-all">
                    {selected.email}
                  </a>
                }
              />
              <Fact label="Date of birth" value={dobLabel(selected.dob)} mono />
              <Fact label="Member since" value={dayLabel(selected.membershipStart)} mono />
              <Fact
                label="Valid thru"
                value={
                  <span className="u-mono">
                    {dayLabel(selected.membershipEnd)}
                    {daysLeft !== null && (
                      <span className="ml-1.5 text-[10px] uppercase tracking-wider text-muted">
                        {daysLeft >= 0 ? `· ${daysLeft}d left` : "· expired"}
                      </span>
                    )}
                  </span>
                }
              />
              <Fact
                label="Dues"
                value={selected.duesPending > 0 ? inr(selected.duesPending, 2) : "Clear"}
                mono
              />
            </div>

            {selected.isMinor && (
              <div className="rounded-xl border border-line bg-paper-soft p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="u-eyebrow text-muted">Guardian on file · DPDP</div>
                  {selected.consentVerifiedAt ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-court">
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-clay-deep">
                      <ShieldAlert className="h-3 w-3" /> Awaiting verification
                    </span>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <Fact label="Guardian" value={selected.guardianName || "Not recorded"} />
                  <Fact label="Guardian phone" value={selected.guardianPhone || "Not recorded"} mono />
                  <Fact label="Guardian email" value={selected.guardianEmail || "Not recorded"} />
                </div>
                {selected.consentVerifiedAt && (
                  <p className="mt-3 u-mono text-[10px] leading-relaxed text-muted">
                    Verified {stampLabel(selected.consentVerifiedAt)} · {selected.consentVerifiedBy ?? "Front desk"}
                  </p>
                )}
              </div>
            )}

            <div>
              <div className="u-eyebrow mb-2 text-muted">Plan entitlements</div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {entitlements.map((item) => (
                  <div key={item.label} className="rounded-lg border border-line bg-paper-soft p-3">
                    <div className="u-label mb-1">{item.label}</div>
                    <div className="u-value text-[13px] text-ink">{item.value}</div>
                  </div>
                ))}
              </div>
              <ul className="mt-3 space-y-1.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2 text-[11.5px] leading-snug text-muted">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-court" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="u-eyebrow text-muted">Staff notes</div>
                {!noteOpen && (
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setNoteOpen(true)}>
                    <StickyNote className="h-3.5 w-3.5" /> Log arrival
                  </button>
                )}
              </div>

              {(selected.staffNotes?.length ?? 0) > 0 ? (
                <ul className="mt-2 divide-y divide-line rounded-xl border border-line">
                  {(selected.staffNotes ?? []).map((note, index) => (
                    <li key={`${selected.id}-note-${index}`} className="px-3.5 py-2.5 text-[11.5px] leading-relaxed text-ink-soft">
                      {note}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-[11.5px] text-muted">No staff notes yet.</p>
              )}

              {noteOpen && (
                <form onSubmit={handleArrival} className="mt-3 space-y-2">
                  <label htmlFor="arrival-note" className="u-label">
                    Arrival note
                  </label>
                  <textarea
                    id="arrival-note"
                    rows={2}
                    value={noteText}
                    onChange={(event) => setNoteText(event.target.value)}
                    placeholder="e.g. Arrived 18:40 for Centre Court 1, asked to extend by 30 min."
                    className="input resize-none"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button type="submit" className="btn btn-ink btn-sm">
                      Save note
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setNoteOpen(false);
                        setNoteText("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="u-eyebrow text-muted">Activity ledger</div>
                <span className="u-mono text-[10px] text-muted">{selected.history.length} entries</span>
              </div>
              <div className="mt-2 max-h-64 space-y-2 overflow-y-auto pr-1">
                {selected.history.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-[11.5px] text-muted">
                    No bookings, shop or bar activity yet.
                  </p>
                ) : (
                  selected.history.map((item) => {
                    const Icon = HISTORY_ICON[item.type] ?? CalendarDays;
                    const amount = inr(item.amount, Number.isInteger(item.amount) ? 0 : 2);
                    return (
                      <div key={item.id} className="flex items-start gap-3 rounded-xl border border-line bg-paper-soft p-3">
                        <span className="mt-0.5 rounded-full border border-line bg-chalk p-1.5 text-ink">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="text-[12px] font-semibold text-ink">{item.title}</div>
                            <div className="u-value text-[12px] text-ink">{amount}</div>
                          </div>
                          <div className="mt-0.5 text-[11px] leading-snug text-muted">{item.details}</div>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className="u-mono text-[9.5px] uppercase tracking-[0.14em] text-muted">{item.date}</span>
                            {item.status !== "completed" && (
                              <StatusPill
                                tone={
                                  item.status === "unsettled"
                                    ? "danger"
                                    : item.status === "active"
                                    ? "info"
                                    : "neutral"
                                }
                              >
                                {item.status}
                              </StatusPill>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </Panel>
        ) : (
          <Panel className="flex min-h-[320px] items-center justify-center">
            <EmptyState
              title="Scan a pass to begin"
              description="Pick a member from the register to see their identity, entitlements, dues, notes and activity history."
              action={
                <span className="inline-flex items-center gap-2 text-muted">
                  <QrCode className="h-5 w-5" />
                  <span className="u-mono text-[10px] uppercase tracking-[0.16em]">QR · Code · Phone · Name</span>
                </span>
              }
            />
          </Panel>
        )}
      </div>
    </div>
  );
}
