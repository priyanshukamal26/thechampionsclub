"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ElementType } from "react";
import { Check, Minus, Users, X } from "lucide-react";
import { TIME_SLOTS, type Booking, type Facility, type SlotState } from "@/lib/bookings";
import { labelToMinutes, minutesToLabel } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * The 18-facility availability grid.
 * Rows = facilities (code, surface, plan rate), columns = 30-minute slot starts.
 * Free / booked / past / social states carry an icon and a title, never colour alone.
 * Desktop renders the full scoreboard table (horizontal scroll inside a wrapper);
 * mobile renders a per-facility slot list so nothing overflows at 360px.
 */

type CellState = SlotState | "social";

export interface AvailabilityGridProps {
  facilities: Facility[];
  availability: Record<string, Record<string, SlotState>>;
  bookings: Booking[];
  selected: { facilityId: string; slot: string } | null;
  onSelect: (facilityId: string, slot: string) => void;
  priceLabel: (facility: Facility) => string;
  socialBlocks: Record<string, string>;
}

const CELL_ICON: Record<CellState, ElementType> = {
  free: Check,
  booked: X,
  past: Minus,
  social: Users,
};

const CELL_LABEL: Record<CellState, string> = {
  free: "Free",
  booked: "Booked",
  past: "Past",
  social: "Social",
};

const CELL_STYLES: Record<CellState, string> = {
  free: "border-court/40 bg-court/15 text-court hover:border-court hover:bg-court hover:text-chalk",
  booked: "border-transparent bg-ink/[0.10] text-muted/60",
  past: "border-transparent bg-paper-deep/70 text-line",
  social: "border-gold/40 bg-gold/15 text-[#7d5d17]",
};

function slotEnd(slot: string): string {
  return minutesToLabel(labelToMinutes(slot) + 60);
}

