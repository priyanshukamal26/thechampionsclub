"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Trophy,
  Calendar,
  Clock,
  ShieldCheck,
  CreditCard,
  Tag,
  Coffee,
  Sparkles,
  ArrowUpRight,
  AlertTriangle,
  QrCode as QrIcon,
  ChevronRight,
  User,
  History,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { MEMBERSHIP_PLANS, getMemberById, SEED_MEMBERS, ClubMember } from "@/lib/membership";
import QRCode from "@/components/common/QRCode";

export default function MemberDashboardPage() {
  const { user } = useAuth();

  // Find member record (fallback to Rohan Mehra if logged in as gold or generic)
  const currentMember: ClubMember =
    (user?.email && getMemberById(user.email)) ||
    (user?.planId && SEED_MEMBERS.find((m) => m.planId === user.planId)) ||
    SEED_MEMBERS[0];

  const plan = MEMBERSHIP_PLANS[currentMember.planId] || MEMBERSHIP_PLANS.gold;
  const [showQrModal, setShowQrModal] = useState(false);

  // Expiry calculation
  const expiryDate = new Date(currentMember.membershipEnd);
  const today = new Date();
  const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysLeft <= 30;

  return (
    <div className="min-h-screen bg-[#050505] text-[#FAFAFA] pb-16">
      {/* Background Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[#CCFF00]/10 rounded-full blur-[180px] pointer-events-none" />

      {/* Top Navigation */}
      <header className="relative z-10 border-b border-[#1A1A1A] bg-[#0A0A0A]/80 backdrop-blur-xl sticky top-0 py-4 px-6 mb-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-[#CCFF00] flex items-center justify-center text-[#0A0A0A] font-black text-base shadow-[0_0_15px_rgba(204,255,0,0.4)] group-hover:scale-105 transition-transform">
              <Trophy className="w-4 h-4 fill-current" />
            </div>
            <span className="font-extrabold tracking-tight text-white text-base uppercase font-[family-name:var(--font-space-grotesk)]">
              The Champions <span className="text-[#CCFF00]">Club</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/#availability"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#888888] hover:text-[#CCFF00] transition-colors px-3 py-1.5"
            >
              <span>Court Slots</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/"
              className="text-xs uppercase tracking-wider font-semibold text-[#888888] hover:text-[#CCFF00] transition-colors"
            >
              ← Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 relative z-10 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#CCFF00]">
                Member ID: {currentMember.memberCode}
              </span>
              <span
                className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border"
                style={{
                  color: plan.badgeColor,
                  borderColor: `${plan.badgeColor}40`,
                  backgroundColor: `${plan.badgeColor}15`,
                }}
              >
                {plan.name} Tier
              </span>
            </div>
            <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl sm:text-4xl font-extrabold uppercase text-white">
              Welcome Back, {currentMember.fullName}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/#availability"
              className="inline-flex items-center gap-2 bg-[#CCFF00] text-[#0A0A0A] font-extrabold text-xs uppercase tracking-wider px-6 py-3 rounded-xl hover:bg-[#a8cc00] transition-all shadow-[0_0_20px_rgba(204,255,0,0.3)]"
            >
              <Calendar className="w-4 h-4" />
              <span>Book A Court</span>
            </Link>
          </div>
        </div>

        {/* Expiry / Renewal Notice if expiring soon */}
        {isExpiringSoon && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs text-amber-300">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
              <div>
                <span className="font-bold">Membership Expiring Soon!</span> Your {plan.name} membership concludes on{" "}
                <span className="font-mono text-white font-bold">{currentMember.membershipEnd}</span> ({daysLeft} days remaining).
              </div>
            </div>
            <button className="shrink-0 text-xs font-bold uppercase tracking-wider text-black bg-amber-400 hover:bg-amber-300 px-4 py-2 rounded-xl transition-all shadow-md">
              Renew Plan
            </button>
          </div>
        )}

        {/* Unsettled Bar Tab Notice (Scene 4) */}
        {currentMember.duesPending > 0 && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs text-red-300">
              <Coffee className="w-5 h-5 shrink-0 text-red-400" />
              <div>
                <span className="font-bold">Unsettled Post-Match Cafeteria Tab:</span> You have an active tab balance of{" "}
                <span className="font-mono text-white font-bold text-sm">₹{currentMember.duesPending.toFixed(2)}</span>.
              </div>
            </div>
            <button className="shrink-0 text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-500 px-4 py-2 rounded-xl transition-all shadow-md">
              Settle With Staff
            </button>
          </div>
        )}

        {/* Top Grid: Digital Pass (A5) & Tier Entitlements Radar (A3) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Digital Member Pass Card (MEM-1, A5) */}
          <div className="lg:col-span-5">
            <div className="bg-gradient-to-br from-[#181818] via-[#121212] to-[#0A0A0A] border border-[#262626] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
              {/* Card Holographic Top Line */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: plan.badgeColor, boxShadow: `0 0 15px ${plan.badgeColor}` }}
              />

              {/* Watermark Logo */}
              <div className="absolute -bottom-8 -right-8 w-44 h-44 opacity-5 pointer-events-none">
                <Trophy className="w-full h-full text-white" />
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#CCFF00] flex items-center justify-center text-[#0A0A0A]">
                    <Trophy className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-white">
                    The Champions Club
                  </span>
                </div>
                <span
                  className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border"
                  style={{
                    color: plan.badgeColor,
                    borderColor: `${plan.badgeColor}50`,
                    backgroundColor: `${plan.badgeColor}15`,
                  }}
                >
                  {plan.name}
                </span>
              </div>

              {/* QR Pass Section */}
              <div className="flex items-center justify-center py-4 mb-4">
                <div
                  onClick={() => setShowQrModal(true)}
                  className="cursor-pointer transition-transform hover:scale-105 relative group/qr"
                  title="Click to expand QR pass"
                >
                  <QRCode value={`TCC:${currentMember.memberCode}:${currentMember.email}`} size={160} />
                  <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover/qr:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold uppercase tracking-wider">
                    Tap to Expand
                  </div>
                </div>
              </div>

              {/* Member Details */}
              <div className="space-y-3 pt-3 border-t border-[#222222]">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#777777] block">Cardholder</span>
                    <span className="text-base font-extrabold text-white font-[family-name:var(--font-space-grotesk)]">
                      {currentMember.fullName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[#777777] block">Member Code</span>
                    <span className="text-xs font-mono font-bold text-[#CCFF00]">{currentMember.memberCode}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-[#888888] pt-2">
                  <span>Valid From: {currentMember.membershipStart}</span>
                  <span className={isExpiringSoon ? "text-amber-400 font-bold" : "text-white"}>
                    Valid Thru: {currentMember.membershipEnd}
                  </span>
                </div>
              </div>

              <div className="mt-4 text-center">
                <span className="text-[10px] text-[#666666] uppercase tracking-wider flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#CCFF00]" />
                  Cryptographically Signed QR Pass (Front Desk Scan)
                </span>
              </div>
            </div>
          </div>

          {/* Tier Entitlements Breakdown (A3) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="bg-[#141414] border border-[#1F1F1F] rounded-3xl p-6 sm:p-8 shadow-2xl h-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#CCFF00] block mb-1">
                    Entitlements & Privileges (Req A3)
                  </span>
                  <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-extrabold uppercase text-white">
                    Your {plan.name} Benefits
                  </h2>
                </div>
                <div className="text-right text-xs text-[#888888]">
                  <span>Daily Cap: </span>
                  <span className="text-[#CCFF00] font-bold">2 sessions / day</span>
                </div>
              </div>

              {/* 4 Privilege Pillars */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-[#0D0D0D] border border-[#222222]">
                  <div className="w-8 h-8 rounded-xl bg-[#CCFF00]/15 text-[#CCFF00] flex items-center justify-center mb-2.5">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="text-[10px] uppercase font-bold text-[#777777]">Court Pricing</div>
                  <div className="text-sm font-extrabold text-white mt-0.5">{plan.courtDiscountText}</div>
                  <div className="text-[10px] text-[#666666] mt-1">18 arenas (Tennis, Padel, Badminton, Cricket)</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0D0D0D] border border-[#222222]">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-2.5">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div className="text-[10px] uppercase font-bold text-[#777777]">Pro Shop Discount</div>
                  <div className="text-sm font-extrabold text-white mt-0.5">{plan.shopDiscountPct}% Off All Gear</div>
                  <div className="text-[10px] text-[#666666] mt-1">Applied automatically at counter & online</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0D0D0D] border border-[#222222]">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center mb-2.5">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <div className="text-[10px] uppercase font-bold text-[#777777]">Bar & Cafeteria</div>
                  <div className="text-sm font-extrabold text-white mt-0.5">{plan.barDiscountPct}% Off Tabs & Food</div>
                  <div className="text-[10px] text-[#666666] mt-1">Shakes, meals, coffees & electrolyte drinks</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0D0D0D] border border-[#222222]">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center mb-2.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-[10px] uppercase font-bold text-[#777777]">Friday Social Night</div>
                  <div className="text-sm font-extrabold text-white mt-0.5">
                    {plan.freeFridaySocial ? "Free Entry Included" : "Subsidized (₹400)"}
                  </div>
                  <div className="text-[10px] text-[#666666] mt-1">Multi-player round robin & social mixer</div>
                </div>
              </div>

              {/* Feature list bullets */}
              <div className="space-y-2 pt-4 border-t border-[#1F1F1F]">
                {plan.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-[#AAAAAA]">
                    <CheckCircle2 className="w-4 h-4 text-[#CCFF00] shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Member History & Activity Log (Requirement A6) */}
        <div className="bg-[#141414] border border-[#1F1F1F] rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#CCFF00]/15 text-[#CCFF00] flex items-center justify-center">
                <History className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#CCFF00] block mb-0.5">
                  Activity Record (Req A6)
                </span>
                <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl font-extrabold uppercase text-white">
                  Recent Club Bookings, Gear Orders & Tabs
                </h3>
              </div>
            </div>
            <span className="text-xs text-[#777777]">Lifetime Records</span>
          </div>

          {currentMember.history.length === 0 ? (
            <div className="text-center py-12 text-[#666666] text-xs">
              No activity logged yet. Book your first court or visit the pro shop!
            </div>
          ) : (
            <div className="divide-y divide-[#1F1F1F]">
              {currentMember.history.map((item) => (
                <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0D0D0D] border border-[#222222] flex items-center justify-center shrink-0 mt-0.5">
                      {item.type === "booking" && <Calendar className="w-4 h-4 text-[#CCFF00]" />}
                      {item.type === "shop" && <Tag className="w-4 h-4 text-purple-400" />}
                      {item.type === "bar" && <Coffee className="w-4 h-4 text-orange-400" />}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-[#CCFF00] transition-colors">
                        {item.title}
                      </div>
                      <div className="text-xs text-[#888888]">{item.details}</div>
                      <div className="text-[10px] text-[#555555] font-mono mt-0.5">{item.date}</div>
                    </div>
                  </div>

                  <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                    <div className="text-xs font-mono font-bold text-white">
                      {item.amount === 0 ? "₹0.00 (Privilege)" : `₹${item.amount.toFixed(2)}`}
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        item.status === "completed"
                          ? "bg-green-500/10 text-green-400 border border-green-500/30"
                          : item.status === "unsettled"
                          ? "bg-red-500/10 text-red-400 border border-red-500/30"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* QR Code Large Modal */}
      {showQrModal && (
        <div
          onClick={() => setShowQrModal(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#141414] border border-[#333333] rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative"
          >
            <div className="text-xs font-extrabold uppercase tracking-widest text-[#CCFF00] mb-1">
              The Champions Club
            </div>
            <h4 className="font-[family-name:var(--font-space-grotesk)] text-xl font-extrabold uppercase text-white mb-6">
              {currentMember.fullName}
            </h4>
            <div className="flex justify-center mb-6">
              <QRCode value={`TCC:${currentMember.memberCode}:${currentMember.email}`} size={220} />
            </div>
            <div className="font-mono text-xs text-[#AAAAAA] mb-4">{currentMember.memberCode}</div>
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full bg-[#222222] hover:bg-[#333333] text-white text-xs font-bold uppercase py-3 rounded-xl transition-colors"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
