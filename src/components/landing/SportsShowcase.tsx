"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

interface SportCardProps {
  title: string;
  category: string;
  tagline: string;
  specs: string[];
  gradient: string;
  accentColor: string;
  badge: string;
  icon: string;
}

const sportsData: SportCardProps[] = [
  {
    title: "Championship Tennis",
    category: "Racquet Sports",
    tagline: "Ultra-cushioned ITF standard synthetic courts with 800-lux broadcast grade LED lighting.",
    specs: ["4 Floodlit Courts", "30 & 60 Min Sessions", "Ball Machine Rental", "Racket Restringing"],
    gradient: "from-[#CCFF00]/20 via-[#141414] to-[#0A0A0A]",
    accentColor: "#CCFF00",
    badge: "Tournament Grade",
    icon: "🎾",
  },
  {
    title: "Panoramic Padel",
    category: "Modern Racquet",
    tagline: "World Padel Tour specification glass enclosures with seamless panoramic views and super-grip turf.",
    specs: ["4 Glass Panoramic Courts", "Italian Supercourt Turf", "Duo & Quad Play", "Equipment Rental"],
    gradient: "from-[#00B4FF]/20 via-[#141414] to-[#0A0A0A]",
    accentColor: "#00B4FF",
    badge: "Fastest Growing",
    icon: "🏓",
  },
  {
    title: "Pro Badminton",
    category: "Indoor Courts",
    tagline: "Air-conditioned indoor arena with Olympic-grade BWF approved shock-absorbing wooden-vinyl flooring.",
    specs: ["6 Indoor Courts", "Zero Draft HVAC", "Non-glare Lighting", "Yonex Shuttle Hub"],
    gradient: "from-[#FF4D00]/20 via-[#141414] to-[#0A0A0A]",
    accentColor: "#FF4D00",
    badge: "BWF Certified",
    icon: "🏸",
  },
  {
    title: "Cricket Nets Arena",
    category: "Precision Training",
    tagline: "Full-length batting pitches equipped with speed-programmable bowling machines and digital speed tracking.",
    specs: ["4 Enclosed Net Lanes", "Dual Bowling Machines", "Full Run-Up Tracks", "Video Analysis Ready"],
    gradient: "from-[#A855F7]/20 via-[#141414] to-[#0A0A0A]",
    accentColor: "#A855F7",
    badge: "Automated Feed",
    icon: "🏏",
  },
];

export default function SportsShowcase() {
  const { user } = useAuth();
  return (
    <section id="sports" className="py-28 bg-[#0A0A0A] relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#CCFF00]/5 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#CCFF00] font-bold mb-3">
              <span className="w-2 h-2 rounded-full bg-[#CCFF00]" />
              <span>World-Class Sporting Arenas</span>
            </div>
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight uppercase text-white">
              Built For <span className="text-[#CCFF00]">High Performance</span>
            </h2>
          </div>
          <p className="max-w-md text-sm md:text-base text-[#888888] leading-relaxed">
            Every surface, luminaire, and boundary is calibrated to global federation standards for recreational lovers and competitive tournament athletes alike.
          </p>
        </div>

        {/* Sports Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sportsData.map((sport, index) => (
            <motion.div
              key={sport.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -6 }}
              className="group relative bg-[#141414] border border-[#1F1F1F] hover:border-[#333333] rounded-3xl p-7 flex flex-col justify-between transition-all duration-300 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            >
              {/* Dynamic Gradient Top Glow */}
              <div
                className={`absolute inset-x-0 top-0 h-40 bg-gradient-to-b ${sport.gradient} opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
              />

              {/* Card Header */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-4xl p-3 rounded-2xl bg-[#0A0A0A]/80 border border-[#1F1F1F] shadow-inner backdrop-blur-sm">
                    {sport.icon}
                  </div>
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border"
                    style={{
                      borderColor: `${sport.accentColor}40`,
                      color: sport.accentColor,
                      backgroundColor: `${sport.accentColor}10`,
                    }}
                  >
                    {sport.badge}
                  </span>
                </div>

                <div className="text-[11px] uppercase tracking-widest text-[#888888] font-semibold mb-1">
                  {sport.category}
                </div>
                <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold uppercase tracking-tight text-white mb-3">
                  {sport.title}
                </h3>
                <p className="text-xs text-[#888888] leading-relaxed mb-6">
                  {sport.tagline}
                </p>

                {/* Specs List */}
                <ul className="space-y-2.5 pt-4 border-t border-[#1F1F1F]">
                  {sport.specs.map((spec) => (
                    <li key={spec} className="flex items-center gap-2 text-xs text-[#CCCCCC]">
                      <CheckCircle2
                        className="w-3.5 h-3.5 flex-shrink-0"
                        style={{ color: sport.accentColor }}
                      />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card Footer CTA */}
              <div className="relative z-10 pt-6 mt-6 border-t border-[#1F1F1F]/60 flex items-center justify-between">
                {user ? (
                  <Link
                    href="/dashboard/courts"
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white group-hover:text-[#CCFF00] transition-colors"
                  >
                    <span>Book A Slot</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                ) : (
                  <a
                    href="#availability"
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white group-hover:text-[#CCFF00] transition-colors"
                  >
                    <span>Book A Slot</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
