"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, UserCheck } from "lucide-react";
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
      <div className="bg-white rounded-[26px] p-7 md:p-10 text-center shadow-[0_20px_50px_-15px_rgba(59,130,246,0.08),0_0_1px_1px_rgba(226,232,240,0.8)] border border-slate-100">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#3B82F6] flex items-center justify-center mx-auto mb-4 border border-blue-200/60 shadow-sm">
          <UserCheck className="w-7 h-7" />
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#3B82F6] block mb-1">
          Registration Complete
        </span>
        <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl sm:text-3xl font-extrabold text-[#0F172A] mb-2 leading-tight">
          Welcome to The Champions Club, {formData.fullName.split(" ")[0]}!
        </h2>
        <p className="text-xs text-[#64748B] max-w-md mx-auto leading-relaxed mb-5">
          {isMinor
            ? "Your Junior Prodigy application is queued under `pending_consent`. A verification link has been dispatched to your guardian's email for DPDP Act validation."
            : `Your membership application has been logged for ${formData.planId.toUpperCase()} tier. You can now use your email to access trial bookings and live court availability.`}
        </p>

        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200/80 max-w-sm mx-auto text-left text-xs mb-5 space-y-2">
          <div className="flex justify-between text-[#64748B]">
            <span>Account Email:</span>
            <span className="text-[#0F172A] font-mono font-medium">{formData.email}</span>
          </div>
          <div className="flex justify-between text-[#64748B]">
            <span>Assigned Plan:</span>
            <span className="text-[#3B82F6] uppercase font-bold">{formData.planId}</span>
          </div>
          <div className="flex justify-between text-[#64748B]">
            <span>Status:</span>
            <span className="text-[#0F172A] font-medium">{isMinor ? "Pending Guardian Consent" : "Active Prospect"}</span>
          </div>
        </div>

        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#DDE7FF] to-[#E7E2FF] hover:from-[#D2DEFF] hover:to-[#DDD7FF] text-[#1E293B] font-bold text-xs uppercase tracking-wider px-7 py-3 rounded-xl border border-blue-200/60 shadow-sm transition-all"
        >
          <span>Open Athlete Dashboard & Book</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[26px] p-5 sm:p-7 md:p-8 shadow-[0_20px_50px_-15px_rgba(59,130,246,0.08),0_0_1px_1px_rgba(226,232,240,0.8)] border border-slate-100 flex flex-col justify-between">
      {/* Wizard Step Indicator Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] uppercase tracking-widest text-[#64748B] font-bold">
            Step {currentStepIndex + 1} of {steps.length}
          </div>
          <div className="text-xs font-bold text-[#3B82F6] uppercase tracking-wider">
            {steps[currentStepIndex].label}
          </div>
        </div>

        {/* Breadcrumb line */}
        <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div key={step.id} className="flex flex-col gap-1">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isCompleted
                      ? "bg-[#3B82F6]"
                      : isCurrent
                      ? "bg-[#93C5FD]"
                      : "bg-[#E2E8F0]"
                  }`}
                />
                <span
                  className={`text-[9.5px] uppercase tracking-wider font-semibold truncate ${
                    isCurrent ? "text-[#0F172A]" : isCompleted ? "text-[#3B82F6]" : "text-[#94A3B8]"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 flex flex-col justify-between min-h-0">
        <AnimatePresence mode="wait">
          {currentStepIndex === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
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
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
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
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
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
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
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
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
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
        <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center justify-between gap-4">
          {currentStepIndex > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#64748B] hover:text-[#0F172A] px-4 py-2 rounded-xl hover:bg-slate-100 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#DDE7FF] to-[#E7E2FF] hover:from-[#D2DEFF] hover:to-[#DDD7FF] text-[#1E293B] font-bold text-xs uppercase tracking-wider px-7 py-2.5 rounded-xl border border-blue-200/60 shadow-sm active:scale-95 transition-all"
          >
            <span>
              {currentStepIndex === steps.length - 1 ? "Submit Registration" : "Next Step"}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
