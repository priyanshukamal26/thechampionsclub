// =============================================================================
// Unified finance & operations ledger
// Requirements: F1–F9, D6, D8, X2, X3
// Synthetic-but-deterministic club ledger: court, pro shop, bar, social and
// membership revenue; payment-mode reconciliation; GST (SAC/HSN) summaries;
// payables, payroll, leave approvals, invoices and expiring share links.
// =============================================================================

import {
  addDaysISO,
  dateToISO,
  downloadCsv,
  hashString,
  inr,
  makeId,
  monthKey,
  mulberry32,
  nowISO,
  offsetDate,
  readStore,
  round2,
  todayISO,
  writeStore,
} from "./store";

export type LedgerSource = "court" | "shop" | "bar" | "membership" | "social" | "fee";
export type LedgerPaymentMode = "upi" | "card" | "cash" | "tab";

export interface Transaction {
  id: string;
  at: string;
  date: string;
  source: LedgerSource;
  description: string;
  net: number;
  gst: number;
  gross: number;
  paymentMode: LedgerPaymentMode;
  taxCode: string;
  memberName?: string;
  ref?: string;
}

export const GST_RATE = 0.18;

export const TAX_CODES: Record<string, string> = {
  "SAC 998413": "Sports facility rentals",
  "HSN 9506": "Sporting goods & equipment",
  "SAC 996331": "Restaurant & cafeteria service",
  "SAC 999723": "Club membership subscriptions",
};

export const SOURCE_LABELS: Record<LedgerSource, string> = {
  court: "Court bookings",
  shop: "Pro shop",
  bar: "Bar & kitchen",
  membership: "Memberships",
  social: "Friday social",
  fee: "Late-cancel fees",
};

export const PAYMENT_LABELS: Record<LedgerPaymentMode, string> = {
  upi: "UPI",
  card: "Card",
  cash: "Cash",
  tab: "Member tab",
};

const LEDGER_KEY = "champions_ledger_v1";
const PAYABLES_KEY = "champions_payables_v1";
const STAFF_KEY = "champions_staff_v1";
const LEAVE_KEY = "champions_leave_v1";
const INVOICES_KEY = "champions_invoices_v1";
const SHARE_KEY = "champions_share_links_v1";
const PAYROLL_PAID_KEY = "champions_payroll_paid_v1";

export function taxCodeFor(source: LedgerSource): string {
  switch (source) {
    case "court":
    case "social":
      return "SAC 998413";
    case "shop":
      return "HSN 9506";
    case "bar":
      return "SAC 996331";
    case "membership":
      return "SAC 999723";
    case "fee":
      return "SAC 998413";
  }
}

export function grossFromNet(net: number): number {
  return round2(net * (1 + GST_RATE));
}

export function splitGross(gross: number): { net: number; gst: number; gross: number } {
  const net = round2(gross / (1 + GST_RATE));
  return { net, gst: round2(gross - net), gross: round2(gross) };
}

/* ─────────────────────────── seed ledger ─────────────────────────── */

const COURT_NOTES = ["Court booking", "Tennis court session", "Padel court session", "Badminton hall", "Cricket net session"];
const SHOP_NOTES = ["Pro shop sale", "Racket + stringing", "Shoes & socks", "Ball tube", "Apparel purchase"];
const BAR_NOTES = ["Bar tab settled", "Café table order", "Post-match kitchen order", "Beverage service"];
const MEMBER_NAMES = ["Rohan Mehra", "Priya Sharma", "Kabir Khan", "Sunita Roy", "Ananya Deshmukh", "Nikhil Bhatia", "Vikrant Rao", "Tara Menon", "Zoya Ali", "Arjun Sethi"];

