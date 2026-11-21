"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ClipboardList,
  Mail,
  Phone,
  ScanLine,
  ShieldAlert,
  UserPlus,
  Users,
} from "lucide-react";
import { EmptyState, PageHeader, Panel, Stat, StatusPill } from "@/components/ui/kit";
import { Tabs } from "@/components/ui/overlay";
import { LookupTab } from "@/components/desk/LookupTab";
import { RegisterTab } from "@/components/desk/RegisterTab";
import { LEAD_STATUS_TONE } from "@/components/desk/shared";
import { useAuth } from "@/lib/auth-context";
import { getPendingConsentQueue, verifyJuniorConsent } from "@/lib/membership";
import {
  LEAD_STATUS_LABEL,
  addLeadNote,
  convertLead,
  getLeads,
  leadDateLabel,
  leadStats,
  sendQuote,
  updateLeadStatus,
  type Lead,
  type LeadStatus,
} from "@/lib/leads";
import { recordAuditLog } from "@/lib/audit";
import { inr } from "@/lib/store";
import { cn } from "@/lib/utils";

type DeskTab = "lookup" | "register" | "consent" | "leads";

export default function FrontDeskPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<DeskTab>("lookup");
  const [version, setVersion] = useState(0);

  useEffect(() => setMounted(true), []);

  const queue = useMemo(() => (mounted ? getPendingConsentQueue() : []), [mounted, version]);
  const stats = useMemo(() => (mounted ? leadStats() : null), [mounted, version]);

  const refresh = () => setVersion((v) => v + 1);

  const verify = (memberId: string, name: string) => {
    verifyJuniorConsent(memberId, `${user?.fullName ?? "Front desk"} (Front Desk)`);
    recordAuditLog({
      actor: user?.fullName,
      role: user?.role,
      action: "consent.verified",
      entity: "members",
      entityId: memberId,
      details: { method: "in_person", member: name },
    });
    refresh();
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-5 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Front desk · DSK-3 · DSK-4 · DSK-5 · E6–E10"
        title="The counter, at a glance."
        description="Recognise a member in seconds, register a walk-in, verify a guardian's consent, and keep every enquiry moving. One screen for the queue that used to live on paper."
        actions={
          <>
            <button className="btn btn-outline btn-sm" onClick={() => setTab("register")}>
              <UserPlus className="h-3.5 w-3.5" />
              Register walk-in
            </button>
            <Link href="/dashboard/courts" className="btn btn-ink btn-sm">
              <ScanLine className="h-3.5 w-3.5" />
              Book for a member
            </Link>
          </>
        }
        meta={
          <>
            <StatusPill tone={queue.length ? "warn" : "success"}>
              <ShieldAlert className="h-3 w-3" />
              {queue.length} consent verification{queue.length === 1 ? "" : "s"}
            </StatusPill>
            <span className="u-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              {stats?.byStatus.new ?? 0} new leads · {(stats?.byStatus.contacted ?? 0) + (stats?.byStatus.quoted ?? 0)} in pipeline
            </span>
            <span className="u-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              Shift: {user?.fullName ?? "Front desk"}
            </span>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Awaiting consent" value={String(queue.length)} unit="juniors" note="DPDP Act 2023" />
        <Stat label="New enquiries" value={String(stats?.byStatus.new ?? 0)} unit="leads" note="Not yet contacted" />
        <Stat label="Follow-ups due" value={String(stats?.dueToday.length ?? 0)} unit="follow-ups" note="Due now" />
        <Stat label="Pipeline value" value={inr(stats?.pipelineValue ?? 0)} unit="quoted" note={`${stats?.conversion ?? 0}% conversion`} />
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "lookup", label: "Lookup & scan", icon: ScanLine },
          { value: "register", label: "Walk-in", icon: UserPlus },
          { value: "consent", label: `Consent queue${queue.length ? ` (${queue.length})` : ""}`, icon: ShieldAlert },
          { value: "leads", label: "Leads & trials", icon: ClipboardList },
        ]}
      />

      {tab === "lookup" && <LookupTab onMutate={refresh} onOpenConsent={() => setTab("consent")} />}
      {tab === "register" && <RegisterTab onMutate={refresh} onOpenConsent={() => setTab("consent")} />}

      {tab === "consent" && (
        <Panel>
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-3">
            <div>
              <div className="u-eyebrow text-clay">DPDP Act 2023 · DSK-5</div>
              <h2 className="u-display mt-1 text-[15px]">Guardian consent queue</h2>
              <p className="mt-1 max-w-xl text-[11px] leading-relaxed text-muted">
                Junior accounts cannot book or pay until consent is verified. Confirm the guardian&apos;s
                identity in person, then record it here with a timestamp.
              </p>
            </div>
            <StatusPill tone={queue.length ? "warn" : "success"}>{queue.length} pending</StatusPill>
          </div>

          {queue.length === 0 ? (
            <EmptyState
              title="Every junior account is cleared"
              description="No guardian verification is waiting at the desk."
              className="mt-4"
            />
          ) : (
            <ul className="mt-3 divide-y divide-line-soft">
              {queue.map((junior) => (
                <li
                  key={junior.id}
                  className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[12.5px] font-medium">{junior.fullName}</span>
                      <span className="u-mono text-[9.5px] text-muted">{junior.memberCode}</span>
                      <StatusPill tone="warn">Pending consent</StatusPill>
                    </div>
                    <div className="mt-1 text-[11px] text-muted">
                      Guardian: {junior.guardianName ?? "not recorded"} · {junior.guardianPhone ?? "—"} ·{" "}
                      {junior.guardianEmail ?? "—"}
                    </div>
                    <div className="mt-0.5 text-[10.5px] text-muted">
                      Date of birth {junior.dob} · Junior plan
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {junior.guardianPhone && (
                      <a href={`tel:${junior.guardianPhone.replace(/\s/g, "")}`} className="btn btn-outline btn-sm">
                        <Phone className="h-3 w-3" />
                        Call guardian
                      </a>
                    )}
                    <button className="btn btn-court btn-sm" onClick={() => verify(junior.id, junior.fullName)}>
                      <ShieldAlert className="h-3 w-3" />
                      Verify in person
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-4 border-t border-line pt-3 text-[10.5px] leading-relaxed text-muted">
            Verification records the staff member, the timestamp and the consent-text version. Consent can be
            withdrawn at any time; invoices are retained for the statutory period.
          </p>
        </Panel>
      )}

      {tab === "leads" && <LeadsBoard onMutate={refresh} />}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4 text-[10.5px] text-muted">
        <span className="flex items-center gap-1.5">
          <BadgeCheck className="h-3.5 w-3.5" />
          Member identity is visible to staff only. Nothing here is exposed publicly.
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          Every action is written to the audit log.
        </span>
      </div>
    </div>
  );
}

function LeadsBoard({ onMutate }: { onMutate: () => void }) {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [filter, setFilter] = useState<LeadStatus | "all">("all");
  const [quote, setQuote] = useState("");
  const [note, setNote] = useState("");
  const [planId, setPlanId] = useState<"gold" | "silver" | "junior">("gold");
  const [flash, setFlash] = useState<string | null>(null);

  const reload = () => {
    const next = getLeads();
    setLeads(next);
    if (!selectedId && next[0]) setSelectedId(next[0].id);
    onMutate();
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = leads.find((lead) => lead.id === selectedId);
  const visible = filter === "all" ? leads : leads.filter((lead) => lead.status === filter);

  const tell = (message: string) => {
    setFlash(message);
    window.setTimeout(() => setFlash(null), 3200);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <Panel padded={false}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2.5">
            <div className="u-eyebrow text-muted">Pipeline · E6–E10</div>
            <div className="no-scrollbar flex gap-1 overflow-x-auto">
              {(["all", "new", "contacted", "quoted", "converted", "lost"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={cn(
                    "shrink-0 rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.1em]",
                    filter === status ? "border-ink bg-ink text-chalk" : "border-line text-muted hover:text-ink"
                  )}
                >
                  {status === "all" ? "All" : LEAD_STATUS_LABEL[status]}
                </button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <EmptyState title="No leads in this view" description="New website enquiries land here automatically." className="m-3" />
          ) : (
            <ul className="divide-y divide-line-soft">
              {visible.map((lead) => (
                <li key={lead.id}>
                  <button
                    onClick={() => setSelectedId(lead.id)}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-3 text-left transition-colors",
                      selectedId === lead.id ? "bg-paper-deep/60" : "hover:bg-paper-deep/30"
                    )}
                  >
                    <span className="u-mono w-10 shrink-0 text-[9px] text-muted">
                      {leadDateLabel(lead.createdAt)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-[12.5px] font-medium">{lead.name}</span>
                        <StatusPill tone={LEAD_STATUS_TONE[lead.status]}>{LEAD_STATUS_LABEL[lead.status]}</StatusPill>
                      </span>
                      <span className="mt-0.5 block truncate text-[10.5px] text-muted">
                        {lead.type === "trial" ? "Trial request" : lead.type === "membership" ? "Membership enquiry" : "General enquiry"} ·{" "}
                        {lead.sport} · {lead.source.replace("_", " ")}
                      </span>
                    </span>
                    {lead.quoteAmount ? (
                      <span className="u-value shrink-0 text-[11px]">{inr(lead.quoteAmount)}</span>
                    ) : (
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="lg:col-span-5">
        {!selected ? (
          <Panel>
            <EmptyState title="Pick a lead" description="The full conversation, trial and quote sit here." />
          </Panel>
        ) : (
          <Panel>
            <div className="flex items-start justify-between gap-3 border-b border-line pb-3">
              <div>
                <div className="u-eyebrow text-clay">{selected.type === "trial" ? "Trial request" : "Enquiry"}</div>
                <div className="u-display mt-1 text-[16px]">{selected.name}</div>
                <div className="mt-1 text-[10.5px] text-muted">
                  {selected.sport} · created {leadDateLabel(selected.createdAt)}
                </div>
              </div>
              <StatusPill tone={LEAD_STATUS_TONE[selected.status]}>{LEAD_STATUS_LABEL[selected.status]}</StatusPill>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <a href={`tel:${selected.phone.replace(/\s/g, "")}`} className="btn btn-outline btn-sm">
                <Phone className="h-3 w-3" />
                {selected.phone}
              </a>
              <a href={`mailto:${selected.email}`} className="btn btn-outline btn-sm truncate">
                <Mail className="h-3 w-3 shrink-0" />
                <span className="truncate">{selected.email}</span>
              </a>
            </div>

            {selected.message && (
              <p className="mt-3 border-l-2 border-clay/40 bg-paper-soft px-3 py-2 text-[11.5px] leading-relaxed text-ink-soft">
                “{selected.message}”
              </p>
            )}

            {selected.preferredDate && (
              <div className="mt-3 flex items-center justify-between rounded-lg border border-line bg-paper-soft px-3 py-2 text-[11px]">
                <span className="text-muted">Preferred trial</span>
                <span className="u-mono">
                  {selected.preferredDate} · {selected.preferredTime ?? "—"}
                </span>
              </div>
            )}

            {selected.quoteAmount && (
              <div className="mt-2 flex items-center justify-between rounded-lg border border-court/30 bg-court/5 px-3 py-2 text-[11px]">
                <span className="text-muted">Quote sent</span>
                <span className="u-value">{inr(selected.quoteAmount)}</span>
              </div>
            )}

            <div className="mt-4 space-y-2 border-t border-line pt-3">
              <div className="flex flex-wrap gap-2">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    updateLeadStatus(selected.id, "contacted", user?.fullName);
                    reload();
                    tell(`${selected.name} marked contacted.`);
                  }}
                >
                  Mark contacted
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    updateLeadStatus(selected.id, "lost", user?.fullName);
                    reload();
                    tell(`${selected.name} moved to lost.`);
                  }}
                >
                  Mark lost
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  className="input"
                  placeholder="Quote amount ₹"
                  inputMode="decimal"
                  value={quote}
                  onChange={(event) => setQuote(event.target.value)}
                  aria-label="Quote amount"
                />
                <button
                  className="btn btn-ink btn-sm shrink-0"
                  onClick={() => {
                    const result = sendQuote(selected.id, Number(quote), "Quote sent from the front desk", user?.fullName);
                    if (result.ok) {
                      setQuote("");
                      reload();
                      tell(`Quote sent to ${selected.name}.`);
                    } else {
                      tell(result.error ?? "Could not send the quote.");
                    }
                  }}
                >
                  Send quote
                </button>
              </div>

              <div className="flex gap-2">
                <select className="select" value={planId} onChange={(event) => setPlanId(event.target.value as typeof planId)}>
                  <option value="gold">Gold</option>
                  <option value="silver">Silver</option>
                  <option value="junior">Junior</option>
                </select>
                <button
                  className="btn btn-clay btn-sm shrink-0"
                  onClick={() => {
                    const result = convertLead(selected.id, planId, user?.fullName);
                    reload();
                    tell(result.ok ? `Converted to ${result.memberCode}.` : result.error ?? "Could not convert.");
                  }}
                >
                  <UserPlus className="h-3 w-3" />
                  Convert
                </button>
              </div>

              <textarea
                className="textarea"
                placeholder="Add a follow-up note…"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                aria-label="Follow-up note"
              />
              <button
                className="btn btn-outline btn-sm btn-block"
                disabled={!note.trim()}
                onClick={() => {
                  addLeadNote(selected.id, note.trim(), user?.fullName);
                  setNote("");
                  reload();
                  tell("Note added to the lead.");
                }}
              >
                Add note
              </button>
            </div>

            {selected.notes.length > 0 && (
              <ul className="mt-4 space-y-2 border-t border-line pt-3">
                {selected.notes.slice(-3).reverse().map((entry, index) => (
                  <li key={index} className="text-[10.5px] leading-relaxed text-muted">
                    <span className="text-ink">{entry.text}</span>
                    <span className="ml-1">· {entry.by}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        )}

        {flash && (
          <div className="mt-3 rounded-lg border border-court/30 bg-court/10 px-3 py-2 text-[11px] text-court">
            <Check className="mr-1 inline h-3 w-3" />
            {flash}
          </div>
        )}
      </div>
    </div>
  );
}

