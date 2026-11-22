-- =============================================================================
-- The Champions Club — Neon Serverless PostgreSQL Initialization
-- Paste this script into the Neon SQL Editor (https://console.neon.tech)
-- =============================================================================

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

-- Seed Staff & Member Demo Accounts
INSERT INTO users (id, email, password_hash, full_name, role, status, plan_id, is_minor, member_id)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'owner@championsclub.in', 'Champions@2026', 'Rajesh Verma', 'owner', 'active_member', null, false, null),
  ('00000000-0000-0000-0000-000000000003', 'frontdesk@championsclub.in', 'Champions@2026', 'Amit Sharma', 'front_desk', 'active_member', null, false, null),
  ('00000000-0000-0000-0000-000000000008', 'cafe@championsclub.in', 'Champions@2026', 'Meera Nair', 'cafe_manager', 'active_member', null, false, null),
  ('00000000-0000-0000-0000-000000000007', 'shop@championsclub.in', 'Champions@2026', 'Neha Kapoor', 'shop_manager', 'active_member', null, false, null),
  ('00000000-0000-0000-0000-000000000005', 'rohan@championsclub.in', 'Champions@2026', 'Rohan Mehra', 'member', 'active_member', 'gold', false, 'mem-001'),
  ('00000000-0000-0000-0000-000000000006', 'aarav@championsclub.in', 'Champions@2026', 'Aarav Patel', 'member', 'pending_consent', 'junior', true, 'mem-003')
ON CONFLICT (email) DO NOTHING;
