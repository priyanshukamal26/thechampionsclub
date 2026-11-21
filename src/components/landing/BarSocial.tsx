"use client";

import { motion } from "framer-motion";
import { Coffee, Flame, Users, Clock, Award, Sparkles, Utensils } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function BarSocial() {
  const { user } = useAuth();
  return (
    <section id="bar" className="py-28 bg-[#050505] border-t border-[#1F1F1F] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 -left-40 w-[600px] h-[600px] bg-[#FF4D00]/10 rounded-full blur-[200px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Two-part layout: The Lounge & The Friday Social */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch mb-20">
          {/* Part 1: Cafe & Bar */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-[#141414] border border-[#1F1F1F] rounded-3xl p-8 sm:p-10 flex flex-col justify-between"
          >
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#FF4D00] font-bold mb-4">
                <Utensils className="w-3.5 h-3.5" />
                <span>Scene 4: Post-Match Recovery</span>
              </div>
              <h3 className="font-[family-name:var(--font-space-grotesk)] text-3xl sm:text-4xl font-bold uppercase tracking-tight text-white mb-4">
                The Champions <span className="text-[#FF4D00]">Bar & Kitchen</span>
              </h3>
              <p className="text-sm text-[#888888] leading-relaxed mb-8">
                Replace paper scribbles with digital table orders, instant kitchen display notifications, and flexible tab settlements with automated member discounts.
              </p>

              {/* Perks grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-[#0D0D0D] border border-[#1F1F1F]">
                  <Coffee className="w-5 h-5 text-[#FF4D00] mb-2" />
                  <div className="text-xs font-bold text-white uppercase">Artisan Brews & Smoothies</div>
                  <div className="text-[11px] text-[#888888] mt-1">High-protein post-workout blends</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#0D0D0D] border border-[#1F1F1F]">
                  <Award className="w-5 h-5 text-[#CCFF00] mb-2" />
                  <div className="text-xs font-bold text-white uppercase">Digital Member Tabs</div>
                  <div className="text-[11px] text-[#888888] mt-1">Auto-discounted, settle at departure</div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#1F1F1F] flex items-center justify-between text-xs text-[#888888]">
              <span>Cash · Credit Cards · UPI QR</span>
              <span className="text-[#FF4D00] font-semibold">Kitchen Display Live</span>
            </div>
          </motion.div>

          {/* Part 2: Friday Night Social Play */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-[#1A1A1A] via-[#141414] to-[#0D0D0D] border-2 border-[#CCFF00]/40 rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-[0_0_50px_rgba(204,255,0,0.08)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 text-7xl opacity-10 pointer-events-none">
              🎾
            </div>

            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#CCFF00] font-bold mb-4">
                <Flame className="w-3.5 h-3.5 text-[#FF4D00]" />
                <span>Scene 2 Highlight</span>
              </div>
              <h3 className="font-[family-name:var(--font-space-grotesk)] text-3xl sm:text-4xl font-bold uppercase tracking-tight text-white mb-4">
                Friday Night <span className="text-[#CCFF00]">Social Play</span>
              </h3>
              <p className="text-sm text-[#888888] leading-relaxed mb-6">
                Where the whole club comes alive. Up to 20 players share dedicated floodlit courts, rotate partners every 20 minutes, and enjoy live music, fresh tacos and cold craft drinks.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-xs text-white">
                  <Clock className="w-4 h-4 text-[#CCFF00]" />
                  <span>Every Friday: 7:00 PM – 10:30 PM IST</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-white">
                  <Users className="w-4 h-4 text-[#CCFF00]" />
                  <span>Exclusive capacity locking (Guaranteed game time)</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-white">
                  <Sparkles className="w-4 h-4 text-[#CCFF00]" />
                  <span>Free entry for Gold members / ₹400 for guests</span>
                </div>
              </div>
            </div>

            <Link
              href={user ? "/dashboard/bar" : "/register"}
              className="w-full py-4 rounded-full bg-[#CCFF00] text-[#0A0A0A] font-extrabold text-xs uppercase tracking-wider text-center hover:bg-[#a8cc00] transition-all shadow-[0_0_25px_rgba(204,255,0,0.3)] block"
            >
              {user ? "View Lounge & Friday Social" : "Reserve Friday Social Spot"}
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