function seedDayTransactions(date: string): Transaction[] {
  const dayTx: Transaction[] = [];
  const rand = mulberry32(hashString(`ledger-${date}`));
  const weekday = new Date(`${date}T00:00:00`).getDay();

  const add = (source: LedgerSource, count: number, min: number, max: number, notes: string[]) => {
    for (let i = 0; i < count; i++) {
      const gross = round2(min + rand() * (max - min));
      const { net, gst } = splitGross(gross);
      const modeRoll = rand();
      const paymentMode: LedgerPaymentMode =
        source === "bar" && modeRoll > 0.94
          ? "tab"
          : modeRoll > 0.7
          ? "card"
          : modeRoll > 0.32
          ? "upi"
          : "cash";
      const hour = 7 + Math.floor(rand() * 15);
      const minute = Math.floor(rand() * 60);
      dayTx.push({
        id: `seed-tx-${date}-${source}-${i}`,
        at: `${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`,
        date,
        source,
        description: notes[Math.floor(rand() * notes.length)],
        net,
        gst,
        gross,
        paymentMode,
        taxCode: taxCodeFor(source),
        memberName: MEMBER_NAMES[Math.floor(rand() * MEMBER_NAMES.length)],
      });
    }
  };

  const peak = weekday === 5 || weekday === 6 || weekday === 0;
  add("court", 8 + Math.floor(rand() * (peak ? 10 : 5)), 600, 2200, COURT_NOTES);
  add("shop", 3 + Math.floor(rand() * 5), 350, 9000, SHOP_NOTES);
  add("bar", 6 + Math.floor(rand() * (peak ? 10 : 5)), 240, 4200, BAR_NOTES);

  if (weekday === 5) {
    const guests = 8 + Math.floor(rand() * 9);
    const gross = round2(guests * 400);
    const { net, gst } = splitGross(gross);
    dayTx.push({
      id: `seed-social-${date}`,
      at: `${date}T22:15:00`,
      date,
      source: "social",
      description: `Friday Night Social · ${guests} guest passes`,
      net,
      gst,
      gross,
      paymentMode: "upi",
      taxCode: taxCodeFor("social"),
    });
  }

  const dom = Number(date.slice(8, 10));
  if (dom === 1 || dom === 15) {
    const memberships = 2 + Math.floor(rand() * 3);
    for (let i = 0; i < memberships; i++) {
      const gross = [4999, 2499, 1699][Math.floor(rand() * 3)];
      const { net, gst } = splitGross(gross);
      dayTx.push({
        id: `seed-mem-${date}-${i}`,
        at: `${date}T11:${String(10 + i * 7).padStart(2, "0")}:00`,
        date,
        source: "membership",
        description: `New membership subscription · ${MEMBER_NAMES[Math.floor(rand() * MEMBER_NAMES.length)]}`,
        net,
        gst,
        gross,
        paymentMode: rand() > 0.5 ? "upi" : "card",
        taxCode: taxCodeFor("membership"),
        memberName: MEMBER_NAMES[Math.floor(rand() * MEMBER_NAMES.length)],
      });
    }
  }
  return dayTx;
}

function seedLedger(): Transaction[] {
  const ledger: Transaction[] = [];
  for (let back = 45; back >= 0; back--) {
    const date = offsetDate(-back);
    ledger.push(...seedDayTransactions(date));
  }
  return ledger.sort((a, b) => a.at.localeCompare(b.at));
}

export function getLedger(): Transaction[] {
  const stored = readStore<Transaction[] | null>(LEDGER_KEY, null);
  if (stored && stored.length) {
    const today = todayISO();
    const hasToday = stored.some((t) => t.date === today);
    if (!hasToday) {
      // Midnight or calendar rollover: populate today's transactions into stored ledger
      const todayTx = seedDayTransactions(today);
      const next = [...stored, ...todayTx].sort((a, b) => a.at.localeCompare(b.at));
      writeStore(LEDGER_KEY, next);
      return next;
    }
    return stored;
  }
  const seeded = seedLedger();
  writeStore(LEDGER_KEY, seeded);
  return seeded;
}

