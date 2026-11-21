"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Trophy,
  Search,
  UserPlus,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Coffee,
  Tag,
  Phone,
  Mail,
  Clock,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
  QrCode,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";
import {
  searchMembers,
  registerMemberAtDesk,
  verifyJuniorConsent,
  getPendingConsentQueue,
  getLocalMembers,
  ClubMember,
  MEMBERSHIP_PLANS,
} from "@/lib/membership";
import { recordAuditLog } from "@/lib/audit";

export default function FrontDeskPage() {
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
      details: { code: result.member.memberCode, plan: result.member.planId, staff: "Amit Sharma" },
    });

    setRegisteredResult(result);
    // Reset form
    setRegFullName("");
    setRegEmail("");
    setRegPhone("");
    setRegDob("");
    setRegGuardianName("");
    setRegGuardianPhone("");
    setRegGuardianEmail("");
  };

  const handleVerifyConsent = (memberId: string) => {
    verifyJuniorConsent(memberId, "Amit Sharma (Front Desk Lead)");
    recordAuditLog({
      action: "verify_junior_dpdp_consent",
      entity: "guardian_consents",
      entityId: memberId,
      details: { verifiedBy: "Amit Sharma", method: "in_person_desk" },
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
    <div className="min-h-screen bg-[#050505] text-[#FAFAFA] pb-16">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[320px] bg-blue-500/10 rounded-full blur-[180px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-[#1A1A1A] bg-[#0A0A0A]/80 backdrop-blur-xl sticky top-0 py-4 px-6 mb-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-[#CCFF00] flex items-center justify-center text-[#0A0A0A] font-black text-base shadow-[0_0_15px_rgba(204,255,0,0.4)] group-hover:scale-105 transition-transform">
                <Trophy className="w-4 h-4 fill-current" />
              </div>
              <span className="font-extrabold tracking-tight text-white text-base uppercase font-[family-name:var(--font-space-grotesk)]">
                The Champions <span className="text-[#CCFF00]">Club</span>
              </span>
            </Link>
            <span className="text-xs uppercase tracking-widest text-[#666666] font-bold hidden md:inline">
              / Front Desk Console
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#141414] border border-[#222222] px-3 py-1.5 rounded-full text-xs">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[#888888]">Staff:</span>
              <span className="text-white font-bold">Amit Sharma</span>
            </div>
            <Link
              href="/"
              className="text-xs uppercase tracking-wider font-semibold text-[#888888] hover:text-[#CCFF00] transition-colors"
            >
              ← Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Console */}
      <main className="max-w-7xl mx-auto px-6 relative z-10 space-y-8">
        {/* Title & Quick Stats */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#CCFF00] block mb-1">
              Scene 1: Front Desk Operations (Req A1–A6, X6, X7)
            </span>
            <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl sm:text-4xl font-extrabold uppercase text-white">
              Member Counter & Scanner
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
              <span>Register Member (A1, A2)</span>
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
              <span>DPDP Minor Queue (X6)</span>
              {consentQueue.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-2 right-2" />
              )}
            </button>
          </div>
        </div>

        {/* =========================================================================
            TAB 1: MEMBER LOOKUP & QUICK RECOGNITION (DSK-3, A5, A6)
            ========================================================================= */}
        {activeTab === "lookup" && (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="p-4 rounded-3xl bg-[#141414] border border-[#1F1F1F] shadow-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Scan QR pass or search by name, phone (+91), email, or code (e.g. TCC-2026-GOLD-001)..."
                  className="w-full bg-[#0A0A0A] border border-[#222222] focus:border-[#CCFF00] rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-[#555555] outline-none transition-colors"
                />
              </div>
            </div>

            {/* Split View: Member List + Selected Profile Inspection Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Member Results List */}
              <div className="lg:col-span-5 space-y-3">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#777777] px-2">
                  Matching Members ({searchResults.length})
                </div>

                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {searchResults.map((m) => {
                    const plan = MEMBERSHIP_PLANS[m.planId];
                    const isSelected = selectedMember?.id === m.id;
                    const hasDues = m.duesPending > 0;
                    const isExpiring = m.status === "expiring_soon";

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
                        <div className="flex items-start justify-between mb-1.5">
                          <div className="font-bold text-white text-sm">{m.fullName}</div>
                          <span
                            className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border"
                            style={{
                              color: plan.badgeColor,
                              borderColor: `${plan.badgeColor}40`,
                              backgroundColor: `${plan.badgeColor}15`,
                            }}
                          >
                            {plan.name}
                          </span>
                        </div>

                        <div className="text-xs text-[#888888] flex items-center justify-between font-mono">
                          <span>{m.memberCode}</span>
                          <span>{m.phone}</span>
                        </div>

                        {/* Status Alert Pills */}
                        <div className="mt-2.5 flex items-center gap-2">
                          {hasDues && (
                            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30">
                              Dues: ₹{m.duesPending}
                            </span>
                          )}
                          {isExpiring && (
                            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              Expiring Soon
                            </span>
                          )}
                          {m.status === "pending_consent" && (
                            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              Pending Consent
                            </span>
                          )}
                          {m.status === "active" && !hasDues && (
                            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-green-500/15 text-green-400 border border-green-500/30">
                              Active • Good Standing
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Profile Recognition Card (A5, A6) */}
              <div className="lg:col-span-7">
                {selectedMember ? (
                  <div className="bg-[#141414] border border-[#222222] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                    {/* Member Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#222222]">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#CCFF00]/15 text-[#CCFF00] flex items-center justify-center font-bold text-xl border border-[#CCFF00]/30 shadow-[0_0_20px_rgba(204,255,0,0.2)]">
                          {selectedMember.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-extrabold uppercase text-white">
                              {selectedMember.fullName}
                            </h3>
                            <span className="text-[10px] font-mono text-[#888888]">({selectedMember.memberCode})</span>
                          </div>
                          <div className="text-xs text-[#888888] flex items-center gap-4 mt-1">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-[#666666]" /> {selectedMember.phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-[#666666]" /> {selectedMember.email}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-[#777777]">Membership Validity</div>
                        <div className="text-xs font-mono font-bold text-white mt-0.5">
                          Thru {selectedMember.membershipEnd}
                        </div>
                      </div>
                    </div>

                    {/* Dues & Emergency Alerts */}
                    {selectedMember.duesPending > 0 && (
                      <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-2.5 text-xs text-red-300">
                          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                          <span>
                            <strong>Unpaid Bar Tab Balance:</strong> ₹{selectedMember.duesPending.toFixed(2)} due before court entry.
                          </span>
                        </div>
                        <button className="text-xs font-bold uppercase bg-red-500 hover:bg-red-400 text-white px-3 py-1.5 rounded-lg transition-colors">
                          Collect Dues
                        </button>
                      </div>
                    )}

                    {/* Emergency / Player Notes */}
                    {selectedMember.emergencyNotes && (
                      <div className="p-3.5 rounded-xl bg-[#0D0D0D] border border-[#222222] text-xs text-[#AAAAAA]">
                        <span className="font-bold text-[#CCFF00] uppercase text-[10px] block mb-0.5">Desk Note:</span>
                        {selectedMember.emergencyNotes}
                      </div>
                    )}

                    {/* Entitlement Summary (A3) */}
                    <div>
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#777777] mb-3">
                        Plan Entitlements ({MEMBERSHIP_PLANS[selectedMember.planId].name})
                      </div>
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
                          <div className="text-[9px] uppercase font-bold text-[#666666]">Bar & Lounge</div>
                          <div className="text-xs font-extrabold text-orange-400 mt-1">
                            {MEMBERSHIP_PLANS[selectedMember.planId].barDiscountPct}% Privilege
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Member History Timeline (A6) */}
                    <div>
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#777777] mb-3">
                        Past History & Visits (Req A6)
                      </div>
                      {selectedMember.history.length === 0 ? (
                        <div className="text-xs text-[#555555] py-4 text-center">No past visits recorded.</div>
                      ) : (
                        <div className="space-y-2 max-h-56 overflow-y-auto">
                          {selectedMember.history.map((h) => (
                            <div
                              key={h.id}
                              className="p-3 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] flex items-center justify-between text-xs"
                            >
                              <div>
                                <div className="font-bold text-white">{h.title}</div>
                                <div className="text-[10px] text-[#777777]">{h.details}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-mono text-white font-bold">
                                  {h.amount === 0 ? "₹0.00" : `₹${h.amount.toFixed(2)}`}
                                </div>
                                <div className="text-[9px] text-[#555555]">{h.date}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#141414] border border-[#222222] rounded-3xl p-12 text-center text-[#666666] text-xs h-full flex flex-col items-center justify-center">
                    <QrCode className="w-12 h-12 mb-3 text-[#444444]" />
                    <p className="max-w-xs">
                      Select a member from the list or search by phone/name to inspect member pass, validity, and dues.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: COUNTER MEMBER REGISTRATION (DSK-4, A1, A2, X6, X7)
            ========================================================================= */}
        {activeTab === "register" && (
          <div className="max-w-2xl mx-auto">
            {registeredResult ? (
              <div className="bg-[#141414] border border-[#222222] rounded-3xl p-8 sm:p-10 text-center shadow-2xl space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-[#CCFF00]/15 text-[#CCFF00] flex items-center justify-center mx-auto border border-[#CCFF00]/30 shadow-[0_0_25px_rgba(204,255,0,0.3)]">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#CCFF00] block mb-1">
                    Registration Logged
                  </span>
                  <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-extrabold uppercase text-white">
                    Member Created: {registeredResult.member.fullName}
                  </h3>
                  <div className="text-xs text-[#888888] font-mono mt-1">
                    Code: {registeredResult.member.memberCode} • Plan: {registeredResult.member.planId.toUpperCase()}
                  </div>
                </div>

                {/* Account Claim Link Box (Requirement X7) */}
                <div className="p-4 rounded-2xl bg-[#0D0D0D] border border-[#222222] text-left text-xs space-y-2">
                  <div className="text-[10px] uppercase font-bold text-[#888888]">
                    Account Claim Invite Link (Req X7):
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${typeof window !== "undefined" ? window.location.origin : ""}/login?claim=${registeredResult.claimToken}`}
                      className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl px-3 py-2 text-xs font-mono text-[#CCFF00] outline-none"
                    />
                    <button
                      onClick={() => handleCopyClaimLink(registeredResult.claimToken)}
                      className="shrink-0 p-2.5 rounded-xl bg-[#222222] hover:bg-[#333333] text-white transition-colors"
                      title="Copy Claim Link"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-[#CCFF00]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-[#666666]">
                    Share this link via SMS/WhatsApp so the member can set their password and access self-service.
                  </p>
                </div>

                <button
                  onClick={() => setRegisteredResult(null)}
                  className="w-full bg-[#CCFF00] text-[#0A0A0A] font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl hover:bg-[#a8cc00] transition-all shadow-[0_0_20px_rgba(204,255,0,0.3)]"
                >
                  Register Another Member
                </button>
              </div>
            ) : (
              <div className="bg-[#141414] border border-[#1F1F1F] rounded-3xl p-8 sm:p-10 shadow-2xl">
                <div className="mb-6">
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#CCFF00] block mb-1">
                    Front Desk Enrollment (DSK-4)
                  </span>
                  <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-extrabold uppercase text-white">
                    Register Walk-In Athlete
                  </h2>
                  <p className="text-xs text-[#888888] mt-1">
                    Direct counter registration. Generates instant membership pass and account claim link.
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#AAAAAA] mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="e.g. Vikramaditya Singh"
                      className="w-full bg-[#0D0D0D] border border-[#222222] focus:border-[#CCFF00] rounded-xl px-4 py-3 text-sm text-white placeholder-[#555555] outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#AAAAAA] mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="athlete@domain.com"
                        className="w-full bg-[#0D0D0D] border border-[#222222] focus:border-[#CCFF00] rounded-xl px-4 py-3 text-sm text-white placeholder-[#555555] outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#AAAAAA] mb-1.5">
                        Phone Number (+91)
                      </label>
                      <input
                        type="tel"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+91 98110 00000"
                        className="w-full bg-[#0D0D0D] border border-[#222222] focus:border-[#CCFF00] rounded-xl px-4 py-3 text-sm text-white placeholder-[#555555] outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#AAAAAA] mb-1.5">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      required
                      value={regDob}
                      onChange={(e) => setRegDob(e.target.value)}
                      className="w-full bg-[#0D0D0D] border border-[#222222] focus:border-[#CCFF00] rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors"
                    />
                  </div>

                  {/* Minor Check Notice */}
                  {isMinorReg && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                      <div className="flex items-center gap-2 text-xs text-amber-300 font-bold">
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        <span>Minor Athlete Detected (&lt;18) — DPDP Act 2023 Protocol Active</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          value={regGuardianName}
                          onChange={(e) => setRegGuardianName(e.target.value)}
                          placeholder="Guardian Full Name"
                          className="bg-[#0A0A0A] border border-[#333333] rounded-xl px-3 py-2 text-xs text-white placeholder-[#666666]"
                        />
                        <input
                          type="tel"
                          required
                          value={regGuardianPhone}
                          onChange={(e) => setRegGuardianPhone(e.target.value)}
                          placeholder="Guardian Phone"
                          className="bg-[#0A0A0A] border border-[#333333] rounded-xl px-3 py-2 text-xs text-white placeholder-[#666666]"
                        />
                      </div>

                      <label className="flex items-center gap-2 text-xs text-amber-200 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={regGuardianVerified}
                          onChange={(e) => setRegGuardianVerified(e.target.checked)}
                          className="rounded text-[#CCFF00] focus:ring-0"
                        />
                        <span>Parent/Guardian present at front desk with valid photo ID (In-Person Verification)</span>
                      </label>
                    </div>
                  )}

                  {/* Plan Selection (A2) */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#AAAAAA] mb-2">
                      Assign Membership Plan (Req A2)
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setRegPlanId("gold")}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          regPlanId === "gold" && !isMinorReg
                            ? "bg-[#CCFF00]/15 border-[#CCFF00] text-white"
                            : "bg-[#0D0D0D] border-[#222222] text-[#888888]"
                        } ${isMinorReg ? "opacity-40" : ""}`}
                        disabled={isMinorReg}
                      >
                        <div className="text-xs font-extrabold text-white">Gold</div>
                        <div className="text-[10px] text-[#CCFF00]">₹4,999/mo</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRegPlanId("silver")}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          regPlanId === "silver" && !isMinorReg
                            ? "bg-white/10 border-white text-white"
                            : "bg-[#0D0D0D] border-[#222222] text-[#888888]"
                        } ${isMinorReg ? "opacity-40" : ""}`}
                        disabled={isMinorReg}
                      >
                        <div className="text-xs font-extrabold text-white">Silver</div>
                        <div className="text-[10px] text-gray-300">₹2,499/mo</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRegPlanId("junior")}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          regPlanId === "junior" || isMinorReg
                            ? "bg-amber-500/15 border-amber-400 text-white"
                            : "bg-[#0D0D0D] border-[#222222] text-[#888888]"
                        }`}
                      >
                        <div className="text-xs font-extrabold text-amber-400">Junior</div>
                        <div className="text-[10px] text-amber-300">₹1,699/mo</div>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-4 bg-[#CCFF00] text-[#0A0A0A] font-extrabold text-xs uppercase tracking-wider py-4 rounded-xl hover:bg-[#a8cc00] transition-all shadow-[0_0_20px_rgba(204,255,0,0.3)]"
                  >
                    Confirm Registration & Issue Pass
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 3: PENDING CONSENT QUEUE (DSK-5, D-027, X6)
            ========================================================================= */}
        {activeTab === "consent" && (
          <div className="bg-[#141414] border border-[#1F1F1F] rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-amber-400 block mb-1">
                  DPDP Act 2023 Compliance Queue (DSK-5)
                </span>
                <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-extrabold uppercase text-white">
                  Junior Athletes Awaiting Guardian Verification
                </h3>
              </div>
              <span className="text-xs text-[#888888] font-bold">
                {consentQueue.length} pending verification
              </span>
            </div>

            {consentQueue.length === 0 ? (
              <div className="text-center py-16 text-[#666666] text-xs">
                <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2 opacity-50" />
                All junior athlete consents are currently verified!
              </div>
            ) : (
              <div className="divide-y divide-[#1F1F1F]">
                {consentQueue.map((junior) => (
                  <div key={junior.id} className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-white">{junior.fullName}</span>
                        <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                          DOB: {junior.dob} (Minor)
                        </span>
                      </div>
                      <div className="text-xs text-[#888888]">
                        Member Code: <span className="font-mono text-white">{junior.memberCode}</span> • Contact: {junior.phone}
                      </div>
                      <div className="text-xs text-amber-200/80 pt-1">
                        Parent/Guardian: <strong>{junior.guardianName || "Not Provided"}</strong> ({junior.guardianPhone || "No Phone"}) • Email: {junior.guardianEmail || "No Email"}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {verificationSuccessId === junior.id ? (
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-green-400 bg-green-500/10 px-4 py-2.5 rounded-xl border border-green-500/30">
                          <Check className="w-4 h-4" />
                          <span>Consent Verified!</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleVerifyConsent(junior.id)}
                          className="inline-flex items-center gap-1.5 bg-[#CCFF00] text-[#0A0A0A] font-extrabold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl hover:bg-[#a8cc00] transition-all shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Verify In-Person Consent</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
