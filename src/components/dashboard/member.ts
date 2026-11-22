// Shared helpers for the member-facing dashboard surfaces (overview, pass, settings).
// The app is local-first: member records live in src/lib/membership.ts and are read
// through its accessors so desk registrations show up immediately.

import type { ClubUser } from "@/lib/auth-context";
import {
  MEMBERSHIP_PLANS,
  getLocalMembers,
  getMemberById,
  type ClubMember,
  type MembershipPlan,
} from "@/lib/membership";
import { formatDate } from "@/lib/store";
import type { PillTone } from "@/components/ui/kit";

const DAY_MS = 86_400_000;

/** Resolve the signed-in account to a club member record.
 *  Priority: exact email → exact full name → synthesized stub.
 *  We NEVER fall back to a random seed member by planId or SEED_MEMBERS[0]
 *  because that caused the stale-identity leak (Priya shown for Somya). */
export function resolveMemberForUser(user: ClubUser): ClubMember {
  const byEmail = user.email ? getMemberById(user.email) : undefined;
  if (byEmail) return byEmail;

  const members = getLocalMembers();
  const byName = members.find((m) => m.fullName.toLowerCase() === user.fullName.toLowerCase());
  if (byName) return byName;

  // Synthesize a stub record bound to this user's identity — never leak
  // another member's data.
  const today = new Date().toISOString().split("T")[0];
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  return {
    id: user.memberId ?? user.id,
    memberCode: `TCC-2026-${(user.planId ?? "silv").toUpperCase().slice(0, 4)}-NEW`,
    fullName: user.fullName,
    email: user.email,
    phone: "",
    dob: "",
    planId: user.planId ?? "silver",
    status: user.status === "pending_consent" ? "pending_consent" : "active",
    membershipStart: today,
    membershipEnd: nextYear.toISOString().split("T")[0],
    duesPending: 0,
    isMinor: user.isMinor ?? false,
    history: [],
  };
}

export function planForMember(member: ClubMember): MembershipPlan {
  return MEMBERSHIP_PLANS[member.planId] ?? MEMBERSHIP_PLANS.gold;
}

/** Whole days from today until the (date-only) membership end. Negative once expired. */
export function daysUntil(iso: string): number {
  const target = new Date(`${iso}T00:00:00`).getTime();
  return Math.ceil((target - Date.now()) / DAY_MS);
}

export type MemberState = "active" | "expiring_soon" | "expired" | "pending_consent";

export function memberState(member: ClubMember): MemberState {
  if (member.status === "pending_consent") return "pending_consent";
  if (member.status === "expired") return "expired";
  const left = daysUntil(member.membershipEnd);
  if (left <= 0) return "expired";
  if (left <= 30) return "expiring_soon";
  return "active";
}

export function memberStateLabel(state: MemberState): string {
  switch (state) {
    case "active":
      return "Active member";
    case "expiring_soon":
      return "Renewal due";
    case "expired":
      return "Expired";
    case "pending_consent":
      return "Consent pending";
  }
}

export function memberStateTone(state: MemberState): PillTone {
  switch (state) {
    case "active":
      return "success";
    case "expiring_soon":
      return "warn";
    case "expired":
      return "danger";
    case "pending_consent":
      return "info";
  }
}

/** Percentage of the membership year already used (0–100), for the validity meter. */
export function validityProgress(member: ClubMember): number {
  const start = new Date(`${member.membershipStart}T00:00:00`).getTime();
  const end = new Date(`${member.membershipEnd}T00:00:00`).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 100;
  return Math.max(0, Math.min(100, Math.round(((Date.now() - start) / (end - start)) * 100)));
}

export function formatMemberDate(iso: string): string {
  if (!iso) return "—";
  return formatDate(iso.slice(0, 10), { day: "numeric", month: "short", year: "numeric" });
}

/** Value encoded in the member QR: identical to the existing pass so scanner lookups stay valid. */
export function memberQrValue(member: ClubMember): string {
  return `TCC:${member.memberCode}:${member.email}`;
}

/** Membership history rows use "YYYY-MM-DD HH:MM" strings; render them in en-IN. */
export function historyDateLabel(raw: string): string {
  const [datePart, timePart = "00:00"] = raw.split(" ");
  const date = new Date(`${datePart}T${timePart}:00`);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export const CLUB_ROLE_LABEL: Record<ClubUser["role"], string> = {
  owner: "Owner",
  manager: "Club Manager",
  front_desk: "Front Desk",
  bar_staff: "Bar / Kitchen Staff",
  shop_manager: "Shop Manager",
  cafe_manager: "Café Manager",
  member: "Member",
};
