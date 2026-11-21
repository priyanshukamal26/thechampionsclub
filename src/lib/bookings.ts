// =============================================================================
// Court booking + Friday Social engine
// Requirements: B1, B2, B3, B4, B5, B6, B7, B8, B9
// Local-first runtime (persisted in localStorage) with DB-shaped invariants:
//  - 60-minute sessions on :00 / :30 starts
//  - overlap prevention per facility (no two bookings on a court at once)
//  - max 2 active court bookings per member per day (IST calendar day)
//  - plan-based pricing (walk-ins pay a premium)
//  - 12-hour free cancellation window, late cancellation forfeits a fee
// =============================================================================

import { MEMBERSHIP_PLANS } from "./membership";
import { recordTransaction } from "./finance";
import {
  addDaysISO,
  dateToISO,
  formatDate,
  hashString,
  inr,
  labelToMinutes,
  makeId,
  minutesToLabel,
  mulberry32,
  offsetDate,
  readStore,
  todayISO,
  writeStore,
} from "./store";

export type Sport = "Tennis" | "Padel" | "Badminton" | "Cricket";
export type PlanId = "gold" | "silver" | "junior";
export type BookingStatus = "confirmed" | "cancelled" | "completed";
export type BookingSource = "member" | "front_desk" | "phone" | "social";
export type PaymentMode = "upi" | "card" | "cash" | "plan";

export interface Facility {
  id: string;
  name: string;
  sport: Sport;
  surface: string;
  basePrice: number;
  lighting: boolean;
  code: string;
}

export const FACILITIES: Facility[] = [
  { id: "tc1", name: "Centre Court 1", sport: "Tennis", surface: "ITF hard · US Open blue", basePrice: 1200, lighting: true, code: "T-01" },
  { id: "tc2", name: "Centre Court 2", sport: "Tennis", surface: "ITF hard · Melbourne blue", basePrice: 1200, lighting: true, code: "T-02" },
  { id: "tc3", name: "Clay Court 1", sport: "Tennis", surface: "European red clay", basePrice: 1000, lighting: true, code: "T-03" },
  { id: "tc4", name: "Clay Court 2", sport: "Tennis", surface: "European red clay", basePrice: 1000, lighting: false, code: "T-04" },
  { id: "tc5", name: "Grass Court", sport: "Tennis", surface: "Natural rye grass", basePrice: 1500, lighting: false, code: "T-05" },
  { id: "tc6", name: "Academy Court", sport: "Tennis", surface: "Cushioned acrylic", basePrice: 800, lighting: true, code: "T-06" },
  { id: "pc1", name: "Panoramic Padel 1", sport: "Padel", surface: "12mm tempered glass", basePrice: 1800, lighting: true, code: "P-01" },
  { id: "pc2", name: "Panoramic Padel 2", sport: "Padel", surface: "12mm tempered glass", basePrice: 1800, lighting: true, code: "P-02" },
  { id: "pc3", name: "Glass Padel 3", sport: "Padel", surface: "WPT supercourt turf", basePrice: 1400, lighting: true, code: "P-03" },
  { id: "pc4", name: "Academy Padel 4", sport: "Padel", surface: "Academy turf", basePrice: 1200, lighting: false, code: "P-04" },
  { id: "bc1", name: "Badminton Hall 1", sport: "Badminton", surface: "BWF Grade 1 indoor", basePrice: 800, lighting: true, code: "B-01" },
  { id: "bc2", name: "Badminton Hall 2", sport: "Badminton", surface: "BWF Grade 1 indoor", basePrice: 800, lighting: true, code: "B-02" },
  { id: "bc3", name: "Badminton Hall 3", sport: "Badminton", surface: "BWF Grade 1 indoor", basePrice: 800, lighting: true, code: "B-03" },
  { id: "bc4", name: "Badminton Hall 4", sport: "Badminton", surface: "BWF Grade 2 indoor", basePrice: 700, lighting: true, code: "B-04" },
  { id: "bc5", name: "Badminton Hall 5", sport: "Badminton", surface: "BWF Grade 2 indoor", basePrice: 700, lighting: true, code: "B-05" },
  { id: "bc6", name: "Badminton Hall 6", sport: "Badminton", surface: "BWF Grade 2 indoor", basePrice: 700, lighting: false, code: "B-06" },
  { id: "cn1", name: "Cricket Net · Pace", sport: "Cricket", surface: "Astroturf · 150kph machine", basePrice: 600, lighting: true, code: "C-01" },
  { id: "cn2", name: "Cricket Net · Spin", sport: "Cricket", surface: "Astroturf · spin machine", basePrice: 600, lighting: true, code: "C-02" },
];

