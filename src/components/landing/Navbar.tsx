"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight, Trophy, User, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Sports", href: "#sports" },
    { label: "Availability", href: "#availability" },
    { label: "Memberships", href: "#membership" },
    { label: "Pro Shop", href: "#shop" },
    { label: "Lounge & Bar", href: "#bar" },
    { label: "Location", href: "#contact" },
  ];

  const getRoleBadge = (role: string, status: string, planId?: string) => {
    if (status === "pending_consent") {
      return { text: "Pending Consent", color: "bg-amber-500/15 text-amber-400 border-amber-500/30" };
    }
    if (role === "owner") {
      return { text: "Owner", color: "bg-[#CCFF00]/15 text-[#CCFF00] border-[#CCFF00]/40" };
    }
    if (role === "manager") {
      return { text: "Manager", color: "bg-purple-500/15 text-purple-400 border-purple-500/30" };
    }
    if (role === "front_desk") {
      return { text: "Front Desk", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" };
    }
    if (role === "bar_staff") {
      return { text: "Bar Staff", color: "bg-orange-500/15 text-orange-400 border-orange-500/30" };
    }
    if (planId) {
      return { text: `${planId.toUpperCase()} Member`, color: "bg-[#CCFF00]/15 text-[#CCFF00] border-[#CCFF00]/30" };
    }
    return { text: "Member", color: "bg-[#222222] text-[#AAAAAA] border-[#333333]" };
  };

  const badge = user ? getRoleBadge(user.role, user.status, user.planId) : null;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-[#1F1F1F] py-3.5 shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#CCFF00] flex items-center justify-center text-[#0A0A0A] font-black text-xl shadow-[0_0_20px_rgba(204,255,0,0.4)] group-hover:scale-105 transition-transform">
              <Trophy className="w-5 h-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-white text-base md:text-lg uppercase leading-none font-[family-name:var(--font-space-grotesk)]">
                The Champions <span className="text-[#CCFF00]">Club</span>
              </span>
              <span className="text-[10px] tracking-[0.25em] text-[#888888] uppercase font-semibold mt-0.5">
                Athletic Excellence
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#141414]/70 border border-[#1F1F1F] px-5 py-2 rounded-full backdrop-blur-md">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs font-semibold tracking-wider uppercase text-[#888888] hover:text-[#CCFF00] px-3.5 py-1.5 rounded-full transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Action CTAs & Auth Profile */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] bg-[#CCFF00] hover:bg-[#a8cc00] px-4 py-1.5 rounded-full transition-all shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-2.5 bg-[#141414] border border-[#222222] pl-3 pr-2 py-1.5 rounded-full">
                  <Link
                    href={
                      user.status === "pending_consent"
                        ? "/pending-consent"
                        : "/dashboard"
                    }
                    className="flex items-center gap-2 group"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#CCFF00]/20 text-[#CCFF00] flex items-center justify-center text-xs font-bold">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-white group-hover:text-[#CCFF00] transition-colors leading-none truncate max-w-[120px]">
                        {user.fullName.split(" ")[0]}
                      </span>
                      {badge && (
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border mt-0.5 inline-block ${badge.color}`}>
                          {badge.text}
                        </span>
                      )}
                    </div>
                  </Link>

                  <button
                    onClick={() => signOut()}
                    className="p-1.5 rounded-full hover:bg-[#222222] text-[#777777] hover:text-white transition-colors"
                    title="Sign Out"
                    aria-label="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-bold uppercase tracking-wider text-[#AAAAAA] hover:text-[#CCFF00] px-4 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="group relative inline-flex items-center gap-2 bg-[#CCFF00] text-[#0A0A0A] font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full hover:bg-[#a8cc00] transition-all duration-200 shadow-[0_0_25px_rgba(204,255,0,0.35)] hover:shadow-[0_0_35px_rgba(204,255,0,0.5)] active:scale-95"
                >
                  <span>Join The Club</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-[#141414] border border-[#1F1F1F] text-white hover:text-[#CCFF00] transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[73px] z-40 bg-[#0A0A0A]/95 backdrop-blur-2xl border-b border-[#1F1F1F] p-6 lg:hidden"
          >
            <nav className="flex flex-col gap-3">
              {user && (
                <div className="p-3 mb-2 rounded-2xl bg-[#141414] border border-[#222222] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#CCFF00]/20 text-[#CCFF00] flex items-center justify-center font-bold text-sm">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{user.fullName}</div>
                      <div className="text-[10px] text-[#888888]">{user.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="p-2 text-[#888888] hover:text-white"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}

              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-bold tracking-wider uppercase text-[#FAFAFA] hover:text-[#CCFF00] p-3 rounded-xl hover:bg-[#141414] transition-all"
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-4 border-t border-[#1F1F1F] flex flex-col gap-3">
                {user ? (
                  user.status === "pending_consent" ? (
                    <Link
                      href="/pending-consent"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center bg-amber-500 text-black font-bold text-sm uppercase tracking-wider py-3.5 rounded-full"
                    >
                      Guardian Verification Pending
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full text-center bg-[#CCFF00] text-[#0A0A0A] font-bold text-sm uppercase tracking-wider py-3.5 rounded-full shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                      >
                        Open Dashboard
                      </Link>
                    </>
                  )
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center bg-[#141414] border border-[#222222] text-white font-bold text-sm uppercase tracking-wider py-3 rounded-full hover:border-[#CCFF00]"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center bg-[#CCFF00] text-[#0A0A0A] font-bold text-sm uppercase tracking-wider py-3.5 rounded-full shadow-[0_0_20px_rgba(204,255,0,0.35)]"
                    >
                      Join The Club
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
