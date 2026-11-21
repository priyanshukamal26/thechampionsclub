import { SectionIntro } from "@/components/ui/kit";

const QUOTES = [
  {
    quote:
      "I used to spend half my evening chasing a court on WhatsApp. Now I book, pay and check in before I have even parked. The Friday social is the best thing that has happened to my week.",
    name: "Vikramaditya Singhania",
    role: "Gold member · Tennis & padel",
    since: "Member since 2021",
  },
  {
    quote:
      "The indoor halls are so still that the shuttle finally goes where I aim it. And the app remembers my level, my regular partners and my bar tab.",
    name: "Ananya Deshmukh",
    role: "Silver member · Badminton",
    since: "Member since 2023",
  },
  {
    quote:
      "As a parent, the guardian consent flow and linked junior account mean I can see exactly what Aarav books and spends. He trains three evenings a week now.",
    name: "Rajesh Malhotra",
    role: "Guardian · Junior member",
    since: "Family member since 2022",
  },
];

function QuoteMark() {
  return (
    <svg viewBox="0 0 48 32" className="h-7 w-10 text-clay" fill="currentColor" aria-hidden>
      <path d="M0 32V19.2C0 8.6 5.7 2.2 17.1 0l2.1 6.4C12 8.3 8.6 12 8.1 17.6H16V32H0Zm30 0V19.2C30 8.6 35.7 2.2 47.1 0l.9 6.4C36 8.3 32.6 12 32.1 17.6H40V32H30Z" />
    </svg>
  );
}

export default function Testimonials() {
  return (
    <section className="border-b border-line bg-paper py-16 md:py-24">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionIntro
            index="07"
            kicker="From the guest book"
            title={<>Loved by the people who <span className="u-serif italic text-clay">show up.</span></>}
          />
          <div className="flex items-center gap-4 border-l border-line pl-5">
            <div className="u-value text-3xl text-ink">4.9</div>
            <div className="font-mono text-[8.5px] uppercase leading-relaxed tracking-[0.14em] text-muted">
              312 member reviews<br />94% would recommend
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {QUOTES.map((item, i) => (
            <figure
              key={item.name}
              className={`flex flex-col justify-between rounded-2xl border bg-chalk p-6 sm:p-7 ${i === 0 ? "border-ink shadow-[5px_5px_0_0_var(--color-ink)] md:-mt-3" : "border-line"}`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <QuoteMark />
                  <span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-muted">{item.since}</span>
                </div>
                <blockquote className="u-serif mt-5 text-[19px] leading-[1.35] text-ink/90">&ldquo;{item.quote}&rdquo;</blockquote>
              </div>
              <figcaption className="mt-7 border-t border-line pt-4">
                <div className="text-[12.5px] font-semibold text-ink">{item.name}</div>
                <div className="mt-0.5 font-mono text-[8.5px] uppercase tracking-[0.14em] text-muted">{item.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
