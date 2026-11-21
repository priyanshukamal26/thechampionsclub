"use client";

import { useState } from "react";
import { User, Mail, Phone, Lock, Bell, Shield, Save, Check } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function SettingsPage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#CCFF00] block mb-1">
          Account Settings
        </span>
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-extrabold uppercase text-white">
          Your Profile & Preferences
        </h1>
      </div>

      {/* Profile Section */}
      <div className="bg-[#141414] border border-[#1F1F1F] rounded-3xl p-6 shadow-xl space-y-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#AAAAAA] mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
              <input type="text" defaultValue={user.fullName} className="w-full bg-[#0D0D0D] border border-[#222222] focus:border-[#CCFF00] rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#AAAAAA] mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
              <input type="email" defaultValue={user.email} className="w-full bg-[#0D0D0D] border border-[#222222] focus:border-[#CCFF00] rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#AAAAAA] mb-1.5">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
              <input type="tel" defaultValue="+91 98110 00000" className="w-full bg-[#0D0D0D] border border-[#222222] focus:border-[#CCFF00] rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#AAAAAA] mb-1.5">Role</label>
            <input type="text" value={user.role.replace("_", " ").toUpperCase()} readOnly className="w-full bg-[#0D0D0D] border border-[#1A1A1A] rounded-xl px-4 py-3 text-sm text-[#888888] outline-none cursor-not-allowed" />
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-[#141414] border border-[#1F1F1F] rounded-3xl p-6 shadow-xl space-y-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#CCFF00]" /> Security
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#AAAAAA] mb-1.5">New Password</label>
            <input type="password" placeholder="••••••••" className="w-full bg-[#0D0D0D] border border-[#222222] focus:border-[#CCFF00] rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#AAAAAA] mb-1.5">Confirm Password</label>
            <input type="password" placeholder="••••••••" className="w-full bg-[#0D0D0D] border border-[#222222] focus:border-[#CCFF00] rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors" />
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-[#141414] border border-[#1F1F1F] rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#CCFF00]" /> Notifications
        </h3>
        {["Court booking confirmations via SMS", "30-min pre-match court reminder", "Pro Shop order ready notifications", "Post-match cafeteria tab receipt", "Annual membership renewal alerts"].map((label, i) => (
          <label key={i} className="flex items-center justify-between py-2 group cursor-pointer">
            <span className="text-xs text-[#AAAAAA] group-hover:text-white transition-colors">{label}</span>
            <input type="checkbox" defaultChecked className="accent-[#CCFF00] w-4 h-4" />
          </label>
        ))}
      </div>

      {/* DPDP Notice */}
      <div className="p-4 rounded-2xl bg-[#0D0D0D] border border-[#1F1F1F] text-xs text-[#666666] flex items-start gap-3">
        <Shield className="w-4 h-4 text-[#CCFF00] shrink-0 mt-0.5" />
        <span>Your data is governed under the Digital Personal Data Protection (DPDP) Act, 2023. You have the right to request access, correction, or deletion of your biometric/contact data at any time via privacy@championsclub.in.</span>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full inline-flex items-center justify-center gap-2 bg-[#CCFF00] text-[#0A0A0A] font-extrabold text-xs uppercase tracking-wider py-4 rounded-xl hover:bg-[#a8cc00] transition-all shadow-[0_0_20px_rgba(204,255,0,0.3)]"
      >
        {saved ? <><Check className="w-4 h-4" /> Saved Successfully!</> : <><Save className="w-4 h-4" /> Save Changes</>}
      </button>
    </div>
  );
}
