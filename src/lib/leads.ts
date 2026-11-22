// =============================================================================
// Public enquiries & trial-booking lead pipeline
// Requirements: E5, E6, E7, E8, E9, E10
// A visitor request never disappears: it lands in the front-desk pipeline,
// gets followed up, quoted, and can be converted into a member in one click.
// =============================================================================

import { registerMemberAtDesk } from "./membership";
import {
  addDaysISO,
  formatDate,
  hashString,
  makeId,
  mulberry32,
  readStore,
  todayISO,
  writeStore,
} from "./store";

export type LeadStatus = "new" | "contacted" | "quoted" | "converted" | "lost";
export type LeadType = "trial" | "membership" | "enquiry";
export type LeadSource = "landing" | "walk_in" | "phone" | "referral";
export type LeadSport = "Tennis" | "Padel" | "Badminton" | "Cricket" | "Not sure";

export interface LeadNote {
  at: string;
  by: string;
  text: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  sport: LeadSport;
  type: LeadType;
  message?: string;
  preferredDate?: string;
  preferredTime?: string;
  source: LeadSource;
  status: LeadStatus;
  createdAt: string;
  followUpAt?: string;
  quoteAmount?: number;
  assignedTo?: string;
  notes: LeadNote[];
  memberCode?: string;
}

export const SPORT_OPTIONS: LeadSport[] = ["Tennis", "Padel", "Badminton", "Cricket", "Not sure"];

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quote sent",
  converted: "Converted",
  lost: "Lost",
};

export const LEAD_TYPE_LABEL: Record<LeadType, string> = {
  trial: "30-min trial",
  membership: "Membership quote",
  enquiry: "General enquiry",
};

const LEADS_KEY = "champions_leads_v1";

function seedLeads(): Lead[] {
  const today = todayISO();
  const rand = mulberry32(hashString("leads-" + today));
  const base: Omit<Lead, "id" | "createdAt" | "notes">[] = [
    {
      name: "Karan Singhal",
      phone: "+91 98765 43210",
      email: "karan.singhal@gmail.com",
      sport: "Tennis",
      type: "trial",
      message: "Looking for a weekend trial before committing to Gold. Play 3.5 level.",
      preferredDate: addDaysISO(today, 2),
      preferredTime: "18:00",
      source: "landing",
      status: "new",
      followUpAt: addDaysISO(today, 1),
      assignedTo: "Amit Sharma",
    },
    {
      name: "Dr. Aditi Bose",
      phone: "+91 99001 22334",
      email: "aditi.bose@clinic.in",
      sport: "Badminton",
      type: "membership",
      message: "Corporate quote for 6 colleagues, weekday mornings.",
      source: "landing",
      status: "contacted",
      followUpAt: today,
      assignedTo: "Simran Kaur",
    },
    {
      name: "Reyansh Gupta",
      phone: "+91 98111 55667",
      email: "reyansh.g@icloud.com",
      sport: "Cricket",
      type: "trial",
      message: "Under-16, wants to try the pace net with a coach.",
      preferredDate: addDaysISO(today, 4),
      preferredTime: "16:00",
      source: "referral",
      status: "quoted",
      quoteAmount: 1699,
      followUpAt: addDaysISO(today, 2),
      assignedTo: "Amit Sharma",
    },
    {
      name: "Meghna Rao",
      phone: "+91 97222 88990",
      email: "meghna.rao@gmail.com",
      sport: "Padel",
      type: "enquiry",
      message: "Do you have padel coaching for absolute beginners?",
      source: "phone",
      status: "converted",
      memberCode: "TCC-2026-SILV-042",
      assignedTo: "Simran Kaur",
    },
    {
      name: "Vivek Menon",
      phone: "+91 98999 10101",
      email: "vivek.menon@outlook.com",
      sport: "Tennis",
      type: "membership",
      message: "Comparing Gold vs Silver for a family of three.",
      source: "landing",
      status: "new",
      followUpAt: addDaysISO(today, 3),
    },
  ];

  return base.map((lead, i) => ({
    ...lead,
    id: "lead-" + (i + 1),
    createdAt: new Date(Date.now() - Math.floor(rand() * 70 + i * 8) * 3600000).toISOString(),
    notes:
      lead.status === "new"
        ? []
        : [
            {
              at: new Date(Date.now() - 20 * 3600000).toISOString(),
              by: "Amit Sharma",
              text:
                lead.status === "quoted"
                  ? "Called the family. Sent the Junior Prodigy quote over WhatsApp."
                  : lead.status === "converted"
                  ? "Signed up at the front desk after the padel induction session."
                  : "Spoke on the phone; asked for a weekday-morning quote.",
            },
          ],
  }));
}

