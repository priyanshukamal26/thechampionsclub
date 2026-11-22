import { NextResponse } from "next/server";
import { getDb, isDbConfigured, ensureTablesExist } from "@/lib/db";
import type { ClubUser } from "@/lib/auth-context";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const cleanEmail = (data.email || "").trim().toLowerCase();
    const cleanPassword = (data.password || "").trim();
    const fullName = (data.fullName || "").trim();
    const planId = data.planId || "silver";
    const isMinor = Boolean(data.isMinor);
    const memberId = data.memberId || `mem-${crypto.randomUUID().slice(0, 8)}`;
    const phone = data.phone || null;
    const dob = data.dob || null;

    if (!cleanEmail || !cleanPassword || !fullName) {
      return NextResponse.json(
        { success: false, error: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    const userId = memberId ? `user-${memberId}` : crypto.randomUUID();
    const user: ClubUser = {
      id: userId,
      email: cleanEmail,
      fullName,
      role: "member",
      status: isMinor ? "pending_consent" : "active_member",
      planId,
      isMinor,
      memberId,
    };

    // If Neon database is configured, persist the new user, profile, and member record
    if (isDbConfigured()) {
      await ensureTablesExist();
      const sql = getDb();
      if (sql) {
        // 1. Insert into users table
        await sql`
          INSERT INTO users (id, email, password_hash, full_name, role, status, plan_id, is_minor, member_id)
          VALUES (
            ${userId},
            ${cleanEmail},
            ${cleanPassword},
            ${fullName},
            'member',
            ${isMinor ? "pending_consent" : "active_member"},
            ${planId},
            ${isMinor},
            ${memberId}
          )
          ON CONFLICT (email) DO UPDATE SET
            password_hash = ${cleanPassword},
            full_name = ${fullName},
            plan_id = ${planId},
            is_minor = ${isMinor},
            updated_at = now();
        `;

        // 2. Insert into profiles table
        await sql`
          INSERT INTO profiles (id, email, full_name, role, status, phone, dob, plan_id, is_minor, member_id)
          VALUES (
            ${userId},
            ${cleanEmail},
            ${fullName},
            'member',
            ${isMinor ? "pending_consent" : "active_member"},
            ${phone},
            ${dob},
            ${planId},
            ${isMinor},
            ${memberId}
          )
          ON CONFLICT (email) DO UPDATE SET
            full_name = ${fullName},
            phone = ${phone},
            dob = ${dob},
            plan_id = ${planId};
        `;

        // 3. Insert or update members table in central DB
        const memberCode = `TCC-2026-${planId.toUpperCase().slice(0, 4)}-${Math.floor(100 + Math.random() * 900)}`;
        const todayStr = new Date().toISOString().split("T")[0];
        const nextYearDate = new Date();
        nextYearDate.setFullYear(nextYearDate.getFullYear() + 1);
        const expiryStr = nextYearDate.toISOString().split("T")[0];

        await sql`
          INSERT INTO members (
            id, member_code, full_name, email, phone, dob, plan_id, status,
            membership_start, membership_end, dues_pending, is_minor,
            guardian_name, guardian_phone, guardian_email
          )
          VALUES (
            ${memberId},
            ${memberCode},
            ${fullName},
            ${cleanEmail},
            ${phone},
            ${dob},
            ${planId},
            ${isMinor ? "pending_consent" : "active"},
            ${todayStr},
            ${expiryStr},
            0.0,
            ${isMinor},
            ${data.guardianName || null},
            ${data.guardianPhone || null},
            ${data.guardianEmail || null}
          )
          ON CONFLICT (email) DO UPDATE SET
            full_name = ${fullName},
            phone = ${phone},
            dob = ${dob},
            plan_id = ${planId};
        `;

        // 4. Record audit entry
        await sql`
          INSERT INTO audit_log (actor_id, actor, role, action, entity, entity_id, details)
          VALUES (
            ${userId},
            ${fullName},
            'member',
            ${isMinor ? "register_minor_pending_consent" : "register_member"},
            'users',
            ${userId},
            ${JSON.stringify({ planId, isMinor, email: cleanEmail })}
          );
        `;
      }
    }

    return NextResponse.json({ success: true, user });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[Register API] Error:", msg);
    return NextResponse.json(
      { success: false, error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
