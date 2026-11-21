import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Ticker } from "@/components/ui/kit";

const COLUMNS = [
  {
    title: "Play",
    links: [
      { label: "Tennis courts", href: "#sports" },
      { label: "Padel courts", href: "#sports" },
      { label: "Badminton halls", href: "#sports" },
      { label: "Cricket nets", href: "#sports" },
      { label: "Friday social", href: "#bar" },
    ],
  },
  {
    title: "Club",
    links: [
      { label: "Membership", href: "#membership" },
      { label: "Live availability", href: "#availability" },
      { label: "Pro shop", href: "#shop" },
      { label: "Bar & kitchen", href: "#bar" },
      { label: "Visit us", href: "#contact" },
    ],
  },
  {
    title: "Members",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Join the club", href: "/register" },
      { label: "Digital pass", href: "/dashboard/pass" },
      { label: "Book a court", href: "/dashboard/courts" },
      { label: "Account", href: "/dashboard/settings" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-chalk">
      <Ticker
        items={["Play", "Compete", "Dominate", "Belong", "Tennis", "Padel", "Badminton", "Cricket"]}
        tone="clay"
      />
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <div className="border-b border-line-inverse py-12 md:py-16">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Link href="/" className="inline-flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-chalk/30 font-mono text-[11px] font-bold tracking-widest text-chalk">
                  TC
                </span>
                <span className="u-display text-lg leading-none text-chalk">The Champions Club</span>
              </Link>
              <p className="mt-5 max-w-sm text-[12.5px] leading-relaxed text-chalk/50">
                A members&apos; sports club in New Delhi — eighteen courts, one pro shop, a proper kitchen, and a
                booking system that never double-books a surface.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Tennis", "Padel", "Badminton", "Cricket nets"].map((sport) => (
                  <span key={sport} className="rounded-full border border-line-inverse px-3 py-1 font-mono text-[8px] uppercase tracking-[0.14em] text-chalk/50">
                    {sport}
                  </span>
                ))}
              </div>
            </div>

            {COLUMNS.map((col) => (
              <div key={col.title} className="lg:col-span-2">
                <h4 className="u-eyebrow text-clay-soft">{col.title}</h4>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-[12px] text-chalk/60 transition hover:text-chalk">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="lg:col-span-1">
              <h4 className="u-eyebrow text-clay-soft">Visit</h4>
              <div className="mt-4 text-[11.5px] leading-relaxed text-chalk/50">
                Siri Fort Road<br />New Delhi 110049<br />06:00 — 23:00
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 py-8 md:flex-row md:items-end md:justify-between">
          <div className="u-display text-[clamp(2.4rem,7vw,6.4rem)] leading-[0.82] text-chalk/95">
            Play. Compete.<br /><span className="u-serif italic text-clay-soft">Belong.</span>
          </div>
          <div className="flex flex-col gap-2 text-[10.5px] text-chalk/40 md:text-right">
            <span className="font-mono uppercase tracking-[0.14em]">GSTIN 07AATCC1234F1Z8 · SAC 998413 / HSN 9506</span>
            <span>© 2026 The Champions Club Management System. Synthetic demo data.</span>
            <div className="flex flex-wrap gap-x-5 gap-y-1 md:justify-end">
              <span>Terms of play</span>
              <span>Cancellation policy</span>
              <span>DPDP privacy charter</span>
              <Link href="/login" className="inline-flex items-center gap-1 text-chalk/60 hover:text-chalk">
                Staff sign in <ArrowUpRight className="h-2.5 w-2.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
