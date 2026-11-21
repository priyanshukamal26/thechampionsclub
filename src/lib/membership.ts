// =============================================================================
// Membership Data Structures, Seed Registry & Entitlement Services
// Project: The Champions Club Management System
// Requirements: A1, A2, A3, A4, A5, A6, X6, X7
// =============================================================================

export interface MembershipPlan {
  id: "gold" | "silver" | "junior";
  name: string;
  shortName?: string;
  tagline?: string;
  badgeColor: string;
  priceMonthly: number;
  priceAnnual: number;
  courtMultiplier: number; // 0.0 = 100% free, 0.7 = 30% off, 0.5 = 50% off
  courtDiscountText: string;
  shopDiscountPct: number;
  barDiscountPct: number;
  freeFridaySocial: boolean;
  dailyCap: number;
  features: string[];
}

export const MEMBERSHIP_PLANS: Record<string, MembershipPlan> = {
  gold: {
    id: "gold",
    name: "Gold Champion",
    shortName: "Gold",
    tagline: "The full club, on your terms.",
    badgeColor: "#b2872c",
    priceMonthly: 4999.0,
    priceAnnual: 47990.0,
    courtMultiplier: 0.0,
    courtDiscountText: "100% Free Court Access (₹0/hr)",
    shopDiscountPct: 15.0,
    barDiscountPct: 15.0,
    freeFridaySocial: true,
    dailyCap: 2,
    features: [
      "All 18 courts & nets included at zero hourly fee",
      "Free entry to Friday Night Social Sessions",
      "15% flat privilege discount on Pro Shop gear",
      "15% flat privilege discount at Post-Match Bar & Lounge",
      "7-day priority booking window",
    ],
  },
  silver: {
    id: "silver",
    name: "Silver Standard",
    shortName: "Silver",
    tagline: "The everyday player's membership.",
    badgeColor: "#6e6555",
    priceMonthly: 2499.0,
    priceAnnual: 23990.0,
    courtMultiplier: 0.7,
    courtDiscountText: "30% Subsidized Court Access",
    shopDiscountPct: 5.0,
    barDiscountPct: 5.0,
    freeFridaySocial: false,
    dailyCap: 2,
    features: [
      "30% subsidized hourly court and net rates",
      "Access to Friday Night Socials (₹400 guest rate)",
      "5% privilege discount on Pro Shop gear",
      "5% privilege discount at Post-Match Bar & Lounge",
      "3-day advance booking window",
    ],
  },
  junior: {
    id: "junior",
    name: "Junior Prodigy",
    shortName: "Junior",
    tagline: "For athletes under eighteen.",
    badgeColor: "#c4502b",
    priceMonthly: 1699.0,
    priceAnnual: 16310.0,
    courtMultiplier: 0.5,
    courtDiscountText: "50% Youth Athlete Subsidized Rate",
    shopDiscountPct: 10.0,
    barDiscountPct: 10.0,
    freeFridaySocial: false,
    dailyCap: 2,
    features: [
      "50% subsidized training & court hours (under 18)",
      "DPDP Act 2023 verified parental consent tracking",
      "10% junior athlete discount on junior rackets & apparel",
      "10% discount on cafeteria healthy meal bowls & shakes",
      "Dedicated coaching clinic access",
    ],
  },
};

export interface MemberHistoryItem {
  id: string;
  date: string;
  type: "booking" | "shop" | "bar";
  title: string;
  details: string;
  amount: number;
  status: "completed" | "active" | "cancelled" | "unsettled";
}

export interface ClubMember {
  id: string;
  memberCode: string; // e.g. "TCC-2026-GOLD-089"
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  avatarUrl?: string;
  planId: "gold" | "silver" | "junior";
  status: "active" | "expiring_soon" | "expired" | "pending_consent";
  membershipStart: string;
  membershipEnd: string;
  duesPending: number;
  emergencyNotes?: string;
  isMinor: boolean;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  consentVerifiedAt?: string;
  consentVerifiedBy?: string;
  history: MemberHistoryItem[];
  staffNotes?: string[];
}

