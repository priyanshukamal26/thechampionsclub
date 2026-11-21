"use client";

import { ArrowRight } from "lucide-react";
import { Avatar } from "@/components/ui/kit";
import { DEMO_USERS, type AppRole } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

export type DemoKey = keyof typeof DEMO_USERS;

const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  manager: "Club Manager",
  front_desk: "Front Desk & Club Manager",
  bar_staff: "Bar & Cafe Staff",
  shop_manager: "Sports Shop Owner",
  cafe_manager: "Bar & Cafe Owner",
  member: "Member",
};

const GROUPS: { label: string; keys: DemoKey[] }[] = [
  {
    label: "Staff & Management",
    keys: ["owner", "front_desk", "cafe_manager", "shop_manager"],
  },
  {
    label: "Members",
    keys: ["gold_member", "junior_minor"],
  },
];

export default function DemoRoleSwitcher({ onSelect }: { onSelect: (key: DemoKey) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="u-eyebrow text-clay">Demo access</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">6 demo accounts</span>
      </div>

      {GROUPS.map((group) => (
        <div key={group.label} className="mt-2.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
              {group.label}
            </span>
            <span className="h-px flex-1 bg-line" />
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted/70">
              {String(group.keys.length).padStart(2, "0")}
            </span>
          </div>

          <div className="mt-1.5 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {group.keys.map((key) => {
              const demo = DEMO_USERS[key];
              const pending = demo.status === "pending_consent";
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSelect(key)}
                  aria-label={`Continue as ${ROLE_LABEL[demo.role]} ${demo.fullName}`}
                  title={`${ROLE_LABEL[demo.role]} · ${demo.fullName}${pending ? " · pending guardian consent" : ""}`}
                  className={cn(
                    "group flex min-w-0 items-center gap-2 rounded-[10px] border border-line bg-paper-soft px-2 py-1.5 text-left transition",
                    "hover:border-ink hover:bg-chalk"
                  )}
                >
                  <Avatar name={demo.fullName} tone={pending ? "clay" : demo.role === "member" ? "court" : "ink"} size={24} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-[8px] uppercase tracking-[0.12em] text-muted">
                      {ROLE_LABEL[demo.role]}
                    </span>
                    <span className="block truncate text-[11px] font-semibold leading-tight text-ink">
                      {demo.fullName}
                    </span>
                  </span>
                  {pending ? (
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
                    />
                  ) : (
                    <ArrowRight
                      aria-hidden
                      className="h-3 w-3 shrink-0 text-muted/50 transition group-hover:text-clay"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <p className="mt-2.5 font-mono text-[8.5px] uppercase leading-relaxed tracking-[0.14em] text-muted/80">
        Demo profiles read local sample data — no live records are changed.
      </p>
    </div>
  );
}
