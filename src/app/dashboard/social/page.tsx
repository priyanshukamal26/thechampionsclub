"use client";

import { PageHeader, Panel } from "@/components/ui/kit";

export default function PlaceholderPage() {
  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-5 sm:p-6 lg:p-8">
      <PageHeader eyebrow="Operations" title="Friday Social" description="Rotating doubles on shared courts." />
      <Panel tone="deep">
        <p className="u-mono text-xs text-muted">This surface is being fitted out.</p>
      </Panel>
    </div>
  );
}
