"use client";

import { useState } from "react";
import { RegisterFormData } from "../RegistrationWizard";
import { Lock, Eye, EyeOff, Check, X } from "lucide-react";

interface Props {
  formData: RegisterFormData;
  updateFormData: (fields: Partial<RegisterFormData>) => void;
}

export default function CreatePassword({ formData, updateFormData }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Compute password strength score (0 to 4)
  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = calculateStrength(formData.password);

  const getStrengthLabel = (score: number) => {
    if (!formData.password) return { text: "Enter password", color: "text-[#94A3B8]", bg: "bg-slate-200" };
    if (score <= 1) return { text: "Weak", color: "text-rose-500", bg: "bg-rose-500" };
    if (score === 2) return { text: "Fair", color: "text-amber-500", bg: "bg-amber-500" };
    if (score === 3) return { text: "Strong", color: "text-[#3B82F6]", bg: "bg-[#3B82F6]" };
    return { text: "Very Strong", color: "text-emerald-500", bg: "bg-emerald-500" };
  };

  const strengthInfo = getStrengthLabel(strength);
  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
  const passwordsMismatch = formData.confirmPassword && formData.password !== formData.confirmPassword;

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-[family-name:var(--font-space-grotesk)] text-lg sm:text-xl font-bold uppercase tracking-tight text-[#0F172A] mb-0.5 leading-tight">
          Account Security
        </h3>
        <p className="text-[11px] text-[#64748B]">
          Create a secure password to protect your bookings, tabs, and payments.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Password */}
        <div>
          <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-[#334155] mb-1">
            Create Password
          </label>
          <div className="relative">
            <Lock className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••••••"
              value={formData.password}
              onChange={(e) => updateFormData({ password: e.target.value })}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-[#3B82F6]/10 rounded-xl pl-9 pr-9 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] transition-colors"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Strength Meter */}
          <div className="mt-1.5">
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="text-[#64748B]">Strength:</span>
              <span className={`font-bold uppercase tracking-wider ${strengthInfo.color}`}>
                {strengthInfo.text}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1 h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full transition-all ${strength >= 1 ? strengthInfo.bg : "bg-transparent"}`} />
              <div className={`h-full transition-all ${strength >= 2 ? strengthInfo.bg : "bg-transparent"}`} />
              <div className={`h-full transition-all ${strength >= 3 ? strengthInfo.bg : "bg-transparent"}`} />
              <div className={`h-full transition-all ${strength >= 4 ? strengthInfo.bg : "bg-transparent"}`} />
            </div>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-[#334155] mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showConfirm ? "text" : "password"}
              required
              placeholder="••••••••••••"
              value={formData.confirmPassword}
              onChange={(e) => updateFormData({ confirmPassword: e.target.value })}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-[#3B82F6]/10 rounded-xl pl-9 pr-9 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] transition-colors"
            >
              {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Match Indicator */}
          {passwordsMatch && (
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-emerald-600 font-medium">
              <Check className="w-3 h-3" />
              <span>Passwords match</span>
            </div>
          )}
          {passwordsMismatch && (
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-rose-500 font-medium">
              <X className="w-3 h-3" />
              <span>Passwords do not match</span>
            </div>
          )}
        </div>
      </div>

      {/* Security guidelines checklist */}
      <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200/80 text-[10.5px] text-[#64748B] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className={formData.password.length >= 8 ? "text-[#3B82F6] font-bold" : "text-slate-300"}>•</span>
          <span>At least 8 characters long</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={/[0-9]/.test(formData.password) ? "text-[#3B82F6] font-bold" : "text-slate-300"}>•</span>
          <span>Includes at least one number</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={/[^A-Za-z0-9]/.test(formData.password) ? "text-[#3B82F6] font-bold" : "text-slate-300"}>•</span>
          <span>Includes at least one special character</span>
        </div>
      </div>
    </div>
  );
}