export const SPORTS: Sport[] = ["Tennis", "Padel", "Badminton", "Cricket"];
export const SESSION_MINUTES = 60;
export const SLOT_STEP = 30;
export const OPEN_MINUTES = 6 * 60;
export const CLOSE_MINUTES = 23 * 60;

export const TIME_SLOTS: string[] = (() => {
  const slots: string[] = [];
  for (let m = OPEN_MINUTES; m + SESSION_MINUTES <= CLOSE_MINUTES; m += SLOT_STEP) {
    slots.push(minutesToLabel(m));
  }
  return slots;
})();

export const DAILY_BOOKING_CAP = 2;
export const FREE_CANCELLATION_HOURS = 12;
export const LATE_CANCELLATION_FEE = 300;
export const WALK_IN_MULTIPLIER = 1.15;

const BOOKINGS_KEY = "champions_bookings_v3";
const SOCIAL_KEY = "champions_social_v2";

export interface Booking {
  id: string;
  facilityId: string;
  date: string;
  start: string;
  durationMin: number;
  memberId: string;
  memberName: string;
  planId?: PlanId;
  price: number;
  status: BookingStatus;
  source: BookingSource;
  paymentMode: PaymentMode;
  bookedAt: string;
  cancelledAt?: string;
  cancellationFee?: number;
  checkedIn?: boolean;
}

export function getFacility(id: string): Facility | undefined {
  return FACILITIES.find((f) => f.id === id);
}

export function facilitiesBySport(sport: Sport | "All"): Facility[] {
  return sport === "All" ? FACILITIES : FACILITIES.filter((f) => f.sport === sport);
}

export function priceFor(facility: Facility, planId?: PlanId | "walk_in"): number {
  const plan = planId && planId !== "walk_in" ? MEMBERSHIP_PLANS[planId] : undefined;
  const multiplier = plan ? plan.courtMultiplier : WALK_IN_MULTIPLIER;
  return Math.round(facility.basePrice * multiplier);
}

export function planRateLabel(planId?: PlanId | "walk_in"): string {
  if (!planId || planId === "walk_in") return "Walker rate (+15%)";
  return MEMBERSHIP_PLANS[planId]?.courtDiscountText ?? "Standard rate";
}

/* ─────────────────────────── seed data ─────────────────────────── */

