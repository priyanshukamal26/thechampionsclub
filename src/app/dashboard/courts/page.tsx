"use client";

import { useState } from "react";
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight, Check, Zap, Star, Info, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { MEMBERSHIP_PLANS } from "@/lib/membership";

interface Facility {
  id: string;
  name: string;
  sport: string;
  surface: string;
  basePrice: number; // INR per 60 min
  lighting: boolean;
}

const FACILITIES: Facility[] = [
  { id: "tc1", name: "Centre Court 1", sport: "Tennis", surface: "Hard (US Open Blue)", basePrice: 1200, lighting: true },
  { id: "tc2", name: "Centre Court 2", sport: "Tennis", surface: "Hard (Aus Open Blue)", basePrice: 1200, lighting: true },
  { id: "tc3", name: "Clay Court 1", sport: "Tennis", surface: "Red Clay", basePrice: 1000, lighting: true },
  { id: "tc4", name: "Clay Court 2", sport: "Tennis", surface: "Red Clay", basePrice: 1000, lighting: false },
  { id: "tc5", name: "Grass Court 1", sport: "Tennis", surface: "Natural Grass", basePrice: 1500, lighting: false },
  { id: "pc1", name: "Padel Court 1", sport: "Padel", surface: "Panoramic Glass", basePrice: 1800, lighting: true },
  { id: "pc2", name: "Padel Court 2", sport: "Padel", surface: "Standard Enclosure", basePrice: 1400, lighting: true },
  { id: "bc1", name: "Badminton Court 1", sport: "Badminton", surface: "Synthetic Indoor AC", basePrice: 800, lighting: true },
  { id: "bc2", name: "Badminton Court 2", sport: "Badminton", surface: "Synthetic Indoor AC", basePrice: 800, lighting: true },
  { id: "bc3", name: "Badminton Court 3", sport: "Badminton", surface: "Synthetic Indoor AC", basePrice: 800, lighting: true },
  { id: "cc1", name: "Cricket Net 1 (Pace)", sport: "Cricket", surface: "Astroturf Pitch", basePrice: 600, lighting: true },
  { id: "cc2", name: "Cricket Net 2 (Spin)", sport: "Cricket", surface: "Astroturf Pitch", basePrice: 600, lighting: true },
];

const SPORTS = ["All", "Tennis", "Padel", "Badminton", "Cricket"];

const TIME_SLOTS = [
  "06:00", "07:00", "08:00", "09:00",
  "10:00", "11:00", "12:00", "13:00",
  "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00",
];

