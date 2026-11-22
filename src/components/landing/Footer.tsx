import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Ticker } from "@/components/ui/kit";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

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

        {/* Developer Credits */}
        <div className="border-t border-line-inverse py-6">
          <div className="flex flex-col items-center gap-4">
            <div className="u-eyebrow text-clay-soft/80">Built with ♥ by</div>
            <div className="flex flex-wrap justify-center gap-6">
              {[
                {
                  name: "Priyanshu Kamal",
                  github: "https://github.com/priyanshukamal26",
                  linkedin: "https://www.linkedin.com/in/priyanshukamal/",
                },
                {
                  name: "Aditya Kumar",
                  github: "https://github.com/kumaradi9508",
                  linkedin: "https://www.linkedin.com/in/aditya958/",
                },
                {
                  name: "Somya Vishnoi",
                  github: "https://github.com/Somya-Vishnoi",
                  linkedin: "https://www.linkedin.com/in/somya-vishnoi/",
                },
              ].map((dev) => (
                <div key={dev.name} className="flex items-center gap-2.5">
                  <span className="text-[12px] font-medium text-chalk/70">{dev.name}</span>
                  <div className="flex items-center gap-1.5">
                    <a
                      href={dev.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-line-inverse p-1.5 text-chalk/50 transition hover:border-chalk/50 hover:text-chalk"
                      aria-label={`${dev.name} on GitHub`}
                    >
                      <GithubIcon className="h-3.5 w-3.5" />
                    </a>
                    <a
                      href={dev.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-line-inverse p-1.5 text-chalk/50 transition hover:border-chalk/50 hover:text-chalk"
                      aria-label={`${dev.name} on LinkedIn`}
                    >
                      <LinkedinIcon className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10.5px] text-chalk/35 text-center max-w-md">
              We&apos;d love to connect — feel free to reach out on GitHub or LinkedIn!
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
