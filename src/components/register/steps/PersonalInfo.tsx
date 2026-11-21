"use client";

import { RegisterFormData } from "../RegistrationWizard";
import { User, Mail, Calendar, ShieldAlert } from "lucide-react";

interface Props {
  formData: RegisterFormData;
  updateFormData: (fields: Partial<RegisterFormData>) => void;
  isMinor: boolean;
}

export default function PersonalInfo({ formData, updateFormData, isMinor }: Props) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-[family-name:var(--font-space-grotesk)] text-lg sm:text-xl font-bold uppercase tracking-tight text-[#0F172A] mb-0.5 leading-tight">
          Personal Information
        </h3>
        <p className="text-[11px] text-[#64748B]">
          Let’s get you verified and set up for court access.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Full Name */}
        <div>
          <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-[#334155] mb-1">
            Full Name (As on Govt ID)
          </label>
          <div className="relative">
            <User className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              placeholder="e.g. Vikramaditya Rathore"
              value={formData.fullName}
              onChange={(e) => updateFormData({ fullName: e.target.value })}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-[#3B82F6]/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] outline-none transition-all"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-[#334155] mb-1">
            Email Address (Primary Login)
          </label>
          <div className="relative">
            <Mail className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              placeholder="vikram@example.com"
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-[#3B82F6]/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] outline-none transition-all"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-[#334155] mb-1">
            Phone Number (For OTP & Slot Notifications)
          </label>
          <div className="relative flex">
            <span className="inline-flex items-center px-3 rounded-l-xl bg-[#F1F5F9] border border-r-0 border-[#E2E8F0] text-xs font-mono text-[#64748B]">
              +91
            </span>
            <input
              type="tel"
              required
              placeholder="98765 43210"
              value={formData.phone}
              onChange={(e) => updateFormData({ phone: e.target.value })}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-[#3B82F6]/10 rounded-r-xl px-3 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] outline-none transition-all"
            />
          </div>
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-[#334155] mb-1">
            Date of Birth
          </label>
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="date"
              required
              value={formData.dob}
              onChange={(e) => updateFormData({ dob: e.target.value })}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-[#3B82F6]/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Minor Alert Banner */}
      {isMinor && (
        <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200/80 flex items-start gap-2.5 mt-2">
          <ShieldAlert className="w-4 h-4 text-[#3B82F6] flex-shrink-0 mt-0.5" />
          <div className="text-[11px] text-[#334155] leading-snug">
            <span className="font-bold text-[#3B82F6] block mb-0.5">Junior Member Detected (&lt;18)</span>
            Under India’s DPDP Act, your account will require a verified parent or legal guardian consent before court booking privileges activate.
          </div>
        </div>
      )}
    </div>
  );
}
