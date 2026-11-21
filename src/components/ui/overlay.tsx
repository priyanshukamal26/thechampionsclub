"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  eyebrow,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  eyebrow?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/55 backdrop-blur-[2px]" onClick={onClose} />
      <div className={cn("relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-ink bg-chalk shadow-[8px_8px_0_0_var(--color-ink)]", className)}>
        {(title || eyebrow) && (
          <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
            <div>
              {eyebrow && <div className="u-eyebrow mb-1 text-clay">{eyebrow}</div>}
              {title && <div className="u-display text-xl text-ink">{title}</div>}
            </div>
            <button onClick={onClose} aria-label="Close" className="rounded-full border border-line p-1.5 text-muted transition hover:border-ink hover:text-ink">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="border-t border-line bg-paper-soft px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  eyebrow,
  children,
  footer,
  side = "right",
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  eyebrow?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  side?: "right" | "left";
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className={cn(
          "absolute inset-y-0 flex w-full max-w-md flex-col border-ink bg-chalk shadow-[-8px_0_0_0_var(--color-ink)]",
          side === "right" ? "right-0 border-l" : "left-0 border-r",
          className
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            {eyebrow && <div className="u-eyebrow mb-1 text-clay">{eyebrow}</div>}
            {title && <div className="u-display text-xl text-ink">{title}</div>}
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-full border border-line p-1.5 text-muted transition hover:border-ink hover:text-ink">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="border-t border-line bg-paper-soft px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
  size = "md",
}: {
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <div className={cn("inline-flex flex-wrap items-center gap-1 rounded-full border border-line bg-paper-deep p-1", className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-full font-mono uppercase tracking-[0.12em] transition-all",
            size === "sm" ? "px-3 py-1.5 text-[9.5px]" : "px-4 py-2 text-[10px]",
            value === opt.value ? "bg-ink text-chalk" : "text-muted hover:text-ink"
          )}
        >
          {opt.label}
          {typeof opt.count === "number" && <span className="ml-1.5 opacity-60">{opt.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: { value: T; label: string; icon?: React.ElementType }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-0 border-b border-line", className)}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = value === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={cn(
              "-mb-px inline-flex items-center gap-1.5 border-b-2 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors",
              active ? "border-clay text-ink" : "border-transparent text-muted hover:text-ink"
            )}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
