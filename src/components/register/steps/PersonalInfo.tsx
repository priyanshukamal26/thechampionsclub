"use client";

import { RegisterFormData } from "../RegistrationWizard";
import { User, Mail, Phone, Calendar, ShieldAlert } from "lucide-react";

interface Props {
  formData: RegisterFormData;
  updateFormData: (fields: Partial<RegisterFormData>) => void;
  isMinor: boolean;
}

export default function PersonalInfo({ formData, updateFormData, isMinor }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold uppercase tracking-tight text-white mb-1">
          Personal Information
        </h3>
        <p className="text-xs text-[#888888]">
          Let’s get you verified and set up for court access.
        </p>
      </div>

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888888] mb-1.5">
            Full Name (As on Govt ID)
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-[#555555] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              placeholder="e.g. Vikramaditya Rathore"
              value={formData.fullName}
              onChange={(e) => updateFormData({ fullName: e.target.value })}
              className="w-full bg-[#0A0A0A] border border-[#222222] focus:border-[#CCFF00] rounded-xl pl-11 pr-4 py-3.5 text-xs text-white placeholder-[#555555] outline-none transition-colors"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888888] mb-1.5">
            Email Address (Primary Login)
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#555555] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              placeholder="vikram@example.com"
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
              className="w-full bg-[#0A0A0A] border border-[#222222] focus:border-[#CCFF00] rounded-xl pl-11 pr-4 py-3.5 text-xs text-white placeholder-[#555555] outline-none transition-colors"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888888] mb-1.5">
            Phone Number (For OTP & Slot Notifications)
          </label>
          <div className="relative flex">
            <span className="inline-flex items-center px-3.5 rounded-l-xl bg-[#1A1A1A] border border-r-0 border-[#222222] text-xs font-mono text-[#888888]">
              +91
            </span>
            <input
              type="tel"
              required
              placeholder="98765 43210"
              value={formData.phone}
              onChange={(e) => updateFormData({ phone: e.target.value })}
              className="w-full bg-[#0A0A0A] border border-[#222222] focus:border-[#CCFF00] rounded-r-xl px-4 py-3.5 text-xs text-white placeholder-[#555555] outline-none transition-colors"
            />
          </div>
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888888] mb-1.5">
            Date of Birth
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-[#555555] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="date"
              required
              value={formData.dob}
              onChange={(e) => updateFormData({ dob: e.target.value })}
              className="w-full bg-[#0A0A0A] border border-[#222222] focus:border-[#CCFF00] rounded-xl pl-11 pr-4 py-3.5 text-xs text-white placeholder-[#555555] outline-none transition-colors [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Minor Alert Banner */}
        {isMinor && (
          <div className="p-4 rounded-2xl bg-[#00B4FF]/10 border border-[#00B4FF]/30 flex items-start gap-3 mt-4">
            <ShieldAlert className="w-5 h-5 text-[#00B4FF] flex-shrink-0 mt-0.5" />
            <div className="text-xs text-[#CCCCCC]">
              <span className="font-bold text-[#00B4FF] block mb-0.5">Junior Member Detected (&lt;18)</span>
              Under India’s DPDP Act, your account will require a verified parent or legal guardian consent before court booking privileges activate.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
