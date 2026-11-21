"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Calendar, Zap, ShieldCheck, Flame, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function Hero() {
  const { user } = useAuth();
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 35 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28 pb-16 bg-[#050505]">
      {/* Dynamic Background Glow Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#CCFF00]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-[#FF4D00]/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-[#00B4FF]/5 rounded-full blur-[180px] pointer-events-none" />

      {/* Subtle Grid Backdrop */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Eyebrow Pill */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#141414] border border-[#1F1F1F] text-xs uppercase tracking-[0.2em] text-[#CCFF00] font-semibold mb-8 shadow-[0_0_20px_rgba(204,255,0,0.1)]"
          >
            <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
            <span>Redefining The Sports Club Experience</span>
          </motion.div>

          {/* Main Giant Headline */}
          <motion.h1
            variants={itemVariants}
            className="font-[family-name:var(--font-space-grotesk)] text-6xl sm:text-7xl md:text-8xl lg:text-[7.5rem] xl:text-[8.5rem] font-extrabold tracking-tighter leading-[0.88] uppercase text-[#FAFAFA]"
          >
            <span className="block">Play.</span>
            <span className="block bg-gradient-to-r from-[#CCFF00] via-[#E4FF66] to-white bg-clip-text text-transparent">
              Compete.
            </span>
            <span className="block text-[#FAFAFA]">Dominate.</span>
          </motion.h1>

          {/* Subtitle / Sports ticker */}
          <motion.div variants={itemVariants} className="mt-8 max-w-2xl">
            <p className="text-lg md:text-xl text-[#888888] font-normal leading-relaxed">
              New Delhi’s high-performance sports sanctuary. Championship{" "}
              <span className="text-white font-medium">Tennis</span>, panoramic{" "}
              <span className="text-white font-medium">Padel</span>, BWF-grade{" "}
              <span className="text-white font-medium">Badminton</span>, and automated{" "}
              <span className="text-white font-medium">Cricket Nets</span>.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#CCFF00] text-[#0A0A0A] font-extrabold text-sm uppercase tracking-wider px-8 py-4 rounded-full hover:bg-[#a8cc00] transition-all duration-300 shadow-[0_0_30px_rgba(204,255,0,0.4)] hover:shadow-[0_0_45px_rgba(204,255,0,0.6)] hover:scale-[1.02] active:scale-95"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/dashboard/courts"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#141414] border border-[#1F1F1F] text-white font-semibold text-sm uppercase tracking-wider px-8 py-4 rounded-full hover:border-[#CCFF00]/60 hover:text-[#CCFF00] transition-all duration-200"
                >
                  <Calendar className="w-4 h-4 text-[#CCFF00]" />
                  <span>Book Courts Now</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#CCFF00] text-[#0A0A0A] font-extrabold text-sm uppercase tracking-wider px-8 py-4 rounded-full hover:bg-[#a8cc00] transition-all duration-300 shadow-[0_0_30px_rgba(204,255,0,0.4)] hover:shadow-[0_0_45px_rgba(204,255,0,0.6)] hover:scale-[1.02] active:scale-95"
                >
                  <span>Get Your Membership</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#availability"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#141414] border border-[#1F1F1F] text-white font-semibold text-sm uppercase tracking-wider px-8 py-4 rounded-full hover:border-[#CCFF00]/60 hover:text-[#CCFF00] transition-all duration-200"
                >
                  <Calendar className="w-4 h-4 text-[#CCFF00]" />
                  <span>View Live Slots</span>
                </a>
              </>
            )}
          </motion.div>

          {/* Value Badges */}
          <motion.div
            variants={itemVariants}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl"
          >
            <div className="flex items-center justify-center gap-3 bg-[#141414]/60 border border-[#1F1F1F] rounded-2xl py-3.5 px-4 backdrop-blur-md">
              <Zap className="w-4 h-4 text-[#CCFF00]" />
              <span className="text-xs uppercase tracking-wider font-semibold text-[#888888]">
                Real-Time Availability
              </span>
            </div>
            <div className="flex items-center justify-center gap-3 bg-[#141414]/60 border border-[#1F1F1F] rounded-2xl py-3.5 px-4 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-[#CCFF00]" />
              <span className="text-xs uppercase tracking-wider font-semibold text-[#888888]">
                Guaranteed No Double-Book
              </span>
            </div>
            <div className="flex items-center justify-center gap-3 bg-[#141414]/60 border border-[#1F1F1F] rounded-2xl py-3.5 px-4 backdrop-blur-md">
              <Flame className="w-4 h-4 text-[#FF4D00]" />
              <span className="text-xs uppercase tracking-wider font-semibold text-[#888888]">
                Friday Night Socials
              </span>
            </div>
          </motion.div>

          {/* Bouncing Scroll Indicator */}
          <motion.div
            variants={itemVariants}
            className="mt-14 flex flex-col items-center gap-2 text-[#555555] hover:text-[#CCFF00] transition-colors"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] font-semibold">
              Scroll To Discover
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            >
              <ChevronDown className="w-4 h-4 text-[#CCFF00]" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
