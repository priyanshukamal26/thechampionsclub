// =============================================================================
// Membership Data Structures, Seed Registry & Entitlement Services
// Project: The Champions Club Management System
// Requirements: A1, A2, A3, A4, A5, A6, X6, X7
// =============================================================================

export interface MembershipPlan {
  id: "gold" | "silver" | "junior";
  name: string;
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
    badgeColor: "#CCFF00",
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
    badgeColor: "#E2E8F0",
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
    badgeColor: "#F59E0B",
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
