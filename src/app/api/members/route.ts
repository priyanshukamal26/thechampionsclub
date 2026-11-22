import { NextResponse } from "next/server";
import { getDb, isDbConfigured, ensureTablesExist } from "@/lib/db";
import { SEED_MEMBERS, type ClubMember } from "@/lib/membership";

export async function GET() {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json({ success: true, source: "seed", members: SEED_MEMBERS });
    }

    await ensureTablesExist();
    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ success: true, source: "seed", members: SEED_MEMBERS });
    }

    const rows = await sql`
      SELECT 
        id, member_code as "memberCode", full_name as "fullName",
        email, phone, dob, plan_id as "planId", status,
        membership_start as "membershipStart", membership_end as "membershipEnd",
        dues_pending as "duesPending", is_minor as "isMinor",
        guardian_name as "guardianName", guardian_phone as "guardianPhone",
        guardian_email as "guardianEmail"
      FROM members
      ORDER BY created_at DESC;
    `;

    // Map rows into ClubMember format
    const dbMembers: ClubMember[] = rows.map((r: any) => ({
      id: r.id,
      memberCode: r.memberCode,
      fullName: r.fullName,
      email: r.email,
      phone: r.phone || "",
      dob: r.dob || "",
      planId: r.planId || "silver",
      status: r.status || "active",
      membershipStart: r.membershipStart,
      membershipEnd: r.membershipEnd,
      duesPending: Number(r.duesPending || 0),
      isMinor: Boolean(r.isMinor),
      guardianName: r.guardianName || undefined,
      guardianPhone: r.guardianPhone || undefined,
      guardianEmail: r.guardianEmail || undefined,
      history: [],
    }));

    // Merge with SEED_MEMBERS (avoiding duplicates by email)
    const existingEmails = new Set(dbMembers.map((m) => m.email.toLowerCase()));
    const combined = [...dbMembers];
    for (const seed of SEED_MEMBERS) {
      if (!existingEmails.has(seed.email.toLowerCase())) {
        combined.push(seed);
      }
    }

    return NextResponse.json({ success: true, source: "database", members: combined });
  } catch (error: unknown) {
    console.warn("[Members API] Error:", error);
    return NextResponse.json({ success: true, source: "seed_fallback", members: SEED_MEMBERS });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!isDbConfigured()) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
    }

    await ensureTablesExist();
    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 });
    }

    const id = data.id || `mem-${crypto.randomUUID().slice(0, 8)}`;
    const memberCode = data.memberCode || `TCC-2026-${(data.planId || "SILV").toUpperCase().slice(0, 4)}-${Math.floor(100 + Math.random() * 900)}`;
    const cleanEmail = (data.email || "").trim().toLowerCase();

    await sql`
      INSERT INTO members (
        id, member_code, full_name, email, phone, dob, plan_id, status,
        membership_start, membership_end, dues_pending, is_minor,
        guardian_name, guardian_phone, guardian_email
      )
      VALUES (
        ${id},
        ${memberCode},
        ${data.fullName},
        ${cleanEmail},
        ${data.phone || null},
        ${data.dob || null},
        ${data.planId || "silver"},
        ${data.status || "active"},
        ${data.membershipStart || new Date().toISOString().split("T")[0]},
        ${data.membershipEnd || new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0]},
        ${Number(data.duesPending || 0)},
        ${Boolean(data.isMinor)},
        ${data.guardianName || null},
        ${data.guardianPhone || null},
        ${data.guardianEmail || null}
      )
      ON CONFLICT (email) DO UPDATE SET
        full_name = ${data.fullName},
        phone = ${data.phone || null},
        plan_id = ${data.planId || "silver"},
        status = ${data.status || "active"};
    `;

    return NextResponse.json({ success: true, id, memberCode });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[Members API POST] Error:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