// Initial realistic synthetic membership registry
export const SEED_MEMBERS: ClubMember[] = [
  {
    id: "mem-001",
    memberCode: "TCC-2026-GOLD-001",
    fullName: "Rohan Mehra",
    email: "rohan@championsclub.in",
    phone: "+91 98110 44521",
    dob: "1994-06-12",
    planId: "gold",
    status: "active",
    membershipStart: "2026-01-01",
    membershipEnd: "2026-12-31",
    duesPending: 0.0,
    emergencyNotes: "Plays aggressive baseline tennis. Prefers Centre Court 1.",
    isMinor: false,
    staffNotes: ["Club champion finalist 2025.", "Always orders double espresso after evening matches."],
    history: [
      {
        id: "hist-001",
        date: "2026-11-20 18:00",
        type: "booking",
        title: "Centre Court 1 (Tennis)",
        details: "60-min session with partner Vikrant. Gold rate (₹0).",
        amount: 0.0,
        status: "completed",
      },
      {
        id: "hist-002",
        date: "2026-11-20 19:15",
        type: "bar",
        title: "Post-Match Cafeteria Tab",
        details: "Double Espresso + Whey Isolate Protein Shake. 15% discount applied.",
        amount: 374.0,
        status: "completed",
      },
      {
        id: "hist-003",
        date: "2026-11-15 11:30",
        type: "shop",
        title: "Pro Shop: Wilson US Open Balls (Can of 4)",
        details: "Counter purchase. 15% Gold privilege applied.",
        amount: 680.0,
        status: "completed",
      },
    ],
  },
  {
    id: "mem-002",
    memberCode: "TCC-2026-SILV-042",
    fullName: "Priya Sharma",
    email: "priya.s@outlook.com",
    phone: "+91 98722 11984",
    dob: "1998-11-04",
    planId: "silver",
    status: "active",
    membershipStart: "2026-04-01",
    membershipEnd: "2027-03-31",
    duesPending: 0.0,
    emergencyNotes: "Regular badminton league player. Prefers AC indoor courts.",
    isMinor: false,
    staffNotes: ["Member of women's Saturday doubles ladder."],
    history: [
      {
        id: "hist-004",
        date: "2026-11-18 19:30",
        type: "booking",
        title: "Badminton Court 3 (Indoor)",
        details: "60-min session. Silver 30% discount applied (₹560 paid).",
        amount: 560.0,
        status: "completed",
      },
      {
        id: "hist-005",
        date: "2026-11-18 20:45",
        type: "bar",
        title: "Electrolyte Cooler & Sourdough Toast",
        details: "Table 4. 5% Silver discount applied.",
        amount: 446.5,
        status: "completed",
      },
    ],
  },
  {
    id: "mem-003",
    memberCode: "TCC-2026-JUNR-108",
    fullName: "Aarav Patel",
    email: "aarav@championsclub.in",
    phone: "+91 97234 56780",
    dob: "2010-08-22", // 16 years old
    planId: "junior",
    status: "pending_consent",
    membershipStart: "2026-11-21",
    membershipEnd: "2027-11-20",
    duesPending: 0.0,
    emergencyNotes: "Under 18 youth athlete. All bookings require parental DPDP validation.",
    isMinor: true,
    guardianName: "Mahesh Patel",
    guardianPhone: "+91 98250 12345",
    guardianEmail: "mahesh.patel@gujaratgas.com",
    staffNotes: ["Awaiting online guardian email signature or physical check-in."],
    history: [],
  },
  {
    id: "mem-004",
    memberCode: "TCC-2025-GOLD-019",
    fullName: "Sunita Roy",
    email: "sunita.roy@biocon.in",
    phone: "+91 99001 88231",
    dob: "1987-03-19",
    planId: "gold",
    status: "expiring_soon",
    membershipStart: "2025-11-26",
    membershipEnd: "2026-11-26", // Expiring in 5 days!
    duesPending: 0.0,
    emergencyNotes: "Plays Padel every Tuesday and Thursday.",
    isMinor: false,
    staffNotes: ["Renewal reminder dispatched on Nov 15. Has verbal intent to renew Gold."],
    history: [
      {
        id: "hist-006",
        date: "2026-11-19 17:00",
        type: "booking",
        title: "Padel Court 1 (Panoramic)",
        details: "60-min session. Gold member free court access.",
        amount: 0.0,
        status: "completed",
      },
    ],
  },
  {
    id: "mem-005",
    memberCode: "TCC-2026-SILV-091",
    fullName: "Kabir Khan",
    email: "kabirkhan@sportslead.in",
    phone: "+91 98200 99120",
    dob: "1991-09-15",
    planId: "silver",
    status: "active",
    membershipStart: "2026-02-15",
    membershipEnd: "2027-02-14",
    duesPending: 1240.0, // Unsettled tab!
    emergencyNotes: "Open cafeteria tab from Nov 19 match (Table 7). Settle before next booking.",
    isMinor: false,
    staffNotes: ["Remind at desk to clear tab ₹1,240 before booking court."],
    history: [
      {
        id: "hist-007",
        date: "2026-11-19 21:00",
        type: "bar",
        title: "Table 7: 4x Post-Match Wraps & Coolers",
        details: "Unsettled tab. Silver 5% discount applied.",
        amount: 1240.0,
        status: "unsettled",
      },
    ],
  },
  {
    id: "mem-006",
    memberCode: "TCC-2026-GOLD-006",
    fullName: "Ananya Deshmukh",
    email: "ananya.d@mumbaitech.io",
    phone: "+91 98201 55670",
    dob: "1993-04-18",
    planId: "gold",
    status: "active",
    membershipStart: "2026-03-01",
    membershipEnd: "2027-02-28",
    duesPending: 0.0,
    emergencyNotes: "Prefers morning Squash Court 1.",
    isMinor: false,
    staffNotes: ["Club squash ladder rank #3."],
    history: [
      {
        id: "hist-008",
        date: "2026-11-17 08:00",
        type: "booking",
        title: "Squash Court 1",
        details: "45-min morning drill. Gold privilege applied (₹0).",
        amount: 0.0,
        status: "completed",
      },
    ],
  },
  {
    id: "mem-007",
    memberCode: "TCC-2026-GOLD-007",
    fullName: "Vikramaditya Singhania",
    email: "vikram.singhania@heritage.org",
    phone: "+91 98100 88722",
    dob: "1985-08-30",
    planId: "gold",
    status: "active",
    membershipStart: "2026-01-15",
    membershipEnd: "2027-01-14",
    duesPending: 0.0,
    emergencyNotes: "Tennis Centre Court 2 evening player.",
    isMinor: false,
    staffNotes: ["Founder member privilege."],
    history: [
      {
        id: "hist-009",
        date: "2026-11-16 19:00",
        type: "booking",
        title: "Tennis Centre Court 2",
        details: "60-min session. Gold member rate.",
        amount: 0.0,
        status: "completed",
      },
    ],
  },
  {
    id: "mem-008",
    memberCode: "TCC-2026-SILV-008",
    fullName: "Meenakshi Sundaram",
    email: "meenakshi.s@chennaiclaw.com",
    phone: "+91 94440 22319",
    dob: "1990-12-05",
    planId: "silver",
    status: "active",
    membershipStart: "2026-05-10",
    membershipEnd: "2027-05-09",
    duesPending: 0.0,
    emergencyNotes: "Plays table tennis on weekend afternoons.",
    isMinor: false,
    staffNotes: ["Registered at front desk counter."],
    history: [],
  },
  {
    id: "mem-009",
    memberCode: "TCC-2026-SILV-009",
    fullName: "Devendra Chawla",
    email: "devendra.c@delhicap.in",
    phone: "+91 98112 33490",
    dob: "1988-07-21",
    planId: "silver",
    status: "active",
    membershipStart: "2026-02-01",
    membershipEnd: "2027-01-31",
    duesPending: 0.0,
    emergencyNotes: "Regular badminton player (Court 2).",
    isMinor: false,
    staffNotes: ["Weekly Friday social participant."],
    history: [
      {
        id: "hist-010",
        date: "2026-11-14 20:00",
        type: "booking",
        title: "Badminton Court 2",
        details: "60-min doubles match. Silver rate.",
        amount: 560.0,
        status: "completed",
      },
    ],
  },
  {
    id: "mem-010",
    memberCode: "TCC-2026-JUNR-010",
    fullName: "Riya Sengupta",
    email: "riya.sengupta@kolkatasch.edu",
    phone: "+91 98300 44129",
    dob: "2009-10-14",
    planId: "junior",
    status: "active",
    membershipStart: "2026-06-01",
    membershipEnd: "2027-05-31",
    duesPending: 0.0,
    emergencyNotes: "Junior state ranking tennis player.",
    isMinor: true,
    guardianName: "Subhash Sengupta",
    guardianPhone: "+91 98301 11234",
    guardianEmail: "subhash.s@kolkatagas.com",
    consentVerifiedAt: "2026-06-01T10:00:00.000Z",
    consentVerifiedBy: "Amit Sharma (Front Desk Lead)",
    staffNotes: ["Coaching academy batch A."],
    history: [],
  },
  {
    id: "mem-011",
    memberCode: "TCC-2026-GOLD-011",
    fullName: "Aditya Kapoor",
    email: "aditya.k@noidafintech.com",
    phone: "+91 98711 99014",
    dob: "1992-01-25",
    planId: "gold",
    status: "active",
    membershipStart: "2026-01-10",
    membershipEnd: "2027-01-09",
    duesPending: 0.0,
    emergencyNotes: "Pickleball and padel enthusiast.",
    isMinor: false,
    staffNotes: ["Organizes corporate weekend matches."],
    history: [
      {
        id: "hist-011",
        date: "2026-11-13 18:30",
        type: "booking",
        title: "Padel Court 2",
        details: "60-min session. Gold free court privilege.",
        amount: 0.0,
        status: "completed",
      },
    ],
  },
  {
    id: "mem-012",
    memberCode: "TCC-2026-SILV-012",
    fullName: "Fatima Al-Mansoor",
    email: "fatima.m@hyderabadbio.in",
    phone: "+91 98490 66782",
    dob: "1995-11-12",
    planId: "silver",
    status: "active",
    membershipStart: "2026-03-15",
    membershipEnd: "2027-03-14",
    duesPending: 0.0,
    emergencyNotes: "Badminton indoor court specialist.",
    isMinor: false,
    staffNotes: ["Prefers late evening slots after 20:00."],
    history: [],
  },
  {
    id: "mem-013",
    memberCode: "TCC-2026-SILV-013",
    fullName: "Karan Johar Joshi",
    email: "karan.joshi@punesoft.com",
    phone: "+91 98220 88102",
    dob: "1989-05-03",
    planId: "silver",
    status: "active",
    membershipStart: "2026-04-10",
    membershipEnd: "2027-04-09",
    duesPending: 0.0,
    emergencyNotes: "Squash and gym regular.",
    isMinor: false,
    staffNotes: ["Regular cafeteria patron."],
    history: [],
  },
  {
    id: "mem-014",
    memberCode: "TCC-2026-GOLD-014",
    fullName: "Tanvi Agarwal",
    email: "tanvi.a@gurgaonvc.in",
    phone: "+91 98188 55410",
    dob: "1996-09-28",
    planId: "gold",
    status: "active",
    membershipStart: "2026-02-20",
    membershipEnd: "2027-02-19",
    duesPending: 0.0,
    emergencyNotes: "Padel Court 2 morning regular.",
    isMinor: false,
    staffNotes: ["Gold privileges verified."],
    history: [
      {
        id: "hist-012",
        date: "2026-11-12 07:30",
        type: "booking",
        title: "Padel Court 2",
        details: "60-min session. Gold member free access.",
        amount: 0.0,
        status: "completed",
      },
    ],
  },
  {
    id: "mem-015",
    memberCode: "TCC-2026-GOLD-015",
    fullName: "Siddharth Nambiar",
    email: "siddharth.n@bengaluruaero.com",
    phone: "+91 98450 77123",
    dob: "1986-02-14",
    planId: "gold",
    status: "active",
    membershipStart: "2026-01-05",
    membershipEnd: "2027-01-04",
    duesPending: 0.0,
    emergencyNotes: "Tennis Centre Court 1 singles player.",
    isMinor: false,
    staffNotes: ["Purchased 2 Wilson Pro Staff rackets from shop."],
    history: [],
  },
  {
    id: "mem-016",
    memberCode: "TCC-2026-SILV-016",
    fullName: "Pooja Kulkarni",
    email: "pooja.k@thanehealth.org",
    phone: "+91 98205 11983",
    dob: "1993-08-09",
    planId: "silver",
    status: "active",
    membershipStart: "2026-05-01",
    membershipEnd: "2027-04-30",
    duesPending: 0.0,
    emergencyNotes: "Table tennis and yoga studio player.",
    isMinor: false,
    staffNotes: ["Silver privileges active."],
    history: [],
  },
  {
    id: "mem-017",
    memberCode: "TCC-2026-JUNR-017",
    fullName: "Nikhil Verma",
    email: "nikhil.verma@delhischool.edu",
    phone: "+91 98118 77654",
    dob: "2011-03-17",
    planId: "junior",
    status: "active",
    membershipStart: "2026-07-01",
    membershipEnd: "2027-06-30",
    duesPending: 0.0,
    emergencyNotes: "Junior badminton prodigy.",
    isMinor: true,
    guardianName: "Vikas Verma",
    guardianPhone: "+91 98118 99881",
    guardianEmail: "vikas.verma@delhicap.in",
    consentVerifiedAt: "2026-07-01T11:30:00.000Z",
    consentVerifiedBy: "Amit Sharma (Front Desk Lead)",
    staffNotes: ["Parent attended orientation."],
    history: [],
  },
  {
    id: "mem-018",
    memberCode: "TCC-2026-SILV-018",
    fullName: "Shalini Mukherjee",
    email: "shalini.m@kolkatabooks.com",
    phone: "+91 98311 33290",
    dob: "1991-12-22",
    planId: "silver",
    status: "active",
    membershipStart: "2026-03-10",
    membershipEnd: "2027-03-09",
    duesPending: 0.0,
    emergencyNotes: "Badminton Court 1 doubles player.",
    isMinor: false,
    staffNotes: ["Women's weekend social team."],
    history: [],
  },
  {
    id: "mem-019",
    memberCode: "TCC-2026-GOLD-019G",
    fullName: "Arjun Reddy",
    email: "arjun.reddy@hyderabaddev.io",
    phone: "+91 98480 22341",
    dob: "1994-07-07",
    planId: "gold",
    status: "active",
    membershipStart: "2026-01-20",
    membershipEnd: "2027-01-19",
    duesPending: 0.0,
    emergencyNotes: "Squash Court 2 high-intensity player.",
    isMinor: false,
    staffNotes: ["Gold champion member."],
    history: [],
  },
  {
    id: "mem-020",
    memberCode: "TCC-2026-SILV-020",
    fullName: "Sneha Bhattacharya",
    email: "sneha.b@bengalurulabs.in",
    phone: "+91 98455 88901",
    dob: "1997-05-19",
    planId: "silver",
    status: "active",
    membershipStart: "2026-04-18",
    membershipEnd: "2027-04-17",
    duesPending: 0.0,
    emergencyNotes: "Pickleball and badminton weekend player.",
    isMinor: false,
    staffNotes: ["Registered online."],
    history: [],
  },
  {
    id: "mem-021",
    memberCode: "TCC-2026-GOLD-021",
    fullName: "Gaurav Tandon",
    email: "gaurav.tandon@lucknowinfra.com",
    phone: "+91 94150 44512",
    dob: "1988-10-10",
    planId: "gold",
    status: "active",
    membershipStart: "2026-02-11",
    membershipEnd: "2027-02-10",
    duesPending: 0.0,
    emergencyNotes: "Centre Court 1 tennis player.",
    isMinor: false,
    staffNotes: ["Gold annual membership paid via UPI."],
    history: [],
  },
];

