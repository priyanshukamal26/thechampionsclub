import Link from "next/link";
import { ArrowLeft, WifiOff } from "lucide-react";

export const metadata = {
  title: "Offline | The Champions Club",
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      <div className="w-full max-w-md rounded-2xl border border-ink bg-chalk p-8 shadow-[6px_6px_0_0_var(--color-ink)]">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-clay text-chalk">
          <WifiOff className="h-5 w-5" />
        </span>
        <div className="u-eyebrow mt-5 text-clay">No connection</div>
        <h1 className="u-display mt-2 text-3xl text-ink">You are offline.</h1>
        <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
          Your digital member pass is generated on this device and still opens from the dashboard. Court booking,
          orders and tabs will sync when you are back online.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href="/dashboard/pass" className="btn btn-clay btn-sm">Open my pass</Link>
          <Link href="/" className="btn btn-outline btn-sm"><ArrowLeft className="h-3.5 w-3.5" /> Home</Link>
        </div>
      </div>
      <p className="mt-5 font-mono text-[8.5px] uppercase tracking-[0.18em] text-muted">
        The Champions Club · cached shell
      </p>
    </main>
  );
}
