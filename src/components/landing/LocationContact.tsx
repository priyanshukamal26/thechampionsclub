"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, ArrowRight, CheckCircle2 } from "lucide-react";

export default function LocationContact() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    sport: "Tennis",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <section id="contact" className="py-28 bg-[#050505] border-t border-[#1F1F1F] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-24">
          {/* Club Info */}
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#CCFF00] font-bold mb-3">
              <MapPin className="w-3.5 h-3.5" />
              <span>Visit & Connect</span>
            </div>
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-4xl sm:text-5xl font-bold tracking-tight uppercase text-white mb-6">
              Clubhouse & <span className="text-[#CCFF00]">Facilities</span>
            </h2>
            <p className="text-sm text-[#888888] leading-relaxed mb-8">
              Strategically located in South Delhi with secure on-site parking, modern shower locker rooms, pro equipment stringing, and a viewing cafe mezzanine.
            </p>

            <div className="space-y-5">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#141414] border border-[#1F1F1F]">
                <MapPin className="w-5 h-5 text-[#CCFF00] flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-white block mb-0.5">Club Address</span>
                  <span className="text-[#888888]">Plot 14, Sports Complex Enclave, Siri Fort Road, New Delhi, 110049</span>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#141414] border border-[#1F1F1F]">
                <Clock className="w-5 h-5 text-[#CCFF00] flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-white block mb-0.5">Operational Hours</span>
                  <span className="text-[#888888]">Monday – Sunday: 06:00 AM – 11:00 PM IST (Floodlit)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#141414] border border-[#1F1F1F]">
                  <Phone className="w-4 h-4 text-[#CCFF00]" />
                  <div className="text-xs text-[#888888]">
                    <span className="text-white font-bold block">+91 98110 54321</span>
                    Front Desk Hotline
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#141414] border border-[#1F1F1F]">
                  <Mail className="w-4 h-4 text-[#CCFF00]" />
                  <div className="text-xs text-[#888888]">
                    <span className="text-white font-bold block">play@champions.in</span>
                    Member Enquiries
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Trial & Enquiry Form (Requirement E6) */}
          <div className="lg:col-span-7 bg-[#141414] border border-[#1F1F1F] rounded-3xl p-8 sm:p-10 shadow-2xl">
            <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold uppercase tracking-tight text-white mb-2">
              Request A Trial Session
            </h3>
            <p className="text-xs text-[#888888] mb-6">
              New to The Champions Club? Drop your details and our desk team will contact you within 2 hours with a complimentary trial slot pass.
            </p>

            {formSubmitted ? (
              <div className="p-8 text-center rounded-2xl bg-[#CCFF00]/10 border border-[#CCFF00]/30">
                <CheckCircle2 className="w-12 h-12 text-[#CCFF00] mx-auto mb-3" />
                <h4 className="font-bold text-white text-base">Enquiry Logged Successfully!</h4>
                <p className="text-xs text-[#888888] mt-1">
                  Our front desk officer will call you to schedule your trial session.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888888] mb-1.5">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Karan Singhal"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#0A0A0A] border border-[#222222] focus:border-[#CCFF00] rounded-xl px-4 py-3 text-xs text-white placeholder-[#555555] outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888888] mb-1.5">
                      Phone (WhatsApp)
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#0A0A0A] border border-[#222222] focus:border-[#CCFF00] rounded-xl px-4 py-3 text-xs text-white placeholder-[#555555] outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888888] mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="karan@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#0A0A0A] border border-[#222222] focus:border-[#CCFF00] rounded-xl px-4 py-3 text-xs text-white placeholder-[#555555] outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888888] mb-1.5">
                      Sport of Primary Interest
                    </label>
                    <select
                      value={formData.sport}
                      onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                      className="w-full bg-[#0A0A0A] border border-[#222222] focus:border-[#CCFF00] rounded-xl px-4 py-3 text-xs text-white outline-none transition-colors"
                    >
                      <option value="Tennis">Championship Tennis</option>
                      <option value="Padel">Panoramic Padel</option>
                      <option value="Badminton">Pro Badminton</option>
                      <option value="Cricket">Cricket Bowling Nets</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888888] mb-1.5">
                    Questions or Preferred Time (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us what time you'd like to visit or if you are looking for coaching..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-[#222222] focus:border-[#CCFF00] rounded-xl px-4 py-3 text-xs text-white placeholder-[#555555] outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-[#CCFF00] text-[#0A0A0A] font-extrabold text-xs uppercase tracking-wider hover:bg-[#a8cc00] transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.3)]"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Trial Request</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Big Bottom Action Strip */}
        <div className="rounded-3xl bg-gradient-to-r from-[#141414] via-[#1A1A1A] to-[#141414] border-2 border-[#CCFF00]/30 p-10 md:p-14 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-3xl mx-auto">
            <h3 className="font-[family-name:var(--font-space-grotesk)] text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-white mb-4">
              Step Into The <span className="text-[#CCFF00]">Champion’s Circle</span>
            </h3>
            <p className="text-sm md:text-base text-[#888888] mb-8">
              Register online in under 2 minutes. Choose your plan, access real-time court booking, and gear up with exclusive member privileges.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-3 bg-[#CCFF00] text-[#0A0A0A] font-black text-sm uppercase tracking-wider px-10 py-5 rounded-full hover:bg-[#a8cc00] transition-all shadow-[0_0_40px_rgba(204,255,0,0.5)] hover:scale-105 active:scale-95"
            >
              <span>Create Your Account</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
