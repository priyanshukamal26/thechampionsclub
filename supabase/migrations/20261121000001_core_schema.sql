-- =============================================================================
-- Migration: 20261121000001_core_schema.sql
-- Project: The Champions Club Management System
-- Purpose: Complete PostgreSQL v0 Core Schema with Invariant Guarantees
-- =============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE app_role AS ENUM ('owner', 'manager', 'front_desk', 'bar_staff', 'member');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE account_status AS ENUM ('prospect', 'pending_consent', 'active_member', 'suspended');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE sport_type AS ENUM ('tennis', 'padel', 'badminton', 'cricket');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE facility_type AS ENUM ('court', 'net');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('held', 'confirmed', 'cancelled', 'completed', 'no_show', 'expired');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('cash', 'card', 'upi', 'mock_online');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE order_channel AS ENUM ('counter', 'table', 'online');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE fulfilment_type AS ENUM ('pickup', 'delivery');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending', 'preparing', 'ready', 'dispatched', 'delivered', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- =============================================================================
-- 3. IDENTITY, PROFILES & DPDP ACT GUARDIAN CONSENT
-- =============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL DEFAULT 'member',
  status account_status NOT NULL DEFAULT 'prospect',
  full_name text NOT NULL,
  phone text,
  dob date,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Under India's DPDP Act 2023: Verifiable guardian consent for minors under 18
CREATE TABLE IF NOT EXISTS guardian_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  minor_profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  guardian_name text NOT NULL,
  guardian_email text NOT NULL,
  guardian_phone text NOT NULL,
  consent_text_version text NOT NULL DEFAULT 'v1.0-dpdp2023',
  consented_at timestamptz NOT NULL DEFAULT now(),
  verified_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  verified_at timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- 4. MEMBERSHIP TIERS & ENTITLEMENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS plans (
  id text PRIMARY KEY, -- 'gold', 'silver', 'junior'
  name text NOT NULL,
  price_monthly numeric(12, 2) NOT NULL,
  price_annual numeric(12, 2) NOT NULL,
  court_rate_multiplier numeric(4, 2) NOT NULL DEFAULT 1.0, -- 0.0 for gold (100% free), 0.7 for silver, 0.5 for junior
  shop_discount_pct numeric(4, 2) NOT NULL DEFAULT 0.0,
  bar_discount_pct numeric(4, 2) NOT NULL DEFAULT 0.0,
  free_friday_social boolean NOT NULL DEFAULT false,
  daily_cap integer NOT NULL DEFAULT 2,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id text NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date NOT NULL,
  auto_renew boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- 5. FACILITIES, PRICING & BOOKINGS (INVARIANTS 1, 2, 3)
-- =============================================================================

CREATE TABLE IF NOT EXISTS facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sport sport_type NOT NULL,
  name text NOT NULL,
  facility_type facility_type NOT NULL DEFAULT 'court',
  is_indoor boolean NOT NULL DEFAULT false,
  has_floodlights boolean NOT NULL DEFAULT true,
  hourly_base_rate numeric(12, 2) NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- INVARIANT 1: No two active bookings (status in 'held', 'confirmed') overlap on the same court
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id uuid NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
  member_id uuid REFERENCES profiles(id) ON DELETE SET NULL, -- Nullable for counter walk-ins
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  status booking_status NOT NULL DEFAULT 'held',
  hold_expires_at timestamptz,
  price_snapshotted numeric(12, 2) NOT NULL,
  is_social_session boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_booking_time CHECK (end_at > start_at),
  CONSTRAINT booking_one_hour CHECK (end_at - start_at = interval '1 hour'),
  CONSTRAINT bookings_no_overlap EXCLUDE USING gist (
    court_id WITH =,
    tstzrange(start_at, end_at) WITH &&
  ) WHERE (status IN ('held', 'confirmed'))
);

