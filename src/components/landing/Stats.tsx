"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Compass, Clock, Zap } from "lucide-react";

export default function Stats() {
  const stats = [
    {
      value: "18",
      suffix: "",
      label: "World-Class Courts & Lanes",
      detail: "Tennis, Padel, Badminton & Nets",
      chip: "Capacity",
      icon: Compass,
      accent: "#EE6A1F",
    },
    {
      value: "100",
      suffix: "%",
      label: "Conflict-Free Guarantee",
      detail: "DB-level exclusion locking",
      chip: "Integrity",
      icon: ShieldCheck,
      accent: "#3BC45E",
    },
    {
      value: "2",
      suffix: "x",
      label: "Daily Play Cap Allowance",
      detail: "Fair access across all tiers",
      chip: "Fair Play",
      icon: Zap,
      accent: "#EE6A1F",
    },
    {
      value: "6",
      suffix: "AM",
      label: "Daily Opening to 11PM",
      detail: "Floodlit & climate-controlled",
      chip: "Operating Hours",
      icon: Clock,
      accent: "#2A2624",
    },
  ];

  return (
    <section className="bg-[#EEECE8] border-b border-[rgba(30,28,26,0.08)] pb-24 pt-4 relative text-[#1E1C1A]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, i) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08, ease: "easeOut" }}
                className="group relative bg-[#F5F3EF] border border-[rgba(30,28,26,0.07)] rounded-[20px] p-6 flex flex-col justify-between transition-all duration-300 shadow-[0_2px_8px_rgba(30,28,26,0.03)] hover:shadow-[0_10px_26px_rgba(30,28,26,0.07)] hover:-translate-y-1"
              >
                {/* Chip at Top-Left */}
                <div className="flex items-center justify-between mb-6">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E9E6E1] border border-[rgba(30,28,26,0.06)] text-[10.5px] font-medium text-[#77736E]">
                    <IconComponent className="w-3 h-3 text-[#1E1C1A]" />
                    <span>{stat.chip}</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stat.accent }} />
                </div>

                {/* Stat Display Number */}
                <div>
                  <div className="font-[family-name:var(--font-space-grotesk)] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1E1C1A] leading-none mb-3">
                    {stat.value}
                    {stat.suffix && (
                      <span className="text-2xl sm:text-3xl ml-0.5 text-[#EE6A1F]">
                        {stat.suffix}
                      </span>
                    )}
                  </div>

                  {/* Label */}
                  <div className="text-xs sm:text-[13px] font-bold uppercase tracking-wider text-[#1E1C1A] mt-2 leading-snug">
                    {stat.label}
                  </div>

                  {/* Detail */}
                  <div className="text-xs text-[#77736E] mt-1 font-normal leading-relaxed">
                    {stat.detail}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
