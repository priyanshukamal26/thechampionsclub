import { NextResponse } from "next/server";
import { getDb, isDbConfigured, ensureTablesExist } from "@/lib/db";
import { BAR_MENU, type MenuItem, type ClubTable, type MemberTab } from "@/lib/orders";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view"); // "menu" | "tables" | "tabs" | "kitchen"

    if (!isDbConfigured()) {
      return NextResponse.json({ success: true, source: "offline_fallback" });
    }

    await ensureTablesExist();
    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ success: true, source: "offline_fallback" });
    }

    if (view === "menu") {
      const rows = await sql`
        SELECT id, name, category, price, veg, description, station, prep_min as "prepMin"
        FROM menu_items
        WHERE active = true
        ORDER BY id ASC;
      `;
      const menu: MenuItem[] = rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        category: r.category,
        price: Number(r.price),
        veg: Boolean(r.veg),
        description: r.description || "",
        station: r.station,
        prepMin: Number(r.prepMin || 5),
      }));
      return NextResponse.json({ success: true, menu });
    }

    if (view === "tables") {
      const rows = await sql`
        SELECT id, label, seats, zone, status, seated_at as "seatedAt", server
        FROM bar_tables
        ORDER BY id ASC;
      `;
      const tables: ClubTable[] = rows.map((r: any) => ({
        id: r.id,
        label: r.label,
        seats: Number(r.seats),
        zone: r.zone,
        status: r.status,
        seatedAt: r.seatedAt || undefined,
        server: r.server || undefined,
      }));
      return NextResponse.json({ success: true, tables });
    }

    if (view === "tabs") {
      const rows = await sql`
        SELECT id, member_name as "memberName", member_id as "memberId", table_id as "tableId",
               order_codes as "orderCodes", total, opened_at as "openedAt", status
        FROM bar_tabs
        WHERE status = 'open'
        ORDER BY opened_at DESC;
      `;
      const tabs: MemberTab[] = rows.map((r: any) => ({
        id: r.id,
        memberName: r.memberName,
        memberId: r.memberId || undefined,
        tableId: r.tableId || undefined,
        orderCodes: r.orderCodes || [],
        total: Number(r.total),
        openedAt: r.openedAt,
        status: r.status,
      }));
      return NextResponse.json({ success: true, tabs });
    }

    // Default: return all bar floor status snapshot
    const [tablesRows, tabsRows, menuRows] = await Promise.all([
      sql`SELECT id, label, seats, zone, status, seated_at as "seatedAt", server FROM bar_tables ORDER BY id ASC;`,
      sql`SELECT id, member_name as "memberName", member_id as "memberId", table_id as "tableId", order_codes as "orderCodes", total, opened_at as "openedAt", status FROM bar_tabs WHERE status = 'open' ORDER BY opened_at DESC;`,
      sql`SELECT id, name, category, price, veg, description, station, prep_min as "prepMin" FROM menu_items WHERE active = true ORDER BY id ASC;`,
    ]);

    return NextResponse.json({
      success: true,
      tables: tablesRows.map((r: any) => ({ ...r, seats: Number(r.seats) })),
      tabs: tabsRows.map((r: any) => ({ ...r, total: Number(r.total) })),
      menu: menuRows.map((r: any) => ({ ...r, price: Number(r.price), veg: Boolean(r.veg) })),
    });
  } catch (error: unknown) {
    console.warn("[Bar API GET] Error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const action = data.action; // "set_table_status" | "add_to_tab" | "settle_tab"

    if (!isDbConfigured()) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
    }

    await ensureTablesExist();
    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ success: false, error: "Database not connected" }, { status: 500 });
    }

    if (action === "add_to_tab") {
      const { tab } = data;
      await sql`
        INSERT INTO bar_tabs (id, member_name, member_id, table_id, order_codes, total, status)
        VALUES (
          ${tab.id || `tab_${crypto.randomUUID().slice(0, 8)}`},
          ${tab.memberName},
          ${tab.memberId || null},
          ${tab.tableId || null},
          ${tab.orderCodes || []},
          ${Number(tab.total || 0)},
          ${tab.status || 'open'}
        )
        ON CONFLICT (id) DO UPDATE SET
          order_codes = ${tab.orderCodes || []},
          total = ${Number(tab.total || 0)},
          table_id = ${tab.tableId || null},
          status = ${tab.status || 'open'};
      `;
      return NextResponse.json({ success: true });
    }

    if (action === "set_table_status") {
      const { tableId, status } = data;
      await sql`
        UPDATE bar_tables
        SET status = ${status},
            seated_at = CASE WHEN ${status} = 'occupied' THEN now() ELSE null END
        WHERE id = ${tableId};
      `;
      return NextResponse.json({ success: true });
    }

    if (action === "settle_tab") {
      const { tabId, paymentMode } = data;
      const tabRows = await sql`
        UPDATE bar_tabs
        SET status = 'settled'
        WHERE id = ${tabId}
        RETURNING id, member_name as "memberName", total, table_id as "tableId";
      `;
      if (tabRows.length > 0) {
        const tab = tabRows[0];
        if (tab.tableId) {
          await sql`UPDATE bar_tables SET status = 'available', seated_at = null WHERE id = ${tab.tableId};`;
        }
        // Record in central financial ledger
        const net = Math.round((Number(tab.total) / 1.18) * 100) / 100;
        const gst = Math.round((Number(tab.total) - net) * 100) / 100;
        await sql`
          INSERT INTO transactions (id, at, date, source, description, net, gst, gross, payment_mode, tax_code, member_name, ref)
          VALUES (
            ${`tx_${crypto.randomUUID().slice(0, 8)}`},
            now(),
            to_char(CURRENT_DATE, 'YYYY-MM-DD'),
            'bar',
            ${'Member tab settled · ' + tab.memberName},
            ${net},
            ${gst},
            ${Number(tab.total)},
            ${paymentMode || 'upi'},
            'SAC 996331',
            ${tab.memberName},
            ${tabId}
          );
        `;
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (error: unknown) {
    console.error("[Bar API POST] Error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
