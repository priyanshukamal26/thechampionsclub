"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, UserCheck } from "lucide-react";
import PersonalInfo from "./steps/PersonalInfo";
import CreatePassword from "./steps/CreatePassword";
import ChoosePlan from "./steps/ChoosePlan";
import GuardianConsent from "./steps/GuardianConsent";
import Confirmation from "./steps/Confirmation";
import { useAuth } from "@/lib/auth-context";
import { registerMemberAtDesk } from "@/lib/membership";
import { recordAuditLog } from "@/lib/audit";
import { MEMBERSHIP_PLANS } from "@/lib/membership";
import { inr } from "@/lib/store";
import { cn } from "@/lib/utils";

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

type Step = { id: string; label: string };

export default function RegistrationWizard({ initialPlan }: { initialPlan?: "gold" | "silver" | "junior" }) {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    password: "",
    confirmPassword: "",
    planId: initialPlan ?? "gold",
    guardianName: "",
    guardianEmail: "",
    guardianPhone: "",
    guardianConsentGiven: false,
    termsAccepted: false,
  });

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [stepError, setStepError] = useState("");

  // Helper to determine if user is a minor (<18)
  const isMinor = Boolean(
    formData.dob && new Date().getFullYear() - new Date(formData.dob).getFullYear() < 18
  );

  // Steps definition based on minor status
  const steps: Step[] = isMinor
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

  const validateStep = (): string => {
    if (currentStepIndex === 0) {
      if (formData.fullName.trim().length < 2) return "Enter the athlete's full name.";
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email.trim())) return "Enter a valid email address.";
      if (formData.phone.replace(/\D/g, "").length < 10) return "Enter a 10-digit mobile number.";
      if (!formData.dob) return "Date of birth is required.";
      const age = new Date().getFullYear() - new Date(formData.dob).getFullYear();
      if (age < 10 || age > 100) return "Check the date of birth.";
    }
    if (currentStepIndex === 1) {
      if (formData.password.length < 8) return "Use a password of at least 8 characters.";
      if (formData.password !== formData.confirmPassword) return "The two passwords do not match.";
    }
    if (isMinor && currentStepIndex === 3) {
      if (formData.guardianName.trim().length < 2) return "The guardian's name is required.";
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.guardianEmail.trim()))
        return "Enter the guardian's email address.";
      if (formData.guardianPhone.replace(/\D/g, "").length < 10)
        return "Enter the guardian's mobile number.";
      if (!formData.guardianConsentGiven)
        return "Guardian consent is required before a Junior account can be created.";
    }
    if (currentStepIndex === steps.length - 1 && !formData.termsAccepted) {
      return "Please accept the club rules to continue.";
    }
    return "";
  };

  const handleNext = () => {
    const error = validateStep();
    if (error) {
      setStepError(error);
      return;
    }
    setStepError("");

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      return;
    }

    const { member } = registerMemberAtDesk({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      dob: formData.dob,
      planId: formData.planId,
      guardianName: isMinor ? formData.guardianName : undefined,
      guardianEmail: isMinor ? formData.guardianEmail : undefined,
      guardianPhone: isMinor ? formData.guardianPhone : undefined,
      guardianVerifiedInPerson: false,
    });

    signUp({
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      planId: formData.planId,
      isMinor,
      memberId: member.id,
    });

    recordAuditLog({
      action: isMinor ? "register_minor_pending_consent" : "register_member",
      entity: "members",
      entityId: member.id,
      details: { plan: formData.planId, email: formData.email, isMinor, memberCode: member.memberCode },
    });
    setSubmitted(true);
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const jumpToStep = (index: number) => {
    setCurrentStepIndex(index);
  };

  /* ── Submitted: application logged ─────────────────────────────────────── */
  if (submitted) {
    const plan = MEMBERSHIP_PLANS[formData.planId];
    const firstName = formData.fullName.trim().split(" ")[0] || "athlete";
    return (
      <div className="card overflow-hidden">
        <div className="panel-ink relative overflow-hidden px-5 py-6 sm:px-7">
          <div aria-hidden className="u-court-grid-inv pointer-events-none absolute inset-0 opacity-40" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="u-eyebrow text-clay-soft">
                {isMinor ? "Application logged · pending guardian consent" : "Application logged · active prospect"}
              </div>
              <h2 className="u-display mt-2 text-[clamp(1.6rem,3vw,2.2rem)] text-chalk">
                Welcome to the club,{" "}
                <span className="u-serif italic normal-case tracking-normal text-clay-soft">
                  {firstName}
                </span>
              </h2>
            </div>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line-inverse text-court-soft sm:h-14 sm:w-14">
              <UserCheck className="h-6 w-6" aria-hidden />
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <p className="max-w-xl text-[12.5px] leading-relaxed text-muted">
            {isMinor
              ? "Your Junior Prodigy application is queued as pending consent. A verification link has been dispatched to your guardian's email for DPDP Act validation — court bookings and transactions unlock once a guardian verifies."
              : `Your membership application has been logged for the ${plan?.name ?? formData.planId} tier. Use your email to access trial bookings and live court availability.`}
          </p>

          <dl className="mt-4 divide-y divide-line rounded-xl border border-line bg-paper-soft px-4">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3">
              <dt className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">Account email</dt>
              <dd className="u-mono break-all text-[11.5px] text-ink">{formData.email || "—"}</dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3">
              <dt className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">Assigned plan</dt>
              <dd className="text-right">
                <span className="text-[11.5px] font-semibold text-ink">{plan?.name ?? formData.planId}</span>
                <span className="ml-2 u-value text-[11.5px] text-muted">
                  {plan ? `${inr(plan.priceMonthly)}/mo` : "—"}
                </span>
              </dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3">
              <dt className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">Status</dt>
              <dd className="text-[11.5px] font-medium text-ink">
                {isMinor ? "Pending guardian consent" : "Active prospect"}
              </dd>
            </div>
          </dl>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Link href="/dashboard" className="btn btn-clay">
              Open athlete dashboard
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
            {isMinor && (
              <Link href="/pending-consent" className="btn btn-outline">
                Guardian consent status
              </Link>
            )}
          </div>

          <p className="mt-4 font-mono text-[8.5px] uppercase leading-relaxed tracking-[0.16em] text-muted/80">
            Session saved to champions_user · application reference {formData.email || "pending"}
          </p>
        </div>
      </div>
    );
  }

  /* ── Wizard ────────────────────────────────────────────────────────────── */
  return (
    <div className="card flex flex-col p-5 sm:p-6">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="u-eyebrow text-clay">
            Application · step {currentStepIndex + 1} of {steps.length}
          </span>
          <span className="inline-flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink">
            <Check className="h-3 w-3 text-court" aria-hidden />
            {steps[currentStepIndex].label}
          </span>
        </div>

        <ol
          className="mt-3 grid gap-2 sm:gap-3"
          style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
          aria-label="Application steps"
        >
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <li key={step.id} className="min-w-0">
                <div
                  className={cn(
                    "h-[3px] rounded-full transition-all duration-300",
                    isCurrent ? "bg-clay" : isCompleted ? "bg-ink" : "bg-line"
                  )}
                />
                <div className="mt-1.5 flex items-baseline gap-1.5">
                  <span
                    className={cn(
                      "u-mono text-[8.5px] tracking-[0.08em]",
                      isCurrent ? "text-clay" : isCompleted ? "text-ink" : "text-muted/70"
                    )}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "truncate font-mono text-[8.5px] uppercase tracking-[0.1em]",
                      isCurrent ? "text-ink" : isCompleted ? "text-ink/70" : "text-muted/70"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="u-rule my-4" />

      <div className="flex-1">
        <AnimatePresence mode="wait">
          {currentStepIndex === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              <PersonalInfo formData={formData} updateFormData={updateFormData} isMinor={isMinor} />
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
              <CreatePassword formData={formData} updateFormData={updateFormData} />
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
              <ChoosePlan formData={formData} updateFormData={updateFormData} isMinor={isMinor} />
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
              <GuardianConsent formData={formData} updateFormData={updateFormData} />
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
      </div>

      {stepError && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-clay/40 bg-clay/10 px-3 py-2 text-[11px] leading-relaxed text-clay-deep"
        >
          {stepError}
        </p>
      )}

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
        {currentStepIndex > 0 ? (
          <button type="button" onClick={handleBack} className="btn btn-outline btn-sm">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Back
          </button>
        ) : (
          <span className="font-mono text-[8.5px] uppercase leading-relaxed tracking-[0.16em] text-muted">
            Encrypted · DPDP Act 2023
          </span>
        )}

        <button type="button" onClick={handleNext} className="btn btn-clay">
          {currentStepIndex === steps.length - 1 ? "Submit application" : "Continue"}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
