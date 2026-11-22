import { NextResponse } from "next/server";
import { getDb, isDbConfigured, ensureTablesExist } from "@/lib/db";
import { FACILITIES, type Facility, type Sport } from "@/lib/bookings";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get("sport") as Sport | "All" | null;

    if (!isDbConfigured()) {
      const filtered = !sport || sport === "All" ? FACILITIES : FACILITIES.filter((f) => f.sport === sport);
      return NextResponse.json({ success: true, source: "offline_fallback", facilities: filtered });
    }

    await ensureTablesExist();
    const sql = getDb();
    if (!sql) {
      const filtered = !sport || sport === "All" ? FACILITIES : FACILITIES.filter((f) => f.sport === sport);
      return NextResponse.json({ success: true, source: "offline_fallback", facilities: filtered });
    }

    let rows;
    if (sport && sport !== "All") {
      rows = await sql`
        SELECT id, name, sport, surface, base_price as "basePrice", lighting, code
        FROM facilities
        WHERE sport = ${sport} AND active = true
        ORDER BY code ASC;
      `;
    } else {
      rows = await sql`
        SELECT id, name, sport, surface, base_price as "basePrice", lighting, code
        FROM facilities
        WHERE active = true
        ORDER BY code ASC;
      `;
    }

    const facilities: Facility[] = rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      sport: r.sport,
      surface: r.surface,
      basePrice: Number(r.basePrice),
      lighting: Boolean(r.lighting),
      code: r.code,
    }));

    return NextResponse.json({ success: true, source: "database", facilities });
  } catch (error: unknown) {
    console.warn("[Facilities API GET] Error:", error);
    return NextResponse.json({ success: true, source: "offline_fallback", facilities: FACILITIES });
  }
}
