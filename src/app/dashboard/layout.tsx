"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CalendarDays,
  CalendarCheck,
  ShoppingBag,
  Coffee,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  ArrowUpRight,
  ScanLine,
  Wallet,
  ChefHat,
  Store,
  Users2,
  ChevronDown,
} from "lucide-react";
import { useAuth, DEMO_USERS, type AppRole } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/kit";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  roles?: AppRole[];
  short?: string;
};

const CLUB_NAV: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, short: "Overview" },
  { href: "/dashboard/courts", label: "Book Courts", icon: CalendarDays, short: "Courts", roles: ["owner", "manager", "front_desk", "member"] },
  { href: "/dashboard/bookings", label: "Bookings", icon: CalendarCheck, short: "Bookings", roles: ["owner", "manager", "front_desk", "cafe_manager", "member"] },
  { href: "/dashboard/social", label: "Friday Social", icon: Users2, short: "Social", roles: ["owner", "manager", "front_desk", "member"] },
  { href: "/dashboard/shop", label: "Pro Shop", icon: ShoppingBag, short: "Shop", roles: ["owner", "manager", "shop_manager", "member"] },
  { href: "/dashboard/bar", label: "Bar & Lounge", icon: Coffee, short: "Bar", roles: ["owner", "manager", "cafe_manager", "member"] },
  { href: "/dashboard/pass", label: "My Pass", icon: CreditCard, short: "Pass", roles: ["member"] },
];

/** Route-level access matrix (X1). The sidebar is filtered by role; this
 *  matrix also stops a staff member opening another role's console by URL. */
const PAGE_ACCESS: Array<{ prefix: string; roles: AppRole[] }> = [
  { prefix: "/dashboard/owner", roles: ["owner", "manager"] },
  { prefix: "/dashboard/desk", roles: ["owner", "manager", "front_desk"] },
  { prefix: "/dashboard/pos", roles: ["owner", "manager", "shop_manager"] },
  { prefix: "/dashboard/kitchen", roles: ["owner", "manager", "cafe_manager"] },
  { prefix: "/dashboard/pass", roles: ["member"] },
  { prefix: "/dashboard/bookings", roles: ["owner", "manager", "front_desk", "cafe_manager", "member"] },
  { prefix: "/dashboard/courts", roles: ["owner", "manager", "front_desk", "member"] },
  { prefix: "/dashboard/social", roles: ["owner", "manager", "front_desk", "member"] },
  { prefix: "/dashboard/shop", roles: ["owner", "manager", "shop_manager", "member"] },
  { prefix: "/dashboard/bar", roles: ["owner", "manager", "cafe_manager", "member"] },
];

const OPERATIONS_NAV: NavItem[] = [
  { href: "/dashboard/owner", label: "Owner Console", icon: Wallet, roles: ["owner", "manager"], short: "Finance" },
  { href: "/dashboard/desk", label: "Front Desk", icon: ScanLine, roles: ["owner", "manager", "front_desk"], short: "Desk" },
  { href: "/dashboard/pos", label: "Shop POS", icon: Store, roles: ["owner", "manager", "shop_manager"], short: "POS" },
  { href: "/dashboard/kitchen", label: "Kitchen Display", icon: ChefHat, roles: ["owner", "manager", "cafe_manager"], short: "Kitchen" },
];

const ROLE_LABEL: Record<AppRole, string> = {
  owner: "Owner",
  manager: "Club Manager",
  front_desk: "Front Desk & Club Manager",
  bar_staff: "Bar & Cafe Staff",
  shop_manager: "Sports Shop Owner",
  cafe_manager: "Bar & Cafe Owner",
  member: "Member",
};

