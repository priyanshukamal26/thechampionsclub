"use client";

import { RegisterFormData } from "../RegistrationWizard";
import { Edit3 } from "lucide-react";

interface Props {
  formData: RegisterFormData;
  updateFormData: (fields: Partial<RegisterFormData>) => void;
  jumpToStep: (index: number) => void;
  isMinor: boolean;
}

export default function Confirmation({ formData, updateFormData, jumpToStep, isMinor }: Props) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-[family-name:var(--font-space-grotesk)] text-lg sm:text-xl font-bold uppercase tracking-tight text-[#0F172A] mb-0.5 leading-tight">
          Review Application
        </h3>
        <p className="text-[11px] text-[#64748B]">
          Double check your details before submitting to the club database.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Personal Details Card */}
        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              Personal Information
            </span>
            <button
              type="button"
              onClick={() => jumpToStep(0)}
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#3B82F6] hover:underline"
            >
              <Edit3 className="w-2.5 h-2.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-[#94A3B8] block text-[10px]">Full Name</span>
              <span className="text-[#0F172A] font-semibold truncate block">{formData.fullName || "—"}</span>
            </div>
            <div>
              <span className="text-[#94A3B8] block text-[10px]">Email</span>
              <span className="text-[#0F172A] font-mono truncate block">{formData.email || "—"}</span>
            </div>
            <div>
              <span className="text-[#94A3B8] block text-[10px]">Phone</span>
              <span className="text-[#0F172A] font-mono">+91 {formData.phone || "—"}</span>
            </div>
            <div>
              <span className="text-[#94A3B8] block text-[10px]">Date of Birth</span>
              <span className="text-[#0F172A]">{formData.dob || "—"}</span>
            </div>
          </div>
        </div>

        {/* Selected Plan Card */}
        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 relative flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              Membership Tier
            </span>
            <button
              type="button"
              onClick={() => jumpToStep(2)}
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#3B82F6] hover:underline"
            >
              <Edit3 className="w-2.5 h-2.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="text-[#0F172A] font-bold uppercase text-xs block">
                {formData.planId} Tier
              </span>
              <span className="text-[10.5px] text-[#64748B]">
                {formData.planId === "gold"
                  ? "₹4,999/mo · Free Court Access"
                  : formData.planId === "silver"
                  ? "₹2,499/mo · 30% Off Fees"
                  : "₹1,699/mo · Junior Prodigy"}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#2563EB] text-[9.5px] font-extrabold uppercase">
              Selected
            </span>
          </div>

          {/* Guardian Sub-card if Minor */}
          {isMinor && (
            <div className="pt-2 mt-2 border-t border-slate-200/60 flex items-center justify-between text-[10.5px]">
              <div>
                <span className="text-[#94A3B8] text-[9.5px] block">Guardian:</span>
                <span className="text-[#0F172A] font-medium">{formData.guardianName || "—"}</span>
              </div>
              <button
                type="button"
                onClick={() => jumpToStep(3)}
                className="text-[10px] text-[#3B82F6] hover:underline"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Terms Agreement Checkbox */}
      <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80">
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.termsAccepted}
            onChange={(e) => updateFormData({ termsAccepted: e.target.checked })}
            className="mt-0.5 w-4 h-4 accent-[#3B82F6] rounded cursor-pointer"
          />
          <span className="text-[11px] text-[#334155] leading-relaxed">
            I accept The Champions Club Member Rules, Court Etiquette, Cancellation Policies, and consent to receive digital transaction notifications via email and SMS.
          </span>
        </label>
      </div>
    </div>
  );
}
