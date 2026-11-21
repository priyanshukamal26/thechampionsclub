"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, LogOut, Menu, User, X } from "lucide-react";
import { useAuth, type AppRole } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Sports", href: "#sports", index: "01" },
  { label: "Membership", href: "#membership", index: "02" },
  { label: "Availability", href: "#availability", index: "03" },
  { label: "Pro Shop", href: "#shop", index: "04" },
  { label: "Friday Social", href: "#bar", index: "05" },
  { label: "Visit", href: "#contact", index: "06" },
];

const ROLE_LABEL: Record<AppRole, string> = {
  owner: "Owner",
  manager: "Manager",
  front_desk: "Front desk",
  bar_staff: "Bar staff",
  shop_manager: "Shop manager",
  cafe_manager: "Café manager",
  member: "Member",
};

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const current = mounted ? user : null;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-line bg-chalk/92 py-2.5 backdrop-blur-md"
            : "border-b border-transparent bg-transparent py-4"
        )}
      >
        <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full border border-ink bg-ink font-mono text-[11px] font-bold tracking-widest text-chalk transition group-hover:bg-clay group-hover:border-clay">
              TC
            </span>
            <span className="flex flex-col leading-none">
              <span className="u-display text-[15px] tracking-[-0.01em] text-ink">The Champions</span>
              <span className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.34em] text-muted">Club · New Delhi</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="group flex items-center gap-1.5 rounded-full px-3 py-2 text-[10.5px] font-mono uppercase tracking-[0.14em] text-ink/60 transition hover:bg-ink/5 hover:text-ink"
              >
                <span className="text-[8px] text-clay/70">{link.index}</span>
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            {current ? (
              <>
                <Link href="/dashboard" className="btn btn-ink btn-sm">
                  Dashboard <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <div className="flex items-center gap-2 rounded-full border border-line bg-chalk py-1 pl-1 pr-1.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-court font-mono text-[9px] font-semibold text-chalk">
                    {current.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </span>
                  <span className="hidden flex-col leading-tight md:flex">
                    <span className="text-[11px] font-semibold text-ink">{current.fullName.split(" ")[0]}</span>
                    <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-muted">{ROLE_LABEL[current.role]}</span>
                  </span>
                  <button
                    onClick={() => signOut()}
                    aria-label="Sign out"
                    className="rounded-full p-1.5 text-muted transition hover:bg-ink/5 hover:text-clay"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="px-3 py-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink/70 transition hover:text-clay">
                  Sign in
                </Link>
                <Link href="/register" className="btn btn-clay btn-sm">
                  Join the club <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink text-ink transition hover:bg-ink hover:text-chalk lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-paper lg:hidden"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <span className="u-display text-lg text-ink">The Champions Club</span>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-ink text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto px-5 py-6">
                {LINKS.map((link, i) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline justify-between border-b border-line py-4"
                  >
                    <span className="u-display text-2xl text-ink">{link.label}</span>
                    <span className="font-mono text-[10px] text-muted">{link.index}</span>
                  </a>
                ))}
                <div className="mt-8 space-y-3">
                  {current ? (
                    <>
                      <Link href="/dashboard" onClick={() => setOpen(false)} className="btn btn-clay btn-block">
                        Open dashboard
                      </Link>
                      <button
                        onClick={() => { signOut(); setOpen(false); }}
                        className="btn btn-outline btn-block"
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/register" onClick={() => setOpen(false)} className="btn btn-clay btn-block">
                        Join the club
                      </Link>
                      <Link href="/login" onClick={() => setOpen(false)} className="btn btn-outline btn-block">
                        Sign in
                      </Link>
                    </>
                  )}
                </div>
              </nav>
              <div className="border-t border-line px-5 py-4 font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
                <span className="flex items-center gap-2"><User className="h-3 w-3" /> 06:00 – 23:00 IST · 18 courts · 4 sports</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
