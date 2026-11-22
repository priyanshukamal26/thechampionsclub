"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "./supabase";
import { getLocalMembers, ensureLocalMember } from "./membership";

export type AppRole =
  | "owner"
  | "manager"
  | "front_desk"
  | "bar_staff"
  | "shop_manager"
  | "cafe_manager"
  | "member";
export type AccountStatus = "prospect" | "pending_consent" | "active_member" | "suspended";

export interface ClubUser {
  id: string;
  email: string;
  fullName: string;
  role: AppRole;
  status: AccountStatus;
  planId?: "gold" | "silver" | "junior";
  isMinor?: boolean;
  memberId?: string;
}

export const DEMO_USERS: Record<string, ClubUser> = {
  owner: {
    id: "00000000-0000-0000-0000-000000000001",
    email: "owner@championsclub.in",
    fullName: "Rajesh Verma",
    role: "owner",
    status: "active_member",
  },
  front_desk: {
    id: "00000000-0000-0000-0000-000000000003",
    email: "frontdesk@championsclub.in",
    fullName: "Amit Sharma",
    role: "front_desk",
    status: "active_member",
  },
  cafe_manager: {
    id: "00000000-0000-0000-0000-000000000008",
    email: "cafe@championsclub.in",
    fullName: "Meera Nair",
    role: "cafe_manager",
    status: "active_member",
  },
  shop_manager: {
    id: "00000000-0000-0000-0000-000000000007",
    email: "shop@championsclub.in",
    fullName: "Neha Kapoor",
    role: "shop_manager",
    status: "active_member",
  },
  gold_member: {
    id: "00000000-0000-0000-0000-000000000005",
    email: "rohan@championsclub.in",
    fullName: "Rohan Mehra",
    role: "member",
    status: "active_member",
    planId: "gold",
    memberId: "mem-001",
  },
  junior_minor: {
    id: "00000000-0000-0000-0000-000000000006",
    email: "aarav@championsclub.in",
    fullName: "Aarav Patel",
    role: "member",
    status: "pending_consent",
    planId: "junior",
    isMinor: true,
    memberId: "mem-003",
  },
};

interface AuthContextType {
  user: ClubUser | null;
  loading: boolean;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: {
    fullName: string;
    email: string;
    password: string;
    planId: "gold" | "silver" | "junior";
    isMinor?: boolean;
    memberId?: string;
  }) => Promise<{ success: boolean; error?: string; user?: ClubUser }>;
  signOut: () => Promise<void>;
  switchDemoUser: (key: keyof typeof DEMO_USERS) => void;
  setUser: React.Dispatch<React.SetStateAction<ClubUser | null>>;
}

export const PRESET_PASSWORDS = [
  "Champions@2026",
  "password123",
  "champions123",
  "demo123",
  "admin123",
];

