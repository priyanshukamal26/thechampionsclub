"use client";

import { RegisterFormData } from "../RegistrationWizard";
import { ShieldCheck, User, Mail } from "lucide-react";

interface Props {
  formData: RegisterFormData;
  updateFormData: (fields: Partial<RegisterFormData>) => void;
}

export default function GuardianConsent({ formData, updateFormData }: Props) {
  return (
    <div className="space-y-3">
      <div>
        <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#3B82F6] mb-0.5">
          <ShieldCheck className="w-3 h-3" />
          <span>India DPDP Act 2023 Compliance</span>
        </div>
        <h3 className="font-[family-name:var(--font-space-grotesk)] text-lg sm:text-xl font-bold uppercase tracking-tight text-[#0F172A] mb-0.5 leading-tight">
          Parent or Legal Guardian Consent
        </h3>
        <p className="text-[11px] text-[#64748B]">
          Because the applicant is under 18 years of age, verifiable parental or guardian authorization is legally mandatory before booking access can be granted.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Guardian Name */}
        <div>
          <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-[#334155] mb-1">
            Guardian Full Name
          </label>
          <div className="relative">
            <User className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Malhotra"
              value={formData.guardianName}
              onChange={(e) => updateFormData({ guardianName: e.target.value })}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-[#3B82F6]/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] outline-none transition-all"
            />
          </div>
        </div>

        {/* Guardian Email */}
        <div>
          <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-[#334155] mb-1">
            Guardian Email (Verification Link Recipient)
          </label>
          <div className="relative">
            <Mail className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              placeholder="ramesh.parent@gmail.com"
              value={formData.guardianEmail}
              onChange={(e) => updateFormData({ guardianEmail: e.target.value })}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-[#3B82F6]/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] outline-none transition-all"
            />
          </div>
        </div>

        {/* Guardian Phone */}
        <div className="sm:col-span-2">
          <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-[#334155] mb-1">
            Guardian Contact Phone
          </label>
          <div className="relative flex">
            <span className="inline-flex items-center px-3 rounded-l-xl bg-[#F1F5F9] border border-r-0 border-[#E2E8F0] text-xs font-mono text-[#64748B]">
              +91
            </span>
            <input
              type="tel"
              required
              placeholder="98100 12345"
              value={formData.guardianPhone}
              onChange={(e) => updateFormData({ guardianPhone: e.target.value })}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-[#3B82F6]/10 rounded-r-xl px-3 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Consent Declaration Checkbox */}
      <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200/60">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.guardianConsentGiven}
            onChange={(e) => updateFormData({ guardianConsentGiven: e.target.checked })}
            className="mt-0.5 w-4 h-4 accent-[#3B82F6] rounded cursor-pointer"
          />
          <span className="text-[11px] text-[#334155] leading-relaxed">
            I affirm that I am the parent or legal guardian of the minor applicant. I authorize The Champions Club to process identity data for booking management and club access in accordance with India’s Digital Personal Data Protection (DPDP) Act 2023.
          </span>
        </label>
      </div>
    </div>
  );
}
