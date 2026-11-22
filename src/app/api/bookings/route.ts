import { NextResponse } from "next/server";
import { getDb, isDbConfigured, ensureTablesExist } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const memberId = searchParams.get("memberId");

    if (!isDbConfigured()) {
      return NextResponse.json({ success: true, source: "offline", bookings: [] });
    }

    await ensureTablesExist();
    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ success: true, source: "offline", bookings: [] });
    }

    let rows;
    if (date && memberId) {
      rows = await sql`
        SELECT 
          id, facility_id as "facilityId", member_id as "memberId",
          member_name as "memberName", date, start_time as "start",
          60 as "durationMin", price, status, 'member' as source,
          'plan' as "paymentMode", created_at as "bookedAt"
        FROM bookings
        WHERE date = ${date} AND member_id = ${memberId}
        ORDER BY start_time ASC;
      `;
    } else if (date) {
      rows = await sql`
        SELECT 
          id, facility_id as "facilityId", member_id as "memberId",
          member_name as "memberName", date, start_time as "start",
          60 as "durationMin", price, status, 'member' as source,
          'plan' as "paymentMode", created_at as "bookedAt"
        FROM bookings
        WHERE date = ${date}
        ORDER BY start_time ASC;
      `;
    } else {
      rows = await sql`
        SELECT 
          id, facility_id as "facilityId", member_id as "memberId",
          member_name as "memberName", date, start_time as "start",
          60 as "durationMin", price, status, 'member' as source,
          'plan' as "paymentMode", created_at as "bookedAt"
        FROM bookings
        ORDER BY date DESC, start_time ASC
        LIMIT 100;
      `;
    }

    return NextResponse.json({ success: true, source: "database", bookings: rows });
  } catch (error: unknown) {
    console.warn("[Bookings API GET] Error:", error);
    return NextResponse.json({ success: true, source: "offline_fallback", bookings: [] });
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

    const id = data.id || `bk_${crypto.randomUUID().slice(0, 8)}`;
    const startTime = data.start || "18:00";
    const endTime = data.end || "19:00";

    await sql`
      INSERT INTO bookings (
        id, facility_id, member_id, member_name, date, start_time, end_time, price, status
      )
      VALUES (
        ${id},
        ${data.facilityId},
        ${data.memberId},
        ${data.memberName},
        ${data.date},
        ${startTime},
        ${endTime},
        ${Number(data.price || 0)},
        ${data.status || "confirmed"}
      )
      ON CONFLICT (id) DO UPDATE SET
        status = ${data.status || "confirmed"};
    `;

    return NextResponse.json({ success: true, id });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[Bookings API POST] Error:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