function seedBookings(): Booking[] {
  const seeded: Booking[] = [];
  const names = [
    ["Priya Sharma", "mem-002", "silver"],
    ["Kabir Khan", "mem-005", "silver"],
    ["Sunita Roy", "mem-004", "gold"],
    ["Vikrant Rao", "mem-010", "gold"],
    ["Ananya Deshmukh", "mem-011", "silver"],
    ["Nikhil Bhatia", "mem-012", "gold"],
    ["Tara Menon", "mem-013", "junior"],
  ] as const;

  for (let dayOffset = 0; dayOffset <= 8; dayOffset++) {
    const date = offsetDate(dayOffset);
    const rand = mulberry32(hashString(`bookings-${date}`));
    FACILITIES.forEach((facility, fi) => {
      const density = 0.18 + rand() * 0.2;
      TIME_SLOTS.forEach((slot, si) => {
        const value = mulberry32(hashString(`${facility.id}-${date}-${slot}`))();
        if (value > density) return;
        // don't stack overlapping sessions on the same facility
        const clash = seeded.some(
          (b) =>
            b.facilityId === facility.id &&
            b.date === date &&
            b.status === "confirmed" &&
            Math.abs(labelToMinutes(b.start) - labelToMinutes(slot)) < SESSION_MINUTES
        );
        if (clash) return;
        const member = names[(fi + si + dayOffset) % names.length];
        const planId = member[2] as PlanId;
        seeded.push({
          id: `seed-${facility.id}-${date}-${slot}`,
          facilityId: facility.id,
          date,
          start: slot,
          durationMin: SESSION_MINUTES,
          memberId: member[1],
          memberName: member[0],
          planId,
          price: priceFor(facility, planId),
          status: "confirmed",
          source: "member",
          paymentMode: planId === "gold" ? "plan" : "upi",
          bookedAt: `${date}T${slot}:00`,
        });
      });
    });
  }

  // Guaranteed demo bookings for the signed-in Gold member profile (Rohan Mehra).
  // Any seeded session that would clash is removed first, so the demo always has
  // a believable upcoming run of bookings on the member dashboard.
  const demo = [
    { day: 0, facility: "tc1", slot: "21:00" },
    { day: 1, facility: "tc3", slot: "18:00" },
    { day: 2, facility: "pc2", slot: "19:30" },
    { day: 3, facility: "bc2", slot: "08:00" },
    { day: 4, facility: "bc3", slot: "07:00" },
    { day: 5, facility: "pc1", slot: "20:00" },
  ];
  demo.forEach((d) => {
    const date = offsetDate(d.day);
    const facility = getFacility(d.facility)!;
    const id = `demo-rohan-${d.facility}-${date}`;
    const startMin = labelToMinutes(d.slot);
    for (let i = seeded.length - 1; i >= 0; i--) {
      const b = seeded[i];
      if (b.facilityId !== facility.id || b.date !== date) continue;
      if (b.memberId === "mem-001") continue;
      if (Math.abs(labelToMinutes(b.start) - startMin) < SESSION_MINUTES) seeded.splice(i, 1);
    }
    if (!seeded.some((b) => b.facilityId === facility.id && b.date === date && b.start === d.slot)) {
      seeded.push({
        id,
        facilityId: facility.id,
        date,
        start: d.slot,
        durationMin: SESSION_MINUTES,
        memberId: "mem-001",
        memberName: "Rohan Mehra",
        planId: "gold",
        price: 0,
        status: "confirmed",
        source: "member",
        paymentMode: "plan",
        bookedAt: new Date().toISOString(),
      });
    }
  });

  // A completed booking in the past for member history
  seeded.push({
    id: `past-rohan-${offsetDate(-2)}`,
    facilityId: "tc1",
    date: offsetDate(-2),
    start: "19:00",
    durationMin: SESSION_MINUTES,
    memberId: "mem-001",
    memberName: "Rohan Mehra",
    planId: "gold",
    price: 0,
    status: "completed",
    source: "member",
    paymentMode: "plan",
    bookedAt: `${offsetDate(-2)}T10:00:00`,
  });

  return seeded;
}

export function getBookings(): Booking[] {
  const stored = readStore<Booking[] | null>(BOOKINGS_KEY, null);
  if (stored && stored.length) return stored;
  const seeded = seedBookings();
  writeStore(BOOKINGS_KEY, seeded);
  return seeded;
}

function saveBookings(bookings: Booking[]) {
  writeStore(BOOKINGS_KEY, bookings);
}

/* ─────────────────────────── queries ─────────────────────────── */

export function bookingsOnDate(date: string): Booking[] {
  return getBookings().filter((b) => b.date === date);
}

export function upcomingBookingsForMember(identifier: string): Booking[] {
  const key = identifier.toLowerCase();
  const now = new Date();
  return getBookings()
    .filter(
      (b) =>
        b.status === "confirmed" &&
        (b.memberId.toLowerCase() === key || b.memberName.toLowerCase() === key) &&
        new Date(`${b.date}T${b.start}:00`) >= now
    )
    .sort((a, b) => `${a.date}T${a.start}`.localeCompare(`${b.date}T${b.start}`));
}

export function bookingsForMember(identifier: string): Booking[] {
  const key = identifier.toLowerCase();
  return getBookings().filter(
    (b) => b.memberId.toLowerCase() === key || b.memberName.toLowerCase() === key
  );
}

export function activeBookingsForMemberOnDate(memberId: string, date: string): Booking[] {
  return getBookings().filter(
    (b) => b.memberId === memberId && b.date === date && b.status === "confirmed"
  );
}

