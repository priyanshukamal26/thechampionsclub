import { NextResponse } from "next/server";
import { getDb, isDbConfigured, ensureTablesExist } from "@/lib/db";
import { DEMO_USERS, PRESET_PASSWORDS, type ClubUser } from "@/lib/auth-context";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cleanEmail = (body.email || "").trim().toLowerCase();
    const cleanPassword = (body.password || "").trim();

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json(
        { success: false, error: "Please provide both email and password." },
        { status: 400 }
      );
    }

    // 1. Check local demo user presets
    const demoKey = Object.keys(DEMO_USERS).find(
      (k) => DEMO_USERS[k].email.toLowerCase() === cleanEmail
    );
    if (demoKey) {
      if (!PRESET_PASSWORDS.includes(cleanPassword)) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid password for this demo profile. Use 'Champions@2026' or 'password123'.",
          },
          { status: 401 }
        );
      }
      return NextResponse.json({ success: true, user: DEMO_USERS[demoKey] });
    }

    // 2. Query Neon Database if configured
    if (isDbConfigured()) {
      await ensureTablesExist();
      const sql = getDb();
      if (sql) {
        const rows = await sql`
          SELECT id, email, password_hash, full_name, role, status, plan_id, is_minor, member_id
          FROM users
          WHERE LOWER(email) = ${cleanEmail}
          LIMIT 1;
        `;

        if (rows.length > 0) {
          const row = rows[0];
          // Check password matches either stored hash or demo preset
          const isPasswordValid =
            row.password_hash === cleanPassword ||
            PRESET_PASSWORDS.includes(cleanPassword);

          if (!isPasswordValid) {
            return NextResponse.json(
              { success: false, error: "Invalid password. Please check your credentials." },
              { status: 401 }
            );
          }

          const user: ClubUser = {
            id: row.id,
            email: row.email,
            fullName: row.full_name,
            role: row.role,
            status: row.status,
            planId: row.plan_id || undefined,
            isMinor: Boolean(row.is_minor),
            memberId: row.member_id || undefined,
          };

          return NextResponse.json({ success: true, user });
        }
      }
    }

    // 3. Fallback invalid credentials
    return NextResponse.json(
      { success: false, error: "Invalid login credentials. Please check your email and password." },
      { status: 401 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[Login API] Error:", msg);
    return NextResponse.json(
      { success: false, error: "Unable to process login. Please try again." },
      { status: 500 }
    );
  }
}
