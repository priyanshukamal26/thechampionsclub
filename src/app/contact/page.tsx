"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Clock,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
} from "lucide-react";
import { Panel } from "@/components/ui/kit";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("membership");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-sand text-ink">
      {/* Top Header */}
      <header className="border-b border-line bg-chalk/80 backdrop-blur-md sticky top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink text-chalk font-mono text-xs font-bold transition group-hover:bg-clay">
              TC
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.2em] font-semibold text-ink">
              The Champions Club
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted hover:text-ink transition"
            >
              Dashboard
            </Link>
            <Link
              href="/login"
              className="btn btn-ink btn-sm"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-muted hover:text-clay transition mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to clubhouse
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <span className="u-eyebrow text-clay">Clubhouse Desk & Concierge</span>
            <span className="h-px w-8 bg-line" />
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              Siri Fort · New Delhi
            </span>
          </div>
          <h1 className="u-display mt-2 text-[clamp(2rem,4vw,3rem)] text-ink">
            Contact the Club
          </h1>
          <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-muted">
            Have a question about memberships, court allocations, tournament draws, or private lounge bookings? Our front desk and member concierge are available daily from 06:00 to 23:00 IST.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Contact Details & Operating Hours */}
          <div className="space-y-6 lg:col-span-5">
            <Panel tone="ink" className="space-y-4">
              <div>
                <div className="u-eyebrow text-clay-soft">Front desk hours</div>
                <div className="u-display mt-1 text-xl text-chalk">06:00 – 23:00 IST</div>
                <div className="text-[11.5px] text-chalk/70 mt-0.5">365 days a year · Siri Fort Complex</div>
              </div>

              <div className="divide-y divide-line-inverse pt-2 text-[12px]">
                <div className="flex items-start gap-3 py-3">
                  <MapPin className="h-4 w-4 text-clay-soft shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-chalk">The Champions Club</div>
                    <div className="text-chalk/70 text-[11px] leading-relaxed">
                      Siri Fort Sports Complex Road, August Kranti Marg, New Delhi 110049
                    </div>
                    <div className="mt-1 font-mono text-[10px] text-clay-soft">Gate 2 · Member Valet Available</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 py-3">
                  <Phone className="h-4 w-4 text-clay-soft shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-chalk">Telephone</div>
                    <div className="text-chalk/70 text-[11px]">+91 11 2649 1234 (Front Desk)</div>
                    <div className="text-chalk/70 text-[11px]">+91 11 2649 1235 (Court Bookings)</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 py-3">
                  <Mail className="h-4 w-4 text-clay-soft shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-chalk">Electronic Mail</div>
                    <div className="text-chalk/70 text-[11px]">desk@championsclub.in (Concierge)</div>
                    <div className="text-chalk/70 text-[11px]">memberships@championsclub.in (Admissions)</div>
                  </div>
                </div>
              </div>
            </Panel>

            <Panel className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-clay" />
                <div className="u-eyebrow text-clay">Facility Timings</div>
              </div>
              <ul className="divide-y divide-line-soft text-[11.5px]">
                <li className="flex justify-between py-2">
                  <span className="text-muted">Tennis & Padel Courts</span>
                  <span className="font-mono text-ink font-medium">06:00 – 22:30 IST</span>
                </li>
                <li className="flex justify-between py-2">
                  <span className="text-muted">Badminton & Cricket Nets</span>
                  <span className="font-mono text-ink font-medium">06:00 – 22:00 IST</span>
                </li>
                <li className="flex justify-between py-2">
                  <span className="text-muted">Bar & Lounge / Kitchen</span>
                  <span className="font-mono text-ink font-medium">07:00 – 23:00 IST</span>
                </li>
                <li className="flex justify-between py-2">
                  <span className="text-muted">Pro Shop & Restringing</span>
                  <span className="font-mono text-ink font-medium">08:00 – 21:00 IST</span>
                </li>
              </ul>
            </Panel>
          </div>

          {/* Contact Inquiry Form */}
          <div className="lg:col-span-7">
            <Panel className="p-6 sm:p-8">
              {submitted ? (
                <div className="py-8 text-center space-y-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-court/10 text-court">
                    <Check className="h-6 w-6" />
                  </div>
                  <h3 className="u-display text-2xl text-ink">Inquiry Received</h3>
                  <p className="max-w-md mx-auto text-[13px] text-muted leading-relaxed">
                    Thank you, <strong className="text-ink">{name}</strong>. Your message has been logged with our front desk team. We will get back to you at <strong className="text-ink">{email}</strong> within 4 business hours.
                  </p>
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setName("");
                        setEmail("");
                        setPhone("");
                        setMessage("");
                      }}
                      className="btn btn-outline btn-sm"
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <div className="u-eyebrow text-clay">Direct dispatch</div>
                    <div className="u-display mt-0.5 text-xl">Leave a Message</div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="u-label" htmlFor="contact-name">
                        Full Name <span className="text-clay">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        className="input"
                        placeholder="Rohan Mehra"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="u-label" htmlFor="contact-email">
                        Email Address <span className="text-clay">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        className="input"
                        placeholder="athlete@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="u-label" htmlFor="contact-phone">
                        Phone (Mobile)
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        className="input"
                        placeholder="+91 98100 12345"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="u-label" htmlFor="contact-category">
                        Inquiry Category
                      </label>
                      <select
                        id="contact-category"
                        className="select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option value="membership">Membership Application & Plans</option>
                        <option value="courts">Court Reservations & Coaching</option>
                        <option value="events">Private Lounge & Event Hosting</option>
                        <option value="shop">Pro Shop, Racquet Demo & Stringing</option>
                        <option value="general">General Desk Assistance</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="u-label" htmlFor="contact-message">
                      Message <span className="text-clay">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      required
                      className="input"
                      placeholder="Please specify how we can assist you..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[11px] text-muted">
                      <ShieldCheck className="h-3.5 w-3.5 text-court" />
                      DPDP Act 2023 compliant
                    </span>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-clay"
                    >
                      {loading ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" /> Send to Front Desk
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </Panel>
          </div>
        </div>
      </main>
    </div>
  );
}