export interface BookingQuote {
  ok: boolean;
  reason?: string;
  price?: number;
  facility?: Facility;
}

export function canBook(memberId: string, date: string, start: string, facilityId: string): BookingQuote {
  const facility = getFacility(facilityId);
  if (!facility) return { ok: false, reason: "That facility does not exist." };
  if (!TIME_SLOTS.includes(start)) return { ok: false, reason: "Sessions start on the hour or half hour." };
  if (isPast(date, start)) return { ok: false, reason: "That slot has already started." };
  if (isSlotTaken(facilityId, date, start)) return { ok: false, reason: "That court is already reserved for this slot." };
  const active = activeBookingsForMemberOnDate(memberId, date);
  if (active.length >= DAILY_BOOKING_CAP) {
    return {
      ok: false,
      reason: `Daily limit reached — ${DAILY_BOOKING_CAP} court sessions per member per day.`,
      facility,
    };
  }
  return { ok: true, facility };
}

export function isPast(date: string, start: string): boolean {
  return new Date(`${date}T${start}:00`).getTime() < Date.now();
}

export function isSlotTaken(facilityId: string, date: string, start: string, ignoreId?: string): boolean {
  const startMin = labelToMinutes(start);
  return getBookings().some((b) => {
    if (b.id === ignoreId) return false;
    if (b.facilityId !== facilityId || b.date !== date || b.status !== "confirmed") return false;
    const existing = labelToMinutes(b.start);
    return Math.abs(existing - startMin) < SESSION_MINUTES; // 60-min sessions overlap across half-hour starts
  });
}

export type SlotState = "free" | "booked" | "past";

export function availabilityFor(date: string): Record<string, Record<string, SlotState>> {
  const now = Date.now();
  const result: Record<string, Record<string, SlotState>> = {};
  const bookings = bookingsOnDate(date);
  FACILITIES.forEach((facility) => {
    result[facility.id] = {};
    TIME_SLOTS.forEach((slot) => {
      const startTs = new Date(`${date}T${slot}:00`).getTime();
      if (startTs < now) {
        result[facility.id][slot] = "past";
        return;
      }
      const slotMin = labelToMinutes(slot);
      const taken = bookings.some(
        (b) =>
          b.facilityId === facility.id &&
          b.status === "confirmed" &&
          Math.abs(labelToMinutes(b.start) - slotMin) < SESSION_MINUTES
      );
      result[facility.id][slot] = taken ? "booked" : "free";
    });
  });
  return result;
}

/* ─────────────────────────── mutations ─────────────────────────── */

export interface CreateBookingInput {
  facilityId: string;
  date: string;
  start: string;
  memberId: string;
  memberName: string;
  planId?: PlanId;
  source?: BookingSource;
  paymentMode?: PaymentMode;
}

export function createBooking(input: CreateBookingInput): { ok: boolean; booking?: Booking; error?: string } {
  const quote = canBook(input.memberId, input.date, input.start, input.facilityId);
  if (!quote.ok || !quote.facility) return { ok: false, error: quote.reason };

  const price = priceFor(quote.facility, input.planId);
  const booking: Booking = {
    id: makeId("bk"),
    facilityId: quote.facility.id,
    date: input.date,
    start: input.start,
    durationMin: SESSION_MINUTES,
    memberId: input.memberId,
    memberName: input.memberName,
    planId: input.planId,
    price,
    status: "confirmed",
    source: input.source ?? "member",
    paymentMode: input.paymentMode ?? (input.planId === "gold" ? "plan" : "upi"),
    bookedAt: new Date().toISOString(),
  };

  const bookings = getBookings();
  bookings.push(booking);
  saveBookings(bookings);
  return { ok: true, booking };
}

export interface CancellationQuote {
  hoursToStart: number;
  free: boolean;
  fee: number;
  deadlineLabel: string;
}