export function recordTransaction(input: {
  source: LedgerSource;
  description: string;
  gross: number;
  paymentMode: LedgerPaymentMode;
  taxCode?: string;
  memberName?: string;
  ref?: string;
  at?: string;
}): Transaction {
  const { net, gst, gross } = splitGross(input.gross);
  const at = input.at ?? nowISO();
  const date = at.slice(0, 10);
  const tx: Transaction = {
    id: makeId("tx"),
    at,
    date,
    source: input.source,
    description: input.description,
    net,
    gst,
    gross,
    paymentMode: input.paymentMode,
    taxCode: input.taxCode ?? taxCodeFor(input.source),
    memberName: input.memberName,
    ref: input.ref,
  };
  const ledger = getLedger();
  ledger.push(tx);
  writeStore(LEDGER_KEY, ledger);
  return tx;
}

/* ─────────────────────────── summaries ─────────────────────────── */

export interface LedgerSummary {
  gross: number;
  net: number;
  gst: number;
  count: number;
  bySource: Record<LedgerSource, number>;
  byMode: Record<LedgerPaymentMode, number>;
}

export function summarize(transactions: Transaction[]): LedgerSummary {
  const bySource: Record<LedgerSource, number> = { court: 0, shop: 0, bar: 0, membership: 0, social: 0, fee: 0 };
  const byMode: Record<LedgerPaymentMode, number> = { upi: 0, card: 0, cash: 0, tab: 0 };
  let gross = 0;
  let net = 0;
  let gst = 0;
  transactions.forEach((t) => {
    gross += t.gross;
    net += t.net;
    gst += t.gst;
    bySource[t.source] = round2((bySource[t.source] ?? 0) + t.gross);
    byMode[t.paymentMode] = round2((byMode[t.paymentMode] ?? 0) + t.gross);
  });
  return { gross: round2(gross), net: round2(net), gst: round2(gst), count: transactions.length, bySource, byMode };
}

export function transactionsBetween(from: string, to: string): Transaction[] {
  return getLedger().filter((t) => t.date >= from && t.date <= to);
}

export function getDaySummary(date = todayISO()): LedgerSummary {
  return summarize(getLedger().filter((t) => t.date === date));
}

export function getPeriodSummary(days: number): LedgerSummary {
  const to = todayISO();
  const from = offsetDate(-(days - 1));
  return summarize(transactionsBetween(from, to));
}

export function getTodayWeekMonth(): {
  today: LedgerSummary;
  week: LedgerSummary;
  month: LedgerSummary;
  yesterday: LedgerSummary;
  lastWeek: LedgerSummary;
  lastMonth: LedgerSummary;
} {
  const today = todayISO();
  const monthStart = `${monthKey(today)}-01`;
  const weekStart = offsetDate(-(((new Date(`${today}T00:00:00`).getDay() + 6) % 7)));
  return {
    today: getDaySummary(today),
    week: summarize(transactionsBetween(weekStart, today)),
    month: summarize(transactionsBetween(monthStart, today)),
    yesterday: getDaySummary(offsetDate(-1)),
    lastWeek: summarize(transactionsBetween(offsetDate(-13), offsetDate(-7))),
    lastMonth: summarize(transactionsBetween(`${monthKey(offsetDate(-31))}-01`, `${monthKey(offsetDate(-31))}-28`)),
  };
}

export function growth(current: number, previous: number): number {
  if (!previous) return current ? 100 : 0;
  return round2(((current - previous) / previous) * 100);
}

/* ─────────────────────────── Z-report ─────────────────────────── */

export interface ZReport {
  date: string;
  summary: LedgerSummary;
  openingFloat: number;
  cashCollected: number;
  expectedDrawer: number;
  cardCollected: number;
  upiCollected: number;
  tabCollected: number;
  gstRows: GstRow[];
  staffOnDuty: StaffMember[];
  openTabs: number;
  generatedAt: string;
  reconciled: boolean;
}

export function getZReport(date = todayISO()): ZReport {
  const transactions = getLedger().filter((t) => t.date === date);
  const summary = summarize(transactions);
  const openingFloat = 5000;
  return {
    date,
    summary,
    openingFloat,
    cashCollected: summary.byMode.cash,
    expectedDrawer: round2(openingFloat + summary.byMode.cash),
    cardCollected: summary.byMode.card,
    upiCollected: summary.byMode.upi,
    tabCollected: summary.byMode.tab,
    gstRows: gstRowsFor(transactions),
    staffOnDuty: getStaffRoster().filter((s) => s.status === "on_duty"),
    openTabs: getOpenTabCount(),
    generatedAt: new Date().toISOString(),
    reconciled: true,
  };
}

