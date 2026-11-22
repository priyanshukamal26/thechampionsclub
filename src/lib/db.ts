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
        is_minor boolean DEFAULT false,
        guardian_name text,
        guardian_phone text,
        guardian_email text,
        consent_verified_at text,
        consent_verified_by text,
        created_at timestamptz DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS audit_log (
        id text PRIMARY KEY DEFAULT gen_random_uuid(),
        actor_id text,
        actor text,
        role text,
        action text NOT NULL,
        entity text NOT NULL,
        entity_id text,
        details jsonb,
        created_at timestamptz DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id text PRIMARY KEY,
        facility_id text NOT NULL,
        member_id text NOT NULL,
        member_name text NOT NULL,
        date text NOT NULL,
        start_time text NOT NULL,
        end_time text NOT NULL,
        price numeric(12, 2) DEFAULT 0.0,
        status text NOT NULL DEFAULT 'confirmed',
        created_at timestamptz DEFAULT now()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id text PRIMARY KEY,
        order_code text UNIQUE NOT NULL,
        member_id text,
        member_name text NOT NULL,
        channel text NOT NULL,
        items jsonb NOT NULL,
        subtotal numeric(12, 2) NOT NULL,
        discount numeric(12, 2) DEFAULT 0.0,
        tax numeric(12, 2) DEFAULT 0.0,
        total numeric(12, 2) NOT NULL,
        payment_method text NOT NULL,
        status text NOT NULL DEFAULT 'completed',
        created_at timestamptz DEFAULT now()
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

    tablesInitialized = true;
    return true;
  } catch (err) {
    console.warn("[Neon DB] Schema check warning:", err);
    return false;
  }
}
