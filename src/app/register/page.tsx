import Link from "next/link";
import { Trophy } from "lucide-react";
import RegistrationWizard from "@/components/register/RegistrationWizard";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#FAFAFA] flex flex-col justify-between relative overflow-hidden py-8">
      {/* Background Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#CCFF00]/10 rounded-full blur-[180px] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 max-w-4xl mx-auto px-6 w-full flex items-center justify-between mb-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#CCFF00] flex items-center justify-center text-[#0A0A0A] font-black text-lg shadow-[0_0_20px_rgba(204,255,0,0.4)] group-hover:scale-105 transition-transform">
            <Trophy className="w-4 h-4 fill-current" />
          </div>
          <span className="font-extrabold tracking-tight text-white text-base md:text-lg uppercase font-[family-name:var(--font-space-grotesk)]">
            The Champions <span className="text-[#CCFF00]">Club</span>
          </span>
        </Link>

        <Link
          href="/"
          className="text-xs uppercase tracking-wider font-semibold text-[#888888] hover:text-[#CCFF00] transition-colors"
        >
          ← Return to Club Home
        </Link>
      </header>

      {/* Main Wizard Card */}
      <main className="relative z-10 max-w-3xl mx-auto px-6 w-full flex-grow flex flex-col justify-center">
        <RegistrationWizard />
      </main>

      {/* Footer Note */}
      <footer className="relative z-10 text-center py-6 text-xs text-[#555555]">
        © {new Date().getFullYear()} The Champions Club. All rights reserved. Encrypted via DPDP Data Protection.
      </footer>
    </div>
  );
}
