"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createLead, SPORT_OPTIONS, type LeadSport, type LeadType } from "@/lib/leads";
import { SectionIntro } from "@/components/ui/kit";
import { cn } from "@/lib/utils";

const INTERESTS: { value: LeadType; label: string; note: string }[] = [
  { value: "trial", label: "Book a trial", note: "30 minutes on court" },
  { value: "membership", label: "Get a quote", note: "Plans & corporate" },
  { value: "enquiry", label: "Ask a question", note: "Anything else" },
];

export default function LocationContact() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    sport: "Tennis" as LeadSport,
    interest: "trial" as LeadType,
    preferredDate: "",
    preferredTime: "",
    message: "",
  });
  const [error, setError] = useState("");
  const [reference, setReference] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = createLead({
      name: form.name,
      phone: form.phone,
      email: form.email,
      sport: form.sport,
      type: form.interest,
      message: form.message,
      preferredDate: form.preferredDate || undefined,
      preferredTime: form.preferredTime || undefined,
      source: "landing",
    });
    if (!result.ok || !result.lead) {
      setError(result.error ?? "Could not send the request. Please try again.");
      return;
    }
    setReference(result.lead.id.replace("lead_", "TCC-").toUpperCase());
  };

  return (
    <section id="contact" className="border-b border-line bg-paper-deep py-16 md:py-24">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <SectionIntro
          index="08"
          kicker="Visit the clubhouse"
          title={<>Come see it <span className="u-serif italic text-clay">for yourself.</span></>}
          description="Siri Fort Road, New Delhi. Walk in for a tour, book a trial session, or send us a note and the front desk will call you back within two hours."
        />

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: club info + map */}
          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-2xl border border-ink bg-chalk">
              <div className="relative h-52 overflow-hidden border-b border-line bg-paper">
                <div className="absolute inset-0 opacity-70 u-court-grid" aria-hidden />
                <svg viewBox="0 0 480 210" className="relative h-full w-full" fill="none" aria-hidden>
                  <path d="M-10 150 H170 L200 120 H330 L360 90 H500" stroke="rgba(23,21,15,0.18)" strokeWidth="9" />
                  <path d="M120 -10 V90 L150 120 V230" stroke="rgba(23,21,15,0.12)" strokeWidth="7" />
                  <path d="M390 -10 V70 L360 100 V230" stroke="rgba(23,21,15,0.12)" strokeWidth="7" />
                  <path d="M-10 60 H80" stroke="rgba(23,21,15,0.12)" strokeWidth="5" />
                  <rect x="215" y="40" width="105" height="58" rx="4" stroke="rgba(30,68,51,0.35)" strokeWidth="1.5" />
                  <line x1="267" y1="40" x2="267" y2="98" stroke="rgba(30,68,51,0.25)" strokeWidth="1" strokeDasharray="3 4" />
                  <circle cx="268" cy="112" r="22" fill="rgba(196,80,43,0.10)" />
                  <circle cx="268" cy="112" r="8" fill="#c4502b" />
                  <circle cx="268" cy="112" r="13" stroke="#c4502b" strokeWidth="1.2" opacity="0.5" />
                  <text x="288" y="116" fill="#17150f" style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "1.5px" }}>
                    SIRI FORT
                  </text>
                  <text x="40" y="30" fill="rgba(23,21,15,0.4)" style={{ fontFamily: "var(--font-mono)", fontSize: "8px", letterSpacing: "2px" }}>
                    SOUTH DELHI
                  </text>
                </svg>
                <span className="absolute bottom-3 left-4 rounded-full border border-line bg-chalk/90 px-3 py-1 font-mono text-[8px] uppercase tracking-[0.14em] text-muted">
                  6 min from Siri Fort auditorium
                </span>
              </div>

              <div className="divide-y divide-line">
                <div className="flex items-start gap-4 px-5 py-4">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
                  <div>
                    <div className="font-mono text-[8px] uppercase tracking-[0.16em] text-muted">Club address</div>
                    <div className="mt-1 text-[12.5px] text-ink">Plot 14, Sports Complex Enclave,<br />Siri Fort Road, New Delhi 110049</div>
                  </div>
                </div>
                <div className="flex items-start gap-4 px-5 py-4">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
                  <div>
                    <div className="font-mono text-[8px] uppercase tracking-[0.16em] text-muted">Open every day</div>
                    <div className="mt-1 text-[12.5px] text-ink">06:00 — 23:00 IST · floodlit after sunset</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 divide-y divide-line sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                  <a href="tel:+919811054321" className="flex items-start gap-3 px-5 py-4 transition hover:bg-paper-soft">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
                    <div>
                      <div className="font-mono text-[8px] uppercase tracking-[0.16em] text-muted">Front desk</div>
                      <div className="mt-1 text-[12px] text-ink">+91 98110 54321</div>
                    </div>
                  </a>
                  <a href="mailto:play@champions.in" className="flex items-start gap-3 px-5 py-4 transition hover:bg-paper-soft">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
                    <div>
                      <div className="font-mono text-[8px] uppercase tracking-[0.16em] text-muted">Enquiries</div>
                      <div className="mt-1 text-[12px] text-ink">play@champions.in</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {["Secure parking", "Showers & lockers", "Pro stringing"].map((item) => (
                <div key={item} className="rounded-lg border border-line bg-chalk px-3 py-2 text-center font-mono text-[8px] uppercase tracking-[0.1em] text-muted">
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right: trial / enquiry form */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-ink bg-chalk p-6 shadow-[6px_6px_0_0_var(--color-ink)] sm:p-8">
              {reference ? (
                <div className="flex h-full min-h-[420px] flex-col items-start justify-center">
                  <CheckCircle2 className="h-9 w-9 text-court" />
                  <h3 className="u-display mt-4 text-3xl text-ink">Enquiry logged.</h3>
                  <p className="mt-2 max-w-md text-[13px] leading-relaxed text-muted">
                    Your request is on the front desk board as <span className="font-mono text-ink">{reference}</span>. A club officer will call you within two hours to confirm your slot.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button onClick={() => setReference(null)} className="btn btn-outline btn-sm">Send another</button>
                    <Link href="/register" className="btn btn-clay btn-sm">Register online <ArrowRight className="h-3.5 w-3.5" /></Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={submit}>
                  <div className="flex items-center justify-between border-b border-line pb-4">
                    <div>
                      <div className="u-eyebrow text-clay">Request a trial / quote</div>
                      <h3 className="u-display mt-2 text-2xl text-ink">Fifteen minutes to your first session.</h3>
                    </div>
                    <span className="hidden shrink-0 rounded-full border border-line px-3 py-1 font-mono text-[8px] uppercase tracking-[0.14em] text-muted sm:block">
                      No payment now
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {INTERESTS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setForm({ ...form, interest: option.value })}
                        className={cn(
                          "rounded-lg border px-2.5 py-2.5 text-left transition",
                          form.interest === option.value ? "border-ink bg-ink text-chalk" : "border-line bg-paper-soft text-ink hover:border-ink"
                        )}
                      >
                        <div className="text-[11.5px] font-semibold">{option.label}</div>
                        <div className={cn("mt-0.5 font-mono text-[7.5px] uppercase tracking-[0.08em]", form.interest === option.value ? "text-chalk/50" : "text-muted")}>{option.note}</div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Full name">
                      <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Karan Singhal" />
                    </Field>
                    <Field label="Phone / WhatsApp">
                      <input className="input" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
                    </Field>
                    <Field label="Email">
                      <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
                    </Field>
                    <Field label="Sport of interest">
                      <select className="input" value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value as LeadSport })}>
                        {SPORT_OPTIONS.map((sport) => <option key={sport} value={sport}>{sport}</option>)}
                      </select>
                    </Field>
                    <Field label="Preferred date (optional)">
                      <input className="input" type="date" value={form.preferredDate} onChange={(e) => setForm({ ...form, preferredDate: e.target.value })} />
                    </Field>
                    <Field label="Preferred time (optional)">
                      <input className="input" type="time" value={form.preferredTime} onChange={(e) => setForm({ ...form, preferredTime: e.target.value })} />
                    </Field>
                  </div>

                  <div className="mt-4">
                    <Field label="Anything we should know?">
                      <textarea className="input min-h-[84px] resize-none" rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Level, preferred coach, corporate group size…" />
                    </Field>
                  </div>

                  {error && (
                    <div className="mt-4 rounded-lg border border-clay/40 bg-clay/5 px-3 py-2 text-[11.5px] text-clay-deep">{error}</div>
                  )}

                  <div className="mt-5 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-xs text-[10px] leading-relaxed text-muted">
                      We use your details only to respond to this enquiry. No marketing lists, ever.
                    </p>
                    <button type="submit" className="btn btn-clay">
                      <Send className="h-3.5 w-3.5" /> Send request
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Closing CTA */}
        <div className="relative mt-12 overflow-hidden rounded-2xl border border-ink bg-ink px-6 py-10 text-chalk sm:px-10 md:py-12">
          <div className="pointer-events-none absolute inset-0 opacity-[0.4] u-court-grid-inv" aria-hidden />
          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="u-eyebrow text-clay-soft">One membership. Every surface.</div>
              <h3 className="u-display mt-3 max-w-2xl text-[clamp(2rem,4.4vw,3.6rem)] leading-[0.92]">
                Step into the <span className="u-serif italic text-clay-soft">champion&apos;s circle.</span>
              </h3>
              <p className="mt-3 max-w-lg text-[12.5px] leading-relaxed text-chalk/55">
                Register online in under two minutes. Choose a plan, book your first court and your digital pass is ready at the door.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link href={user ? "/dashboard" : "/register"} className="btn btn-clay">
                {user ? "Open dashboard" : "Create your account"} <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#availability" className="btn btn-outline-inv">Check availability</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="u-label">{label}</span>
      {children}
    </label>
  );
}
