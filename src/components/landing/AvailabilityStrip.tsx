"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { availabilityFor, FACILITIES, TIME_SLOTS, type SlotState } from "@/lib/bookings";
import { formatDate, todayISO } from "@/lib/store";
import { SectionIntro } from "@/components/ui/kit";
import { cn } from "@/lib/utils";

const DAY_OFFSETS = [0, 1, 2, 3, 4];
const SHOWCASE_FACILITIES = ["tc1", "pc1", "bc1", "cn1", "tc3", "pc2"];
const SHOWCASE_SLOTS = ["06:00", "07:00", "08:00", "12:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];

function offsetISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

export default function AvailabilityStrip() {
  const { user } = useAuth();
  const [dayOffset, setDayOffset] = useState(0);
  const [grid, setGrid] = useState<Record<string, Record<string, SlotState>> | null>(null);

  const date = offsetISO(dayOffset);

  useEffect(() => {
    setGrid(availabilityFor(date));
  }, [date]);

  const facilities = useMemo(
    () => SHOWCASE_FACILITIES.map((id) => FACILITIES.find((f) => f.id === id)).filter(Boolean),
    []
  );

  const freeTonight = useMemo(() => {
    if (!grid) return 0;
    const evening = ["18:00", "19:00", "20:00", "21:00"];
    let count = 0;
    facilities.forEach((facility) => {
      if (!facility) return;
      evening.forEach((slot) => {
        if (grid[facility.id]?.[slot] === "free") count += 1;
      });
    });
    return count;
  }, [grid, facilities]);

  const bookHref = user ? "/dashboard/courts" : "/login";

  const cell = (state: SlotState | undefined) => {
    if (!state) return <span className="font-mono text-[8.5px] uppercase tracking-wider text-muted/50">—</span>;
    if (state === "free") {
      return (
        <span className="inline-flex items-center gap-1.5 font-mono text-[8.5px] uppercase tracking-[0.1em] text-court">
          <span className="h-1.5 w-1.5 rounded-full bg-court" /> Open
        </span>
      );
    }
    if (state === "booked") {
      return (
        <span className="inline-flex items-center gap-1.5 font-mono text-[8.5px] uppercase tracking-[0.1em] text-muted">
          <Lock className="h-2.5 w-2.5" /> Taken
        </span>
      );
    }
    return <span className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-muted/35">Past</span>;
  };

  return (
    <section id="availability" className="border-b border-line bg-paper py-16 md:py-24">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionIntro
            index="04"
            kicker="Live availability"
            title={<>The <span className="u-serif italic text-clay">draw board.</span></>}
            description="What is actually free this week. Sessions run sixty minutes and open every half hour — the board below shows the headline slots for six of the eighteen surfaces."
          />
          <div className="flex items-center gap-4 rounded-xl border border-ink bg-chalk px-4 py-3">
            <div>
              <div className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-muted">Free this evening</div>
              <div className="u-value mt-0.5 text-2xl text-ink">{grid ? freeTonight : "—"}<span className="ml-1 font-mono text-[9px] uppercase text-muted">slots</span></div>
            </div>
            <span className="h-10 w-px bg-line" />
            <div className="font-mono text-[8.5px] uppercase leading-relaxed tracking-[0.14em] text-muted">
              18 surfaces<br />06:00 — 23:00
            </div>
          </div>
        </div>

        <div className="mt-9 flex flex-wrap items-center gap-1.5">
          {DAY_OFFSETS.map((offset) => {
            const iso = offsetISO(offset);
            const active = offset === dayOffset;
            return (
              <button
                key={offset}
                onClick={() => setDayOffset(offset)}
                className={cn(
                  "rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition",
                  active ? "border-ink bg-ink text-chalk" : "border-line bg-transparent text-muted hover:border-ink hover:text-ink"
                )}
              >
                {offset === 0 ? "Today" : formatDate(iso, { weekday: "short", day: "numeric", month: "short" })}
              </button>
            );
          })}
          <span suppressHydrationWarning className="ml-auto hidden items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted sm:flex">
            <CalendarDays className="h-3 w-3" /> {formatDate(isoToday(), { weekday: "long", day: "numeric", month: "long" })}
          </span>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-ink bg-chalk">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-ink bg-paper-soft">
                  <th className="sticky left-0 z-10 min-w-[190px] border-r border-line bg-paper-soft px-4 py-3 text-left font-mono text-[8.5px] uppercase tracking-[0.16em] text-muted">
                    Surface
                  </th>
                  {SHOWCASE_SLOTS.map((slot) => (
                    <th key={slot} className="px-2 py-3 text-center font-mono text-[9px] font-medium tracking-[0.06em] text-ink/70">
                      {slot}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {facilities.map((facility) => {
                  if (!facility) return null;
                  return (
                    <tr key={facility.id} className="border-b border-line-soft last:border-b-0">
                      <td className="sticky left-0 z-10 border-r border-line bg-chalk px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-[8.5px] text-clay">{facility.code}</span>
                          <div>
                            <div className="text-[12px] font-semibold text-ink">{facility.name}</div>
                            <div className="font-mono text-[8px] uppercase tracking-[0.1em] text-muted">{facility.sport} · {facility.surface}</div>
                          </div>
                        </div>
                      </td>
                      {SHOWCASE_SLOTS.map((slot) => (
                        <td key={slot} className="border-l border-line-soft px-2 py-3 text-center">
                          {cell(grid?.[facility.id]?.[slot])}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 border-t border-line bg-paper-soft px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-4 font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted">
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-court" /> Open</span>
              <span className="flex items-center gap-1.5"><Lock className="h-2.5 w-2.5" /> Reserved</span>
              <span className="flex items-center gap-1.5 text-muted/50">Past</span>
            </div>
            <Link href={bookHref} className="inline-flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-clay u-link">
              {user ? "Open the booking board" : "Sign in to book a slot"} <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
          <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> 60-min sessions, :00 and :30 starts</span>
          <span>Max 2 sessions per member per day</span>
          <span>Free cancellation up to 12 hours before</span>
        </div>
      </div>
    </section>
  );
}

function isoToday() {
  return todayISO();
}
