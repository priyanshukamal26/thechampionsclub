"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  LayoutDashboard,
  Calendar,
  ShoppingBag,
  Coffee,
  CreditCard,
  Settings,
  LogOut,
  User,
  Menu,
  X,
  ChevronRight,
  Monitor,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const MEMBER_NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { id: "courts", label: "Book Courts", icon: Calendar, href: "/dashboard/courts" },
  { id: "shop", label: "Pro Shop", icon: ShoppingBag, href: "/dashboard/shop" },
  { id: "bar", label: "Bar & Lounge", icon: Coffee, href: "/dashboard/bar" },
  { id: "pass", label: "My Pass", icon: CreditCard, href: "/dashboard/pass" },
  { id: "settings", label: "Settings", icon: Settings, href: "/dashboard/settings" },
];

const STAFF_NAV = [
  { id: "desk", label: "Front Desk", icon: Monitor, href: "/dashboard/desk" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="animate-pulse text-[#CCFF00] text-sm font-bold uppercase tracking-widest">
          Loading Dashboard...
        </div>
      </div>
    );
  }

  if (!user) return null;

  const isStaff = user.role !== "member";
  const navItems = isStaff ? [...MEMBER_NAV, ...STAFF_NAV] : MEMBER_NAV;

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#FAFAFA] flex">
      {/* ====== DESKTOP SIDEBAR ====== */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-[#1A1A1A] bg-[#0A0A0A] fixed inset-y-0 left-0 z-30">
        <div className="p-5 border-b border-[#1A1A1A]">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#CCFF00] flex items-center justify-center text-[#0A0A0A] font-black text-lg shadow-[0_0_20px_rgba(204,255,0,0.4)] group-hover:scale-105 transition-transform">
              <Trophy className="w-4 h-4 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-white text-sm uppercase leading-none font-[family-name:var(--font-space-grotesk)]">
                Champions <span className="text-[#CCFF00]">Club</span>
              </span>
              <span className="text-[9px] tracking-[0.2em] text-[#666666] uppercase font-semibold mt-0.5">
                Dashboard
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all group ${
                  active
                    ? "bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30"
                    : "text-[#888888] hover:text-white hover:bg-[#141414] border border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-[#CCFF00]" : "text-[#666666] group-hover:text-white"}`} />
                <span>{item.label}</span>
                {active && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#1A1A1A]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#CCFF00]/20 text-[#CCFF00] flex items-center justify-center font-bold text-sm">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{user.fullName}</div>
              <div className="text-[10px] text-[#666666] truncate">{user.email}</div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#888888] hover:text-red-400 py-2 rounded-lg hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ====== MOBILE TOP BAR ====== */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-[#1A1A1A] py-3 px-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#CCFF00] flex items-center justify-center text-[#0A0A0A] font-black">
              <Trophy className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="font-extrabold tracking-tight text-white text-sm uppercase font-[family-name:var(--font-space-grotesk)]">
              TCC <span className="text-[#CCFF00]">Hub</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="text-[10px] font-bold text-[#888888] uppercase hidden sm:block">
              {user.fullName.split(" ")[0]}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-[#141414] border border-[#222222] text-white"
              aria-label="Toggle Menu"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-72 bg-[#0A0A0A] border-r border-[#1A1A1A] z-40 lg:hidden pt-16 px-3 pb-4 flex flex-col"
            >
              <nav className="flex-1 space-y-1 mt-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                        active
                          ? "bg-[#CCFF00]/15 text-[#CCFF00] border border-[#CCFF00]/30"
                          : "text-[#888888] hover:text-white hover:bg-[#141414] border border-transparent"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? "text-[#CCFF00]" : "text-[#666666]"}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
              <button
                onClick={handleSignOut}
                className="mt-4 w-full flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-[#888888] hover:text-red-400 py-3 rounded-lg hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ====== MAIN CONTENT AREA ====== */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="pt-16 lg:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
