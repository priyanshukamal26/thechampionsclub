"use client";

import { motion } from "framer-motion";

export default function Stats() {
  const stats = [
    {
      value: "18",
      suffix: "",
      label: "World-Class Courts & Lanes",
      detail: "Tennis, Padel, Badminton & Nets",
    },
    {
      value: "100",
      suffix: "%",
      label: "Conflict-Free Guarantee",
      detail: "DB-level exclusion locking",
    },
    {
      value: "2",
      suffix: "x",
      label: "Daily Play Cap Allowance",
      detail: "Fair access across all tiers",
    },
    {
      value: "6",
      suffix: "AM",
      label: "Daily Opening to 11PM",
      detail: "Floodlit & climate-controlled",
    },
  ];

  return (
    <section className="bg-[#050505] border-y border-[#1F1F1F] py-16 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col items-center text-center p-4 rounded-2xl bg-[#141414]/30 border border-[#1F1F1F]/40"
            >
              <div className="font-[family-name:var(--font-space-grotesk)] text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#CCFF00]">
                {stat.value}
                <span className="text-white text-3xl sm:text-4xl">{stat.suffix}</span>
              </div>
              <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white mt-2">
                {stat.label}
              </div>
              <div className="text-[11px] text-[#888888] mt-1">
                {stat.detail}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
