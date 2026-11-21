-- =============================================================================
-- Seed Data: The Champions Club Initial Setup
-- Sports: Tennis, Padel, Badminton, Cricket Nets
-- Plans: Gold, Silver, Junior
-- =============================================================================

-- Plans
INSERT INTO plans (id, name, price_monthly, price_annual, court_rate_multiplier, shop_discount_pct, bar_discount_pct, free_friday_social, daily_cap)
VALUES
  ('gold', 'Gold Champion', 4999.00, 47990.00, 0.00, 15.00, 15.00, true, 2),
  ('silver', 'Silver Standard', 2499.00, 23990.00, 0.70, 5.00, 5.00, false, 2),
  ('junior', 'Junior Prodigy', 1699.00, 16310.00, 0.50, 10.00, 10.00, false, 2)
ON CONFLICT (id) DO NOTHING;

-- Facilities: 18 Total (4 Tennis, 4 Padel, 6 Badminton, 4 Cricket Nets)
INSERT INTO facilities (sport, name, facility_type, is_indoor, has_floodlights, hourly_base_rate)
VALUES
  -- Tennis (4 hard courts)
  ('tennis', 'Tennis Court 1 (Centre Court)', 'court', false, true, 1200.00),
  ('tennis', 'Tennis Court 2', 'court', false, true, 1000.00),
  ('tennis', 'Tennis Court 3', 'court', false, true, 1000.00),
  ('tennis', 'Tennis Court 4', 'court', false, true, 1000.00),
  -- Padel (4 glass courts)
  ('padel', 'Padel Court 1 (Panoramic)', 'court', false, true, 1400.00),
  ('padel', 'Padel Court 2', 'court', false, true, 1400.00),
  ('padel', 'Padel Court 3', 'court', false, true, 1400.00),
  ('padel', 'Padel Court 4', 'court', false, true, 1400.00),
  -- Badminton (6 indoor AC courts)
  ('badminton', 'Badminton Court 1', 'court', true, true, 800.00),
  ('badminton', 'Badminton Court 2', 'court', true, true, 800.00),
  ('badminton', 'Badminton Court 3', 'court', true, true, 800.00),
  ('badminton', 'Badminton Court 4', 'court', true, true, 800.00),
  ('badminton', 'Badminton Court 5', 'court', true, true, 800.00),
  ('badminton', 'Badminton Court 6', 'court', true, true, 800.00),
  -- Cricket Nets (4 bowling machine lanes)
  ('cricket', 'Cricket Net 1 (Auto Bowling Machine)', 'net', false, true, 900.00),
  ('cricket', 'Cricket Net 2 (Auto Bowling Machine)', 'net', false, true, 900.00),
  ('cricket', 'Cricket Net 3 (Manual Feed)', 'net', false, true, 600.00),
  ('cricket', 'Cricket Net 4 (Manual Feed)', 'net', false, true, 600.00)
ON CONFLICT DO NOTHING;

-- Bar Tables (12 tables)
INSERT INTO bar_tables (table_number, seats)
SELECT generate_series, 4 FROM generate_series(1, 12)
ON CONFLICT (table_number) DO NOTHING;

-- Cafe Menu Items
INSERT INTO menu_items (name, category, price)
VALUES
  ('Whey Isolate Protein Shake (Berry Blast)', 'shakes', 280.00),
  ('Post-Match Electrolyte Cooler', 'shakes', 180.00),
  ('Double Espresso', 'hot_beverage', 160.00),
  ('Artisan Cold Brew', 'hot_beverage', 220.00),
  ('Grilled Chicken & Avocado Wrap', 'meals', 380.00),
  ('Paneer Tikka Protein Bowl', 'meals', 340.00),
  ('Club Energy Granola Bar', 'snacks', 120.00),
  ('Avocado Toast with Sourdough', 'snacks', 290.00)
ON CONFLICT DO NOTHING;
