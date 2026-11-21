"use client";

import { RegisterFormData } from "../RegistrationWizard";
import { Check, Star, Zap, Shield, Sparkles } from "lucide-react";

interface Props {
  formData: RegisterFormData;
  updateFormData: (fields: Partial<RegisterFormData>) => void;
  isMinor: boolean;
}

export default function ChoosePlan({ formData, updateFormData, isMinor }: Props) {
  const planOptions = [
    {
      id: "gold" as const,
      name: "Gold Champion",
      price: "₹4,999",
      disabled: isMinor,
      badge: "Full Privilege",
      perk: "100% Free Court Access (₹0)",
      description: "For active daily players, corporate athletes, and weekend tournament contenders.",
    },
    {
      id: "silver" as const,
      name: "Silver Tier",
      price: "₹2,499",
      disabled: isMinor,
      badge: "Standard",
      perk: "30% Off Court Fees",
      description: "For recreational players looking for flexible evening play and community events.",
    },
    {
      id: "junior" as const,
      name: "Junior Prodigy",
      price: "₹1,699",
      badge: "Under 18 Dedicated",
      perk: "50% Off & Coached Slots",
      description: "For budding tennis, badminton, and cricket juniors under parental supervision.",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold uppercase tracking-tight text-white mb-1">
          Select Your Membership Plan
        </h3>
        <p className="text-xs text-[#888888]">
          {isMinor
            ? "Since your birthdate indicates you are under 18, Junior Prodigy tier is pre-selected."
            : "Choose the entitlement tier that matches your playing schedule."}
        </p>
      </div>

      <div className="space-y-3">
        {planOptions.map((plan) => {
          const isSelected = formData.planId === plan.id;

          return (
            <div
              key={plan.id}
              onClick={() => {
                if (!plan.disabled) {
                  updateFormData({ planId: plan.id });
                }
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative ${
                plan.disabled
                  ? "opacity-40 cursor-not-allowed bg-[#0D0D0D] border-[#1F1F1F]"
                  : isSelected
                  ? "bg-[#1A1A1A] border-2 border-[#CCFF00] shadow-[0_0_25px_rgba(204,255,0,0.15)]"
                  : "bg-[#0D0D0D] border-[#1F1F1F] hover:border-[#333333]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? "border-[#CCFF00] bg-[#CCFF00] text-[#0A0A0A]"
                        : "border-[#555555] bg-transparent"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-[family-name:var(--font-space-grotesk)] text-base font-bold uppercase text-white">
                        {plan.name}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#1F1F1F] text-[#CCFF00]">
                        {plan.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#888888] mt-0.5">
                      {plan.description}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-black text-white font-[family-name:var(--font-space-grotesk)]">
                    {plan.price}
                  </div>
                  <div className="text-[10px] text-[#CCFF00] font-semibold">
                    {plan.perk}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 rounded-2xl bg-[#0D0D0D] border border-[#1F1F1F] text-xs text-[#888888]">
        💡 <span className="text-white font-medium">Club Policy:</span> Memberships are renewed monthly or annually. You can upgrade or switch plans anytime from the Member Dashboard.
      </div>
    </div>
  );
}
