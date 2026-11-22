-- =============================================================================
-- Migration: 001_full_production_schema.sql
-- Project: The Champions Club Management System
-- Purpose: Complete Production PostgreSQL Schema on Neon with Invariants
-- =============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 2. IDENTITY, PROFILES & MEMBERSHIP
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

CREATE TABLE IF NOT EXISTS guardian_consents (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  member_id text NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  guardian_name text NOT NULL,
  guardian_email text NOT NULL,
  guardian_phone text NOT NULL,
  consent_text_version text NOT NULL DEFAULT 'v1.0-dpdp2023',
  consented_at timestamptz NOT NULL DEFAULT now(),
  verified_by text,
  verified_at timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- 3. FACILITIES & COURT BOOKINGS (INVARIANTS 1, 2)
-- =============================================================================

CREATE TABLE IF NOT EXISTS facilities (
  id text PRIMARY KEY,
  name text NOT NULL,
  sport text NOT NULL,
  surface text NOT NULL,
  base_price numeric(12, 2) NOT NULL,
  lighting boolean NOT NULL DEFAULT true,
  code text NOT NULL,
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS bookings (
  id text PRIMARY KEY,
  facility_id text NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
  member_id text NOT NULL,
  member_name text NOT NULL,
  plan_id text,
  date text NOT NULL,
  start_time text NOT NULL,
  duration_min integer NOT NULL DEFAULT 60,
  price numeric(12, 2) NOT NULL DEFAULT 0.0,
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  source text NOT NULL DEFAULT 'member',
  payment_mode text NOT NULL DEFAULT 'plan',
  booked_at timestamptz DEFAULT now(),
  cancelled_at timestamptz,
  cancellation_fee numeric(12, 2) DEFAULT 0.0,
  checked_in boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS social_sessions (
  id text PRIMARY KEY,
  date text NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  title text NOT NULL,
  court_ids text[] NOT NULL,
  capacity integer NOT NULL DEFAULT 20,
  guest_fee numeric(12, 2) NOT NULL DEFAULT 400.0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS session_participants (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_id text NOT NULL REFERENCES social_sessions(id) ON DELETE CASCADE,
  player_id text,
  name text NOT NULL,
  member_id text,
  player_type text NOT NULL DEFAULT 'gold',
  joined_at timestamptz NOT NULL DEFAULT now(),
  paid boolean NOT NULL DEFAULT true,
  payment_mode text,
  CONSTRAINT unique_session_player UNIQUE (session_id, name)
);

-- =============================================================================
-- 4. PRO SHOP & UNIFIED INVENTORY
-- =============================================================================

CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  sku text UNIQUE NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  price numeric(12, 2) NOT NULL,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  low_stock_at integer NOT NULL DEFAULT 4,
  tag text,
  brand text NOT NULL,
  sport text NOT NULL,
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id text NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  delta integer NOT NULL,
  reason text NOT NULL,
  reference_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- 5. BAR, CAFETERIA & DINING
-- =============================================================================

CREATE TABLE IF NOT EXISTS bar_tables (
  id text PRIMARY KEY,
  label text UNIQUE NOT NULL,
  seats integer NOT NULL DEFAULT 4,
  zone text NOT NULL DEFAULT 'Lounge',
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'occupied')),
  seated_at timestamptz,
  server text
);

CREATE TABLE IF NOT EXISTS menu_items (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  price numeric(12, 2) NOT NULL,
  veg boolean NOT NULL DEFAULT true,
  description text,
  station text NOT NULL DEFAULT 'bar' CHECK (station IN ('bar', 'kitchen')),
  prep_min integer NOT NULL DEFAULT 5,
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS bar_tabs (
  id text PRIMARY KEY,
  member_name text NOT NULL,
  member_id text,
  table_id text REFERENCES bar_tables(id) ON DELETE SET NULL,
  order_codes text[] NOT NULL DEFAULT '{}',
  total numeric(12, 2) NOT NULL DEFAULT 0.0,
  opened_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'settled'))
);

-- =============================================================================
-- 6. ORDERS (PRO SHOP & BAR/CAFETERIA UNIFIED)
-- =============================================================================

CREATE TABLE IF NOT EXISTS orders (
  id text PRIMARY KEY,
  order_code text UNIQUE NOT NULL,
  channel text NOT NULL CHECK (channel IN ('shop', 'bar')),
  items jsonb NOT NULL,
  member_id text,
  member_name text NOT NULL,
  plan_id text,
  subtotal numeric(12, 2) NOT NULL,
  discount_pct numeric(4, 2) NOT NULL DEFAULT 0.0,
  discount numeric(12, 2) NOT NULL DEFAULT 0.0,
  delivery_fee numeric(12, 2) NOT NULL DEFAULT 0.0,
  tax numeric(12, 2) NOT NULL DEFAULT 0.0,
  total numeric(12, 2) NOT NULL,
  payment_method text NOT NULL,
  status text NOT NULL DEFAULT 'placed' CHECK (status IN ('placed', 'preparing', 'ready', 'dispatched', 'delivered', 'completed', 'cancelled')),
  fulfilment text,
  table_id text,
  address text,
  phone text,
  otp text,
  pickup_code text,
  eta_min integer,
  staff text,
  paid boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- =============================================================================
-- 7. UNIFIED FINANCIAL REVENUE LEDGER, PAYABLES, PAYROLL & INVOICES
-- =============================================================================

CREATE TABLE IF NOT EXISTS transactions (
  id text PRIMARY KEY,
  at timestamptz NOT NULL DEFAULT now(),
  date text NOT NULL,
  source text NOT NULL CHECK (source IN ('court', 'shop', 'bar', 'membership', 'social', 'fee')),
  description text NOT NULL,
  net numeric(12, 2) NOT NULL,
  gst numeric(12, 2) NOT NULL,
  gross numeric(12, 2) NOT NULL,
  payment_mode text NOT NULL CHECK (payment_mode IN ('upi', 'card', 'cash', 'tab')),
  tax_code text NOT NULL,
  member_name text,
  ref text
);

CREATE TABLE IF NOT EXISTS payables (
  id text PRIMARY KEY,
  vendor text NOT NULL,
  category text NOT NULL,
  amount numeric(12, 2) NOT NULL,
  due_date text NOT NULL,
  status text NOT NULL DEFAULT 'due' CHECK (status IN ('due', 'scheduled', 'paid')),
  reference text NOT NULL
);

CREATE TABLE IF NOT EXISTS staff (
  id text PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL,
  department text NOT NULL,
  shift text NOT NULL,
  shift_time text NOT NULL,
  salary numeric(12, 2) NOT NULL,
  overtime_hours integer NOT NULL DEFAULT 0,
  attendance_days integer NOT NULL DEFAULT 24,
  leaves_taken integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'on_duty' CHECK (status IN ('on_duty', 'off', 'leave')),
  joined text NOT NULL,
  phone text NOT NULL
);

CREATE TABLE IF NOT EXISTS leave_requests (
  id text PRIMARY KEY,
  staff_id text NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  staff_name text NOT NULL,
  role text NOT NULL,
  leave_type text NOT NULL CHECK (leave_type IN ('Casual', 'Sick', 'Comp-off', 'Unpaid')),
  from_date text NOT NULL,
  to_date text NOT NULL,
  days integer NOT NULL DEFAULT 1,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at timestamptz DEFAULT now(),
  decided_by text
);

CREATE TABLE IF NOT EXISTS invoices (
  id text PRIMARY KEY,
  number text UNIQUE NOT NULL,
  client text NOT NULL,
  gstin text,
  invoice_type text NOT NULL CHECK (invoice_type IN ('membership', 'business')),
  description text NOT NULL,
  issued_at text NOT NULL,
  due_at text NOT NULL,
  net numeric(12, 2) NOT NULL,
  gst numeric(12, 2) NOT NULL,
  gross numeric(12, 2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue'))
);

CREATE TABLE IF NOT EXISTS share_links (
  id text PRIMARY KEY,
  token text UNIQUE NOT NULL,
  period text NOT NULL,
  scope text NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- =============================================================================
-- 8. LEADS & AUDIT LOG
-- =============================================================================

CREATE TABLE IF NOT EXISTS leads (
  id text PRIMARY KEY,
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  sport text NOT NULL,
  source text NOT NULL DEFAULT 'website',
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'trial_booked', 'converted', 'lost')),
  notes text,
  follow_up_date text,
  assigned_staff text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  actor_id text,
  actor text,
  role text,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- =============================================================================
-- 9. BASELINE SEED DATA INSERTION
-- =============================================================================

-- Facilities: 18 Official Arenas
INSERT INTO facilities (id, name, sport, surface, base_price, lighting, code) VALUES
  ('tc1', 'Centre Court 1', 'Tennis', 'ITF hard · US Open blue', 1200.00, true, 'T-01'),
  ('tc2', 'Centre Court 2', 'Tennis', 'ITF hard · Melbourne blue', 1200.00, true, 'T-02'),
  ('tc3', 'Clay Court 1', 'Tennis', 'European red clay', 1000.00, true, 'T-03'),
  ('tc4', 'Clay Court 2', 'Tennis', 'European red clay', 1000.00, false, 'T-04'),
  ('tc5', 'Grass Court', 'Tennis', 'Natural rye grass', 1500.00, false, 'T-05'),
  ('tc6', 'Academy Court', 'Tennis', 'Cushioned acrylic', 800.00, true, 'T-06'),
  ('pc1', 'Panoramic Padel 1', 'Padel', '12mm tempered glass', 1800.00, true, 'P-01'),
  ('pc2', 'Panoramic Padel 2', 'Padel', '12mm tempered glass', 1800.00, true, 'P-02'),
  ('pc3', 'Glass Padel 3', 'Padel', 'WPT supercourt turf', 1400.00, true, 'P-03'),
  ('pc4', 'Academy Padel 4', 'Padel', 'Academy turf', 1200.00, false, 'P-04'),
  ('bc1', 'Badminton Hall 1', 'Badminton', 'BWF Grade 1 indoor', 800.00, true, 'B-01'),
  ('bc2', 'Badminton Hall 2', 'Badminton', 'BWF Grade 1 indoor', 800.00, true, 'B-02'),
  ('bc3', 'Badminton Hall 3', 'Badminton', 'BWF Grade 1 indoor', 800.00, true, 'B-03'),
  ('bc4', 'Badminton Hall 4', 'Badminton', 'BWF Grade 2 indoor', 700.00, true, 'B-04'),
  ('bc5', 'Badminton Hall 5', 'Badminton', 'BWF Grade 2 indoor', 700.00, true, 'B-05'),
  ('bc6', 'Badminton Hall 6', 'Badminton', 'BWF Grade 2 indoor', 700.00, false, 'B-06'),
  ('cn1', 'Cricket Net · Pace', 'Cricket', 'Astroturf · 150kph machine', 600.00, true, 'C-01'),
  ('cn2', 'Cricket Net · Spin', 'Cricket', 'Astroturf · spin machine', 600.00, true, 'C-02')
ON CONFLICT (id) DO NOTHING;

-- Pro Shop Products: 16 Items
INSERT INTO products (id, sku, name, category, price, stock, low_stock_at, brand, sport, tag) VALUES
  ('prd-01', 'TCC-RK-001', 'Wilson Pro Staff V14', 'Rackets', 18499.00, 6, 4, 'Wilson', 'Tennis', 'Pro favourite'),
  ('prd-02', 'TCC-RK-002', 'Babolat Pure Aero 98', 'Rackets', 19999.00, 3, 4, 'Babolat', 'Tennis', 'Low stock'),
  ('prd-03', 'TCC-RK-003', 'Head Speed MP Padel', 'Rackets', 21999.00, 5, 3, 'Head', 'Padel', NULL),
  ('prd-04', 'TCC-RK-004', 'Yonex Astrox 100 ZZ', 'Rackets', 17299.00, 2, 3, 'Yonex', 'Badminton', 'Low stock'),
  ('prd-05', 'TCC-BL-001', 'Wilson US Open Balls (4)', 'Balls', 680.00, 48, 12, 'Wilson', 'Tennis', NULL),
  ('prd-06', 'TCC-BL-002', 'Head Padel Pro Balls (3)', 'Balls', 520.00, 36, 10, 'Head', 'Padel', NULL),
  ('prd-07', 'TCC-SH-001', 'Yonex AS-30 Shuttlecock (Tin)', 'Shuttlecocks', 1450.00, 22, 8, 'Yonex', 'Badminton', NULL),
  ('prd-08', 'TCC-SH-002', 'Victor Champion No.1 (Tin)', 'Shuttlecocks', 1180.00, 7, 8, 'Victor', 'Badminton', 'Low stock'),
  ('prd-09', 'TCC-AC-001', 'Tourna Grip Original (3)', 'Accessories', 420.00, 40, 15, 'Tourna', 'All', NULL),
  ('prd-10', 'TCC-AC-002', 'Racket Vibration Dampener', 'Accessories', 260.00, 28, 10, 'Babolat', 'All', NULL),
  ('prd-11', 'TCC-AP-001', 'Club Training Tee · Court Green', 'Apparel', 1290.00, 34, 10, 'TCC', 'All', NULL),
  ('prd-12', 'TCC-AP-002', 'Club Woven Shorts', 'Apparel', 1490.00, 19, 8, 'TCC', 'All', NULL),
  ('prd-13', 'TCC-FW-001', 'Yonex Power Cushion Eclipsion Z', 'Footwear', 11499.00, 9, 4, 'Yonex', 'All', 'All court'),
  ('prd-14', 'TCC-FW-002', 'Asics Court FF 3', 'Footwear', 10999.00, 4, 4, 'Asics', 'Tennis', NULL),
  ('prd-15', 'TCC-NU-001', 'Fast&Up Reload Electrolyte', 'Nutrition', 340.00, 60, 20, 'Fast&Up', 'All', NULL),
  ('prd-16', 'TCC-NU-002', 'Whey Isolate · Café Mocha', 'Nutrition', 2890.00, 15, 6, 'TCC', 'All', NULL)
ON CONFLICT (id) DO NOTHING;

-- Bar Menu Items: 16 Items
INSERT INTO menu_items (id, name, category, price, veg, description, station, prep_min) VALUES
  ('mn-01', 'Whey Isolate Shake', 'Beverages', 340.00, true, 'Café mocha, 25g protein, cold', 'bar', 4),
  ('mn-02', 'Electrolyte Cooler', 'Beverages', 220.00, true, 'Lime, sea salt, mint, soda', 'bar', 3),
  ('mn-03', 'Cold Brew', 'Beverages', 260.00, true, '18-hour steep, single origin', 'bar', 3),
  ('mn-04', 'Masala Chai', 'Beverages', 120.00, true, 'Assam leaf, ginger, cardamom', 'bar', 4),
  ('mn-05', 'Sourdough Club Sandwich', 'Mains', 420.00, false, 'Chicken, cheddar, herb aioli', 'kitchen', 12),
  ('mn-06', 'Paneer Tikka Bowl', 'Mains', 380.00, true, 'Charred paneer, quinoa, mint', 'kitchen', 14),
  ('mn-07', 'Pesto Pasta', 'Mains', 440.00, true, 'Basil, parmesan, cherry tomato', 'kitchen', 13),
  ('mn-08', 'Grilled Chicken Wrap', 'Mains', 360.00, false, 'Smoked chicken, slaw, yogurt', 'kitchen', 10),
  ('mn-09', 'Truffle Fries', 'Snacks', 280.00, true, 'Parmesan, chive, truffle oil', 'kitchen', 8),
  ('mn-10', 'Chicken Satay (6)', 'Snacks', 390.00, false, 'Peanut sauce, pickled cucumber', 'kitchen', 12),
  ('mn-11', 'Peri Peri Paneer Sticks', 'Snacks', 320.00, true, 'House peri peri, lime', 'kitchen', 9),
  ('mn-12', 'Hummus & Lavash', 'Snacks', 260.00, true, 'Beetroot hummus, toasted lavash', 'kitchen', 6),
  ('mn-13', 'Kingfisher Ultra (330ml)', 'Bar', 350.00, true, 'Chilled draught bottle', 'bar', 2),
  ('mn-14', 'House Red · Glass', 'Bar', 480.00, true, 'Shiraz, 150ml pour', 'bar', 2),
  ('mn-15', 'Classic Gin & Tonic', 'Bar', 520.00, true, 'London dry, tonic, citrus', 'bar', 4),
  ('mn-16', 'Zero-Proof Spritz', 'Bar', 290.00, true, 'Aperitivo, soda, orange', 'bar', 4)
ON CONFLICT (id) DO NOTHING;

-- Floor Tables: 12 Tables
INSERT INTO bar_tables (id, label, seats, zone, status) VALUES
  ('tbl-1', 'T01', 4, 'Lounge', 'available'),
  ('tbl-2', 'T02', 2, 'Terrace', 'available'),
  ('tbl-3', 'T03', 4, 'Bar', 'occupied'),
  ('tbl-4', 'T04', 6, 'Lounge', 'available'),
  ('tbl-5', 'T05', 4, 'Terrace', 'available'),
  ('tbl-6', 'T06', 2, 'Bar', 'reserved'),
  ('tbl-7', 'T07', 4, 'Lounge', 'occupied'),
  ('tbl-8', 'T08', 6, 'Terrace', 'available'),
  ('tbl-9', 'T09', 2, 'Bar', 'available'),
  ('tbl-10', 'T10', 4, 'Lounge', 'available'),
  ('tbl-11', 'T11', 4, 'Terrace', 'available'),
  ('tbl-12', 'T12', 6, 'Bar', 'available')
ON CONFLICT (id) DO NOTHING;

-- Staff Roster: 8 Members
INSERT INTO staff (id, name, role, department, shift, shift_time, salary, overtime_hours, attendance_days, leaves_taken, status, joined, phone) VALUES
  ('stf-001', 'Amit Sharma', 'Front Desk Lead', 'Front desk', 'Morning', '06:00 – 14:00', 34000.00, 6, 24, 1, 'on_duty', '2023-04-10', '+91 98110 22201'),
  ('stf-002', 'Simran Kaur', 'Club Manager', 'Front desk', 'General', '09:00 – 18:00', 62000.00, 0, 25, 1, 'on_duty', '2022-08-01', '+91 98110 22202'),
  ('stf-003', 'Chef Vikram Singh', 'Head Chef', 'Bar & kitchen', 'Evening', '14:00 – 22:00', 48000.00, 12, 23, 2, 'on_duty', '2023-01-15', '+91 98110 22203'),
  ('stf-004', 'Meera Nair', 'Café Manager', 'Bar & kitchen', 'Evening', '15:00 – 23:00', 41000.00, 4, 24, 1, 'on_duty', '2024-02-20', '+91 98110 22204'),
  ('stf-005', 'Neha Kapoor', 'Pro Shop Manager', 'Pro shop', 'General', '10:00 – 19:00', 38000.00, 2, 25, 0, 'on_duty', '2023-06-05', '+91 98110 22205'),
  ('stf-006', 'Rahul Yadav', 'Court Attendant', 'Courts', 'Morning', '06:00 – 14:00', 24000.00, 8, 22, 3, 'off', '2024-05-11', '+91 98110 22206'),
  ('stf-007', 'Sneha Iyer', 'Accounts Executive', 'Accounts', 'General', '10:00 – 18:00', 45000.00, 0, 24, 1, 'on_duty', '2022-11-03', '+91 98110 22207'),
  ('stf-008', 'Ravi Kumar', 'Kitchen Steward', 'Bar & kitchen', 'Night', '20:00 – 04:00', 22000.00, 10, 21, 4, 'leave', '2024-09-01', '+91 98110 22208')
ON CONFLICT (id) DO NOTHING;

-- Payables: 7 Initial Vendor Bills
INSERT INTO payables (id, vendor, category, amount, due_date, status, reference) VALUES
  ('pay-001', 'BSES Rajdhani Power', 'Electricity', 148500.00, '2026-11-25', 'due', 'ELEC-1121'),
  ('pay-002', 'Delhi Jal Board', 'Water', 22400.00, '2026-11-28', 'scheduled', 'WTR-1121'),
  ('pay-003', 'Wilson Sporting Goods India', 'Pro shop inventory', 286000.00, '2026-12-01', 'due', 'PO-2291'),
  ('pay-004', 'Sula / Gateway Beverages', 'Bar stock', 97200.00, '2026-11-24', 'due', 'PO-2304'),
  ('pay-005', 'GreenTurf Maintenance', 'Turf & courts', 68000.00, '2026-12-04', 'scheduled', 'AMC-118'),
  ('pay-006', 'SecureGuard Services', 'Security', 154000.00, '2026-11-20', 'paid', 'SEC-1119'),
  ('pay-007', 'Airtel Business Broadband', 'Internet & CCTV', 18400.00, '2026-11-27', 'scheduled', 'NET-1121')
ON CONFLICT (id) DO NOTHING;
