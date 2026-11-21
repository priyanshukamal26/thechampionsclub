"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download, WifiOff, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAProvider() {
  const pathname = usePathname();
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "production") {
        navigator.serviceWorker.register("/sw.js").catch(() => undefined);
      } else {
        // Never let a stale dev-time worker interfere with hot reload.
        navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((reg) => reg.unregister())).catch(() => undefined);
      }
    }

    try {
      setDismissed(window.localStorage.getItem("tcc_pwa_dismissed") === "1");
    } catch {
      setDismissed(false);
    }

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    const updateOnline = () => setOffline(!navigator.onLine);
    updateOnline();
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, []);

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  };

  const dismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem("tcc_pwa_dismissed", "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      {offline && (
        <div className="fixed bottom-4 right-4 z-[95] flex items-center gap-2 rounded-full border border-ink bg-ink px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.14em] text-chalk shadow-lg">
          <WifiOff className="h-3.5 w-3.5 text-clay-soft" />
          Offline — your pass still works
        </div>
      )}

      {installEvent && !dismissed && (!pathname.startsWith("/dashboard") || pathname.startsWith("/dashboard/pass")) && (
        <div className="fixed bottom-4 left-4 z-[95] w-[calc(100%-2rem)] max-w-sm rounded-xl border border-ink bg-chalk p-4 shadow-[5px_5px_0_0_var(--color-ink)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-clay text-chalk">
                <Download className="h-4 w-4" />
              </span>
              <div>
                <div className="text-[12.5px] font-semibold text-ink">Install the club app</div>
                <p className="mt-1 text-[10.5px] leading-snug text-muted">
                  Keep your QR pass and court bookings on your home screen — it opens even without a signal.
                </p>
                <div className="mt-2.5 flex items-center gap-3">
                  <button onClick={install} className="btn btn-clay btn-sm">Install</button>
                  <Link href="/dashboard/pass" className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted u-link">
                    View pass
                  </Link>
                </div>
              </div>
            </div>
            <button onClick={dismiss} aria-label="Dismiss install prompt" className="rounded-full p-1 text-muted hover:text-ink">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