/* Hook for the bar tab count — orders lib can override with its own store. */
let openTabCountProvider: (() => number) | null = null;
export function registerOpenTabCountProvider(fn: () => number) {
  openTabCountProvider = fn;
}
export function getOpenTabCount(): number {
  return openTabCountProvider ? openTabCountProvider() : 3;
}

/* ─────────────────────────── GST ─────────────────────────── */

export interface GstRow {
  taxCode: string;
  label: string;
  taxable: number;
  gst: number;
  gross: number;
  count: number;
}

export function gstRowsFor(transactions: Transaction[]): GstRow[] {
  const map = new Map<string, GstRow>();
  transactions.forEach((t) => {
    const row = map.get(t.taxCode) ?? {
      taxCode: t.taxCode,
      label: TAX_CODES[t.taxCode] ?? "Other",
      taxable: 0,
      gst: 0,
      gross: 0,
      count: 0,
    };
    row.taxable = round2(row.taxable + t.net);
    row.gst = round2(row.gst + t.gst);
    row.gross = round2(row.gross + t.gross);
    row.count += 1;
    map.set(t.taxCode, row);
  });
  return [...map.values()].sort((a, b) => b.gross - a.gross);
}

export function getGstSummary(month: string): { month: string; rows: GstRow[]; total: { taxable: number; gst: number; gross: number; count: number } } {
  const transactions = getLedger().filter((t) => t.date.startsWith(month));
  const rows = gstRowsFor(transactions);
  return {
    month,
    rows,
    total: rows.reduce(
      (acc, r) => ({
        taxable: round2(acc.taxable + r.taxable),
        gst: round2(acc.gst + r.gst),
        gross: round2(acc.gross + r.gross),
        count: acc.count + r.count,
      }),
      { taxable: 0, gst: 0, gross: 0, count: 0 }
    ),
  };
}

