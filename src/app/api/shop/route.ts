import { NextResponse } from "next/server";
import { getDb, isDbConfigured, ensureTablesExist } from "@/lib/db";
import { type Product } from "@/lib/orders";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    if (!isDbConfigured()) {
      return NextResponse.json({ success: true, source: "offline_fallback", products: [] });
    }

    await ensureTablesExist();
    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ success: true, source: "offline_fallback", products: [] });
    }

    let rows;
    if (category && category !== "All") {
      rows = await sql`
        SELECT id, sku, name, category, price, stock, low_stock_at as "lowStockAt", tag, brand, sport
        FROM products
        WHERE category = ${category} AND active = true
        ORDER BY id ASC;
      `;
    } else {
      rows = await sql`
        SELECT id, sku, name, category, price, stock, low_stock_at as "lowStockAt", tag, brand, sport
        FROM products
        WHERE active = true
        ORDER BY id ASC;
      `;
    }

    const products: Product[] = rows.map((r: any) => ({
      id: r.id,
      sku: r.sku,
      name: r.name,
      category: r.category,
      price: Number(r.price),
      stock: Number(r.stock),
      lowStockAt: Number(r.lowStockAt),
      tag: r.tag || undefined,
      brand: r.brand,
      sport: r.sport,
    }));

    return NextResponse.json({ success: true, source: "database", products });
  } catch (error: unknown) {
    console.warn("[Shop API GET] Error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const action = data.action; // "restock" | "deduct"

    if (!isDbConfigured()) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
    }

    await ensureTablesExist();
    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ success: false, error: "Database not connected" }, { status: 500 });
    }

    if (action === "restock") {
      const { productId, qty } = data;
      const count = Number(qty || 0);
      await sql`
        UPDATE products
        SET stock = stock + ${count}
        WHERE id = ${productId};
      `;
      await sql`
        INSERT INTO stock_movements (id, product_id, delta, reason)
        VALUES (${`sm_${crypto.randomUUID().slice(0, 8)}`}, ${productId}, ${count}, 'restock');
      `;
      return NextResponse.json({ success: true });
    }

    if (action === "deduct") {
      const { items } = data; // Array of { productId, qty }
      for (const item of items) {
        const qty = Number(item.qty || 1);
        await sql`
          UPDATE products
          SET stock = stock - ${qty}
          WHERE id = ${item.productId} AND stock >= ${qty};
        `;
        await sql`
          INSERT INTO stock_movements (id, product_id, delta, reason)
          VALUES (${`sm_${crypto.randomUUID().slice(0, 8)}`}, ${item.productId}, ${-qty}, 'counter_sale');
        `;
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (error: unknown) {
    console.error("[Shop API POST] Error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