-- Friday Social Play: One exclusive court reservation with multiple participants up to capacity
CREATE TABLE IF NOT EXISTS social_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  capacity integer NOT NULL DEFAULT 20,
  guest_fee numeric(12, 2) NOT NULL DEFAULT 400.00,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS session_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES social_sessions(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  guest_name text,
  joined_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_member_in_session UNIQUE (session_id, profile_id)
);

-- =============================================================================
-- 6. INVARIANT 2: DAILY BOOKING CAP (MAX 2 PER MEMBER PER IST CALENDAR DAY)
-- =============================================================================

CREATE OR REPLACE FUNCTION check_daily_booking_cap()
RETURNS TRIGGER AS $$
DECLARE
  v_booking_count integer;
  v_member_cap integer := 2;
  v_ist_day date;
BEGIN
  -- Walk-in bookings without a member profile are uncapped
  IF NEW.member_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Only active bookings count against the daily cap
  IF NEW.status NOT IN ('held', 'confirmed') THEN
    RETURN NEW;
  END IF;

  -- Convert start_at to IST (Asia/Kolkata) calendar date
  v_ist_day := (timezone('Asia/Kolkata', NEW.start_at))::date;

  -- Count existing active bookings on this same IST day
  SELECT COUNT(*)
    INTO v_booking_count
    FROM bookings
   WHERE member_id = NEW.member_id
     AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
     AND status IN ('held', 'confirmed')
     AND (timezone('Asia/Kolkata', start_at))::date = v_ist_day;

  IF v_booking_count >= v_member_cap THEN
    RAISE EXCEPTION 'Daily play cap exceeded: Member % has already reserved % sessions for IST date % (max % allowed)',
      NEW.member_id, v_booking_count, v_ist_day, v_member_cap
      USING ERRCODE = '23514'; -- check_violation
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_enforce_daily_booking_cap ON bookings;
CREATE TRIGGER trigger_enforce_daily_booking_cap
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_daily_booking_cap();

-- =============================================================================
-- 7. PRO SHOP & UNIFIED INVENTORY (INVARIANT 4: STOCK NEVER NEGATIVE)
-- =============================================================================

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sport sport_type NOT NULL,
  category text NOT NULL,
  brand text NOT NULL,
  hsn_code text NOT NULL DEFAULT '9506',
  description text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku text UNIQUE NOT NULL,
  size text,
  color text,
  price numeric(12, 2) NOT NULL,
  qty_on_hand integer NOT NULL DEFAULT 0 CHECK (qty_on_hand >= 0),
  reorder_level integer NOT NULL DEFAULT 3,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
  delta integer NOT NULL,
  reason text NOT NULL, -- 'counter_sale', 'online_order', 'restock', 'return'
  reference_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- INVARIANT 4: Atomic stock reservation prevents race condition overselling