export function exportTransactionsCsv(transactions: Transaction[], filename = "champions-ledger.csv") {
  downloadCsv(filename, [
    ["Date", "Time", "Source", "Description", "Payment mode", "Tax code", "Taxable", "GST", "Gross", "Member"],
    ...transactions.map((t) => [
      t.date,
      new Date(t.at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      SOURCE_LABELS[t.source],
      t.description,
      PAYMENT_LABELS[t.paymentMode],
      t.taxCode,
      t.net.toFixed(2),
      t.gst.toFixed(2),
      t.gross.toFixed(2),
      t.memberName ?? "",
    ]),
  ]);
}

export function exportGstCsv(month: string) {
  const { rows } = getGstSummary(month);
  downloadCsv(`champions-gst-${month}.csv`, [
    ["Tax code", "Description", "Taxable value (INR)", "GST @18% (INR)", "Gross (INR)", "Transactions"],
    ...rows.map((r) => [r.taxCode, r.label, r.taxable.toFixed(2), r.gst.toFixed(2), r.gross.toFixed(2), r.count]),
  ]);
}

/* ─────────────────────────── payables ─────────────────────────── */

export type PayableStatus = "due" | "scheduled" | "paid";

export interface Payable {
  id: string;
  vendor: string;
  category: string;
  amount: number;
  dueDate: string;
  status: PayableStatus;
  reference: string;
}

function seedPayables(): Payable[] {
  const today = todayISO();
  return [
    { id: "pay-001", vendor: "BSES Rajdhani Power", category: "Electricity", amount: 148500, dueDate: addDaysISO(today, 3), status: "due", reference: "ELEC-1121" },
    { id: "pay-002", vendor: "Delhi Jal Board", category: "Water", amount: 22400, dueDate: addDaysISO(today, 6), status: "scheduled", reference: "WTR-1121" },
    { id: "pay-003", vendor: "Wilson Sporting Goods India", category: "Pro shop inventory", amount: 286000, dueDate: addDaysISO(today, 9), status: "due", reference: "PO-2291" },
    { id: "pay-004", vendor: "Sula / Gateway Beverages", category: "Bar stock", amount: 97200, dueDate: addDaysISO(today, 2), status: "due", reference: "PO-2304" },
    { id: "pay-005", vendor: "GreenTurf Maintenance", category: "Turf & courts", amount: 68000, dueDate: addDaysISO(today, 12), status: "scheduled", reference: "AMC-118" },
    { id: "pay-006", vendor: "SecureGuard Services", category: "Security", amount: 154000, dueDate: addDaysISO(today, -2), status: "paid", reference: "SEC-1119" },
    { id: "pay-007", vendor: "Airtel Business Broadband", category: "Internet & CCTV", amount: 18400, dueDate: addDaysISO(today, 5), status: "scheduled", reference: "NET-1121" },
  ];
}

export function getPayables(): Payable[] {
  const stored = readStore<Payable[] | null>(PAYABLES_KEY, null);
  if (stored) return stored;
  const seeded = seedPayables();
  writeStore(PAYABLES_KEY, seeded);
  return seeded;
}

export function markPayablePaid(id: string): void {
  const payables = getPayables().map((p) => (p.id === id ? { ...p, status: "paid" as PayableStatus } : p));
  writeStore(PAYABLES_KEY, payables);
}

export function totalDue(): number {
  return round2(getPayables().filter((p) => p.status !== "paid").reduce((s, p) => s + p.amount, 0));
}

/* ─────────────────────────── staff, shifts, payroll, leave ─────────────────────────── */

export type Shift = "Morning" | "Evening" | "Night" | "General";
export type StaffStatus = "on_duty" | "off" | "leave";

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: "Front desk" | "Bar & kitchen" | "Pro shop" | "Courts" | "Accounts";
  shift: Shift;
  shiftTime: string;
  salary: number;
  overtimeHours: number;
  attendanceDays: number;
  leavesTaken: number;
  status: StaffStatus;
  joined: string;
  phone: string;
}

function seedStaff(): StaffMember[] {
  return [
    { id: "stf-001", name: "Amit Sharma", role: "Front Desk Lead", department: "Front desk", shift: "Morning", shiftTime: "06:00 – 14:00", salary: 34000, overtimeHours: 6, attendanceDays: 24, leavesTaken: 1, status: "on_duty", joined: "2023-04-10", phone: "+91 98110 22201" },
    { id: "stf-002", name: "Simran Kaur", role: "Club Manager", department: "Front desk", shift: "General", shiftTime: "09:00 – 18:00", salary: 62000, overtimeHours: 0, attendanceDays: 25, leavesTaken: 1, status: "on_duty", joined: "2022-08-01", phone: "+91 98110 22202" },
    { id: "stf-003", name: "Chef Vikram Singh", role: "Head Chef", department: "Bar & kitchen", shift: "Evening", shiftTime: "14:00 – 22:00", salary: 48000, overtimeHours: 12, attendanceDays: 23, leavesTaken: 2, status: "on_duty", joined: "2023-01-15", phone: "+91 98110 22203" },
    { id: "stf-004", name: "Meera Nair", role: "Café Manager", department: "Bar & kitchen", shift: "Evening", shiftTime: "15:00 – 23:00", salary: 41000, overtimeHours: 4, attendanceDays: 24, leavesTaken: 1, status: "on_duty", joined: "2024-02-20", phone: "+91 98110 22204" },
    { id: "stf-005", name: "Neha Kapoor", role: "Pro Shop Manager", department: "Pro shop", shift: "General", shiftTime: "10:00 – 19:00", salary: 38000, overtimeHours: 2, attendanceDays: 25, leavesTaken: 0, status: "on_duty", joined: "2023-06-05", phone: "+91 98110 22205" },
    { id: "stf-006", name: "Rahul Yadav", role: "Court Attendant", department: "Courts", shift: "Morning", shiftTime: "06:00 – 14:00", salary: 24000, overtimeHours: 8, attendanceDays: 22, leavesTaken: 3, status: "off", joined: "2024-05-11", phone: "+91 98110 22206" },
    { id: "stf-007", name: "Sneha Iyer", role: "Accounts Executive", department: "Accounts", shift: "General", shiftTime: "10:00 – 18:00", salary: 45000, overtimeHours: 0, attendanceDays: 24, leavesTaken: 1, status: "on_duty", joined: "2022-11-03", phone: "+91 98110 22207" },
    { id: "stf-008", name: "Ravi Kumar", role: "Kitchen Steward", department: "Bar & kitchen", shift: "Night", shiftTime: "20:00 – 04:00", salary: 22000, overtimeHours: 10, attendanceDays: 21, leavesTaken: 4, status: "leave", joined: "2024-09-01", phone: "+91 98110 22208" },
  ];
}

