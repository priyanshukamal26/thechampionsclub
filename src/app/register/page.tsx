import Link from "next/link";
import { Trophy } from "lucide-react";
import RegistrationWizard from "@/components/register/RegistrationWizard";

export default function RegisterPage() {
  return (
    <div className="h-screen max-h-screen bg-gradient-to-br from-[#EEF4FF] via-[#F5F8FF] to-[#E8F0FE] text-[#0F172A] flex flex-col justify-between relative overflow-hidden py-3 sm:py-4 px-4 sm:px-6">
      {/* Soft Ambient Ethereal Glows */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-[#DDE9FD] rounded-full blur-[140px] pointer-events-none opacity-60" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-[#E3DEFD] rounded-full blur-[140px] pointer-events-none opacity-60" />

      {/* Top Header */}
      <header className="relative z-10 max-w-4xl mx-auto w-full flex items-center justify-between shrink-0 mb-1 sm:mb-2">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#3B82F6] to-[#6366F1] flex items-center justify-center text-white font-black text-base shadow-[0_8px_20px_-4px_rgba(59,130,246,0.3)] group-hover:scale-105 transition-transform">
            <Trophy className="w-4 h-4 fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-tight text-[#0F172A] text-sm sm:text-base uppercase font-[family-name:var(--font-space-grotesk)] leading-none">
              The Champions <span className="text-[#3B82F6]">Club</span>
            </span>
            <span className="text-[9px] tracking-[0.2em] text-[#64748B] uppercase font-semibold">
              Athletic Excellence
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="text-[11px] uppercase tracking-wider font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors bg-white/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/60 shadow-sm"
        >
          ← Return to Club Home
        </Link>
      </header>

      {/* Main Wizard Card */}
      <main className="relative z-10 max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center min-h-0 py-1">
        <RegistrationWizard />
      </main>

      {/* Footer Note */}
      <footer className="relative z-10 text-center py-1 text-[11px] text-[#64748B] shrink-0">
        © {new Date().getFullYear()} The Champions Club. All rights reserved. Encrypted via DPDP Data Protection.
      </footer>
    </div>
  );
}
