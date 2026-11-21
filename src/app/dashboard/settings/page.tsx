"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  Download,
  KeyRound,
  LogOut,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { PageHeader, Panel, StatusPill } from "@/components/ui/kit";
import { useAuth } from "@/lib/auth-context";
import {
  getLocalMembers,
  getMemberById,
  MEMBERSHIP_PLANS,
  saveLocalMembers,
  type ClubMember,
} from "@/lib/membership";
import { recordAuditLog } from "@/lib/audit";
import { formatDate } from "@/lib/store";
import { useRouter } from "next/navigation";

type Prefs = {
  bookingReminders: boolean;
  offers: boolean;
  tabAlerts: boolean;
  expiryReminders: boolean;
};

const PREF_KEY = "champions_prefs_v1";
const DEFAULT_PREFS: Prefs = {
  bookingReminders: true,
  offers: false,
  tabAlerts: true,
  expiryReminders: true,
};

export default function SettingsPage() {
  const { user, signOut, setUser } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "" });
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [passwordError, setPasswordError] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(PREF_KEY);
      if (raw) setPrefs({ ...DEFAULT_PREFS, ...(JSON.parse(raw) as Prefs) });
    } catch {
      /* ignore */
    }
  }, []);

  const member: ClubMember | undefined = useMemo(() => {
    if (!mounted || !user) return undefined;
    return getMemberById(user.email) ?? getLocalMembers().find((m) => m.email === user.email);
  }, [mounted, user]);

  useEffect(() => {
    if (!member) return;
    setForm({ fullName: member.fullName, email: member.email, phone: member.phone });
  }, [member]);

  if (!mounted || !user) {
    return <div className="mx-auto max-w-[900px] p-6"><div className="h-80 animate-pulse rounded-2xl bg-ink/[0.05]" /></div>;
  }

  const plan = member ? MEMBERSHIP_PLANS[member.planId] : undefined;

  const flash = (message: string) => {
    setSaved(message);
    window.setTimeout(() => setSaved(null), 3200);
  };

  const saveProfile = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.fullName.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      flash("Check the name and email before saving.");
      return;
    }
    if (member) {
      const members = getLocalMembers().map((m) =>
        m.id === member.id ? { ...m, fullName: form.fullName.trim(), email: form.email.trim(), phone: form.phone.trim() } : m
      );
      saveLocalMembers(members);
    }
    setUser({ ...user, fullName: form.fullName.trim(), email: form.email.trim() });
    recordAuditLog({
      actor: user.fullName,
      role: user.role,
      action: "profile.updated",
      entity: "profiles",
      entityId: member?.id,
      details: { email: form.email },
    });
    flash("Profile updated.");
  };

  const savePrefs = (next: Prefs) => {
    setPrefs(next);
    try {
      localStorage.setItem(PREF_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const changePassword = (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError("");
    if (passwords.next.length < 8) {
      setPasswordError("Use at least 8 characters.");
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setPasswordError("The two new passwords don't match.");
      return;
    }
    recordAuditLog({
      actor: user.fullName,
      role: user.role,
      action: "auth.password_changed",
      entity: "profiles",
      entityId: member?.id,
    });
    setPasswords({ current: "", next: "", confirm: "" });
    flash("Password changed. Use it next time you sign in.");
  };

  const exportData = () => {
    const payload = { account: user, member: member ?? null, exportedAt: new Date().toISOString(), preferences: prefs };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `champions-club-${member?.memberCode ?? user.email}.json`;
    link.click();
    URL.revokeObjectURL(url);
    flash("Your data export has been downloaded.");
  };

  const withdrawConsent = () => {
    if (!member) return;
    const members = getLocalMembers().map((m) =>
      m.id === member.id
        ? {
            ...m,
            status: "pending_consent" as const,
            consentVerifiedAt: undefined,
            consentVerifiedBy: undefined,
            staffNotes: [`Consent withdrawn by member on ${formatDate(new Date().toISOString().slice(0, 10))}.`, ...(m.staffNotes ?? [])],
          }
        : m
    );
    saveLocalMembers(members);
    recordAuditLog({
      actor: user.fullName,
      role: user.role,
      action: "consent.withdrawn",
      entity: "members",
      entityId: member.id,
    });
    setWithdrawing(false);
    flash("Consent withdrawn. The account is now read-only until it is re-verified.");
  };

  return (
    <div className="mx-auto max-w-[900px] space-y-6 p-5 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Account settings · A1 · X5 · X6"
        title="Your account, your rules."
        description="Update your details, choose what the club may contact you about, and exercise your data rights under the DPDP Act."
        actions={
          <button
            className="btn btn-outline btn-sm"
            onClick={async () => {
              await signOut();
              router.push("/");
            }}
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        }
        meta={
          <>
            <StatusPill tone="info">{user.role.replace("_", " ")}</StatusPill>
            {member && <span className="u-mono text-[10px] uppercase tracking-[0.14em] text-muted">{member.memberCode}</span>}
            {plan && <span className="u-mono text-[10px] uppercase tracking-[0.14em] text-muted">{plan.name}</span>}
          </>
        }
      />

      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-court/30 bg-court/10 px-4 py-2.5 text-[12px] text-court">
          <Check className="h-3.5 w-3.5" />
          {saved}
        </div>
      )}

      <Panel>
        <div className="flex items-center gap-2 border-b border-line pb-3">
          <UserRound className="h-4 w-4 text-muted" />
          <div>
            <div className="u-eyebrow text-muted">Profile</div>
            <div className="u-display text-[13px]">Who the club knows you as</div>
          </div>
        </div>
        <form onSubmit={saveProfile} className="mt-3 space-y-3">
          <div>
            <label className="u-label" htmlFor="set-name">Full name</label>
            <input id="set-name" className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="u-label" htmlFor="set-email">Email</label>
              <input id="set-email" type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="u-label" htmlFor="set-phone">Mobile</label>
              <input id="set-phone" className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91" />
            </div>
          </div>
          {member && (
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-line bg-paper-soft p-3 text-[10.5px] text-muted sm:grid-cols-4">
              <div><div className="u-eyebrow text-[8px]">Plan</div><div className="mt-0.5 text-ink">{plan?.name}</div></div>
              <div><div className="u-eyebrow text-[8px]">Member since</div><div className="mt-0.5 text-ink">{formatDate(member.membershipStart)}</div></div>
              <div><div className="u-eyebrow text-[8px]">Renews</div><div className="mt-0.5 text-ink">{formatDate(member.membershipEnd)}</div></div>
              <div><div className="u-eyebrow text-[8px]">Consent</div><div className="mt-0.5 text-ink">{member.consentVerifiedAt ? "Verified" : member.isMinor ? "Pending" : "Not required"}</div></div>
            </div>
          )}
          <div className="flex justify-end">
            <button type="submit" className="btn btn-clay btn-sm">Save profile</button>
          </div>
        </form>
      </Panel>

      <Panel>
        <div className="flex items-center gap-2 border-b border-line pb-3">
          <Bell className="h-4 w-4 text-muted" />
          <div>
            <div className="u-eyebrow text-muted">Notifications</div>
            <div className="u-display text-[13px]">What reaches you, and where</div>
          </div>
        </div>
        <div className="mt-2 divide-y divide-line-soft">
          {[
            { key: "bookingReminders" as const, label: "Booking reminders", detail: "A nudge two hours before your court." },
            { key: "tabAlerts" as const, label: "Tab alerts", detail: "When a café tab is left open after play." },
            { key: "expiryReminders" as const, label: "Membership expiry", detail: "Two weeks and two days before renewal." },
            { key: "offers" as const, label: "Club offers", detail: "Tournaments, clinics and Pro Shop drops." },
          ].map((row) => (
            <label key={row.key} className="flex cursor-pointer items-center justify-between gap-4 py-3">
              <span>
                <span className="block text-[12px] font-medium">{row.label}</span>
                <span className="block text-[10.5px] text-muted">{row.detail}</span>
              </span>
              <input
                type="checkbox"
                className="h-4 w-4 accent-[var(--color-court)]"
                checked={prefs[row.key]}
                onChange={(event) => savePrefs({ ...prefs, [row.key]: event.target.checked })}
              />
            </label>
          ))}
        </div>
        <p className="border-t border-line pt-2 text-[10px] text-muted">
          Preferences are stored on this device in the demo build. With Supabase connected they move to your profile row.
        </p>
      </Panel>

      <Panel>
        <div className="flex items-center gap-2 border-b border-line pb-3">
          <KeyRound className="h-4 w-4 text-muted" />
          <div>
            <div className="u-eyebrow text-muted">Security</div>
            <div className="u-display text-[13px]">Password and sessions</div>
          </div>
        </div>
        <form onSubmit={changePassword} className="mt-3 space-y-3">
          <div>
            <label className="u-label" htmlFor="pw-current">Current password</label>
            <input id="pw-current" type="password" className="input" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} autoComplete="current-password" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="u-label" htmlFor="pw-next">New password</label>
              <input id="pw-next" type="password" className="input" value={passwords.next} onChange={(e) => setPasswords({ ...passwords, next: e.target.value })} autoComplete="new-password" />
            </div>
            <div>
              <label className="u-label" htmlFor="pw-confirm">Confirm</label>
              <input id="pw-confirm" type="password" className="input" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} autoComplete="new-password" />
            </div>
          </div>
          {passwordError && <p className="text-[10.5px] text-clay-deep">{passwordError}</p>}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] text-muted">Demo build: changes are simulated, never stored in plain text.</span>
            <button type="submit" className="btn btn-outline btn-sm">Change password</button>
          </div>
        </form>
      </Panel>

      <Panel tone="deep">
        <div className="flex items-center gap-2 border-b border-line pb-3">
          <ShieldCheck className="h-4 w-4 text-muted" />
          <div>
            <div className="u-eyebrow text-muted">Privacy · DPDP Act 2023</div>
            <div className="u-display text-[13px]">Your data rights</div>
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-2 text-[11.5px] leading-relaxed text-muted">
          <p>
            You may access, correct, port and erase the personal data the club holds about you, and you may
            withdraw consent at any time. Requests are actioned at the front desk or by email.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button className="btn btn-outline btn-sm" onClick={exportData}>
              <Download className="h-3.5 w-3.5" />
              Download my data
            </button>
            {member?.isMinor && member.status !== "pending_consent" && (
              <button className="btn btn-outline btn-sm" onClick={() => setWithdrawing(true)}>
                <Trash2 className="h-3.5 w-3.5" />
                Withdraw guardian consent
              </button>
            )}
            <Link href="/contact" className="btn btn-outline btn-sm">
              Request erasure
            </Link>
          </div>
          {withdrawing && (
            <div className="mt-2 rounded-lg border border-clay/40 bg-clay/[0.06] p-3">
              <p className="text-[11px] text-clay-deep">
                Withdrawing consent deactivates booking and payments until a guardian verifies again. Invoices
                are retained for the statutory tax period.
              </p>
              <div className="mt-2 flex gap-2">
                <button className="btn btn-outline btn-sm" onClick={() => setWithdrawing(false)}>Cancel</button>
                <button className="btn btn-clay btn-sm" onClick={withdrawConsent}>Withdraw consent</button>
              </div>
            </div>
          )}
          {member?.consentVerifiedAt && (
            <p className="text-[10.5px]">
              Consent on file: verified by {member.consentVerifiedBy} on {formatDate(member.consentVerifiedAt.slice(0, 10))}.
            </p>
          )}
        </div>
      </Panel>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4 text-[10.5px] text-muted">
        <span>Synthetic demo · data stays in this browser unless a Supabase project is connected.</span>
        <Link href="/dashboard/pass" className="u-link">Back to my pass</Link>
      </div>
    </div>
  );
}
