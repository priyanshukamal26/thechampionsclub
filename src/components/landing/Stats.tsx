import { CourtLines } from "@/components/ui/kit";

const SCOREBOARD = [
  { value: "18", label: "Courts & nets", note: "Tennis 6 · Padel 4 · Badminton 6 · Cricket 2" },
  { value: "04", label: "Sports under one roof", note: "Every surface built to federation spec" },
  { value: "02", label: "Sessions per member, per day", note: "A fair-play cap that keeps courts moving" },
  { value: "12h", label: "Free cancellation window", note: "Cancel before 12 hours, pay nothing" },
];

export default function Stats() {
  return (
    <section className="relative overflow-hidden border-b border-ink bg-ink text-chalk">
      <div className="pointer-events-none absolute inset-0 opacity-[0.55] u-court-grid-inv" aria-hidden />
      <CourtLines className="pointer-events-none absolute -bottom-16 right-0 hidden h-[340px] w-[620px] text-chalk" opacity={0.12} />
      <div className="relative mx-auto max-w-[1320px] px-5 py-16 sm:px-8 md:py-20">
        <div className="flex items-end justify-between gap-8 border-b border-line-inverse pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="u-mono border border-line-inverse px-1.5 py-0.5 text-[10px] tracking-[0.2em] text-chalk/60">02</span>
              <span className="u-eyebrow text-clay-soft">The club standard</span>
            </div>
            <h2 className="u-display mt-4 max-w-2xl text-[clamp(1.8rem,3.4vw,3rem)] text-chalk">
              A club that finally <span className="u-serif italic text-clay-soft">runs itself.</span>
            </h2>
          </div>
          <p className="hidden max-w-xs text-[12.5px] leading-relaxed text-chalk/50 md:block">
            No WhatsApp threads. No Excel sheets. No paper bar receipts. Every court, order and rupee
            lands in one place — visible to the people who need it.
          </p>
        </div>

        <div className="grid grid-cols-2 divide-chalk/15 md:grid-cols-4 md:divide-x">
          {SCOREBOARD.map((item, i) => (
            <div key={item.label} className={"py-8 md:px-6 " + (i === 0 ? "md:pl-0" : "")}>
              <div className="flex items-baseline justify-between">
                <span className="u-value text-[clamp(2.6rem,5vw,4.4rem)] leading-none text-chalk">{item.value}</span>
                <span className="u-mono text-[9px] text-chalk/25">0{i + 1}</span>
              </div>
              <div className="mt-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-chalk">{item.label}</div>
              <div className="mt-1.5 max-w-[220px] text-[11px] leading-snug text-chalk/45">{item.note}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 border-t border-line-inverse pt-5 font-mono text-[9px] uppercase tracking-[0.18em] text-chalk/40">
          <span>Members pay less than walk-ins</span>
          <span>Pricing follows the plan</span>
          <span>Stock never goes negative</span>
          <span>Totals always reconcile</span>
        </div>
      </div>
    </section>
  );
}