export function getRegisteredUsers(): Record<string, { email: string; password?: string; user: ClubUser }> {
  try {
    const raw = localStorage.getItem("champions_registered_users");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveRegisteredUser(account: { email: string; password?: string; user: ClubUser }) {
  try {
    const existing = getRegisteredUsers();
    existing[account.email.toLowerCase()] = account;
    localStorage.setItem("champions_registered_users", JSON.stringify(existing));
  } catch {
    // Ignore storage errors
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ClubUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Read the local session after hydration so server and client markup match.
  useEffect(() => {
    try {
      const cached = localStorage.getItem("champions_user");
      if (cached) {
        const u = JSON.parse(cached) as ClubUser;
        setUser(u);
        ensureLocalMember(u);
      }
    } catch {
      localStorage.removeItem("champions_user");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Listen to Supabase Auth state changes if available
    try {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            const mappedUser: ClubUser = {
              id: session.user.id,
              email: session.user.email || "",
              fullName: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Athlete",
              role: (session.user.user_metadata?.role as AppRole) || "member",
              status: (session.user.user_metadata?.status as AccountStatus) || "active_member",
              planId: session.user.user_metadata?.plan_id,
              isMinor: session.user.user_metadata?.is_minor,
            };
            setUser(mappedUser);
            localStorage.setItem("champions_user", JSON.stringify(mappedUser));
          } else if (event === "SIGNED_OUT") {
            // Keep local demo user unless explicitly cleared
          }
        }
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    } catch {
      // Ignore in offline/demo environment
    }
  }, []);

  const signUp = async (data: {
    fullName: string;
    email: string;
    password: string;
    planId: "gold" | "silver" | "junior";
    isMinor?: boolean;
    memberId?: string;
  }): Promise<{ success: boolean; error?: string; user?: ClubUser }> => {
    const cleanEmail = data.email.trim().toLowerCase();
    const newUser: ClubUser = {
      id: data.memberId ? `user-${data.memberId}` : crypto.randomUUID(),
      email: cleanEmail,
      fullName: data.fullName.trim(),
      role: "member",
      status: data.isMinor ? "pending_consent" : "active_member",
      planId: data.planId,
      isMinor: data.isMinor,
      memberId: data.memberId,
    };

    // 1. Save in registered users cache
    saveRegisteredUser({
      email: cleanEmail,
      password: data.password,
      user: newUser,
    });

    // 2. Persist to Neon Serverless Database via API
    try {
      await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          email: cleanEmail,
          password: data.password,
          planId: data.planId,
          isMinor: data.isMinor,
          memberId: data.memberId,
        }),
      });
    } catch (e) {
      console.warn("Neon registration sync error:", e);
    }

    // 3. If Supabase is configured, also keep in sync
    if (isSupabaseConfigured) {
      try {
        const { error: suError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: data.password,
          options: {
            data: {
              full_name: data.fullName,
              role: "member",
              plan_id: data.planId,
              is_minor: Boolean(data.isMinor),
              member_id: data.memberId,
            },
          },
        });
        if (suError) {
          console.warn("Supabase signUp warning:", suError.message);
        }
      } catch (e) {
        console.warn("Supabase signUp error:", e);
      }
    }

    setUser(newUser);
    ensureLocalMember(newUser);
    localStorage.setItem("champions_user", JSON.stringify(newUser));
    return { success: true, user: newUser };
  };

  const signIn = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password?.trim() || "";

    if (!cleanEmail) {
      return { success: false, error: "Please enter your registered email address." };
    }
    if (!cleanPassword) {
      return { success: false, error: "Please enter your password." };
    }

    // 1. Check if matching demo user
    const matchedKey = Object.keys(DEMO_USERS).find(
      (k) => DEMO_USERS[k].email.toLowerCase() === cleanEmail
    );

    if (matchedKey) {
      if (!PRESET_PASSWORDS.includes(cleanPassword)) {
        return { success: false, error: "Invalid password for this demo profile. Use 'Champions@2026' or 'password123'." };
      }
      const demoUser = DEMO_USERS[matchedKey];
      setUser(demoUser);
      ensureLocalMember(demoUser);
      localStorage.setItem("champions_user", JSON.stringify(demoUser));
      return { success: true };
    }

    // 2. Check locally registered users (created via registration wizard)
    const registered = getRegisteredUsers();
    if (registered[cleanEmail]) {
      const record = registered[cleanEmail];
      if (record.password && record.password !== cleanPassword) {
        return { success: false, error: "Invalid password. Please check your credentials." };
      }
      setUser(record.user);
      ensureLocalMember(record.user);
      localStorage.setItem("champions_user", JSON.stringify(record.user));
      return { success: true };
    }

    // 3. Check if matching seed or local member in the club registry
    try {
      const localMember = getLocalMembers().find(
        (m) => m.email.toLowerCase() === cleanEmail
      );
      if (localMember) {
        if (!PRESET_PASSWORDS.includes(cleanPassword)) {
          return { success: false, error: "Invalid password for this club profile. Use 'Champions@2026' or 'password123'." };
        }
        const memberUser: ClubUser = {
          id: `user-${localMember.id}`,
          email: localMember.email,
          fullName: localMember.fullName,
          role: "member",
          status: localMember.status === "pending_consent" ? "pending_consent" : "active_member",
          planId: localMember.planId,
          isMinor: localMember.isMinor,
          memberId: localMember.id,
        };
        setUser(memberUser);
        ensureLocalMember(memberUser);
        localStorage.setItem("champions_user", JSON.stringify(memberUser));
        return { success: true };
      }
    } catch {
      // Ignore if getLocalMembers throws
    }

    // 4. Try Neon Server Auth API
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.user) {
          setUser(json.user);
          ensureLocalMember(json.user);
          localStorage.setItem("champions_user", JSON.stringify(json.user));
          return { success: true };
        }
      } else {
        const json = await res.json().catch(() => ({}));
        if (json.error && !json.error.includes("Invalid login credentials")) {
          return { success: false, error: json.error };
        }
      }
    } catch {
      // Ignore network errors and continue to fallbacks
    }

    // 5. Try Supabase Auth when configured
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (!error && data?.user) {
          const u: ClubUser = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            fullName: data.user.user_metadata?.full_name || cleanEmail.split("@")[0],
            role: data.user.user_metadata?.role || "member",
            status: data.user.user_metadata?.status || "active_member",
            planId: data.user.user_metadata?.plan_id,
            isMinor: data.user.user_metadata?.is_minor,
            memberId: data.user.user_metadata?.member_id,
          };
          setUser(u);
          localStorage.setItem("champions_user", JSON.stringify(u));
          return { success: true };
        } else if (error) {
          const msg = error.message.toLowerCase();
          if (msg.includes("email not confirmed")) {
            return {
              success: false,
              error: "Please check your email to confirm your account before logging in, or disable email confirmations in Supabase.",
            };
          }
          if (msg.includes("invalid login credentials") || msg.includes("invalid grant")) {
            return {
              success: false,
              error: "Invalid login credentials. Please check your email and password.",
            };
          }
          if (msg.includes("failed to fetch") || msg.includes("network")) {
            return {
              success: false,
              error: "Unable to reach the authentication service. Please check your internet connection or verify Vercel environment variables.",
            };
          }
          return { success: false, error: error.message };
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn("Supabase auth error:", msg);
        if (msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("network")) {
          return {
            success: false,
            error: "Unable to reach the authentication service. Please check your connection or Supabase settings.",
          };
        }
      }
    }

    return { success: false, error: "Invalid login credentials. Please check your email and password." };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore
    }
    setUser(null);
    // Clear the session identity token
    localStorage.removeItem("champions_user");
    // Clear ALL per-session data stores so the next login starts clean.
    // Without this, stale data from the previous user's session leaks into
    // the next user's dashboard (the "Priya → Somya" bug).
    const sessionKeys = [
      "champions_bookings_v3",
      "champions_social_v2",
      "champions_orders_v2",
      "champions_tabs_v1",
      "champions_tables_v1",
      "champions_products_v1",
      "champions_ledger_v1",
      "champions_payables_v1",
      "champions_staff_v1",
      "champions_leave_v1",
      "champions_invoices_v1",
      "champions_share_links_v1",
      "champions_payroll_paid_v1",
      "champions_members",
    ];
    sessionKeys.forEach((key) => {
      try { localStorage.removeItem(key); } catch { /* ignore */ }
    });
  };

  const switchDemoUser = (key: keyof typeof DEMO_USERS) => {
    const demoUser = DEMO_USERS[key];
    setUser(demoUser);
    ensureLocalMember(demoUser);
    localStorage.setItem("champions_user", JSON.stringify(demoUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        switchDemoUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