export default function AvailabilityGrid({
  facilities,
  availability,
  bookings,
  selected,
  onSelect,
  priceLabel,
  socialBlocks,
}: AvailabilityGridProps) {
  const [mobileFacilityId, setMobileFacilityId] = useState(facilities[0]?.id ?? "");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Open the scoreboard near the current hour so the usable part of the day is visible.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const hour = Math.max(6, Math.min(22, new Date().getHours()));
    const column = (hour - 6) * 2;
    el.scrollLeft = Math.max(0, 220 + column * 28 - 80);
  }, []);

  const hourGroups: { hour: string; count: number }[] = [];
  TIME_SLOTS.forEach((slot) => {
    const hour = slot.slice(0, 2);
    const last = hourGroups[hourGroups.length - 1];
    if (last && last.hour === hour) last.count += 1;
    else hourGroups.push({ hour, count: 1 });
  });

  const bookedInfo = useMemo(() => {
    const map: Record<string, string> = {};
    bookings.forEach((b) => {
      if (b.status !== "confirmed") return;
      const startMin = labelToMinutes(b.start);
      TIME_SLOTS.forEach((slot) => {
        if (Math.abs(labelToMinutes(slot) - startMin) < b.durationMin) {
          map[`${b.facilityId}|${slot}`] = `${b.start}–${minutesToLabel(startMin + b.durationMin)} reserved`;
        }
      });
    });
    return map;
  }, [bookings]);

  const cellState = (facility: Facility, slot: string): CellState => {
    const social = socialBlocks[`${facility.id}|${slot}`];
    if (social) return "social";
    return availability[facility.id]?.[slot] ?? "past";
  };

  const cellTitle = (facility: Facility, slot: string, state: CellState): string => {
    if (state === "social") return `${facility.name} · ${slot} — ${socialBlocks[`${facility.id}|${slot}`]}`;
    if (state === "booked") {
      const info = bookedInfo[`${facility.id}|${slot}`];
      return `${facility.name} · ${slot} — ${info ?? "reserved by another member"}`;
    }
    if (state === "past") return `${facility.name} · ${slot} — session start has passed`;
    return `Book ${facility.name} · ${slot}–${slotEnd(slot)} · 60 min · ${priceLabel(facility)}`;
  };

  const activeMobileFacility = facilities.find((f) => f.id === mobileFacilityId) ?? facilities[0];

  return (
    <div className="space-y-4">
      {/* ── Desktop / tablet scoreboard table ─────────────────────────── */}
      <div ref={scrollRef} className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse">
          <caption className="sr-only">
            Court availability. Rows are facilities, columns are 30-minute session starts between 06:00 and 22:00.
          </caption>
          <thead>
            <tr>
              <th
                rowSpan={2}
                scope="col"
                className="sticky left-0 z-20 min-w-[220px] border-b border-line bg-chalk px-3 py-2 text-left align-bottom"
              >
                <span className="u-eyebrow text-muted">Court · surface · plan rate</span>
              </th>
              {hourGroups.map((group) => (
                <th
                  key={group.hour}
                  scope="colgroup"
                  colSpan={group.count}
                  className="border-b border-line-soft px-1 pt-2 text-center u-mono text-[10px] font-medium text-muted"
                >
                  {group.hour}
                </th>
              ))}
            </tr>
            <tr>
              {TIME_SLOTS.map((slot) => (
                <th
                  key={slot}
                  scope="col"
                  className="w-7 border-b border-line px-0.5 pb-1.5 text-center u-mono text-[8.5px] font-normal text-muted/80"
                >
                  {slot.slice(3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {facilities.map((facility) => (
              <tr key={facility.id} className="group">
                <th
                  scope="row"
                  className="sticky left-0 z-10 border-b border-line-soft bg-chalk px-3 py-2 text-left align-middle font-normal transition-colors group-hover:bg-paper-soft"
                >
                  <div className="flex items-center gap-2">
                    <span className="u-mono text-[9px] tracking-[0.14em] text-muted">{facility.code}</span>
                    <span className="u-display text-[11.5px] leading-none text-ink">{facility.name}</span>
                  </div>
                  <div className="mt-1 truncate text-[10px] text-muted">
                    {facility.sport} · {facility.surface}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="u-value text-[10.5px] text-ink">{priceLabel(facility)}</span>
                    <span className="u-mono text-[8.5px] uppercase tracking-[0.1em] text-muted">
                      {facility.lighting ? "Floodlit" : "Daylight"}
                    </span>
                  </div>
                </th>
                {TIME_SLOTS.map((slot) => {
                  const state = cellState(facility, slot);
                  const Icon = CELL_ICON[state];
                  const isSelected = selected?.facilityId === facility.id && selected?.slot === slot;
                  const title = cellTitle(facility, slot, state);
                  const disabled = state !== "free";
                  return (
                    <td key={slot} className="border-b border-line-soft px-0.5 py-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => onSelect(facility.id, slot)}
                        disabled={disabled}
                        aria-pressed={isSelected}
                        aria-label={title}
                        title={title}
                        className={cn(
                          "mx-auto flex h-6 w-6 items-center justify-center rounded-md border transition-colors",
                          isSelected ? "border-clay bg-clay text-chalk" : CELL_STYLES[state],
                          disabled ? "cursor-not-allowed" : "cursor-pointer"
                        )}
                      >
                        <Icon className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile: pick a facility, then a readable slot list ─────────── */}
      <div className="md:hidden">
        <label htmlFor="courts-facility-picker" className="u-label">
          Facility
        </label>
        <select
          id="courts-facility-picker"
          className="input"
          value={activeMobileFacility?.id ?? ""}
          onChange={(e) => setMobileFacilityId(e.target.value)}
        >
          {facilities.map((facility) => (
            <option key={facility.id} value={facility.id}>
              {facility.code} · {facility.name} — {priceLabel(facility)}
            </option>
          ))}
        </select>

        {activeMobileFacility && (
          <>
            <div className="mt-3 rounded-xl border border-line bg-paper-soft p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="u-display text-[13px] text-ink">{activeMobileFacility.name}</div>
                <span className="u-value text-[12px] text-ink">{priceLabel(activeMobileFacility)}</span>
              </div>
              <div className="mt-1 text-[11px] text-muted">
                {activeMobileFacility.sport} · {activeMobileFacility.surface} ·{" "}
                {activeMobileFacility.lighting ? "floodlit" : "daylight only"}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {TIME_SLOTS.map((slot) => {
                const state = cellState(activeMobileFacility, slot);
                const Icon = CELL_ICON[state];
                const isSelected =
                  selected?.facilityId === activeMobileFacility.id && selected?.slot === slot;
                const title = cellTitle(activeMobileFacility, slot, state);
                const disabled = state !== "free";
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => onSelect(activeMobileFacility.id, slot)}
                    disabled={disabled}
                    aria-pressed={isSelected}
                    aria-label={title}
                    title={title}
                    className={cn(
                      "flex w-full items-center justify-between gap-1 rounded-lg border px-2.5 py-2 text-left transition-colors",
                      isSelected ? "border-clay bg-clay text-chalk" : CELL_STYLES[state],
                      disabled ? "cursor-not-allowed" : "cursor-pointer"
                    )}
                  >
                    <span className="u-value text-[12px]">{slot}</span>
                    <span className="flex items-center gap-1 u-mono text-[9px] uppercase tracking-[0.08em]">
                      <Icon className="h-3 w-3" aria-hidden="true" />
                      {CELL_LABEL[state]}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** Icon + word legend so state is never conveyed by colour alone. */
export function AvailabilityLegend() {
  const items: { state: CellState; text: string }[] = [
    { state: "free", text: "Free — tap to reserve" },
    { state: "booked", text: "Reserved by another member" },
    { state: "past", text: "Session already started" },
    { state: "social", text: "Friday social · shared court" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {items.map(({ state, text }) => {
        const Icon = CELL_ICON[state];
        return (
          <span key={state} className="flex items-center gap-1.5 text-[10.5px] text-muted">
            <span
              className={cn(
                "flex h-4 w-4 items-center justify-center rounded border",
                CELL_STYLES[state]
              )}
            >
              <Icon className="h-2.5 w-2.5" aria-hidden="true" />
            </span>
            {text}
          </span>
        );
      })}
    </div>
  );
}