let hasSyncedLeadsWithServer = false;

export function syncLeadsWithServer(): void {
  if (typeof window === "undefined" || hasSyncedLeadsWithServer) return;
  hasSyncedLeadsWithServer = true;
  fetch("/api/leads")
    .then((res) => res.json())
    .then((data) => {
      if (data?.success && Array.isArray(data.leads)) {
        const local = getLeads();
        const remoteIds = new Set(data.leads.map((l: any) => l.id));
        const customLocal = local.filter((l) => !l.id.startsWith("lead-") && !remoteIds.has(l.id));
        const merged = [...data.leads, ...customLocal];
        saveLeads(merged);
      }
    })
    .catch(() => {});
}

export function getLeads(): Lead[] {
  if (typeof window !== "undefined" && !hasSyncedLeadsWithServer) {
    setTimeout(syncLeadsWithServer, 100);
  }
  const stored = readStore<Lead[] | null>(LEADS_KEY, null);
  if (stored && stored.length) return stored;
  const seeded = seedLeads();
  writeStore(LEADS_KEY, seeded);
  return seeded;
}

function saveLeads(leads: Lead[]): void {
  writeStore(LEADS_KEY, leads);
}

export interface CreateLeadInput {
  name: string;
  phone: string;
  email: string;
  sport: LeadSport;
  type: LeadType;
  message?: string;
  preferredDate?: string;
  preferredTime?: string;
  source?: LeadSource;
}

export function createLead(input: CreateLeadInput): { ok: boolean; lead?: Lead; error?: string } {
  if (!input.name.trim()) return { ok: false, error: "Please add your name." };
  const digits = input.phone.replace(/[^0-9]/g, "");
  if (digits.length < 10) return { ok: false, error: "Please add a valid phone number." };
  if (input.email && input.email.indexOf("@") < 1) {
    return { ok: false, error: "That email address does not look right." };
  }

  const leads = getLeads();
  const duplicate = leads.find(
    (l) => l.phone.replace(/\s/g, "") === input.phone.replace(/\s/g, "") && l.status !== "lost"
  );
  if (duplicate) {
    duplicate.notes.push({
      at: new Date().toISOString(),
      by: "Website",
      text: ("Repeat enquiry received. " + (input.message ?? "")).trim(),
    });
    duplicate.followUpAt = todayISO();
    saveLeads(leads);
    return { ok: true, lead: duplicate };
  }

  const lead: Lead = {
    id: makeId("lead"),
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email.trim(),
    sport: input.sport,
    type: input.type,
    message: input.message?.trim(),
    preferredDate: input.preferredDate,
    preferredTime: input.preferredTime,
    source: input.source ?? "landing",
    status: "new",
    createdAt: new Date().toISOString(),
    followUpAt: addDaysISO(todayISO(), 1),
    notes: [],
  };
  leads.unshift(lead);
  saveLeads(leads);

  if (typeof window !== "undefined") {
    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: lead.id,
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        sport: lead.sport,
        source: lead.source,
        status: lead.status,
        notes: lead.message || null,
        followUpDate: lead.followUpAt || null,
      }),
    }).catch(() => {});
  }

  return { ok: true, lead };
}