const PAGE_TITLES: { match: (p: string) => boolean; title: string; section: string }[] = [
  { match: (p) => p === "/dashboard", title: "Overview", section: "The Club" },
  { match: (p) => p.startsWith("/dashboard/courts"), title: "Court Reservations", section: "The Club" },
  { match: (p) => p.startsWith("/dashboard/social"), title: "Friday Social", section: "The Club" },
  { match: (p) => p.startsWith("/dashboard/shop"), title: "Pro Shop", section: "The Club" },
  { match: (p) => p.startsWith("/dashboard/bar"), title: "Bar & Lounge", section: "The Club" },
  { match: (p) => p.startsWith("/dashboard/pass"), title: "Digital Member Pass", section: "The Club" },
  { match: (p) => p.startsWith("/dashboard/owner"), title: "Owner Console", section: "Operations" },
  { match: (p) => p.startsWith("/dashboard/desk"), title: "Front Desk", section: "Operations" },
  { match: (p) => p.startsWith("/dashboard/pos"), title: "Shop Point of Sale", section: "Operations" },
  { match: (p) => p.startsWith("/dashboard/kitchen"), title: "Kitchen Display", section: "Operations" },
  { match: (p) => p.startsWith("/dashboard/settings"), title: "Account & Privacy", section: "Account" },
];