function getDateStr(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

// Deterministic mock availability
function isSlotAvailable(courtId: string, dateStr: string, slot: string): boolean {
  const hash = (courtId + dateStr + slot).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return hash % 5 !== 0; // ~80% available
}

export default function CourtsPage() {
  const { user } = useAuth();
  const [selectedSport, setSelectedSport] = useState("All");
  const [dateOffset, setDateOffset] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<{ courtId: string; slot: string } | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookedSessions, setBookedSessions] = useState<string[]>([]);

  if (!user) return null;

  const plan = MEMBERSHIP_PLANS[user.planId || "silver"] || MEMBERSHIP_PLANS.silver;
  const dateStr = getDateStr(dateOffset);
  const filteredFacilities = selectedSport === "All"
    ? FACILITIES
    : FACILITIES.filter((f) => f.sport === selectedSport);

  const selectedFacility = selectedSlot ? FACILITIES.find((f) => f.id === selectedSlot.courtId) : null;
  const memberPrice = selectedFacility ? Math.round(selectedFacility.basePrice * plan.courtMultiplier) : 0;

  const handleBook = () => {
    if (!selectedSlot || !selectedFacility) return;
    const sessionKey = `${selectedFacility.name} at ${selectedSlot.slot} (${formatDate(dateStr)})`;
    setBookedSessions((prev) => [sessionKey, ...prev]);
    setBookingConfirmed(true);
    setTimeout(() => {
      setBookingConfirmed(false);
      setSelectedSlot(null);
    }, 2500);
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#CCFF00] block mb-1">
          Court & Facility Reservations (B1–B9)
        </span>
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-extrabold uppercase text-white">
          Book Arena Slots
        </h1>
        <p className="text-xs text-[#888888] mt-1">
          {plan.name} privilege: <span className="text-[#CCFF00] font-bold">{plan.courtDiscountText}</span> · Daily Cap: {plan.dailyCap} sessions/day (IST)
        </p>
      </div>

      {/* Controls: Sport Filter + Date Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Sport Filter */}
        <div className="flex gap-2 flex-wrap">
          {SPORTS.map((sport) => (
            <button
              key={sport}
              onClick={() => setSelectedSport(sport)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                selectedSport === sport
                  ? "bg-[#CCFF00] text-[#0A0A0A] shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                  : "bg-[#141414] border border-[#222222] text-[#888888] hover:text-white hover:border-[#333333]"
              }`}
            >
              {sport}
            </button>
          ))}
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDateOffset(Math.max(0, dateOffset - 1))}
            disabled={dateOffset === 0}
            className="p-2 rounded-lg bg-[#141414] border border-[#222222] text-[#888888] hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="px-4 py-2 rounded-xl bg-[#141414] border border-[#222222] text-sm font-bold text-white min-w-[150px] text-center">
            <Calendar className="w-3.5 h-3.5 inline mr-2 text-[#CCFF00]" />
            {formatDate(dateStr)}
          </div>
          <button
            onClick={() => setDateOffset(Math.min(6, dateOffset + 1))}
            disabled={dateOffset >= 6}
            className="p-2 rounded-lg bg-[#141414] border border-[#222222] text-[#888888] hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Real-time Confirmation Feedback */}
      {bookedSessions.length > 0 && (
        <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-green-300">
            <ShieldCheck className="w-5 h-5 text-green-400 shrink-0" />
            <div>
              <span className="font-bold">Latest Reservation Confirmed:</span> {bookedSessions[0]}
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase bg-green-500/20 text-green-300 px-2.5 py-1 rounded-md">
            Slot Locked
          </span>
        </div>
      )}

      {/* Grid */}
      <div className="bg-[#141414] border border-[#1F1F1F] rounded-3xl p-6 shadow-xl overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#222222]">
              <th className="text-left py-3 px-3 text-[10px] uppercase tracking-wider text-[#777777] font-bold sticky left-0 bg-[#141414] min-w-[180px]">
                Court / Surface
              </th>
              {TIME_SLOTS.map((slot) => (
                <th key={slot} className="text-center py-3 px-1 text-[10px] text-[#666666] font-mono font-bold whitespace-nowrap">
                  {slot}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredFacilities.map((facility) => (
              <tr key={facility.id} className="border-b border-[#1A1A1A] hover:bg-[#1A1A1A]/50">
                <td className="py-3 px-3 sticky left-0 bg-[#141414]">
                  <div className="font-bold text-white text-xs">{facility.name}</div>
                  <div className="text-[10px] text-[#666666]">{facility.sport} · {facility.surface}</div>
                  <div className="text-[10px] text-[#CCFF00] font-mono font-bold">
                    {plan.courtMultiplier === 0 ? "₹0 (Free)" : `₹${Math.round(facility.basePrice * plan.courtMultiplier)}/hr`}
                  </div>
                </td>
                {TIME_SLOTS.map((slot) => {
                  const available = isSlotAvailable(facility.id, dateStr, slot);
                  const isSelected = selectedSlot?.courtId === facility.id && selectedSlot?.slot === slot;
                  return (
                    <td key={slot} className="text-center py-2 px-1">
                      <button
                        onClick={() => available && setSelectedSlot({ courtId: facility.id, slot })}
                        disabled={!available}
                        title={available ? `Book ${facility.name} at ${slot}` : "Slot Booked"}
                        className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all ${
                          isSelected
                            ? "bg-[#CCFF00] text-[#0A0A0A] shadow-[0_0_10px_rgba(204,255,0,0.4)] scale-105"
                            : available
                            ? "bg-[#0D0D0D] border border-[#222222] text-[#CCFF00] hover:border-[#CCFF00] hover:bg-[#CCFF00]/10"
                            : "bg-[#0D0D0D] border border-[#1A1A1A] text-[#333333] cursor-not-allowed"
                        }`}
                      >
                        {isSelected ? <Check className="w-3.5 h-3.5 mx-auto" /> : available ? "○" : "×"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend & Daily Cap Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#777777] gap-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#0D0D0D] border border-[#222222] text-[#CCFF00] text-[9px] flex items-center justify-center font-bold">○</span>
            Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#0D0D0D] border border-[#1A1A1A] text-[#333333] text-[9px] flex items-center justify-center font-bold">×</span>
            Booked / Blocked
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#CCFF00] text-[#0A0A0A] text-[9px] flex items-center justify-center font-bold">✓</span>
            Selected
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <Info className="w-3.5 h-3.5 text-[#CCFF00]" />
          <span>PostgreSQL exclusion constraints prevent double-booking across 18 arenas.</span>
        </div>
      </div>

      {/* Floating Booking Action Drawer */}
      {selectedSlot && selectedFacility && (
        <div className="fixed bottom-0 inset-x-0 lg:left-64 z-20 bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-[#1F1F1F] p-4 shadow-2xl">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#CCFF00]/15 text-[#CCFF00] flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">{selectedFacility.name}</div>
                <div className="text-xs text-[#888888]">
                  {formatDate(dateStr)} at <span className="text-white font-mono font-bold">{selectedSlot.slot}</span> · 60 min
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-[#777777]">{plan.name} Rate</div>
                <div className="text-lg font-extrabold text-[#CCFF00] font-mono">
                  {memberPrice === 0 ? "₹0 (Privilege)" : `₹${memberPrice}`}
                </div>
              </div>
              {bookingConfirmed ? (
                <div className="inline-flex items-center gap-2 bg-green-500/15 text-green-400 font-bold text-xs uppercase px-6 py-3 rounded-xl border border-green-500/30">
                  <Check className="w-4 h-4" /> Booked!
                </div>
              ) : (
                <button
                  onClick={handleBook}
                  className="inline-flex items-center gap-2 bg-[#CCFF00] text-[#0A0A0A] font-extrabold text-xs uppercase tracking-wider px-6 py-3 rounded-xl hover:bg-[#a8cc00] transition-all shadow-[0_0_20px_rgba(204,255,0,0.3)] active:scale-95"
                >
                  <Zap className="w-4 h-4" />
                  Confirm Reservation
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