export function getStaffRoster(): StaffMember[] {
  const stored = readStore<StaffMember[] | null>(STAFF_KEY, null);
  if (stored) return stored;
  const seeded = seedStaff();
  writeStore(STAFF_KEY, seeded);
  return seeded;
}

export type LeaveStatus = "pending" | "approved" | "rejected";
export type LeaveType = "Casual" | "Sick" | "Comp-off" | "Unpaid";

export interface LeaveRequest {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  type: LeaveType;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  requestedAt: string;
  decidedBy?: string;
}

function seedLeave(): LeaveRequest[] {
  const today = todayISO();
  return [
    { id: "lv-001", staffId: "stf-006", staffName: "Rahul Yadav", role: "Court Attendant", type: "Sick", from: addDaysISO(today, 1), to: addDaysISO(today, 2), days: 2, reason: "Viral fever, doctor advised rest.", status: "pending", requestedAt: new Date().toISOString() },
    { id: "lv-002", staffId: "stf-003", staffName: "Chef Vikram Singh", role: "Head Chef", type: "Comp-off", from: addDaysISO(today, 5), to: addDaysISO(today, 5), days: 1, reason: "Worked the Diwali weekend double shift.", status: "pending", requestedAt: new Date().toISOString() },
    { id: "lv-003", staffId: "stf-008", staffName: "Ravi Kumar", role: "Kitchen Steward", type: "Casual", from: addDaysISO(today, -1), to: addDaysISO(today, 1), days: 3, reason: "Family function out of town.", status: "approved", requestedAt: addDaysISO(today, -4), decidedBy: "Simran Kaur" },
    { id: "lv-004", staffId: "stf-004", staffName: "Meera Nair", role: "Café Manager", type: "Unpaid", from: addDaysISO(today, 9), to: addDaysISO(today, 10), days: 2, reason: "Personal travel.", status: "pending", requestedAt: new Date().toISOString() },
    { id: "lv-005", staffId: "stf-005", staffName: "Neha Kapoor", role: "Pro Shop Manager", type: "Sick", from: addDaysISO(today, -6), to: addDaysISO(today, -5), days: 2, reason: "Migraine.", status: "approved", requestedAt: addDaysISO(today, -8), decidedBy: "Simran Kaur" },
  ];
}

export function getLeaveRequests(): LeaveRequest[] {
  const stored = readStore<LeaveRequest[] | null>(LEAVE_KEY, null);
  if (stored) return stored;
  const seeded = seedLeave();
  writeStore(LEAVE_KEY, seeded);
  return seeded;
}

export function decideLeave(id: string, status: "approved" | "rejected", by = "Rajesh Verma (Owner)"): void {
  const requests = getLeaveRequests().map((r) =>
    r.id === id ? { ...r, status, decidedBy: by } : r
  );
  writeStore(LEAVE_KEY, requests);
}

export interface PayrollRow {
  staffId: string;
  name: string;
  role: string;
  department: string;
  base: number;
  overtimePay: number;
  deductions: number;
  net: number;
  paid: boolean;
}

