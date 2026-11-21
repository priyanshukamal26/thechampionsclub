import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────────────────
   Shared shell for the authentication screens (login, register, reset,
   pending consent). Paper surface, club masthead, ledger footer.
   ──────────────────────────────────────────────────────────────────────────── */

export function BrandMark({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-3", className)}>
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-ink bg-ink font-mono text-[11px] font-bold tracking-widest text-chalk transition group-hover:border-clay group-hover:bg-clay">
        TC
      </span>
      <span className="flex flex-col leading-none">
        <span className="u-display text-[15px] text-ink">The Champions</span>
        <span className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.3em] text-muted">
          Club · New Delhi
        </span>
      </span>
    </Link>
  );
}

export function HomeLink({ label = "Club home" }: { label?: string }) {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-chalk/60 px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted transition hover:border-ink hover:text-ink"
    >
      <ArrowLeft className="h-3 w-3" aria-hidden />
      {label}
    </Link>
  );
}

export function AuthTopBar({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <header className={cn("relative z-10 shrink-0 border-b border-line/80 bg-paper/85 backdrop-blur", className)}>
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-3 px-5 py-3 sm:px-6 lg:px-8">
        <BrandMark />
        <div className="flex items-center gap-2">{children ?? <HomeLink />}</div>
      </div>
    </header>
  );
}

export function AuthFooter({ note, className }: { note?: string; className?: string }) {
  return (
    <footer className={cn("relative z-10 mt-auto border-t border-line/80", className)}>
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-1 px-5 py-4 font-mono text-[9px] uppercase tracking-[0.18em] text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <span>© {new Date().getFullYear()} The Champions Club · New Delhi</span>
        <span>{note ?? "DPDP Act 2023 compliant · encrypted sign-in"}</span>
      </div>
    </footer>
  );
}

export function AuthPage({
  children,
  className,
  grid = true,
}: {
  children: ReactNode;
  className?: string;
  grid?: boolean;
}) {
  return (
    <div className={cn("relative flex min-h-screen flex-col bg-paper", className)}>
      {grid && (
        <div aria-hidden className="u-court-grid pointer-events-none absolute inset-0 opacity-50" />
      )}
      {children}
    </div>
  );
}

export function AuthCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("card p-5 sm:p-6 lg:p-7", className)}>{children}</div>;
}

export function AuthEyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("u-eyebrow text-clay", className)}>{children}</div>;
}