function todayIST() {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date());
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut, loading, switchDemoUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    setSidebarOpen(false);
    setRoleMenuOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="u-eyebrow animate-pulse text-clay">Opening the clubhouse…</div>
      </div>
    );
  }
  if (!user) return null;

  const isStaff = user.role !== "member";
  const can = (item: NavItem) => !item.roles || item.roles.includes(user.role);
  const accessRule = PAGE_ACCESS.find((rule) => pathname.startsWith(rule.prefix));
  const blocked = Boolean(accessRule && !accessRule.roles.includes(user.role));
  const ops = OPERATIONS_NAV.filter(can);
  const clubNav = CLUB_NAV.filter(can);
  const page = PAGE_TITLES.find((p) => p.match(pathname)) ?? { title: "Clubhouse", section: "The Club" };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const isActive = (href: string) => (href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href));

  const NavLink = ({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
          active ? "bg-white/[0.06] text-chalk" : "text-chalk/50 hover:bg-white/[0.03] hover:text-chalk"
        )}
      >
        {active && <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-clay" />}
        <Icon className={cn("h-[15px] w-[15px] shrink-0", active ? "text-clay-soft" : "text-chalk/40 group-hover:text-chalk/70")} />
        <span className="font-mono text-[10.5px] uppercase tracking-[0.14em]">{item.label}</span>
        {active && <ArrowUpRight className="ml-auto h-3 w-3 text-clay-soft" />}
      </Link>
    );
  };

  const sidebarBody = (mobile = false) => (
    <div className="flex h-full flex-col">
      <div className="border-b border-line-inverse px-5 py-5">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-chalk/25 bg-clay font-mono text-[11px] font-bold text-chalk">
            TC
          </div>
          <div>
            <div className="u-display text-[15px] leading-none text-chalk">Champions Club</div>
            <div className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.24em] text-chalk/40">
              {isStaff ? "Operations Hub" : "Member Hub"}
            </div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="u-eyebrow mb-2 px-3 text-chalk/30">The Club</div>
        <div className="space-y-0.5">
          {clubNav.map((item) => (
            <NavLink key={item.href} item={item} onNavigate={() => setSidebarOpen(false)} />
          ))}
        </div>

        {ops.length > 0 && (
          <>
            <div className="u-eyebrow mt-6 mb-2 px-3 text-chalk/30">Operations</div>
            <div className="space-y-0.5">
              {ops.map((item) => (
                <NavLink key={item.href} item={item} onNavigate={() => setSidebarOpen(false)} />
              ))}
            </div>
          </>
        )}

        <div className="u-eyebrow mt-6 mb-2 px-3 text-chalk/30">Account</div>
        <div className="space-y-0.5">
          <NavLink item={{ href: "/dashboard/settings", label: "Settings", icon: Settings }} onNavigate={() => setSidebarOpen(false)} />
          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-chalk/50 transition-colors hover:bg-white/[0.03] hover:text-chalk"
          >
            <ArrowUpRight className="h-[15px] w-[15px] text-chalk/40 group-hover:text-chalk/70" />
            <span className="font-mono text-[10.5px] uppercase tracking-[0.14em]">Public Clubhouse</span>
          </Link>
        </div>

        {mobile && (
          <div className="mt-6 rounded-xl border border-line-inverse bg-white/[0.03] p-3">
            <div className="u-eyebrow mb-2 text-chalk/35">Demo role switcher</div>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(DEMO_USERS) as (keyof typeof DEMO_USERS)[]).map((key) => (
                <button
                  key={key}
                  onClick={() => { switchDemoUser(key); router.push(key === "junior_minor" ? "/pending-consent" : "/dashboard"); }}
                  className={cn(
                    "rounded-md border px-2 py-1.5 text-left font-mono text-[9px] uppercase tracking-wider transition",
                    user.id === DEMO_USERS[key].id
                      ? "border-clay bg-clay/20 text-chalk"
                      : "border-line-inverse text-chalk/50 hover:text-chalk"
                  )}
                >
                  {ROLE_LABEL[DEMO_USERS[key].role]}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="border-t border-line-inverse p-4">
        <div className="flex items-center gap-3">
          <Avatar name={user.fullName} tone="clay" size={36} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12px] font-semibold text-chalk">{user.fullName}</div>
            <div className="mt-0.5 font-mono text-[8.5px] uppercase tracking-[0.18em] text-chalk/40">{ROLE_LABEL[user.role]}</div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={handleSignOut}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-line-inverse py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-chalk/60 transition hover:border-clay hover:text-chalk"
          >
            <LogOut className="h-3 w-3" /> Sign out
          </button>
          {!mobile && (
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen((v) => !v)}
                className="flex items-center gap-1 rounded-lg border border-line-inverse px-2.5 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-chalk/60 transition hover:border-clay hover:text-chalk"
                aria-label="Switch demo role"
              >
                Role <ChevronDown className="h-3 w-3" />
              </button>
              {roleMenuOpen && (
                <div className="absolute bottom-11 right-0 z-50 w-48 rounded-xl border border-ink-line bg-ink-soft p-2 shadow-2xl">
                  {(Object.keys(DEMO_USERS) as (keyof typeof DEMO_USERS)[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => { switchDemoUser(key); setRoleMenuOpen(false); router.push(key === "junior_minor" ? "/pending-consent" : "/dashboard"); }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left font-mono text-[9.5px] uppercase tracking-wider transition",
                        user.id === DEMO_USERS[key].id ? "bg-clay/20 text-clay-soft" : "text-chalk/60 hover:bg-white/5 hover:text-chalk"
                      )}
                    >
                      <span>{ROLE_LABEL[DEMO_USERS[key].role]}</span>
                      <span className="text-[8px] opacity-50">{DEMO_USERS[key].fullName.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-paper text-ink">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[252px] border-r border-ink bg-ink lg:block">{sidebarBody()}</aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-ink/60 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] border-r border-ink bg-ink lg:hidden"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                aria-label="Close menu"
                className="absolute right-3 top-3 rounded-full border border-line-inverse p-1.5 text-chalk/60"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              {sidebarBody(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="min-w-0 flex-1 lg:ml-[252px]">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-line bg-paper/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-md border border-line p-2 text-ink lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="hidden items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted sm:flex">
              <span>{page.section}</span>
              <span className="text-line">/</span>
              <span className="text-ink">{page.title}</span>
            </div>
            <div className="u-mono text-[11px] uppercase tracking-[0.1em] text-ink sm:hidden">{page.title}</div>
          </div>
          <div className="flex items-center gap-2.5">
            <span suppressHydrationWarning className="hidden font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted md:inline">{todayIST()} IST</span>
            <span className="chip chip-ink hidden sm:inline-flex">{ROLE_LABEL[user.role]}</span>
            <Link
              href="/"
              className="rounded-full border border-line p-2 text-ink transition hover:border-ink"
              aria-label="Public clubhouse"
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </header>
        <main className="min-h-[calc(100vh-3.5rem)]">
          {blocked ? (
            <div className="mx-auto max-w-lg px-5 py-16">
              <div className="card p-6 text-center">
                <div className="u-eyebrow text-clay">Role-restricted surface</div>
                <h1 className="u-display mt-2 text-2xl">Not your counter.</h1>
                <p className="mt-2 text-[12px] leading-relaxed text-muted">
                  You are signed in as {ROLE_LABEL[user.role]}. This console belongs to a different
                  team. Use the role switcher in the sidebar to see how that person works, or head
                  back to your own overview.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <Link href="/dashboard" className="btn btn-ink btn-sm">
                    My overview
                  </Link>
                  <button className="btn btn-outline btn-sm" onClick={handleSignOut}>
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
