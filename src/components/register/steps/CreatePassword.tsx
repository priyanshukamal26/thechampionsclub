"use client";

import { useState } from "react";
import { RegisterFormData } from "../RegistrationWizard";
import { Lock, Eye, EyeOff, Check, X, ShieldCheck } from "lucide-react";

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
    if (!formData.password) return { text: "Enter password", color: "text-[#555555]", bg: "bg-[#222222]" };
    if (score <= 1) return { text: "Weak", color: "text-[#FF4D00]", bg: "bg-[#FF4D00]" };
    if (score === 2) return { text: "Fair", color: "text-amber-400", bg: "bg-amber-400" };
    if (score === 3) return { text: "Strong", color: "text-[#CCFF00]", bg: "bg-[#CCFF00]" };
    return { text: "Very Strong", color: "text-emerald-400", bg: "bg-emerald-400" };
  };

  const strengthInfo = getStrengthLabel(strength);
  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
  const passwordsMismatch = formData.confirmPassword && formData.password !== formData.confirmPassword;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold uppercase tracking-tight text-white mb-1">
          Account Security
        </h3>
        <p className="text-xs text-[#888888]">
          Create a secure password to protect your bookings, tabs, and payments.
        </p>
      </div>

      <div className="space-y-5">
        {/* Password */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888888] mb-1.5">
            Create Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#555555] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••••••"
              value={formData.password}
              onChange={(e) => updateFormData({ password: e.target.value })}
              className="w-full bg-[#0A0A0A] border border-[#222222] focus:border-[#CCFF00] rounded-xl pl-11 pr-12 py-3.5 text-xs text-white placeholder-[#555555] outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555555] hover:text-[#CCFF00] transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Strength Meter */}
          <div className="mt-2.5">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-[#888888]">Password Strength:</span>
              <span className={`font-bold uppercase tracking-wider ${strengthInfo.color}`}>
                {strengthInfo.text}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 h-1.5 bg-[#1F1F1F] rounded-full overflow-hidden">
              <div className={`h-full transition-all ${strength >= 1 ? strengthInfo.bg : "bg-transparent"}`} />
              <div className={`h-full transition-all ${strength >= 2 ? strengthInfo.bg : "bg-transparent"}`} />
              <div className={`h-full transition-all ${strength >= 3 ? strengthInfo.bg : "bg-transparent"}`} />
              <div className={`h-full transition-all ${strength >= 4 ? strengthInfo.bg : "bg-transparent"}`} />
            </div>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888888] mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#555555] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type={showConfirm ? "text" : "password"}
              required
              placeholder="••••••••••••"
              value={formData.confirmPassword}
              onChange={(e) => updateFormData({ confirmPassword: e.target.value })}
              className="w-full bg-[#0A0A0A] border border-[#222222] focus:border-[#CCFF00] rounded-xl pl-11 pr-12 py-3.5 text-xs text-white placeholder-[#555555] outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555555] hover:text-[#CCFF00] transition-colors"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Match Indicator */}
          {passwordsMatch && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-[#CCFF00]">
              <Check className="w-3.5 h-3.5" />
              <span>Passwords match</span>
            </div>
          )}
          {passwordsMismatch && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-[#FF4D00]">
              <X className="w-3.5 h-3.5" />
              <span>Passwords do not match</span>
            </div>
          )}
        </div>

        {/* Security guidelines checklist */}
        <div className="p-4 rounded-2xl bg-[#0D0D0D] border border-[#1F1F1F] text-[11px] text-[#888888] space-y-1.5">
          <div className="flex items-center gap-2">
            <span className={formData.password.length >= 8 ? "text-[#CCFF00]" : "text-[#555555]"}>•</span>
            <span>At least 8 characters long</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={/[0-9]/.test(formData.password) ? "text-[#CCFF00]" : "text-[#555555]"}>•</span>
            <span>Includes at least one number</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={/[^A-Za-z0-9]/.test(formData.password) ? "text-[#CCFF00]" : "text-[#555555]"}>•</span>
            <span>Includes at least one special character</span>
          </div>
        </div>
      </div>
    </div>
  );
}
