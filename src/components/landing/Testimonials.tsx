"use client";

import { motion } from "framer-motion";
import { Star, Quote, Award } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  sport: string;
  text: string;
  avatarText: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    name: "Vikramaditya Singhania",
    role: "Gold Member",
    sport: "Tennis & Padel",
    text: "The court lighting and ITF synthetic surface are unmatched in NCR. We used to struggle with messy WhatsApp groups for booking slots; now reserving a court takes 15 seconds flat on the web app.",
    avatarText: "VS",
    rating: 5,
  },
  {
    name: "Ananya Deshmukh",
    role: "Silver Member",
    sport: "Badminton",
    text: "The indoor badminton hall maintains zero air draft so shuttles fly with absolute precision. Plus, Friday night socials have introduced me to some of my favorite hitting partners.",
    avatarText: "AD",
    rating: 5,
  },
  {
    name: "Rajesh & Aarav Malhotra",
    role: "Junior Member & Guardian",
    sport: "Cricket Academy",
    text: "As a parent, I love the DPDP guardian consent and linked access. Aarav uses the bowling machine nets 3 days a week, and I receive clear transaction receipts straight to my phone.",
    avatarText: "RM",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-28 bg-[#0A0A0A] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#CCFF00] font-bold mb-3">
            <Award className="w-3.5 h-3.5" />
            <span>Community Voices</span>
          </div>
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-4xl sm:text-5xl font-bold tracking-tight uppercase text-white">
            Loved By <span className="text-[#CCFF00]">Champions</span>
          </h2>
          <p className="mt-4 text-sm text-[#888888]">
            From competitive juniors to seasoned corporate competitors, hear from the athletes who call our courts home.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="bg-[#141414] border border-[#1F1F1F] rounded-3xl p-8 flex flex-col justify-between hover:border-[#333333] transition-colors relative"
            >
              <div>
                {/* Rating */}
                <div className="flex items-center gap-1 text-[#CCFF00] mb-6">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                <Quote className="w-8 h-8 text-[#1F1F1F] mb-4" />

                <p className="text-sm text-[#CCCCCC] leading-relaxed mb-8 italic">
                  "{t.text}"
                </p>
              </div>

              <div className="flex items-center gap-3.5 pt-5 border-t border-[#1F1F1F]">
                <div className="w-11 h-11 rounded-full bg-[#1F1F1F] text-[#CCFF00] font-bold text-sm flex items-center justify-center font-[family-name:var(--font-space-grotesk)] border border-[#2A2A2A]">
                  {t.avatarText}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{t.name}</div>
                  <div className="text-xs text-[#888888]">
                    {t.role} · <span className="text-[#CCFF00]">{t.sport}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
