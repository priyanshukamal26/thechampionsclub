"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

interface SportCardProps {
  id: string;
  title: string;
  category: string;
  tagline: string;
  specs: string[];
  badge: string;
  icon: string;
  statusText: string;
  highlightNumber: string;
  highlightLabel: string;
}

const sportsData: SportCardProps[] = [
  {
    id: "tennis",
    title: "Championship Tennis",
    category: "Racquet Sports",
    tagline: "Ultra-cushioned ITF standard synthetic courts with 800-lux broadcast grade LED lighting.",
    specs: ["4 Floodlit Courts", "30 & 60 Min Sessions", "Ball Machine Rental", "Racket Restringing"],
    badge: "Tournament Grade",
    icon: "🎾",
    statusText: "Live Booking",
    highlightNumber: "4",
    highlightLabel: "ITF Pro Courts",
  },
  {
    id: "padel",
    title: "Panoramic Padel",
    category: "Modern Racquet",
    tagline: "World Padel Tour specification glass enclosures with seamless panoramic views and super-grip turf.",
    specs: ["4 Glass Panoramic Courts", "Italian Supercourt Turf", "Duo & Quad Play", "Equipment Rental"],
    badge: "Fastest Growing",
    icon: "🏓",
    statusText: "High Demand",
    highlightNumber: "12mm",
    highlightLabel: "Tempered Glass",
  },
  {
    id: "badminton",
    title: "Pro Badminton",
    category: "Indoor Courts",
    tagline: "Air-conditioned indoor arena with Olympic-grade BWF approved shock-absorbing wooden-vinyl flooring.",
    specs: ["6 Indoor Courts", "Zero Draft HVAC", "Non-glare Lighting", "Yonex Shuttle Hub"],
    badge: "BWF Certified",
    icon: "🏸",
    statusText: "Climate Controlled",
    highlightNumber: "BWF",
    highlightLabel: "Grade 1 Spec",
  },
  {
    id: "cricket",
    title: "Cricket Nets Arena",
    category: "Precision Training",
    tagline: "Full-length batting pitches equipped with speed-programmable bowling machines and digital speed tracking.",
    specs: ["4 Enclosed Net Lanes", "Dual Bowling Machines", "Full Run-Up Tracks", "Video Analysis Ready"],
    badge: "Automated Feed",
    icon: "🏏",
    statusText: "Speed Tracking",
    highlightNumber: "150+",
    highlightLabel: "kph Machines",
  },
];

export default function SportsShowcase() {
  const { user } = useAuth();

  return (
    <section id="sports" className="py-24 bg-[#EEECE8] relative text-[#1E1C1A]">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-8">
          <div>
            {/* Chip Badge with Pulse */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E9E6E1] border border-[rgba(30,28,26,0.08)] mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EE6A1F] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EE6A1F]" />
              </span>
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#77736E] font-semibold">
                World-Class Sporting Arenas
              </span>
            </div>

            <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight uppercase text-[#1E1C1A] leading-[1.05]">
              Built For <span className="text-[#EE6A1F]">High Performance</span>
            </h2>
          </div>

          <p className="max-w-md text-sm md:text-[15px] text-[#77736E] leading-relaxed">
            Every surface, luminaire, and boundary is calibrated to global federation standards for recreational lovers and competitive tournament athletes alike.
          </p>
        </div>

        {/* Bento Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {sportsData.map((sport, index) => {
            return (
              <motion.div
                key={sport.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
                className="group relative bg-[#F5F3EF] border border-[rgba(30,28,26,0.07)] rounded-[22px] p-6 flex flex-col justify-between transition-all duration-300 shadow-[0_2px_10px_rgba(30,28,26,0.03)] hover:shadow-[0_12px_32px_rgba(30,28,26,0.08)] hover:-translate-y-1"
              >
                {/* Top Header Row with Chips */}
                <div>
                  <div className="flex items-center justify-between mb-5">
                    {/* Category Chip */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E9E6E1] border border-[rgba(30,28,26,0.06)] text-[11px] font-medium text-[#77736E]">
                      <span className="text-sm">{sport.icon}</span>
                      <span>{sport.category}</span>
                    </div>

                    {/* Editorial Badge */}
                    <span className="text-[10.5px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#EEECE8] border border-[rgba(30,28,26,0.08)] text-[#1E1C1A]">
                      {sport.badge}
                    </span>
                  </div>

                  {/* Sport Title */}
                  <h3 className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold uppercase tracking-tight text-[#1E1C1A] mb-2.5 group-hover:text-[#EE6A1F] transition-colors">
                    {sport.title}
                  </h3>

                  {/* Tagline */}
                  <p className="text-xs text-[#77736E] leading-relaxed mb-6 line-clamp-3">
                    {sport.tagline}
                  </p>

                  {/* Micro Metric Banner (quiet editorial motion) */}
                  <div className="mb-6 p-3 rounded-xl bg-[#EBE8E3] border border-[rgba(30,28,26,0.06)] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-[#A7A39D] font-semibold">
                        {sport.highlightLabel}
                      </div>
                      <div className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold text-[#1E1C1A] leading-none mt-0.5">
                        {sport.highlightNumber}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#77736E]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3BC45E]" />
                      <span>{sport.statusText}</span>
                    </div>
                  </div>

                  {/* Specs List */}
                  <ul className="space-y-2.5 pt-4 border-t border-[rgba(30,28,26,0.07)]">
                    {sport.specs.map((spec) => (
                      <li key={spec} className="flex items-center gap-2 text-xs text-[#1E1C1A]">
                        <div className="w-3.5 h-3.5 rounded-full bg-[#E9E6E1] flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 text-[#EE6A1F]" />
                        </div>
                        <span className="font-medium text-[#1E1C1A]/90">{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Footer CTA */}
                <div className="pt-5 mt-6 border-t border-[rgba(30,28,26,0.07)] flex items-center justify-between">
                  {user ? (
                    <Link
                      href="/dashboard/courts"
                      className="inline-flex items-center justify-between w-full text-xs font-semibold uppercase tracking-wider text-[#1E1C1A] group-hover:text-[#EE6A1F] transition-colors"
                    >
                      <span>Book A Slot</span>
                      <div className="w-7 h-7 rounded-full bg-[#E9E6E1] group-hover:bg-[#EE6A1F] group-hover:text-white flex items-center justify-center transition-all">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </Link>
                  ) : (
                    <a
                      href="#availability"
                      className="inline-flex items-center justify-between w-full text-xs font-semibold uppercase tracking-wider text-[#1E1C1A] group-hover:text-[#EE6A1F] transition-colors"
                    >
                      <span>Book A Slot</span>
                      <div className="w-7 h-7 rounded-full bg-[#E9E6E1] group-hover:bg-[#EE6A1F] group-hover:text-white flex items-center justify-center transition-all">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
