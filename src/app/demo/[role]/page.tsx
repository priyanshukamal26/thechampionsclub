"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthCard, AuthEyebrow, AuthPage, AuthTopBar } from "@/components/auth/AuthShell";
import { DEMO_USERS, useAuth } from "@/lib/auth-context";

const DESTINATIONS: Record<string, string> = {
  owner: "/dashboard/owner",
  manager: "/dashboard/owner",
  front_desk: "/dashboard/desk",
  bar_staff: "/dashboard/kitchen",
  cafe_manager: "/dashboard/bar",
  shop_manager: "/dashboard/pos",
  gold_member: "/dashboard",
  silver_member: "/dashboard",
  junior_minor: "/pending-consent",
};

export default function DemoRolePage() {
  const params = useParams<{ role: string }>();
  const routeRole = typeof params?.role === "string" ? params.role : "";
  const { switchDemoUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!routeRole || !DEMO_USERS[routeRole]) return;
    switchDemoUser(routeRole);
    router.replace(DESTINATIONS[routeRole] ?? "/dashboard");
  }, [routeRole, switchDemoUser, router]);

  const label = DEMO_USERS[routeRole]?.fullName ?? "a demo role";

  return (
    <AuthPage>
      <AuthTopBar />
      <main className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-16">
        <AuthEyebrow>Demo access</AuthEyebrow>
        <h1 className="u-display mt-2 text-[30px] leading-tight">Signing in as {label}.</h1>
        <p className="mt-2 text-[12px] text-muted">
          One moment — the club is opening the right console for this role.
        </p>
        <AuthCard className="mt-6">
          <p className="u-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            {routeRole ? `role/${routeRole}` : "role/unknown"}
          </p>
          <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
            Demo sessions are password-free and stored in this browser. Use the role switcher in the
            dashboard rail to change roles at any point.
          </p>
        </AuthCard>
      </main>
    </AuthPage>
  );
}