export function getPayroll(): PayrollRow[] {
  const paid = readStore<string[]>(PAYROLL_PAID_KEY, []);
  return getStaffRoster().map((s) => {
    const overtimePay = round2((s.salary / 160) * 1.5 * s.overtimeHours);
    const gross = round2(s.salary + overtimePay);
    const deductions = round2(s.salary * 0.12 + 200);
    return {
      staffId: s.id,
      name: s.name,
      role: s.role,
      department: s.department,
      base: s.salary,
      overtimePay,
      deductions,
      net: round2(gross - deductions),
      paid: paid.includes(s.id),
    };
  });
}

export function markPayrollPaid(staffId: string): void {
  const paid = readStore<string[]>(PAYROLL_PAID_KEY, []);
  if (!paid.includes(staffId)) writeStore(PAYROLL_PAID_KEY, [...paid, staffId]);
}

export function totalPayroll(): number {
  return round2(getPayroll().reduce((s, p) => s + p.net, 0));
}

/* ─────────────────────────── invoices ─────────────────────────── */

export type InvoiceStatus = "paid" | "pending" | "overdue";
export type InvoiceType = "membership" | "business";

export interface Invoice {
  id: string;
  number: string;
  client: string;
  gstin?: string;
  type: InvoiceType;
  description: string;
  issuedAt: string;
  dueAt: string;
  net: number;
  gst: number;
  gross: number;
  status: InvoiceStatus;
}

function seedInvoices(): Invoice[] {
  const today = todayISO();
  const rows: Omit<Invoice, "net" | "gst" | "gross">[] = [
    { id: "inv-001", number: "TCC/26-27/0141", client: "Infosys BPM Ltd.", gstin: "07AABCI1234F1Z5", type: "business", description: "Corporate tennis league · 16 court hours + coaching", issuedAt: addDaysISO(today, -12), dueAt: addDaysISO(today, 3), status: "pending" },
    { id: "inv-002", number: "TCC/26-27/0142", client: "Sunita Roy", type: "membership", description: "Gold membership renewal · 12 months", issuedAt: addDaysISO(today, -5), dueAt: addDaysISO(today, 2), status: "pending" },
    { id: "inv-003", number: "TCC/26-27/0139", client: "American Express India", gstin: "07AAACA7890B1Z2", type: "business", description: "Annual corporate padel membership · 8 seats", issuedAt: addDaysISO(today, -22), dueAt: addDaysISO(today, -7), status: "overdue" },
    { id: "inv-004", number: "TCC/26-27/0138", client: "Priya Sharma", type: "membership", description: "Silver membership · 12 months", issuedAt: addDaysISO(today, -30), dueAt: addDaysISO(today, -20), status: "paid" },
    { id: "inv-005", number: "TCC/26-27/0137", client: "HDFC Bank Sports Council", gstin: "07AAACH5678C1Z9", type: "business", description: "Weekend badminton corporate block · Q3", issuedAt: addDaysISO(today, -40), dueAt: addDaysISO(today, -30), status: "paid" },
    { id: "inv-006", number: "TCC/26-27/0143", client: "Kabir Khan", type: "membership", description: "Silver membership · 12 months", issuedAt: addDaysISO(today, -2), dueAt: addDaysISO(today, 12), status: "pending" },
  ];
  return rows.map((r) => {
    const gross = r.type === "membership" ? 2499 : 48000 + (hashString(r.id) % 5) * 12000;
    const { net, gst } = splitGross(gross);
    return { ...r, net, gst, gross, status: r.status as InvoiceStatus };
  });
}

export function getInvoices(): Invoice[] {
  const stored = readStore<Invoice[] | null>(INVOICES_KEY, null);
  if (stored) return stored;
  const seeded = seedInvoices();
  writeStore(INVOICES_KEY, seeded);
  return seeded;
}

export function markInvoicePaid(id: string): void {
  const invoices = getInvoices().map((i) => (i.id === id ? { ...i, status: "paid" as InvoiceStatus } : i));
  writeStore(INVOICES_KEY, invoices);
}

