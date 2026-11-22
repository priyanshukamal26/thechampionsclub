import { NextResponse } from "next/server";
import { getDb, isDbConfigured, ensureTablesExist } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const entry = await request.json();
    if (!isDbConfigured()) {
      return NextResponse.json({ success: true, local: true });
    }

    await ensureTablesExist();
    const sql = getDb();
    if (sql) {
      await sql`
        INSERT INTO audit_log (actor_id, actor, role, action, entity, entity_id, details)
        VALUES (
          ${entry.actorId || null},
          ${entry.actor || null},
          ${entry.role || null},
          ${entry.action || "unknown"},
          ${entry.entity || "general"},
          ${entry.entityId || null},
          ${JSON.stringify(entry.details || {})}
        );
      `;
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[Audit API] Trace:", msg);
    return NextResponse.json({ success: true, fallback: true });
  }
}
