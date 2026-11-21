"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Search,
  UserPlus,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Phone,
  Mail,
  Copy,
  Check,
  QrCode,
  ShieldAlert,
} from "lucide-react";
import {
  searchMembers,
  registerMemberAtDesk,
  verifyJuniorConsent,
  getPendingConsentQueue,
  ClubMember,
  MEMBERSHIP_PLANS,
} from "@/lib/membership";
import { recordAuditLog } from "@/lib/audit";
import { useAuth } from "@/lib/auth-context";

export default function FrontDeskDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"lookup" | "register" | "consent">("lookup");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<ClubMember | null>(null);

  // Registration Form State
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regDob, setRegDob] = useState("");
  const [regPlanId, setRegPlanId] = useState<"gold" | "silver" | "junior">("gold");
  const [regGuardianName, setRegGuardianName] = useState("");
  const [regGuardianPhone, setRegGuardianPhone] = useState("");
  const [regGuardianEmail, setRegGuardianEmail] = useState("");
  const [regGuardianVerified, setRegGuardianVerified] = useState(false);
  const [registeredResult, setRegisteredResult] = useState<{ member: ClubMember; claimToken: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Consent Queue State
  const [consentQueue, setConsentQueue] = useState<ClubMember[]>(getPendingConsentQueue());
  const [verificationSuccessId, setVerificationSuccessId] = useState<string | null>(null);

  if (!user) return null;

  const searchResults = searchMembers(searchQuery);
  const isMinorReg = Boolean(regDob && new Date().getFullYear() - new Date(regDob).getFullYear() < 18);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName || !regEmail || !regPhone) return;

    const result = registerMemberAtDesk({
      fullName: regFullName,
      email: regEmail,
      phone: regPhone,
      dob: regDob,
      planId: isMinorReg ? "junior" : regPlanId,
      guardianName: regGuardianName,
      guardianPhone: regGuardianPhone,
      guardianEmail: regGuardianEmail,
      guardianVerifiedInPerson: regGuardianVerified,
    });

    recordAuditLog({
      action: "desk_register_member",
      entity: "members",
      entityId: result.member.id,
      details: { code: result.member.memberCode, plan: result.member.planId, staff: user.fullName },
    });

    setRegisteredResult(result);
    setRegFullName("");
    setRegEmail("");
    setRegPhone("");
    setRegDob("");
    setRegGuardianName("");
    setRegGuardianPhone("");
    setRegGuardianEmail("");
  };

  const handleVerifyConsent = (memberId: string) => {
    verifyJuniorConsent(memberId, `${user.fullName} (Front Desk)`);
    recordAuditLog({
      action: "verify_junior_dpdp_consent",
      entity: "guardian_consents",
      entityId: memberId,
      details: { verifiedBy: user.fullName, method: "in_person_desk" },
    });

    setVerificationSuccessId(memberId);
    setTimeout(() => {
      setConsentQueue(getPendingConsentQueue());
      setVerificationSuccessId(null);
    }, 1200);
  };

  const handleCopyClaimLink = (token: string) => {
    const url = `${window.location.origin}/login?claim=${token}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#CCFF00] block mb-1">
            Front Desk Console (DSK-3, DSK-4, DSK-5)
          </span>
          <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-extrabold uppercase text-white">
            Staff Counter & Scanner
          </h1>
        </div>

        {/* Tab Selector */}
        <div className="inline-flex p-1.5 rounded-2xl bg-[#141414] border border-[#222222]">
          <button
            onClick={() => setActiveTab("lookup")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === "lookup"
                ? "bg-[#CCFF00] text-[#0A0A0A] shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                : "text-[#888888] hover:text-white"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Lookup & Scan (A5)</span>
          </button>

          <button
            onClick={() => setActiveTab("register")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === "register"
                ? "bg-[#CCFF00] text-[#0A0A0A] shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                : "text-[#888888] hover:text-white"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Walk-In Registration (A1)</span>
          </button>

          <button
            onClick={() => setActiveTab("consent")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 relative ${
              activeTab === "consent"
                ? "bg-[#CCFF00] text-[#0A0A0A] shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                : "text-[#888888] hover:text-white"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>DPDP Minors ({consentQueue.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: LOOKUP */}
      {activeTab === "lookup" && (
        <div className="space-y-6">
          <div className="p-4 rounded-3xl bg-[#141414] border border-[#1F1F1F] shadow-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Scan QR pass or search by name, phone (+91), email, or member code (e.g. TCC-2026-GOLD-001)..."
                className="w-full bg-[#0A0A0A] border border-[#222222] focus:border-[#CCFF00] rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-[#555555] outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-2 max-h-[550px] overflow-y-auto pr-1">
              {searchResults.map((m) => {
                const plan = MEMBERSHIP_PLANS[m.planId];
                const isSelected = selectedMember?.id === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMember(m)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#1C1C1C] border-[#CCFF00] shadow-[0_0_20px_rgba(204,255,0,0.15)]"
                        : "bg-[#111111] border-[#1F1F1F] hover:border-[#333333]"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="font-bold text-white text-sm">{m.fullName}</div>
                      <span
                        className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border"
                        style={{ color: plan.badgeColor, borderColor: `${plan.badgeColor}40`, backgroundColor: `${plan.badgeColor}15` }}
                      >
                        {plan.name}
                      </span>
                    </div>
                    <div className="text-xs text-[#888888] flex items-center justify-between font-mono">
                      <span>{m.memberCode}</span>
                      <span>{m.phone}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      {m.duesPending > 0 && (
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30">
                          Dues: ₹{m.duesPending}
                        </span>
                      )}
                      {m.status === "expiring_soon" && (
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          Expiring Soon
                        </span>
                      )}
                      {m.status === "active" && m.duesPending === 0 && (
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-green-500/15 text-green-400 border border-green-500/30">
                          Good Standing
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-7">
              {selectedMember ? (
                <div className="bg-[#141414] border border-[#222222] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-[#222222]">
                    <div>
                      <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-extrabold uppercase text-white">
                        {selectedMember.fullName}
                      </h3>
                      <div className="text-xs text-[#888888] font-mono mt-0.5">{selectedMember.memberCode}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-[#777777]">Valid Thru</div>
                      <div className="text-xs font-mono font-bold text-white">{selectedMember.membershipEnd}</div>
                    </div>
                  </div>

                  {selectedMember.duesPending > 0 && (
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-between">
                      <div className="text-xs text-red-300">
                        <strong>Unpaid Cafeteria Dues:</strong> ₹{selectedMember.duesPending.toFixed(2)}
                      </div>
                      <button className="text-xs font-bold uppercase bg-red-500 hover:bg-red-400 text-white px-3 py-1.5 rounded-lg transition-colors">
                        Collect Cash/UPI
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
                      <div className="text-[9px] uppercase font-bold text-[#666666]">Court Rate</div>
                      <div className="text-xs font-extrabold text-[#CCFF00] mt-1">
                        {MEMBERSHIP_PLANS[selectedMember.planId].courtDiscountText}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
                      <div className="text-[9px] uppercase font-bold text-[#666666]">Pro Shop</div>
                      <div className="text-xs font-extrabold text-purple-400 mt-1">
                        {MEMBERSHIP_PLANS[selectedMember.planId].shopDiscountPct}% Privilege
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F]">
                      <div className="text-[9px] uppercase font-bold text-[#666666]">Lounge</div>
                      <div className="text-xs font-extrabold text-orange-400 mt-1">
                        {MEMBERSHIP_PLANS[selectedMember.planId].barDiscountPct}% Privilege
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#777777] mb-2">Past Activity</div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {selectedMember.history.map((h) => (
                        <div key={h.id} className="p-2.5 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-white">{h.title}</div>
                            <div className="text-[10px] text-[#777777]">{h.details}</div>
                          </div>
                          <div className="font-mono text-white font-bold">{h.amount === 0 ? "₹0.00" : `₹${h.amount.toFixed(2)}`}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#141414] border border-[#222222] rounded-3xl p-12 text-center text-[#666666] text-xs h-full flex flex-col items-center justify-center">
                  <QrCode className="w-12 h-12 mb-3 text-[#444444]" />
                  <p>Select a member from the left list to view pass details, scan status, and clear dues.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REGISTER WALK-IN */}
      {activeTab === "register" && (
        <div className="max-w-2xl mx-auto">
          {registeredResult ? (
            <div className="bg-[#141414] border border-[#222222] rounded-3xl p-8 text-center space-y-5">
              <CheckCircle2 className="w-12 h-12 text-[#CCFF00] mx-auto" />
              <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-extrabold uppercase text-white">
                Member Registered: {registeredResult.member.fullName}
              </h3>
              <div className="text-xs text-[#888888] font-mono">
                Code: {registeredResult.member.memberCode} · Plan: {registeredResult.member.planId.toUpperCase()}
              </div>
              <div className="p-4 rounded-2xl bg-[#0D0D0D] border border-[#222222] text-left text-xs space-y-2">
                <span className="text-[10px] font-bold text-[#888888] uppercase block">Invite Claim Link:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/login?claim=${registeredResult.claimToken}`}
                    className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl px-3 py-2 text-xs font-mono text-[#CCFF00]"
                  />
                  <button onClick={() => handleCopyClaimLink(registeredResult.claimToken)} className="p-2 rounded-xl bg-[#222222] text-white">
                    {copiedLink ? <Check className="w-4 h-4 text-[#CCFF00]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                onClick={() => setRegisteredResult(null)}
                className="w-full bg-[#CCFF00] text-[#0A0A0A] font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl hover:bg-[#a8cc00] transition-all"
              >
                Enroll Next Athlete
              </button>
            </div>
          ) : (
            <div className="bg-[#141414] border border-[#1F1F1F] rounded-3xl p-8 shadow-2xl">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-extrabold uppercase text-white mb-4">
                Walk-In Registration
              </h2>
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#AAAAAA] mb-1">Full Name</label>
                  <input type="text" required value={regFullName} onChange={(e) => setRegFullName(e.target.value)} placeholder="Full name" className="w-full bg-[#0D0D0D] border border-[#222222] rounded-xl px-4 py-3 text-sm text-white outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#AAAAAA] mb-1">Email</label>
                    <input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="email@domain.com" className="w-full bg-[#0D0D0D] border border-[#222222] rounded-xl px-4 py-3 text-sm text-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#AAAAAA] mb-1">Phone (+91)</label>
                    <input type="tel" required value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="+91 98110 00000" className="w-full bg-[#0D0D0D] border border-[#222222] rounded-xl px-4 py-3 text-sm text-white outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#AAAAAA] mb-1">Date of Birth</label>
                  <input type="date" required value={regDob} onChange={(e) => setRegDob(e.target.value)} className="w-full bg-[#0D0D0D] border border-[#222222] rounded-xl px-4 py-3 text-sm text-white outline-none" />
                </div>
                <button type="submit" className="w-full bg-[#CCFF00] text-[#0A0A0A] font-extrabold text-xs uppercase tracking-wider py-4 rounded-xl hover:bg-[#a8cc00] transition-all">
                  Register & Issue Digital Pass
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DPDP CONSENT */}
      {activeTab === "consent" && (
        <div className="bg-[#141414] border border-[#1F1F1F] rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-amber-400 block mb-0.5">
                DPDP Act 2023 Queue (DSK-5)
              </span>
              <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-extrabold uppercase text-white">
                Minor Athletes Awaiting Parental Consent
              </h3>
            </div>
            <span className="text-xs text-[#888888] font-bold">{consentQueue.length} pending</span>
          </div>

          {consentQueue.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#666666]">
              All junior member consents verified!
            </div>
          ) : (
            <div className="divide-y divide-[#1F1F1F]">
              {consentQueue.map((junior) => (
                <div key={junior.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-bold text-white">{junior.fullName} ({junior.memberCode})</div>
                    <div className="text-xs text-[#888888]">Guardian: {junior.guardianName || "N/A"} · {junior.guardianPhone || "N/A"}</div>
                  </div>
                  {verificationSuccessId === junior.id ? (
                    <div className="text-xs font-bold text-green-400 flex items-center gap-1.5"><Check className="w-4 h-4" /> Verified!</div>
                  ) : (
                    <button
                      onClick={() => handleVerifyConsent(junior.id)}
                      className="bg-[#CCFF00] text-[#0A0A0A] font-extrabold text-xs uppercase px-5 py-2.5 rounded-xl hover:bg-[#a8cc00] transition-all"
                    >
                      Verify In-Person
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
