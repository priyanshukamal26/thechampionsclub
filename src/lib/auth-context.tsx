"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "./supabase";

export type AppRole = "owner" | "manager" | "front_desk" | "bar_staff" | "member";
export type AccountStatus = "prospect" | "pending_consent" | "active_member" | "suspended";

export interface ClubUser {
  id: string;
  email: string;
  fullName: string;
  role: AppRole;
  status: AccountStatus;
  planId?: "gold" | "silver" | "junior";
  isMinor?: boolean;
}

export const DEMO_USERS: Record<string, ClubUser> = {
  owner: {
    id: "00000000-0000-0000-0000-000000000001",
    email: "owner@championsclub.in",
    fullName: "Rajesh Verma",
    role: "owner",
    status: "active_member",
  },
  manager: {
    id: "00000000-0000-0000-0000-000000000002",
    email: "manager@championsclub.in",
    fullName: "Simran Kaur",
    role: "manager",
    status: "active_member",
  },
  front_desk: {
    id: "00000000-0000-0000-0000-000000000003",
    email: "frontdesk@championsclub.in",
    fullName: "Amit Sharma",
    role: "front_desk",
    status: "active_member",
  },
  bar_staff: {
    id: "00000000-0000-0000-0000-000000000004",
    email: "bar@championsclub.in",
    fullName: "Chef Vikram",
    role: "bar_staff",
    status: "active_member",
  },
  gold_member: {
    id: "00000000-0000-0000-0000-000000000005",
    email: "rohan@championsclub.in",
    fullName: "Rohan Mehra",
    role: "member",
    status: "active_member",
    planId: "gold",
  },
  junior_minor: {
    id: "00000000-0000-0000-0000-000000000006",
    email: "aarav@championsclub.in",
    fullName: "Aarav Patel",
    role: "member",
    status: "pending_consent",
    planId: "junior",
    isMinor: true,
  },
};

interface AuthContextType {
  user: ClubUser | null;
  loading: boolean;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  switchDemoUser: (key: keyof typeof DEMO_USERS) => void;
  setUser: React.Dispatch<React.SetStateAction<ClubUser | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ClubUser | null>(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("champions_user");
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          localStorage.removeItem("champions_user");
        }
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

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

  const signIn = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Check if matching demo user
    const matchedKey = Object.keys(DEMO_USERS).find(
      (k) => DEMO_USERS[k].email.toLowerCase() === cleanEmail
    );

    if (matchedKey) {
      const demoUser = DEMO_USERS[matchedKey];
      setUser(demoUser);
      localStorage.setItem("champions_user", JSON.stringify(demoUser));
      return { success: true };
    }

    // 2. If Supabase backend is not configured (offline/mock development)
    if (!isSupabaseConfigured) {
      const fallbackUser: ClubUser = {
        id: crypto.randomUUID(),
        email: cleanEmail,
        fullName: cleanEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        role: cleanEmail.includes("owner")
          ? "owner"
          : cleanEmail.includes("manager")
          ? "manager"
          : cleanEmail.includes("desk")
          ? "front_desk"
          : cleanEmail.includes("bar")
          ? "bar_staff"
          : "member",
        status: cleanEmail.includes("junior") ? "pending_consent" : "active_member",
        planId: cleanEmail.includes("gold") ? "gold" : cleanEmail.includes("junior") ? "junior" : "silver",
      };
      setUser(fallbackUser);
      localStorage.setItem("champions_user", JSON.stringify(fallbackUser));
      return { success: true };
    }

    // 3. Try Supabase Auth when configured
    try {
      if (password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          const errMsg = error.message?.toLowerCase() || "";
          if (
            errMsg.includes("failed to fetch") ||
            errMsg.includes("fetch failed") ||
            errMsg.includes("placeholder") ||
            errMsg.includes("networkerror") ||
            errMsg.includes("load failed")
          ) {
            const fallbackUser: ClubUser = {
              id: crypto.randomUUID(),
              email: cleanEmail,
              fullName: cleanEmail.split("@")[0].toUpperCase(),
              role: "member",
              status: cleanEmail.includes("junior") ? "pending_consent" : "active_member",
              planId: "silver",
            };
            setUser(fallbackUser);
            localStorage.setItem("champions_user", JSON.stringify(fallbackUser));
            return { success: true };
          }
          return { success: false, error: error.message };
        }

        if (data.user) {
          const u: ClubUser = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            fullName: data.user.user_metadata?.full_name || cleanEmail.split("@")[0],
            role: data.user.user_metadata?.role || "member",
            status: data.user.user_metadata?.status || "active_member",
            planId: data.user.user_metadata?.plan_id,
          };
          setUser(u);
          localStorage.setItem("champions_user", JSON.stringify(u));
          return { success: true };
        }
      }
    } catch {
      // Fallback local session for seamless development
      const fallbackUser: ClubUser = {
        id: crypto.randomUUID(),
        email: cleanEmail,
        fullName: cleanEmail.split("@")[0],
        role: "member",
        status: cleanEmail.includes("junior") ? "pending_consent" : "active_member",
        planId: "silver",
      };
      setUser(fallbackUser);
      localStorage.setItem("champions_user", JSON.stringify(fallbackUser));
      return { success: true };
    }

    return { success: false, error: "Invalid credentials. Please verify your email and password." };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore
    }
    setUser(null);
    localStorage.removeItem("champions_user");
  };

  const switchDemoUser = (key: keyof typeof DEMO_USERS) => {
    const demoUser = DEMO_USERS[key];
    setUser(demoUser);
    localStorage.setItem("champions_user", JSON.stringify(demoUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
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
