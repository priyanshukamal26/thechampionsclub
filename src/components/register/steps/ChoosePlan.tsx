"use client";

import { RegisterFormData } from "../RegistrationWizard";
import { Check } from "lucide-react";

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
    <div className="space-y-3">
      <div>
        <h3 className="font-[family-name:var(--font-space-grotesk)] text-lg sm:text-xl font-bold uppercase tracking-tight text-[#0F172A] mb-0.5 leading-tight">
          Select Your Membership Plan
        </h3>
        <p className="text-[11px] text-[#64748B]">
          {isMinor
            ? "Since your birthdate indicates you are under 18, Junior Prodigy tier is pre-selected."
            : "Choose the entitlement tier that matches your playing schedule."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                plan.disabled
                  ? "opacity-40 cursor-not-allowed bg-slate-50 border-slate-200"
                  : isSelected
                  ? "bg-blue-50/70 border-2 border-[#3B82F6] shadow-sm"
                  : "bg-[#F8FAFC] border-slate-200/80 hover:border-slate-300 hover:bg-white"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? "border-[#3B82F6] bg-[#3B82F6] text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100/80 text-[#2563EB]">
                    {plan.badge}
                  </span>
                </div>

                <div className="font-[family-name:var(--font-space-grotesk)] text-sm font-bold uppercase text-[#0F172A] leading-tight">
                  {plan.name}
                </div>
                <p className="text-[10.5px] text-[#64748B] mt-1 leading-snug line-clamp-2">
                  {plan.description}
                </p>
              </div>

              <div className="pt-2.5 mt-2.5 border-t border-slate-200/60">
                <div className="text-base font-black text-[#0F172A] font-[family-name:var(--font-space-grotesk)] leading-none">
                  {plan.price}
                </div>
                <div className="text-[10px] text-[#2563EB] font-semibold mt-0.5">
                  {plan.perk}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 text-[11px] text-[#64748B]">
        💡 <span className="text-[#0F172A] font-medium">Club Policy:</span> Memberships are renewed monthly or annually. You can upgrade or switch plans anytime from the Member Dashboard.
      </div>
    </div>
  );
}
