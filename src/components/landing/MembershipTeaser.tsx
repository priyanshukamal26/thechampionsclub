"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Sparkles, Star, Zap, Shield, ArrowRight } from "lucide-react";

interface PlanTier {
  id: string;
  name: string;
  priceMonthly: number;
  badge?: string;
  isPopular?: boolean;
  courtRate: string;
  shopDiscount: string;
  barDiscount: string;
  features: string[];
  ctaText: string;
  accent: string;
}

const plans: PlanTier[] = [
  {
    id: "silver",
    name: "Silver Tier",
    priceMonthly: 2499,
    courtRate: "30% off standard hourly rate",
    shopDiscount: "5% off gear & apparel",
    barDiscount: "5% off cafe tabs",
    features: [
      "Access to all 4 sports courts",
      "7-day advance booking window",
      "Max 2 bookings per day (IST)",
      "Standard cancellation policy",
      "Digital member QR pass",
    ],
    ctaText: "Select Silver",
    accent: "#888888",
  },
  {
    id: "gold",
    name: "Gold Champion",
    priceMonthly: 4999,
    badge: "Most Popular",
    isPopular: true,
    courtRate: "100% Free Court Access (₹0)",
    shopDiscount: "15% off gear & apparel",
    barDiscount: "15% automatic cafe discount",
    features: [
      "Zero court fees across all 18 arenas",
      "14-day priority advance booking",
      "Complimentary Friday Social Nights",
      "Free racket stringing (2/month)",
      "Guest passes (4 passes / month)",
      "Priority cafeteria table reservation",
    ],
    ctaText: "Claim Gold Tier",
    accent: "#CCFF00",
  },
  {
    id: "junior",
    name: "Junior Prodigy",
    priceMonthly: 1699,
    badge: "Under 18 Years",
    courtRate: "50% off standard hourly rate",
    shopDiscount: "10% off training gear",
    barDiscount: "10% off healthy drinks & meals",
    features: [
      "Coached academy priority slots",
      "Guardian DPDP-compliant linked account",
      "Junior tournament league entry",
      "Weekend morning net access",
      "Equipment trial loaner program",
    ],
    ctaText: "Register Junior",
    accent: "#00B4FF",
  },
];

export default function MembershipTeaser() {
  const [annualBilling, setAnnualBilling] = useState(false);

  return (
    <section id="membership" className="py-28 bg-[#0A0A0A] relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-[#CCFF00]/10 rounded-full blur-[200px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#CCFF00] font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tailored For Your Sporting Lifestyle</span>
          </div>
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight uppercase text-white">
            Membership <span className="text-[#CCFF00]">Tiers</span>
          </h2>
          <p className="mt-4 text-sm md:text-base text-[#888888]">
            Transparent pricing with zero hidden surcharges. Full self-service booking, exclusive club perks, and instant recognition.
          </p>

          {/* Billing Interval Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 bg-[#141414] border border-[#1F1F1F] p-1.5 rounded-full">
            <button
              onClick={() => setAnnualBilling(false)}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                !annualBilling
                  ? "bg-[#CCFF00] text-[#0A0A0A] shadow-md"
                  : "text-[#888888] hover:text-white"
              }`}
            >
              Billed Monthly
            </button>
            <button
              onClick={() => setAnnualBilling(true)}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                annualBilling
                  ? "bg-[#CCFF00] text-[#0A0A0A] shadow-md"
                  : "text-[#888888] hover:text-white"
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-[#FF4D00] text-white px-2 py-0.5 rounded-full font-black uppercase">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => {
            const finalPrice = annualBilling
              ? Math.round(plan.priceMonthly * 0.8)
              : plan.priceMonthly;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  plan.isPopular
                    ? "bg-[#141414] border-2 border-[#CCFF00] shadow-[0_0_40px_rgba(204,255,0,0.15)] scale-[1.02] z-20"
                    : "bg-[#141414]/70 border border-[#1F1F1F] hover:border-[#333333]"
                }`}
              >
                {/* Popular Ribbon */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-[#CCFF00] text-[#0A0A0A] text-[11px] font-extrabold uppercase tracking-widest px-4 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                      <Star className="w-3 h-3 fill-current" />
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  {/* Card Title & Cost */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold uppercase tracking-tight text-white">
                      {plan.name}
                    </h3>
                  </div>

                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-[family-name:var(--font-space-grotesk)]">
                      ₹{finalPrice.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs uppercase tracking-wider text-[#888888] font-semibold">
                      / month + GST
                    </span>
                  </div>

                  {/* Core Entitlement Highlights */}
                  <div className="space-y-3 py-4 mb-6 border-y border-[#1F1F1F]">
                    <div className="flex items-center gap-2.5 text-xs text-white">
                      <Zap className="w-4 h-4 text-[#CCFF00]" />
                      <span className="font-semibold text-[#CCCCCC]">Court Rate:</span>
                      <span className="text-[#CCFF00] font-bold">{plan.courtRate}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-white">
                      <Shield className="w-4 h-4 text-[#00B4FF]" />
                      <span className="font-semibold text-[#CCCCCC]">Pro Shop:</span>
                      <span className="text-white font-medium">{plan.shopDiscount}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-white">
                      <Sparkles className="w-4 h-4 text-[#FF4D00]" />
                      <span className="font-semibold text-[#CCCCCC]">Bar & Lounge:</span>
                      <span className="text-white font-medium">{plan.barDiscount}</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-8">
                    <div className="text-[11px] uppercase tracking-wider text-[#888888] font-bold">
                      What's Included:
                    </div>
                    {plan.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2.5 text-xs text-[#AAAAAA]">
                        <Check className="w-4 h-4 text-[#CCFF00] flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Link */}
                <Link
                  href={`/register?plan=${plan.id}`}
                  className={`w-full py-4 rounded-full font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    plan.isPopular
                      ? "bg-[#CCFF00] text-[#0A0A0A] hover:bg-[#a8cc00] shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:shadow-[0_0_30px_rgba(204,255,0,0.5)]"
                      : "bg-[#1F1F1F] text-white hover:bg-[#2A2A2A] hover:text-[#CCFF00]"
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Walk-in notice */}
        <div className="mt-12 text-center p-6 rounded-2xl bg-[#141414]/40 border border-[#1F1F1F] max-w-2xl mx-auto">
          <p className="text-xs text-[#888888]">
            <span className="text-white font-bold">Not ready for a plan?</span> Walk-in and guest court rates are available at standard peak and off-peak pricing. Booking opens 24 hours prior subject to member reservations.
          </p>
        </div>
      </div>
    </section>
  );
}
