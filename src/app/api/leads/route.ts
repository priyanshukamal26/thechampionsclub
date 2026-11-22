import { NextResponse } from "next/server";
import { getDb, isDbConfigured, ensureTablesExist } from "@/lib/db";
import { type Lead } from "@/lib/leads";

export async function GET() {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json({ success: true, source: "offline_fallback", leads: [] });
    }

    await ensureTablesExist();
    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ success: true, source: "offline_fallback", leads: [] });
    }

    const rows = await sql`
      SELECT id, name, phone, email, sport, source, status, notes,
             follow_up_date as "followUpAt", assigned_staff as "assignedStaff",
             created_at as "createdAt"
      FROM leads
      ORDER BY created_at DESC;
    `;

    const leads: Lead[] = rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      phone: r.phone,
      email: r.email,
      sport: r.sport,
      type: "enquiry" as const,
      source: r.source || "landing",
      status: r.status,
      notes: [],
      followUpAt: r.followUpAt || undefined,
      assignedStaff: r.assignedStaff || undefined,
      createdAt: r.createdAt,
    }));

    return NextResponse.json({ success: true, source: "database", leads });
  } catch (error: unknown) {
    console.warn("[Leads API GET] Error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
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
      return NextResponse.json({ success: false, error: "Database not connected" }, { status: 500 });
    }

    const id = data.id || `lead_${crypto.randomUUID().slice(0, 8)}`;
    await sql`
      INSERT INTO leads (id, name, phone, email, sport, source, status, notes, follow_up_date, assigned_staff)
      VALUES (
        ${id},
        ${data.name},
        ${data.phone},
        ${data.email},
        ${data.sport || 'Tennis'},
        ${data.source || 'website'},
        ${data.status || 'new'},
        ${data.notes || null},
        ${data.followUpDate || null},
        ${data.assignedStaff || null}
      )
      ON CONFLICT (id) DO UPDATE SET
        status = ${data.status || 'new'},
        notes = ${data.notes || null};
    `;

    return NextResponse.json({ success: true, id });
  } catch (error: unknown) {
    console.error("[Leads API POST] Error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