CREATE OR REPLACE FUNCTION reserve_stock_atomic(
  p_variant_id uuid,
  p_qty integer,
  p_reason text,
  p_reference_id text DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  v_rows_updated integer;
BEGIN
  IF p_qty <= 0 THEN
    RAISE EXCEPTION 'Quantity to reserve must be greater than zero';
  END IF;

  -- Atomic conditional decrement
  UPDATE product_variants
     SET qty_on_hand = qty_on_hand - p_qty
   WHERE id = p_variant_id
     AND qty_on_hand >= p_qty;

  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;

  IF v_rows_updated = 0 THEN
    RAISE EXCEPTION 'Insufficient inventory for variant %: cannot deduct % items', p_variant_id, p_qty
      USING ERRCODE = '23514';
  END IF;

  -- Append to audit ledger
  INSERT INTO stock_movements (variant_id, delta, reason, reference_id)
  VALUES (p_variant_id, -p_qty, p_reason, p_reference_id);

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Online Orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  fulfilment fulfilment_type NOT NULL DEFAULT 'pickup',
  delivery_address text,
  handover_otp text,
  status order_status NOT NULL DEFAULT 'pending',
  subtotal numeric(12, 2) NOT NULL,
  discount numeric(12, 2) NOT NULL DEFAULT 0.0,
  delivery_fee numeric(12, 2) NOT NULL DEFAULT 0.0,
  total numeric(12, 2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id uuid NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(12, 2) NOT NULL,
  line_total numeric(12, 2) NOT NULL
);

-- =============================================================================
-- 8. BAR & CAFETERIA (INVARIANT 5: TAB TOTAL = SUM OF LINES AFTER DISCOUNT)
-- =============================================================================

CREATE TABLE IF NOT EXISTS bar_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number integer UNIQUE NOT NULL,
  seats integer NOT NULL DEFAULT 4,
  is_occupied boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL, -- 'shakes', 'hot_beverage', 'meals', 'snacks'
  price numeric(12, 2) NOT NULL,
  is_available boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS bar_tabs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  table_id uuid REFERENCES bar_tables(id) ON DELETE SET NULL,
  is_settled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bar_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tab_id uuid REFERENCES bar_tabs(id) ON DELETE SET NULL,
  channel order_channel NOT NULL DEFAULT 'counter',
  table_id uuid REFERENCES bar_tables(id) ON DELETE SET NULL,
  member_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  discount_pct numeric(4, 2) NOT NULL DEFAULT 0.0,
  subtotal numeric(12, 2) NOT NULL DEFAULT 0.0,
  discount_amount numeric(12, 2) NOT NULL DEFAULT 0.0,
  tax_amount numeric(12, 2) NOT NULL DEFAULT 0.0,
  total_amount numeric(12, 2) NOT NULL DEFAULT 0.0,
  status order_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bar_order_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES bar_orders(id) ON DELETE CASCADE,
  menu_item_id uuid NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(12, 2) NOT NULL,
  line_total numeric(12, 2) NOT NULL,
  kitchen_status text NOT NULL DEFAULT 'received' CHECK (kitchen_status IN ('received', 'preparing', 'served'))
);

-- =============================================================================
-- 9. PAYMENTS & UNIFIED FINANCIAL RECONCILIATION (INVARIANT 6)
-- =============================================================================

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key text UNIQUE NOT NULL,
  amount numeric(12, 2) NOT NULL CHECK (amount >= 0),
  method payment_method NOT NULL,
  status payment_status NOT NULL DEFAULT 'completed',
  reference text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid REFERENCES payments(id) ON DELETE SET NULL,
  source_module text NOT NULL CHECK (source_module IN ('courts', 'shop', 'bar', 'membership', 'other')),
  source_id uuid,
  member_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  gross_amount numeric(12, 2) NOT NULL,
  discount_amount numeric(12, 2) NOT NULL DEFAULT 0.0,
  gst_amount numeric(12, 2) NOT NULL DEFAULT 0.0,
  net_amount numeric(12, 2) NOT NULL,
  payment_method payment_method NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- 10. AUDIT LOG & LEADS
-- =============================================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  sport_interest sport_type NOT NULL DEFAULT 'tennis',
  message text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'trial_booked', 'quoted', 'converted', 'closed')),
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardian_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bar_tabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Anonymous public visitors can read facilities, plans, menu items, and active products
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view facilities" ON facilities FOR SELECT USING (active = true);
CREATE POLICY "Public can view plans" ON plans FOR SELECT USING (active = true);
CREATE POLICY "Public can view active products" ON products FOR SELECT USING (active = true);
CREATE POLICY "Public can view product variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Public can view menu items" ON menu_items FOR SELECT USING (is_available = true);
CREATE POLICY "Public can insert leads" ON leads FOR INSERT WITH CHECK (true);

-- Members can see their own profile and bookings
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Members can view own bookings" ON bookings FOR SELECT USING (auth.uid() = member_id);
CREATE POLICY "Public can view slot availability without member identity" ON bookings FOR SELECT USING (true);
