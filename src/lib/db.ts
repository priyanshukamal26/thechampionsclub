import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Neon Serverless PostgreSQL Database Connector for The Champions Club.
 * Works seamlessly in Next.js Serverless and Edge runtime without persistent connection limits.
 */

export function getDatabaseUrl(): string | undefined {
  const raw =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEON_DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL;
  if (!raw) return undefined;
  const trimmed = raw.trim().replace(/^["']|["']$/g, "");
  // Sanitize any typo in connection parameters (e.g. channel_binding=requiree)
  return trimmed.replace("channel_binding=requiree", "channel_binding=require");
}

export function isDbConfigured(): boolean {
  const url = getDatabaseUrl();
  return Boolean(
    url &&
      !url.includes("placeholder") &&
      (url.startsWith("postgres://") || url.startsWith("postgresql://"))
  );
}

let cachedSql: NeonQueryFunction<false, false> | null = null;

export function getDb(): NeonQueryFunction<false, false> | null {
  const url = getDatabaseUrl();
  if (!url || !isDbConfigured()) return null;

  if (!cachedSql) {
    cachedSql = neon(url);
  }
  return cachedSql;
}

/**
 * Ensures required PostgreSQL tables exist in the Neon database.
 */
let tablesInitialized = false;

export async function ensureTablesExist(): Promise<boolean> {
  const sql = getDb();
  if (!sql) return false;
  if (tablesInitialized) return true;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id text PRIMARY KEY,
        email text UNIQUE NOT NULL,
        password_hash text NOT NULL,
        full_name text NOT NULL,
        role text NOT NULL DEFAULT 'member',
        status text NOT NULL DEFAULT 'active_member',
        plan_id text,
        is_minor boolean DEFAULT false,
        member_id text,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS profiles (
        id text PRIMARY KEY,
        email text UNIQUE NOT NULL,
        full_name text NOT NULL,
        role text NOT NULL DEFAULT 'member',
        status text NOT NULL DEFAULT 'active_member',
        phone text,
        dob text,
        plan_id text,
        is_minor boolean DEFAULT false,
        member_id text,
        created_at timestamptz DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS members (
        id text PRIMARY KEY,
        member_code text UNIQUE NOT NULL,
        full_name text NOT NULL,
        email text UNIQUE NOT NULL,
        phone text,
        dob text,
        plan_id text NOT NULL,
        status text NOT NULL DEFAULT 'active',
        membership_start text NOT NULL,
        membership_end text NOT NULL,
        dues_pending numeric(12, 2) DEFAULT 0.0,
        emergency_notes text,
        is_minor boolean DEFAULT false,
        guardian_name text,
        guardian_phone text,
        guardian_email text,
        consent_verified_at text,
        consent_verified_by text,
        staff_notes text[],
        created_at timestamptz DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id text PRIMARY KEY,
        facility_id text NOT NULL,
        member_id text NOT NULL,
        member_name text NOT NULL,
        plan_id text,
        date text NOT NULL,
        start_time text NOT NULL,
        end_time text NOT NULL,
        duration_min integer DEFAULT 60,
        price numeric(12, 2) DEFAULT 0.0,
        status text NOT NULL DEFAULT 'confirmed',
        source text NOT NULL DEFAULT 'member',
        payment_mode text NOT NULL DEFAULT 'plan',
        booked_at timestamptz DEFAULT now(),
        cancelled_at timestamptz,
        cancellation_fee numeric(12, 2) DEFAULT 0.0,
        checked_in boolean DEFAULT false,
        created_at timestamptz DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id text PRIMARY KEY,
        order_code text UNIQUE NOT NULL,
        channel text NOT NULL,
        items jsonb NOT NULL,
        member_id text,
        member_name text NOT NULL,
        plan_id text,
        subtotal numeric(12, 2) NOT NULL,
        discount_pct numeric(4, 2) DEFAULT 0.0,
        discount numeric(12, 2) DEFAULT 0.0,
        delivery_fee numeric(12, 2) DEFAULT 0.0,
        tax numeric(12, 2) DEFAULT 0.0,
        total numeric(12, 2) NOT NULL,
        payment_method text NOT NULL,
        status text NOT NULL DEFAULT 'placed',
        fulfilment text,
        table_id text,
        address text,
        phone text,
        otp text,
        pickup_code text,
        eta_min integer,
        staff text,
        paid boolean DEFAULT false,
        created_at timestamptz DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS bar_tabs (
        id text PRIMARY KEY,
        member_name text NOT NULL,
        member_id text,
        table_id text,
        order_codes text[] NOT NULL DEFAULT '{}',
        total numeric(12, 2) NOT NULL DEFAULT 0.0,
        opened_at timestamptz NOT NULL DEFAULT now(),
        status text NOT NULL DEFAULT 'open'
      );
    `;

    // Seed preset staff and demo users if missing
    await sql`
      INSERT INTO users (id, email, password_hash, full_name, role, status, plan_id, is_minor, member_id)
      VALUES
        ('00000000-0000-0000-0000-000000000001', 'owner@championsclub.in', 'Champions@2026', 'Rajesh Verma', 'owner', 'active_member', null, false, null),
        ('00000000-0000-0000-0000-000000000003', 'frontdesk@championsclub.in', 'Champions@2026', 'Amit Sharma', 'front_desk', 'active_member', null, false, null),
        ('00000000-0000-0000-0000-000000000008', 'cafe@championsclub.in', 'Champions@2026', 'Meera Nair', 'cafe_manager', 'active_member', null, false, null),
        ('00000000-0000-0000-0000-000000000007', 'shop@championsclub.in', 'Champions@2026', 'Neha Kapoor', 'shop_manager', 'active_member', null, false, null),
        ('00000000-0000-0000-0000-000000000005', 'rohan@championsclub.in', 'Champions@2026', 'Rohan Mehra', 'member', 'active_member', 'gold', false, 'mem-001'),
        ('00000000-0000-0000-0000-000000000006', 'aarav@championsclub.in', 'Champions@2026', 'Aarav Patel', 'member', 'pending_consent', 'junior', true, 'mem-003')
      ON CONFLICT (email) DO NOTHING;
    `;

    // Ensure member records in central members table match all member accounts
    await sql`
      INSERT INTO members (id, member_code, full_name, email, plan_id, status, membership_start, membership_end)
      SELECT 
        COALESCE(member_id, 'mem-' || substr(id, 1, 8)),
        'TCC-2026-' || UPPER(substr(COALESCE(plan_id, 'SILV'), 1, 4)) || '-' || lpad(abs(('x' || substr(md5(email), 1, 4))::bit(16)::int % 900 + 100)::text, 3, '0'),
        full_name,
        email,
        COALESCE(plan_id, 'silver'),
        CASE WHEN status = 'pending_consent' THEN 'pending_consent' ELSE 'active' END,
        to_char(CURRENT_DATE, 'YYYY-MM-DD'),
        to_char(CURRENT_DATE + interval '1 year', 'YYYY-MM-DD')
      FROM users
      WHERE role = 'member'
      ON CONFLICT (email) DO NOTHING;
    `;

    tablesInitialized = true;
    return true;
  } catch (err) {
    console.warn("[Neon DB] Schema check warning:", err);
    return false;
  }
}
