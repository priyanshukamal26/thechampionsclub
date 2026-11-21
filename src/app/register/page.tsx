import Link from "next/link";
import { ArrowUpRight, CalendarDays, ReceiptText, ShieldCheck, Users2 } from "lucide-react";
import RegistrationWizard from "@/components/register/RegistrationWizard";
import { AuthFooter, AuthPage, AuthTopBar, HomeLink } from "@/components/auth/AuthShell";
import { Panel } from "@/components/ui/kit";

type PlanParam = "gold" | "silver" | "junior";

const BENEFITS = [
  {
    icon: CalendarDays,
    title: "Court reservations",
    copy: "Hold tennis, padel, badminton and cricket nets on the club calendar.",
  },
  {
    icon: ReceiptText,
    title: "One clubhouse ledger",
    copy: "Pro shop purchases and bar tabs on a single monthly statement.",
  },
  {
    icon: Users2,
    title: "Friday social play",
    copy: "Members-only social sessions, ladders and tournament draws.",
  },
  {
    icon: ShieldCheck,
    title: "DPDP-safe by default",
    copy: "Consent, guardian verification and data rights handled at the desk.",
  },
];

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawPlan = Array.isArray(params.plan) ? params.plan[0] : params.plan;
  const initialPlan: PlanParam | undefined =
    rawPlan === "gold" || rawPlan === "silver" || rawPlan === "junior" ? rawPlan : undefined;

  return (
    <AuthPage>
      <AuthTopBar>
        <HomeLink />
        <Link href="/login" className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted transition hover:text-clay">
          Sign in
        </Link>
      </AuthTopBar>

      <main className="relative z-10 mx-auto w-full max-w-[1200px] flex-1 px-5 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-8">
            <div className="mb-5 border-b border-line pb-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="u-eyebrow text-clay">Membership · application</span>
                <span className="h-px w-8 bg-line" />
                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted">
                  4–5 steps · about 3 minutes
                </span>
              </div>
              <h1 className="u-display mt-3 text-[clamp(1.8rem,3.6vw,2.7rem)] text-ink">
                Join the club
              </h1>
              <p className="mt-2 max-w-xl text-[12.5px] leading-relaxed text-muted">
                Tell us who is playing. We will set up your membership tier, court access and
                clubhouse ledger — guardian consent is added automatically for junior athletes.
              </p>
            </div>

            <RegistrationWizard initialPlan={initialPlan} />
          </div>

          <aside className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-6 space-y-4">
              <Panel tone="ink">
                <div className="u-eyebrow text-clay-soft">What membership opens</div>
                <ul className="mt-4 space-y-4">
                  {BENEFITS.map((benefit) => {
                    const Icon = benefit.icon;
                    return (
                      <li key={benefit.title} className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line-inverse text-clay-soft">
                          <Icon className="h-3.5 w-3.5" aria-hidden />
                        </span>
                        <div className="min-w-0">
                          <div className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-chalk">
                            {benefit.title}
                          </div>
                          <p className="mt-1 text-[11.5px] leading-snug text-chalk/60">
                            {benefit.copy}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div className="u-rule-inverse mt-5 pt-4">
                  <div className="font-mono text-[8.5px] uppercase tracking-[0.2em] text-chalk/40">
                    Front desk · 06:00–23:00 IST
                  </div>
                  <a
                    href="tel:+919811054321"
                    className="mt-1 block font-mono text-[11px] tracking-wide text-chalk transition hover:text-clay-soft"
                  >
                    +91 98110 54321
                  </a>
                  <a
                    href="mailto:play@champions.in"
                    className="mt-0.5 block font-mono text-[10px] tracking-wide text-chalk/60 transition hover:text-clay-soft"
                  >
                    play@champions.in
                  </a>
                </div>
              </Panel>

              <div className="rounded-2xl border border-line bg-paper-deep p-4">
                <div className="u-eyebrow text-muted">Already a member</div>
                <p className="mt-1.5 text-[11.5px] leading-snug text-muted">
                  Sign in instead of applying again — your plan and court credits are already on the
                  ledger.
                </p>
                <Link href="/login" className="btn btn-outline btn-sm mt-3">
                  Member sign-in
                  <ArrowUpRight className="h-3 w-3" aria-hidden />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <AuthFooter note="New applications · DPDP Act 2023 · New Delhi" />
    </AuthPage>
  );
}
