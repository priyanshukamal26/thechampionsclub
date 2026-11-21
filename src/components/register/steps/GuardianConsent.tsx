"use client";

import { RegisterFormData } from "../RegistrationWizard";
import { ShieldCheck, User, Mail, Phone, FileText } from "lucide-react";

interface Props {
  formData: RegisterFormData;
  updateFormData: (fields: Partial<RegisterFormData>) => void;
}

export default function GuardianConsent({ formData, updateFormData }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#00B4FF] mb-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>India DPDP Act 2023 Compliance</span>
        </div>
        <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold uppercase tracking-tight text-white mb-1">
          Parent or Legal Guardian Consent
        </h3>
        <p className="text-xs text-[#888888]">
          Because the applicant is under 18 years of age, verifiable parental or guardian authorization is legally mandatory before booking access can be granted.
        </p>
      </div>

      <div className="space-y-4">
        {/* Guardian Name */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888888] mb-1.5">
            Guardian Full Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-[#555555] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Malhotra"
              value={formData.guardianName}
              onChange={(e) => updateFormData({ guardianName: e.target.value })}
              className="w-full bg-[#0A0A0A] border border-[#222222] focus:border-[#00B4FF] rounded-xl pl-11 pr-4 py-3.5 text-xs text-white placeholder-[#555555] outline-none transition-colors"
            />
          </div>
        </div>

        {/* Guardian Email */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888888] mb-1.5">
            Guardian Email (Verification Link Recipient)
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#555555] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              placeholder="ramesh.parent@gmail.com"
              value={formData.guardianEmail}
              onChange={(e) => updateFormData({ guardianEmail: e.target.value })}
              className="w-full bg-[#0A0A0A] border border-[#222222] focus:border-[#00B4FF] rounded-xl pl-11 pr-4 py-3.5 text-xs text-white placeholder-[#555555] outline-none transition-colors"
            />
          </div>
        </div>

        {/* Guardian Phone */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888888] mb-1.5">
            Guardian Contact Phone
          </label>
          <div className="relative flex">
            <span className="inline-flex items-center px-3.5 rounded-l-xl bg-[#1A1A1A] border border-r-0 border-[#222222] text-xs font-mono text-[#888888]">
              +91
            </span>
            <input
              type="tel"
              required
              placeholder="98100 12345"
              value={formData.guardianPhone}
              onChange={(e) => updateFormData({ guardianPhone: e.target.value })}
              className="w-full bg-[#0A0A0A] border border-[#222222] focus:border-[#00B4FF] rounded-r-xl px-4 py-3.5 text-xs text-white placeholder-[#555555] outline-none transition-colors"
            />
          </div>
        </div>

        {/* Consent Declaration Checkbox */}
        <div className="p-4 rounded-2xl bg-[#0D0D0D] border border-[#1F1F1F] mt-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.guardianConsentGiven}
              onChange={(e) => updateFormData({ guardianConsentGiven: e.target.checked })}
              className="mt-1 w-4 h-4 accent-[#00B4FF] rounded cursor-pointer"
            />
            <span className="text-xs text-[#CCCCCC] leading-relaxed">
              I affirm that I am the parent or legal guardian of the minor applicant. I authorize The Champions Club to process identity data for booking management and club access in accordance with India’s Digital Personal Data Protection (DPDP) Act 2023.
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
