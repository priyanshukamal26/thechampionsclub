"use client";

import Link from "next/link";
import {
  Calendar,
  ShoppingBag,
  Coffee,
  CreditCard,
  ArrowUpRight,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { MEMBERSHIP_PLANS, getMemberById, SEED_MEMBERS, ClubMember } from "@/lib/membership";

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  if (!user) return null;

  const currentMember: ClubMember =
    (user.email && getMemberById(user.email)) ||
    (user.planId && SEED_MEMBERS.find((m) => m.planId === user.planId)) ||
    SEED_MEMBERS[0];

  const plan = MEMBERSHIP_PLANS[currentMember.planId] || MEMBERSHIP_PLANS.gold;
  const expiryDate = new Date(currentMember.membershipEnd);
  const today = new Date();
  const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysLeft <= 30;

  const quickActions = [
    { label: "Book a Court", href: "/dashboard/courts", icon: Calendar, color: "text-[#CCFF00]", bg: "bg-[#CCFF00]/15" },
    { label: "Pro Shop", href: "/dashboard/shop", icon: ShoppingBag, color: "text-purple-400", bg: "bg-purple-500/15" },
    { label: "Bar & Lounge", href: "/dashboard/bar", icon: Coffee, color: "text-orange-400", bg: "bg-orange-500/15" },
    { label: "My Pass & QR", href: "/dashboard/pass", icon: CreditCard, color: "text-blue-400", bg: "bg-blue-500/15" },
  ];

  const upcomingBookings = [
    { court: "Centre Court 1 (Tennis)", date: "Tomorrow, 6:00 PM", status: "confirmed" },
    { court: "Padel Court 2", date: "Fri 22 Nov, 7:30 PM", status: "confirmed" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      <div className="fixed top-0 right-0 w-[500px] h-[300px] bg-[#CCFF00]/5 rounded-full blur-[180px] pointer-events-none" />

      {/* Welcome */}
      <div>
        <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#CCFF00] block mb-1">
          {plan.name} Member Dashboard
        </span>
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl sm:text-4xl font-extrabold uppercase text-white">
          Welcome, {currentMember.fullName.split(" ")[0]}
        </h1>
        <p className="text-xs text-[#888888] mt-1">
          Member since {currentMember.membershipStart} · {daysLeft > 0 ? `${daysLeft} days remaining` : "Membership expired"}
        </p>
      </div>

      {/* Alerts */}
      {isExpiringSoon && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-amber-300">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
            <div>
              <span className="font-bold">Membership Expiring!</span> Renew your {plan.name} plan before{" "}
              <span className="font-mono text-white font-bold">{currentMember.membershipEnd}</span>.
            </div>
          </div>
          <button className="shrink-0 text-xs font-bold uppercase tracking-wider text-black bg-amber-400 hover:bg-amber-300 px-4 py-2 rounded-xl transition-all shadow-md">
            Renew Plan
          </button>
        </div>
      )}

      {currentMember.duesPending > 0 && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-red-300">
            <Coffee className="w-5 h-5 shrink-0 text-red-400" />
            <div>
              <span className="font-bold">Unsettled Tab:</span>{" "}
              <span className="font-mono text-white font-bold text-sm">₹{currentMember.duesPending.toFixed(2)}</span> pending.
            </div>
          </div>
          <Link
            href="/dashboard/bar"
            className="shrink-0 text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-500 px-4 py-2 rounded-xl transition-all shadow-md"
          >
            View Tab
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className="group p-5 rounded-2xl bg-[#141414] border border-[#1F1F1F] hover:border-[#333333] transition-all hover:shadow-lg"
            >
              <div className={`w-10 h-10 rounded-xl ${action.bg} ${action.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-sm font-bold text-white group-hover:text-[#CCFF00] transition-colors">{action.label}</div>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#555555] group-hover:text-[#CCFF00] mt-2 transition-colors" />
            </Link>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Court Sessions", value: currentMember.history.filter((h) => h.type === "booking").length, sub: "This month" },
          { label: "Shop Orders", value: currentMember.history.filter((h) => h.type === "shop").length, sub: "This month" },
          { label: "Bar Visits", value: currentMember.history.filter((h) => h.type === "bar").length, sub: "This month" },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-2xl bg-[#141414] border border-[#1F1F1F]">
            <div className="text-[10px] uppercase font-bold text-[#777777]">{stat.label}</div>
            <div className="text-2xl font-extrabold text-white mt-1 font-[family-name:var(--font-space-grotesk)]">{stat.value}</div>
            <div className="text-[10px] text-[#555555]">{stat.sub}</div>
          </div>
        ))}
        <div className="p-4 rounded-2xl bg-[#141414] border border-[#1F1F1F]">
          <div className="text-[10px] uppercase font-bold text-[#777777]">Total Spent</div>
          <div className="text-2xl font-extrabold text-[#CCFF00] mt-1 font-[family-name:var(--font-space-grotesk)]">
            ₹{currentMember.history.reduce((s, h) => s + h.amount, 0).toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-[#555555]">Lifetime</div>
        </div>
      </div>

      {/* Upcoming Bookings */}
      <div className="bg-[#141414] border border-[#1F1F1F] rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#CCFF00] block mb-0.5">Upcoming</span>
            <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl font-extrabold uppercase text-white">
              Your Court Reservations
            </h3>
          </div>
          <Link href="/dashboard/courts" className="text-xs font-bold uppercase tracking-wider text-[#CCFF00] hover:underline flex items-center gap-1">
            Book New <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-3">
          {upcomingBookings.map((b, i) => (
            <div key={i} className="p-4 rounded-xl bg-[#0D0D0D] border border-[#1F1F1F] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#CCFF00]/15 text-[#CCFF00] flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{b.court}</div>
                  <div className="text-xs text-[#888888] flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {b.date}
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-bold uppercase px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/30">
                {b.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[#141414] border border-[#1F1F1F] rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl font-extrabold uppercase text-white">
            Recent Activity
          </h3>
          <Link href="/dashboard/pass" className="text-xs font-bold text-[#888888] hover:text-[#CCFF00] transition-colors">
            View All →
          </Link>
        </div>
        {currentMember.history.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#666666]">No activity yet. Start by booking a court!</div>
        ) : (
          <div className="divide-y divide-[#1F1F1F]">
            {currentMember.history.slice(0, 5).map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#0D0D0D] border border-[#222222] flex items-center justify-center">
                    {item.type === "booking" && <Calendar className="w-4 h-4 text-[#CCFF00]" />}
                    {item.type === "shop" && <ShoppingBag className="w-4 h-4 text-purple-400" />}
                    {item.type === "bar" && <Coffee className="w-4 h-4 text-orange-400" />}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{item.title}</div>
                    <div className="text-[10px] text-[#666666] font-mono">{item.date}</div>
                  </div>
                </div>
                <div className="text-xs font-mono font-bold text-white">
                  {item.amount === 0 ? "₹0 (Free)" : `₹${item.amount.toFixed(0)}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
