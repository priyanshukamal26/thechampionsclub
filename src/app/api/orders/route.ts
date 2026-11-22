import { NextResponse } from "next/server";
import { getDb, isDbConfigured, ensureTablesExist } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get("channel");
    const memberName = searchParams.get("memberName");

    if (!isDbConfigured()) {
      return NextResponse.json({ success: true, source: "offline", orders: [] });
    }

    await ensureTablesExist();
    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ success: true, source: "offline", orders: [] });
    }

    let rows;
    if (channel && memberName) {
      rows = await sql`
        SELECT 
          id, order_code as code, channel, items as lines, member_id as "memberId",
          member_name as "memberName", subtotal, discount, tax as gst, total,
          payment_method as "paymentMode", status, created_at as "placedAt"
        FROM orders
        WHERE channel = ${channel} AND LOWER(member_name) = ${memberName.toLowerCase()}
        ORDER BY created_at DESC;
      `;
    } else if (channel) {
      rows = await sql`
        SELECT 
          id, order_code as code, channel, items as lines, member_id as "memberId",
          member_name as "memberName", subtotal, discount, tax as gst, total,
          payment_method as "paymentMode", status, created_at as "placedAt"
        FROM orders
        WHERE channel = ${channel}
        ORDER BY created_at DESC;
      `;
    } else if (memberName) {
      rows = await sql`
        SELECT 
          id, order_code as code, channel, items as lines, member_id as "memberId",
          member_name as "memberName", subtotal, discount, tax as gst, total,
          payment_method as "paymentMode", status, created_at as "placedAt"
        FROM orders
        WHERE LOWER(member_name) = ${memberName.toLowerCase()}
        ORDER BY created_at DESC;
      `;
    } else {
      rows = await sql`
        SELECT 
          id, order_code as code, channel, items as lines, member_id as "memberId",
          member_name as "memberName", subtotal, discount, tax as gst, total,
          payment_method as "paymentMode", status, created_at as "placedAt"
        FROM orders
        ORDER BY created_at DESC
        LIMIT 100;
      `;
    }

    return NextResponse.json({ success: true, source: "database", orders: rows });
  } catch (error: unknown) {
    console.warn("[Orders API GET] Error:", error);
    return NextResponse.json({ success: true, source: "offline_fallback", orders: [] });
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

    const id = data.id || `ord_${crypto.randomUUID().slice(0, 8)}`;
    const orderCode = data.code || `#TCC-${Math.floor(300 + Math.random() * 700)}`;

    await sql`
      INSERT INTO orders (
        id, order_code, member_id, member_name, channel, items,
        subtotal, discount, tax, total, payment_method, status
      )
      VALUES (
        ${id},
        ${orderCode},
        ${data.memberId || null},
        ${data.memberName},
        ${data.channel || "bar"},
        ${JSON.stringify(data.lines || [])},
        ${Number(data.subtotal || 0)},
        ${Number(data.discount || 0)},
        ${Number(data.gst || 0)},
        ${Number(data.total || 0)},
        ${data.paymentMode || "upi"},
        ${data.status || "placed"}
      )
      ON CONFLICT (id) DO UPDATE SET
        status = ${data.status || "placed"};
    `;

    return NextResponse.json({ success: true, id, orderCode });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[Orders API POST] Error:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