// In-memory runtime registry with local persistence
let localMembers: ClubMember[] = [...SEED_MEMBERS];

export function getLocalMembers(): ClubMember[] {
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem("champions_members");
    if (cached) {
      try {
        localMembers = JSON.parse(cached);
      } catch {
        // Fallback to memory
      }
    }
  }
  return localMembers;
}

export function saveLocalMembers(members: ClubMember[]) {
  localMembers = members;
  if (typeof window !== "undefined") {
    localStorage.setItem("champions_members", JSON.stringify(members));
  }
}

export function getMemberById(id: string): ClubMember | undefined {
  const members = getLocalMembers();
  return members.find((m) => m.id === id || m.memberCode === id || m.email.toLowerCase() === id.toLowerCase());
}

export function searchMembers(query: string): ClubMember[] {
  const q = query.toLowerCase().trim();
  if (!q) return getLocalMembers();
  const members = getLocalMembers();
  return members.filter(
    (m) =>
      m.fullName.toLowerCase().includes(q) ||
      m.phone.includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.memberCode.toLowerCase().includes(q)
  );
}

export function registerMemberAtDesk(data: {
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  planId: "gold" | "silver" | "junior";
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  guardianVerifiedInPerson?: boolean;
}): { member: ClubMember; claimToken: string } {
  const members = getLocalMembers();
  const isMinor = Boolean(data.dob && new Date().getFullYear() - new Date(data.dob).getFullYear() < 18);
  const serial = String(members.length + 1).padStart(3, "0");
  const code = `TCC-2026-${data.planId.toUpperCase().slice(0, 4)}-${serial}`;

  const today = new Date().toISOString().split("T")[0];
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const expiry = nextYear.toISOString().split("T")[0];

  const newMember: ClubMember = {
    id: `mem-${crypto.randomUUID().slice(0, 8)}`,
    memberCode: code,
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    dob: data.dob,
    planId: data.planId,
    status: isMinor && !data.guardianVerifiedInPerson ? "pending_consent" : "active",
    membershipStart: today,
    membershipEnd: expiry,
    duesPending: 0.0,
    isMinor,
    guardianName: data.guardianName,
    guardianPhone: data.guardianPhone,
    guardianEmail: data.guardianEmail,
    consentVerifiedAt: data.guardianVerifiedInPerson ? new Date().toISOString() : undefined,
    consentVerifiedBy: data.guardianVerifiedInPerson ? "Front Desk (In-Person Verified)" : undefined,
    staffNotes: ["Registered at front desk counter."],
    history: [],
  };

  members.unshift(newMember);
  saveLocalMembers(members);

  const claimToken = `claim_${crypto.randomUUID().slice(0, 12)}`;
  return { member: newMember, claimToken };
}

export function verifyJuniorConsent(memberId: string, verifiedBy: string = "Amit Sharma (Front Desk Lead)") {
  const members = getLocalMembers();
  const member = members.find((m) => m.id === memberId);
  if (member) {
    member.status = "active";
    member.consentVerifiedAt = new Date().toISOString();
    member.consentVerifiedBy = verifiedBy;
    member.staffNotes = member.staffNotes || [];
    member.staffNotes.push(`DPDP Consent verified in person by ${verifiedBy} on ${new Date().toLocaleDateString("en-IN")}`);
    saveLocalMembers(members);
  }
}

export function getPendingConsentQueue(): ClubMember[] {
  const members = getLocalMembers();
  return members.filter((m) => m.status === "pending_consent" && m.isMinor);
}


