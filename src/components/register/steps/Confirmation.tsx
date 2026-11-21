"use client";

import { RegisterFormData } from "../RegistrationWizard";
import { Edit3, CheckCircle, ShieldCheck } from "lucide-react";

interface Props {
  formData: RegisterFormData;
  updateFormData: (fields: Partial<RegisterFormData>) => void;
  jumpToStep: (index: number) => void;
  isMinor: boolean;
}

export default function Confirmation({ formData, updateFormData, jumpToStep, isMinor }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold uppercase tracking-tight text-white mb-1">
          Review Application
        </h3>
        <p className="text-xs text-[#888888]">
          Double check your details before submitting to the club database.
        </p>
      </div>

      <div className="space-y-4">
        {/* Personal Details Card */}
        <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1F1F1F] relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#888888]">
              Personal Information
            </span>
            <button
              type="button"
              onClick={() => jumpToStep(0)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#CCFF00] hover:underline"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[#555555] block">Full Name</span>
              <span className="text-white font-semibold">{formData.fullName || "—"}</span>
            </div>
            <div>
              <span className="text-[#555555] block">Email</span>
              <span className="text-white font-mono">{formData.email || "—"}</span>
            </div>
            <div>
              <span className="text-[#555555] block">Phone</span>
              <span className="text-white font-mono">+91 {formData.phone || "—"}</span>
            </div>
            <div>
              <span className="text-[#555555] block">Date of Birth</span>
              <span className="text-white">{formData.dob || "—"}</span>
            </div>
          </div>
        </div>

        {/* Selected Plan Card */}
        <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1F1F1F] relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#888888]">
              Membership Tier
            </span>
            <button
              type="button"
              onClick={() => jumpToStep(2)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#CCFF00] hover:underline"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="text-white font-bold uppercase text-sm block">
                {formData.planId} Tier
              </span>
              <span className="text-[#888888]">
                {formData.planId === "gold"
                  ? "₹4,999/mo · 100% Free Court Access"
                  : formData.planId === "silver"
                  ? "₹2,499/mo · 30% Off Hourly Fees"
                  : "₹1,699/mo · Junior Prodigy Tier"}
              </span>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] text-[11px] font-extrabold uppercase">
              Selected
            </span>
          </div>
        </div>

        {/* Guardian Card if Minor */}
        {isMinor && (
          <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#1F1F1F] relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#00B4FF]">
                Guardian Verification (DPDP Act)
              </span>
              <button
                type="button"
                onClick={() => jumpToStep(3)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00B4FF] hover:underline"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[#555555] block">Guardian Name</span>
                <span className="text-white font-semibold">{formData.guardianName || "—"}</span>
              </div>
              <div>
                <span className="text-[#555555] block">Guardian Email</span>
                <span className="text-white font-mono">{formData.guardianEmail || "—"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Terms Agreement Checkbox */}
        <div className="p-4 rounded-2xl bg-[#0D0D0D] border border-[#1F1F1F]">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.termsAccepted}
              onChange={(e) => updateFormData({ termsAccepted: e.target.checked })}
              className="mt-1 w-4 h-4 accent-[#CCFF00] rounded cursor-pointer"
            />
            <span className="text-xs text-[#CCCCCC] leading-relaxed">
              I accept The Champions Club Member Rules, Court Etiquette, Cancellation Policies, and consent to receive digital transaction notifications via email and SMS.
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