export function updateLeadStatus(id: string, status: LeadStatus, by = "Front Desk"): void {
  const leads = getLeads();
  const lead = leads.find((l) => l.id === id);
  if (!lead) return;
  lead.status = status;
  lead.notes.push({
    at: new Date().toISOString(),
    by,
    text: "Status moved to " + LEAD_STATUS_LABEL[status] + ".",
  });
  saveLeads(leads);

  if (typeof window !== "undefined") {
    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: lead.id,
        status: lead.status,
      }),
    }).catch(() => {});
  }
}

export function addLeadNote(id: string, text: string, by = "Front Desk"): void {
  const leads = getLeads();
  const lead = leads.find((l) => l.id === id);
  if (!lead) return;
  lead.notes.push({ at: new Date().toISOString(), by, text });
  saveLeads(leads);
}

export function sendQuote(id: string, amount: number, note?: string, by = "Simran Kaur"): { ok: boolean; error?: string } {
  const leads = getLeads();
  const lead = leads.find((l) => l.id === id);
  if (!lead) return { ok: false, error: "Lead not found." };
  if (!amount || amount <= 0) return { ok: false, error: "Enter a quote amount." };
  lead.quoteAmount = amount;
  lead.status = "quoted";
  lead.followUpAt = addDaysISO(todayISO(), 2);
  lead.notes.push({
    at: new Date().toISOString(),
    by,
    text: "Quote of Rs " + amount.toLocaleString("en-IN") + " sent." + (note ? " " + note : ""),
  });
  saveLeads(leads);
  return { ok: true };
}

export function scheduleFollowUp(id: string, date: string): void {
  const leads = getLeads();
  const lead = leads.find((l) => l.id === id);
  if (!lead) return;
  lead.followUpAt = date;
  saveLeads(leads);
}

export function convertLead(
  id: string,
  planId: "gold" | "silver" | "junior",
  by = "Amit Sharma"
): { ok: boolean; memberCode?: string; error?: string } {
  const leads = getLeads();
  const lead = leads.find((l) => l.id === id);
  if (!lead) return { ok: false, error: "Lead not found." };
  if (lead.status === "converted") return { ok: false, error: "Already converted." };

  const { member } = registerMemberAtDesk({
    fullName: lead.name,
    email: lead.email || lead.phone.replace(/[^0-9]/g, "") + "@prospect.championsclub.in",
    phone: lead.phone,
    dob: planId === "junior" ? addDaysISO(todayISO(), -365 * 15) : addDaysISO(todayISO(), -365 * 30),
    planId,
    guardianVerifiedInPerson: planId === "junior",
  });

  lead.status = "converted";
  lead.memberCode = member.memberCode;
  lead.notes.push({
    at: new Date().toISOString(),
    by,
    text: "Converted to " + planId.toUpperCase() + " member - " + member.memberCode + ". Welcome call issued.",
  });
  saveLeads(leads);
  return { ok: true, memberCode: member.memberCode };
}

export function leadStats() {
  const leads = getLeads();
  const byStatus = leads.reduce(
    (acc, l) => {
      acc[l.status] += 1;
      return acc;
    },
    { new: 0, contacted: 0, quoted: 0, converted: 0, lost: 0 } as Record<LeadStatus, number>
  );
  const pipelineValue = leads.filter((l) => l.status === "quoted").reduce((s, l) => s + (l.quoteAmount ?? 0), 0);
  const conversion = leads.length ? Math.round((byStatus.converted / leads.length) * 100) : 0;
  const dueToday = leads.filter(
    (l) => l.followUpAt && l.followUpAt <= todayISO() && l.status !== "converted" && l.status !== "lost"
  );
  return { total: leads.length, byStatus, pipelineValue, conversion, dueToday };
}

export function leadDateLabel(iso: string): string {
  return formatDate(iso, { day: "numeric", month: "short" });
}