/** Raise a GST invoice for a membership or a business client (F4). */
export function createInvoice(input: {
  client: string;
  type: InvoiceType;
  description: string;
  net: number;
  gstin?: string;
  dueAt?: string;
}): Invoice {
  const invoices = getInvoices();
  const net = round2(input.net);
  const gst = round2(net * GST_RATE);
  const invoice: Invoice = {
    id: makeId("inv"),
    number: `TCC/26-27/${String(143 + invoices.length).padStart(4, "0")}`,
    client: input.client.trim(),
    gstin: input.gstin?.trim() || undefined,
    type: input.type,
    description: input.description.trim(),
    issuedAt: todayISO(),
    dueAt: input.dueAt ?? addDaysISO(todayISO(), 15),
    net,
    gst,
    gross: round2(net + gst),
    status: "pending",
  };
  writeStore(INVOICES_KEY, [invoice, ...invoices]);
  return invoice;
}

export function exportInvoicesCsv() {
  downloadCsv("champions-invoices.csv", [
    ["Number", "Client", "GSTIN", "Type", "Issued", "Due", "Taxable", "GST", "Gross", "Status"],
    ...getInvoices().map((i) => [i.number, i.client, i.gstin ?? "", i.type, i.issuedAt, i.dueAt, i.net.toFixed(2), i.gst.toFixed(2), i.gross.toFixed(2), i.status]),
  ]);
}

/* ─────────────────────────── share links ─────────────────────────── */

export interface ShareLink {
  id: string;
  token: string;
  period: string;
  createdAt: string;
  expiresAt: string;
  scope: string;
}

export function getShareLinks(): ShareLink[] {
  return readStore<ShareLink[]>(SHARE_KEY, []);
}

export function createShareLink(period: string): ShareLink {
  const now = new Date();
  const token = makeId("share").replace("share_", "");
  const link: ShareLink = {
    id: makeId("sl"),
    token,
    period,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 72 * 3_600_000).toISOString(),
    scope: "Revenue summary · payment modes · GST",
  };
  writeStore(SHARE_KEY, [link, ...getShareLinks()]);
  return link;
}

export function getShareLink(token: string): ShareLink | undefined {
  return getShareLinks().find((l) => l.token === token);
}

export function shareUrl(token: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/share/${token}`;
}

export function formatShareValidity(link: ShareLink): string {
  return new Date(link.expiresAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

/* ─────────────────────────── helpers for the console ─────────────────────────── */

export function sourceBreakdown(summary: LedgerSummary): { source: LedgerSource; label: string; amount: number; share: number }[] {
  return (Object.keys(SOURCE_LABELS) as LedgerSource[])
    .map((source) => ({
      source,
      label: SOURCE_LABELS[source],
      amount: summary.bySource[source] ?? 0,
      share: summary.gross ? round2(((summary.bySource[source] ?? 0) / summary.gross) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function moneyLabel(amount: number): string {
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(2)} Cr`;
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(2)} L`;
  return inr(amount);
}

/** CSV export used by the owner console "share the numbers" action. */
export function exportSummaryCsv() {
  const { today, week, month } = getTodayWeekMonth();
  downloadCsv("champions-revenue-summary.csv", [
    ["Period", "Gross (INR)", "Net (INR)", "GST (INR)", "Transactions"],
    ["Today", today.gross.toFixed(2), today.net.toFixed(2), today.gst.toFixed(2), today.count],
    ["This week", week.gross.toFixed(2), week.net.toFixed(2), week.gst.toFixed(2), week.count],
    ["This month", month.gross.toFixed(2), month.net.toFixed(2), month.gst.toFixed(2), month.count],
    [],
    ["Source", "Amount (INR)"],
    ...sourceBreakdown(month).map((r) => [r.label, r.amount.toFixed(2)]),
    [],
    ["Payment mode", "Amount (INR)"],
    ...(Object.keys(PAYMENT_LABELS) as LedgerPaymentMode[]).map((m) => [PAYMENT_LABELS[m], (month.byMode[m] ?? 0).toFixed(2)]),
  ]);
}

export function monthLabel(month: string): string {
  const d = new Date(`${month}-01T00:00:00`);
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

export function previousMonth(month: string): string {
  const d = new Date(`${month}-01T00:00:00`);
  d.setMonth(d.getMonth() - 1);
  return dateToISO(d).slice(0, 7);
}