export function cancellationQuote(booking: Booking, now = new Date()): CancellationQuote {
  const start = new Date(`${booking.date}T${booking.start}:00`);
  const hoursToStart = Math.max(0, (start.getTime() - now.getTime()) / 3_600_000);
  const free = hoursToStart >= FREE_CANCELLATION_HOURS;
  const fee = free ? 0 : booking.price > 0 ? booking.price : LATE_CANCELLATION_FEE;
  return {
    hoursToStart,
    free,
    fee,
    deadlineLabel: new Date(start.getTime() - FREE_CANCELLATION_HOURS * 3_600_000).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

export function cancelBooking(
  bookingId: string,
  reason = "Member cancellation"
): { ok: boolean; free?: boolean; fee?: number; error?: string; booking?: Booking } {
  const bookings = getBookings();
  const booking = bookings.find((b) => b.id === bookingId);
  if (!booking) return { ok: false, error: "Booking not found." };
  if (booking.status !== "confirmed") return { ok: false, error: "Only confirmed bookings can be cancelled." };

  const quote = cancellationQuote(booking);
  booking.status = "cancelled";
  booking.cancelledAt = new Date().toISOString();
  booking.cancellationFee = quote.fee;
  saveBookings(bookings);

  if (quote.fee > 0) {
    recordTransaction({
      source: "court",
      description: `Late cancellation fee · ${getFacility(booking.facilityId)?.name ?? "Court"}`,
      gross: quote.fee,
      paymentMode: "card",
      taxCode: "SAC 998413",
      memberName: booking.memberName,
      ref: booking.id,
    });
  }
  if (!quote.free) console.info("[booking]", reason);

  return { ok: true, free: quote.free, fee: quote.fee, booking };
}

export function checkInBooking(bookingId: string): boolean {
  const bookings = getBookings();
  const booking = bookings.find((b) => b.id === bookingId);
  if (!booking) return false;
  booking.checkedIn = true;
  saveBookings(bookings);
  return true;
}

/* ─────────────────────────── Friday Social ─────────────────────────── */

export type SocialPlayerType = "gold" | "silver" | "junior" | "corporate" | "guest";

export interface SocialPlayer {
  id: string;
  name: string;
  memberId?: string;
  type: SocialPlayerType;
  joinedAt: string;
  paid: boolean;
  paymentMode?: PaymentMode;
}

export interface SocialSession {
  id: string;
  date: string;
  start: string;
  end: string;
  title: string;
  courtIds: string[];
  capacity: number;
  guestFee: number;
  players: SocialPlayer[];
}

export const SOCIAL_CAPACITY = 20;
export const SOCIAL_GUEST_FEE = 400;

function fridayAfter(dateISO: string, weeks: number): string {
  const d = new Date(`${dateISO}T00:00:00`);
  const delta = (5 - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + delta + weeks * 7);
  return dateToISO(d);
}

function seedSocial(): SocialSession[] {
  const base = todayISO();
  const sessions: SocialSession[] = [];
  for (let w = 0; w < 3; w++) {
    const date = fridayAfter(base, w);
    if (date < base) continue;
    const rand = mulberry32(hashString(`social-${date}`));
    const names = [
      "Rohan Mehra", "Ananya Deshmukh", "Vikrant Rao", "Priya Sharma", "Nikhil Bhatia",
      "Tara Menon", "Kabir Khan", "Sunita Roy", "Aditya Nair", "Meher Gill",
      "Zoya Ali", "Arjun Sethi", "Diya Kulkarni", "Rehan Qureshi", "Ishaan Verma",
    ];
    const count = 8 + Math.floor(rand() * 6);
    const players: SocialPlayer[] = names.slice(0, count).map((name, i) => ({
      id: `sp-${date}-${i}`,
      name,
      type: name === "Rohan Mehra" ? "gold" : i % 5 === 4 ? "guest" : "gold",
      joinedAt: `${addDaysISO(date, -2)}T12:00:00`,
      paid: true,
      paymentMode: i % 4 === 0 ? "upi" : "plan",
    }));
    sessions.push({
      id: `social-${date}`,
      date,
      start: "19:00",
      end: "22:30",
      title: w === 0 ? "Friday Night Social · Rotating Doubles" : "Friday Night Social",
      courtIds: ["tc1", "tc2", "pc1"],
      capacity: SOCIAL_CAPACITY,
      guestFee: SOCIAL_GUEST_FEE,
      players,
    });
  }
  return sessions;
}

export function getSocialSessions(): SocialSession[] {
  const stored = readStore<SocialSession[] | null>(SOCIAL_KEY, null);
  if (stored && stored.length) return stored;
  const seeded = seedSocial();
  writeStore(SOCIAL_KEY, seeded);
  return seeded;
}

function saveSocial(sessions: SocialSession[]) {
  writeStore(SOCIAL_KEY, sessions);
}

export function getSocialSession(id: string): SocialSession | undefined {
  return getSocialSessions().find((s) => s.id === id);
}

export function nextSocialSession(): SocialSession | undefined {
  const today = todayISO();
  return getSocialSessions()
    .filter((s) => s.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
}

export function joinSocial(
  sessionId: string,
  player: { name: string; memberId?: string; type: SocialPlayerType }
): { ok: boolean; session?: SocialSession; player?: SocialPlayer; fee?: number; error?: string } {
  const sessions = getSocialSessions();
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) return { ok: false, error: "Session not found." };
  if (session.players.length >= session.capacity) return { ok: false, error: "This Friday's roster is full (20 players)." };
  if (session.players.some((p) => p.name.toLowerCase() === player.name.trim().toLowerCase())) {
    return { ok: false, error: "That player is already on the roster." };
  }
  const fee = player.type === "gold" ? 0 : session.guestFee;
  const entry: SocialPlayer = {
    id: makeId("sp"),
    name: player.name.trim(),
    memberId: player.memberId,
    type: player.type,
    joinedAt: new Date().toISOString(),
    paid: fee === 0,
    paymentMode: fee === 0 ? "plan" : undefined,
  };
  session.players.push(entry);
  saveSocial(sessions);
  return { ok: true, session, player: entry, fee };
}

export function paySocialGuest(
  sessionId: string,
  playerId: string,
  mode: PaymentMode
): { ok: boolean; error?: string; fee?: number } {
  const sessions = getSocialSessions();
  const session = sessions.find((s) => s.id === sessionId);
  const player = session?.players.find((p) => p.id === playerId);
  if (!session || !player) return { ok: false, error: "Player not found." };
  if (player.paid) return { ok: true, fee: 0 };
  player.paid = true;
  player.paymentMode = mode;
  saveSocial(sessions);
  recordTransaction({
    source: "social",
    description: `Friday social guest pass · ${session.date}`,
    gross: session.guestFee,
    paymentMode: mode === "plan" ? "upi" : mode,
    taxCode: "SAC 998413",
    memberName: player.name,
    ref: session.id,
  });
  return { ok: true, fee: session.guestFee };
}

export function leaveSocial(sessionId: string, playerId: string): { ok: boolean; error?: string } {
  const sessions = getSocialSessions();
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) return { ok: false, error: "Session not found." };
  const before = session.players.length;
  session.players = session.players.filter((p) => p.id !== playerId);
  if (session.players.length === before) return { ok: false, error: "Player not on roster." };
  saveSocial(sessions);
  return { ok: true };
}

export interface SocialRoundPairing {
  court: string;
  teamA: string[];
  teamB: string[];
}

export interface SocialRound {
  round: number;
  pairings: SocialRoundPairing[];
}

/** Deterministic rotating-doubles draw: everyone plays, partners rotate each round. */
export function buildRotation(session: SocialSession, rounds = 3): SocialRound[] {
  const names = session.players.map((p) => p.name);
  if (names.length < 4) return [];
  const result: SocialRound[] = [];
  const courts = session.courtIds.length ? session.courtIds : ["tc1"];
  const slots = Math.min(courts.length * 4, names.length);
  for (let r = 0; r < rounds; r++) {
    const rotated = [...names.slice(r * 2), ...names.slice(0, r * 2)];
    const pairings: SocialRoundPairing[] = [];
    for (let c = 0; c < courts.length; c++) {
      const chunk = rotated.slice(c * 4, c * 4 + 4);
      if (chunk.length < 4) break;
      pairings.push({ court: courts[c], teamA: [chunk[0], chunk[1]], teamB: [chunk[2], chunk[3]] });
    }
    result.push({ round: r + 1, pairings });
  }
  return result;
}

export function socialGuestFeeLabel(fee: number): string {
  return fee === 0 ? "Included with membership" : inr(fee);
}

export function socialDateLabel(date: string): string {
  return formatDate(date, { weekday: "long", day: "numeric", month: "short" });
}
