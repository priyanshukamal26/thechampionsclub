"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, ArrowLeft, ShieldCheck, Sparkles, UserCheck } from "lucide-react";
import PersonalInfo from "./steps/PersonalInfo";
import CreatePassword from "./steps/CreatePassword";
import ChoosePlan from "./steps/ChoosePlan";
import GuardianConsent from "./steps/GuardianConsent";
import Confirmation from "./steps/Confirmation";
import { useAuth, ClubUser } from "@/lib/auth-context";
import { recordAuditLog } from "@/lib/audit";

export interface RegisterFormData {
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  password: string;
  confirmPassword: string;
  planId: "gold" | "silver" | "junior";
  guardianName: string;
  guardianEmail: string;
  guardianPhone: string;
  guardianConsentGiven: boolean;
  termsAccepted: boolean;
}

export default function RegistrationWizard() {
  const { setUser } = useAuth();
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    password: "",
    confirmPassword: "",
    planId: "gold",
    guardianName: "",
    guardianEmail: "",
    guardianPhone: "",
    guardianConsentGiven: false,
    termsAccepted: false,
  });

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // Helper to determine if user is a minor (<18)
  const isMinor = Boolean(
    formData.dob &&
      new Date().getFullYear() - new Date(formData.dob).getFullYear() < 18
  );

  // Steps definition based on minor status
  const steps = isMinor
    ? [
        { id: "personal", label: "Details" },
        { id: "password", label: "Security" },
        { id: "plan", label: "Plan" },
        { id: "guardian", label: "Guardian" },
        { id: "confirm", label: "Review" },
      ]
    : [
        { id: "personal", label: "Details" },
        { id: "password", label: "Security" },
        { id: "plan", label: "Plan" },
        { id: "confirm", label: "Review" },
      ];

  const updateFormData = (fields: Partial<RegisterFormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const handleNext = () => {
    // Basic step validation can happen here
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      const newUser: ClubUser = {
        id: crypto.randomUUID(),
        email: formData.email,
        fullName: formData.fullName,
        role: "member",
        status: isMinor ? "pending_consent" : "active_member",
        planId: formData.planId,
        isMinor,
      };
      setUser(newUser);
      localStorage.setItem("champions_user", JSON.stringify(newUser));
      recordAuditLog({
        action: isMinor ? "register_minor_pending_consent" : "register_member",
        entity: "profiles",
        details: { plan: formData.planId, email: formData.email, isMinor },
      });
      setSubmitted(true);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const jumpToStep = (index: number) => {
    setCurrentStepIndex(index);
  };

  if (submitted) {
    return (
      <div className="bg-[#141414] border border-[#1F1F1F] rounded-3xl p-10 md:p-14 text-center shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-[#CCFF00]/15 text-[#CCFF00] flex items-center justify-center mx-auto mb-6 border border-[#CCFF00]/30 shadow-[0_0_30px_rgba(204,255,0,0.3)]">
          <UserCheck className="w-8 h-8" />
        </div>
        <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#CCFF00] block mb-2">
          Registration Complete
        </span>
        <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl sm:text-4xl font-extrabold uppercase text-white mb-4">
          Welcome to The Champions Club, {formData.fullName.split(" ")[0]}!
        </h2>
        <p className="text-sm text-[#888888] max-w-lg mx-auto leading-relaxed mb-8">
          {isMinor
            ? "Your Junior Prodigy application is queued under `pending_consent`. A verification link has been dispatched to your guardian's email for DPDP Act validation."
            : `Your membership application has been logged for ${formData.planId.toUpperCase()} tier. You can now use your email to access trial bookings and live court availability.`}
        </p>

        <div className="p-4 rounded-2xl bg-[#0D0D0D] border border-[#1F1F1F] max-w-md mx-auto text-left text-xs mb-8 space-y-2">
          <div className="flex justify-between text-[#888888]">
            <span>Account Email:</span>
            <span className="text-white font-mono">{formData.email}</span>
          </div>
          <div className="flex justify-between text-[#888888]">
            <span>Assigned Plan:</span>
            <span className="text-[#CCFF00] uppercase font-bold">{formData.planId}</span>
          </div>
          <div className="flex justify-between text-[#888888]">
            <span>Status:</span>
            <span className="text-white">{isMinor ? "Pending Guardian Consent" : "Active Prospect"}</span>
          </div>
        </div>

        <a
          href="/"
          className="inline-flex items-center gap-2 bg-[#CCFF00] text-[#0A0A0A] font-extrabold text-xs uppercase tracking-wider px-8 py-4 rounded-full hover:bg-[#a8cc00] transition-all shadow-[0_0_30px_rgba(204,255,0,0.3)]"
        >
          <span>Explore Facilities & Book Slots</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return (
    <div className="bg-[#141414] border border-[#1F1F1F] rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl relative">
      {/* Wizard Step Indicator Bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] uppercase tracking-widest text-[#888888] font-bold">
            Step {currentStepIndex + 1} of {steps.length}
          </div>
          <div className="text-xs font-bold text-[#CCFF00] uppercase tracking-wider">
            {steps[currentStepIndex].label}
          </div>
        </div>

        {/* Breadcrumb line */}
        <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div key={step.id} className="flex flex-col gap-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isCompleted
                      ? "bg-[#CCFF00]"
                      : isCurrent
                      ? "bg-[#CCFF00]/50"
                      : "bg-[#222222]"
                  }`}
                />
                <span
                  className={`text-[10px] uppercase tracking-wider font-semibold truncate ${
                    isCurrent ? "text-white" : isCompleted ? "text-[#CCFF00]" : "text-[#555555]"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content with Motion Animations */}
      <div className="min-h-[360px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {currentStepIndex === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <PersonalInfo
                formData={formData}
                updateFormData={updateFormData}
                isMinor={isMinor}
              />
            </motion.div>
          )}

          {currentStepIndex === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <CreatePassword
                formData={formData}
                updateFormData={updateFormData}
              />
            </motion.div>
          )}

          {currentStepIndex === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <ChoosePlan
                formData={formData}
                updateFormData={updateFormData}
                isMinor={isMinor}
              />
            </motion.div>
          )}

          {isMinor && currentStepIndex === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <GuardianConsent
                formData={formData}
                updateFormData={updateFormData}
              />
            </motion.div>
          )}

          {((isMinor && currentStepIndex === 4) || (!isMinor && currentStepIndex === 3)) && (
            <motion.div
              key="step-confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <Confirmation
                formData={formData}
                updateFormData={updateFormData}
                jumpToStep={jumpToStep}
                isMinor={isMinor}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wizard Control Buttons */}
        <div className="pt-8 mt-8 border-t border-[#1F1F1F] flex items-center justify-between gap-4">
          {currentStepIndex > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#888888] hover:text-white px-5 py-3 rounded-full hover:bg-[#1F1F1F] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-2 bg-[#CCFF00] text-[#0A0A0A] font-extrabold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full hover:bg-[#a8cc00] transition-all shadow-[0_0_20px_rgba(204,255,0,0.35)] active:scale-95"
          >
            <span>
              {currentStepIndex === steps.length - 1 ? "Submit Registration" : "Next Step"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
