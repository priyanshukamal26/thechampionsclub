-- =============================================================================
-- Invariant & Concurrency Verification Test Suite
-- Database: PostgreSQL
-- Tests:
--   1. Exclusion Constraint (No Overlapping Court Bookings)
--   2. Daily Booking Cap (Max 2 bookings per member per IST calendar day)
--   3. Non-Negative Stock Under Atomic Reservation
-- =============================================================================

DO $$
DECLARE
  v_court_id uuid;
  v_member_id uuid := gen_random_uuid();
  v_member_2 uuid := gen_random_uuid();
  v_slot_start timestamptz := '2026-11-25 18:00:00+05:30';
  v_slot_end timestamptz := '2026-11-25 19:00:00+05:30';
  v_overlap_start timestamptz := '2026-11-25 18:30:00+05:30';
  v_overlap_end timestamptz := '2026-11-25 19:30:00+05:30';
  v_prod_id uuid;
  v_var_id uuid;
  v_overlap_caught boolean := false;
  v_cap_caught boolean := false;
  v_stock_caught boolean := false;
BEGIN
  RAISE NOTICE '=== STARTING INVARIANT TESTS ===';

  -- Create dummy test profiles
  INSERT INTO profiles (id, full_name, role, status)
  VALUES 
    (v_member_id, 'Test Member 1', 'member', 'active_member'),
    (v_member_2, 'Test Member 2', 'member', 'active_member');

  -- Pick court
  SELECT id INTO v_court_id FROM facilities LIMIT 1;
  IF v_court_id IS NULL THEN
    INSERT INTO facilities (sport, name, hourly_base_rate)
    VALUES ('tennis', 'Test Court A', 1000.00) RETURNING id INTO v_court_id;
  END IF;

  -- ---------------------------------------------------------------------------
  -- TEST 1: NO OVERLAPPING BOOKING ON SAME COURT
  -- ---------------------------------------------------------------------------
  RAISE NOTICE 'Running Test 1: Exclusion Constraint Overlap Prevention...';
  
  -- Insert first booking (18:00 to 19:00 IST)
  INSERT INTO bookings (court_id, member_id, start_at, end_at, status, price_snapshotted)
  VALUES (v_court_id, v_member_id, v_slot_start, v_slot_end, 'confirmed', 1000.00);

  -- Attempt second booking overlapping (18:30 to 19:30 IST)
  BEGIN
    INSERT INTO bookings (court_id, member_id, start_at, end_at, status, price_snapshotted)
    VALUES (v_court_id, v_member_2, v_overlap_start, v_overlap_end, 'confirmed', 1000.00);
  EXCEPTION WHEN exclusion_violation THEN
    v_overlap_caught := true;
    RAISE NOTICE '-> PASS: Overlapping booking rejected by exclusion constraint bookings_no_overlap!';
  END;

  IF NOT v_overlap_caught THEN
    RAISE EXCEPTION 'TEST 1 FAILED: Overlapping booking was NOT rejected!';
  END IF;

  -- ---------------------------------------------------------------------------
  -- TEST 2: DAILY CAP ENFORCEMENT (MAX 2 PER IST CALENDAR DAY)
  -- ---------------------------------------------------------------------------
  RAISE NOTICE 'Running Test 2: Daily Booking Cap Rule (Max 2)...';
  
  -- Insert 2nd booking for v_member_id on same day (e.g. 20:00 to 21:00 IST)
  INSERT INTO bookings (court_id, member_id, start_at, end_at, status, price_snapshotted)
  VALUES (v_court_id, v_member_id, '2026-11-25 20:00:00+05:30', '2026-11-25 21:00:00+05:30', 'confirmed', 1000.00);

  -- Attempt 3rd booking for v_member_id on same day (e.g. 21:00 to 22:00 IST)
  BEGIN
    INSERT INTO bookings (court_id, member_id, start_at, end_at, status, price_snapshotted)
    VALUES (v_court_id, v_member_id, '2026-11-25 21:00:00+05:30', '2026-11-25 22:00:00+05:30', 'confirmed', 1000.00);
  EXCEPTION WHEN check_violation THEN
    v_cap_caught := true;
    RAISE NOTICE '-> PASS: 3rd booking on same IST day rejected by check_daily_booking_cap() trigger!';
  END;

  IF NOT v_cap_caught THEN
    RAISE EXCEPTION 'TEST 2 FAILED: 3rd booking exceeded daily cap but was allowed!';
  END IF;

  -- ---------------------------------------------------------------------------
  -- TEST 3: STOCK NEVER NEGATIVE
  -- ---------------------------------------------------------------------------
  RAISE NOTICE 'Running Test 3: Atomic Stock Reservation...';

  INSERT INTO products (name, sport, category, brand)
  VALUES ('Test Tennis Racket', 'tennis', 'rackets', 'Wilson') RETURNING id INTO v_prod_id;

  INSERT INTO product_variants (product_id, sku, price, qty_on_hand)
  VALUES (v_prod_id, 'TEST-SKU-001', 5000.00, 1) RETURNING id INTO v_var_id;

  -- Reserve 1st unit (should succeed, remaining: 0)
  PERFORM reserve_stock_atomic(v_var_id, 1, 'test_purchase_1');

  -- Attempt to reserve 2nd unit when stock is 0 (must fail)
  BEGIN
    PERFORM reserve_stock_atomic(v_var_id, 1, 'test_purchase_2');
  EXCEPTION WHEN check_violation THEN
    v_stock_caught := true;
    RAISE NOTICE '-> PASS: Overselling prevented! reserve_stock_atomic rejected purchase on zero inventory!';
  END;

  IF NOT v_stock_caught THEN
    RAISE EXCEPTION 'TEST 3 FAILED: Stock went below zero!';
  END IF;

  RAISE NOTICE '=== ALL INVARIANT TESTS PASSED CLEANLY (3/3) ===';

  -- Rollback test data to leave test environment pristine
  RAISE EXCEPTION 'ROLLBACK_TRANSACTION_TEST_COMPLETE' USING ERRCODE = '00000';
EXCEPTION WHEN SQLSTATE '00000' THEN
  RAISE NOTICE 'Transaction rolled back safely after successful test execution.';
END $$;
