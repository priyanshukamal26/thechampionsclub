"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, ChevronRight, CheckCircle, ShieldAlert, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface SlotData {
  time: string;
  tennis1: "free" | "booked" | "social";
  tennis2: "free" | "booked";
  padel1: "free" | "booked";
  badminton1: "free" | "booked";
}

const mockSchedule: SlotData[] = [
  { time: "06:00 AM", tennis1: "free", tennis2: "free", padel1: "free", badminton1: "free" },
  { time: "06:30 AM", tennis1: "free", tennis2: "free", padel1: "free", badminton1: "free" },
  { time: "07:00 AM", tennis1: "booked", tennis2: "free", padel1: "booked", badminton1: "free" },
  { time: "07:30 AM", tennis1: "booked", tennis2: "booked", padel1: "free", badminton1: "free" },
  { time: "05:00 PM", tennis1: "booked", tennis2: "booked", padel1: "booked", badminton1: "booked" },
  { time: "05:30 PM", tennis1: "booked", tennis2: "free", padel1: "booked", badminton1: "free" },
  { time: "06:00 PM", tennis1: "free", tennis2: "free", padel1: "booked", badminton1: "booked" },
  { time: "07:00 PM", tennis1: "social", tennis2: "booked", padel1: "booked", badminton1: "free" },
  { time: "07:30 PM", tennis1: "social", tennis2: "free", padel1: "free", badminton1: "free" },
  { time: "08:00 PM", tennis1: "social", tennis2: "free", padel1: "free", badminton1: "free" },
];

export default function AvailabilityStrip() {
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState("Today");

  const days = ["Today", "Tomorrow", "Friday Social", "Saturday", "Sunday"];

  return (
    <section id="availability" className="py-28 bg-[#050505] border-t border-[#1F1F1F] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#CCFF00] font-bold mb-3">
              <Clock className="w-3.5 h-3.5" />
              <span>Real-Time Engine With Zero Double-Bookings</span>
            </div>
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-4xl sm:text-5xl font-bold tracking-tight uppercase text-white">
              Live Court <span className="text-[#CCFF00]">Schedule</span>
            </h2>
          </div>
          <p className="max-w-md text-sm text-[#888888]">
            Slots start every 30 minutes for 60-minute match sessions. Postgres exclusion constraints guarantee 100% concurrency safety.
          </p>
        </div>

        {/* Day Selectors */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider flex-shrink-0 transition-all ${
                selectedDay === day
                  ? "bg-[#CCFF00] text-[#0A0A0A] shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                  : "bg-[#141414] text-[#888888] hover:text-white border border-[#1F1F1F]"
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Interactive Schedule Table */}
        <div className="bg-[#141414] border border-[#1F1F1F] rounded-3xl overflow-hidden shadow-2xl">
          {/* Table Header */}
          <div className="grid grid-cols-5 p-5 bg-[#1A1A1A] border-b border-[#1F1F1F] text-xs font-bold uppercase tracking-wider text-[#888888]">
            <div>Slot (30m Interval)</div>
            <div>Tennis Court 1</div>
            <div>Tennis Court 2</div>
            <div>Padel Court 1</div>
            <div>Badminton Hall 1</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-[#1F1F1F]/60">
            {mockSchedule.map((row) => (
              <div
                key={row.time}
                className="grid grid-cols-5 p-4 items-center hover:bg-[#1A1A1A]/40 transition-colors text-xs"
              >
                <div className="font-mono font-bold text-white flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#888888]" />
                  <span>{row.time}</span>
                </div>

                {/* Tennis 1 */}
                <div>
                  {row.tennis1 === "free" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] font-semibold border border-[#CCFF00]/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" />
                      Free
                    </span>
                  )}
                  {row.tennis1 === "booked" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F1F1F] text-[#888888] font-medium">
                      Booked
                    </span>
                  )}
                  {row.tennis1 === "social" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF4D00]/15 text-[#FF4D00] font-bold border border-[#FF4D00]/30">
                      <Sparkles className="w-3 h-3" />
                      Social Play
                    </span>
                  )}
                </div>

                {/* Tennis 2 */}
                <div>
                  {row.tennis2 === "free" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] font-semibold border border-[#CCFF00]/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" />
                      Free
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F1F1F] text-[#888888] font-medium">
                      Booked
                    </span>
                  )}
                </div>

                {/* Padel 1 */}
                <div>
                  {row.padel1 === "free" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] font-semibold border border-[#CCFF00]/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" />
                      Free
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F1F1F] text-[#888888] font-medium">
                      Booked
                    </span>
                  )}
                </div>

                {/* Badminton 1 */}
                <div>
                  {row.badminton1 === "free" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] font-semibold border border-[#CCFF00]/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" />
                      Free
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F1F1F] text-[#888888] font-medium">
                      Booked
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Table Footer info banner */}
          <div className="p-4 bg-[#111111] border-t border-[#1F1F1F] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs text-[#888888]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#CCFF00]" /> Available For Booking
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FF4D00]" /> Friday Social (Multi-user)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#555555]" /> Reserved
              </span>
            </div>

            {user ? (
              <Link
                href="/dashboard/courts"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#CCFF00] hover:underline"
              >
                <span>Book Court in Member Dashboard</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#CCFF00] hover:underline"
              >
                <span>Sign in to book 60-min slots</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
