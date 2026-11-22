import { NextResponse } from "next/server";
import { getDb, isDbConfigured, ensureTablesExist } from "@/lib/db";
import { type Transaction, type Payable, type StaffMember, type Invoice } from "@/lib/finance";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view"); // "summary" | "transactions" | "payables" | "staff" | "invoices"

    if (!isDbConfigured()) {
      return NextResponse.json({ success: true, source: "offline_fallback" });
    }

    await ensureTablesExist();
    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ success: true, source: "offline_fallback" });
    }

    if (view === "payables") {
      const rows = await sql`
        SELECT id, vendor, category, amount, due_date as "dueDate", status, reference
        FROM payables
        ORDER BY due_date ASC;
      `;
      const payables: Payable[] = rows.map((r: any) => ({
        id: r.id,
        vendor: r.vendor,
        category: r.category,
        amount: Number(r.amount),
        dueDate: r.dueDate,
        status: r.status,
        reference: r.reference,
      }));
      return NextResponse.json({ success: true, payables });
    }

    if (view === "staff") {
      const rows = await sql`
        SELECT id, name, role, department, shift, shift_time as "shiftTime", salary,
               overtime_hours as "overtimeHours", attendance_days as "attendanceDays",
               leaves_taken as "leavesTaken", status, joined, phone
        FROM staff
        ORDER BY id ASC;
      `;
      const staff: StaffMember[] = rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        role: r.role,
        department: r.department,
        shift: r.shift,
        shiftTime: r.shiftTime,
        salary: Number(r.salary),
        overtimeHours: Number(r.overtimeHours || 0),
        attendanceDays: Number(r.attendanceDays || 24),
        leavesTaken: Number(r.leavesTaken || 0),
        status: r.status,
        joined: r.joined,
        phone: r.phone,
      }));
      return NextResponse.json({ success: true, staff });
    }

    if (view === "invoices") {
      const rows = await sql`
        SELECT id, number, client, gstin, invoice_type as "type", description,
               issued_at as "issuedAt", due_at as "dueAt", net, gst, gross, status
        FROM invoices
        ORDER BY issued_at DESC;
      `;
      const invoices: Invoice[] = rows.map((r: any) => ({
        id: r.id,
        number: r.number,
        client: r.client,
        gstin: r.gstin || undefined,
        type: r.type,
        description: r.description,
        issuedAt: r.issuedAt,
        dueAt: r.dueAt,
        net: Number(r.net),
        gst: Number(r.gst),
        gross: Number(r.gross),
        status: r.status,
      }));
      return NextResponse.json({ success: true, invoices });
    }

    // Default view: financial summary and recent transactions
    const [txRows, todayAgg, weekAgg, monthAgg] = await Promise.all([
      sql`
        SELECT id, at, date, source, description, net, gst, gross,
               payment_mode as "paymentMode", tax_code as "taxCode", member_name as "memberName", ref
        FROM transactions
        ORDER BY at DESC
        LIMIT 100;
      `,
      sql`
        SELECT count(*) as count, coalesce(sum(gross), 0) as gross, coalesce(sum(net), 0) as net, coalesce(sum(gst), 0) as gst
        FROM transactions
        WHERE date = to_char(CURRENT_DATE, 'YYYY-MM-DD');
      `,
      sql`
        SELECT count(*) as count, coalesce(sum(gross), 0) as gross, coalesce(sum(net), 0) as net, coalesce(sum(gst), 0) as gst
        FROM transactions
        WHERE at >= date_trunc('week', CURRENT_DATE);
      `,
      sql`
        SELECT count(*) as count, coalesce(sum(gross), 0) as gross, coalesce(sum(net), 0) as net, coalesce(sum(gst), 0) as gst
        FROM transactions
        WHERE at >= date_trunc('month', CURRENT_DATE);
      `,
    ]);

    const transactions: Transaction[] = txRows.map((r: any) => ({
      id: r.id,
      at: r.at,
      date: r.date,
      source: r.source,
      description: r.description,
      net: Number(r.net),
      gst: Number(r.gst),
      gross: Number(r.gross),
      paymentMode: r.paymentMode,
      taxCode: r.taxCode,
      memberName: r.memberName || undefined,
      ref: r.ref || undefined,
    }));

    return NextResponse.json({
      success: true,
      transactions,
      today: {
        count: Number(todayAgg[0]?.count || 0),
        gross: Number(todayAgg[0]?.gross || 0),
        net: Number(todayAgg[0]?.net || 0),
        gst: Number(todayAgg[0]?.gst || 0),
      },
      week: {
        count: Number(weekAgg[0]?.count || 0),
        gross: Number(weekAgg[0]?.gross || 0),
        net: Number(weekAgg[0]?.net || 0),
        gst: Number(weekAgg[0]?.gst || 0),
      },
      month: {
        count: Number(monthAgg[0]?.count || 0),
        gross: Number(monthAgg[0]?.gross || 0),
        net: Number(monthAgg[0]?.net || 0),
        gst: Number(monthAgg[0]?.gst || 0),
      },
    });
  } catch (error: unknown) {
    console.warn("[Finance API GET] Error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const action = data.action;

    if (!isDbConfigured()) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
    }

    await ensureTablesExist();
    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ success: false, error: "Database not connected" }, { status: 500 });
    }

    if (action === "record_transaction") {
      const { tx } = data;
      const net = Math.round((Number(tx.gross) / 1.18) * 100) / 100;
      const gst = Math.round((Number(tx.gross) - net) * 100) / 100;
      await sql`
        INSERT INTO transactions (id, at, date, source, description, net, gst, gross, payment_mode, tax_code, member_name, ref)
        VALUES (
          ${tx.id || `tx_${crypto.randomUUID().slice(0, 8)}`},
          ${tx.at || new Date().toISOString()},
          ${tx.date || new Date().toISOString().slice(0, 10)},
          ${tx.source},
          ${tx.description},
          ${net},
          ${gst},
          ${Number(tx.gross)},
          ${tx.paymentMode || 'upi'},
          ${tx.taxCode || 'SAC 998413'},
          ${tx.memberName || null},
          ${tx.ref || null}
        );
      `;
      return NextResponse.json({ success: true });
    }

    if (action === "pay_payable") {
      const { payableId } = data;
      await sql`
        UPDATE payables
        SET status = 'paid'
        WHERE id = ${payableId};
      `;
      return NextResponse.json({ success: true });
    }

    if (action === "pay_invoice") {
      const { invoiceId } = data;
      await sql`
        UPDATE invoices
        SET status = 'paid'
        WHERE id = ${invoiceId};
      `;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (error: unknown) {
    console.error("[Finance API POST] Error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
