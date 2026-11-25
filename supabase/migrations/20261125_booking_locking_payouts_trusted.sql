-- ====================================================================
-- MIGRATION: Driver Booking Locking, Vehicle Ownership,
-- Per-Trip Payouts, Senior Saved Destinations & Trusted Driver Circle
-- ====================================================================

-- 1. Add active booking lock tracking on drivers
ALTER TABLE drivers
  ADD COLUMN IF NOT EXISTS current_active_booking_id UUID;

-- 2. Enforce at most ONE active assigned ride per driver at database level
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_booking_per_driver
  ON bookings (driver_id)
  WHERE driver_id IS NOT NULL
    AND status IN (
      'driver_assigned',
      'confirmed',
      'driver_en_route',
      'driver_arrived',
      'trip_started'
    );

-- 3. Driver's own registered/assigned vehicles (distinct from customer vehicles)
CREATE TABLE IF NOT EXISTS driver_vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID UNIQUE REFERENCES drivers(id) ON DELETE CASCADE,
  registration_number VARCHAR(30) NOT NULL,
  manufacturer VARCHAR(60) NOT NULL,
  model VARCHAR(60) NOT NULL,
  year INT,
  category VARCHAR(50) DEFAULT 'Sedan',
  transmission transmission_type DEFAULT 'manual',
  fuel_type fuel_type DEFAULT 'petrol',
  verification_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Trips table (1-to-1 with completed/started bookings)
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE RESTRICT,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completion_time TIMESTAMPTZ,
  final_fare NUMERIC(10, 2) NOT NULL,
  trip_status VARCHAR(20) NOT NULL DEFAULT 'in_progress' CHECK (trip_status IN ('in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Per-trip Driver Payouts (UNIQUE trip_id prevents duplicate payout records)
CREATE TABLE IF NOT EXISTS driver_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  trip_id UUID UNIQUE NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  total_fare NUMERIC(10, 2) NOT NULL,
  platform_commission NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  deductions NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  net_payout NUMERIC(10, 2) GENERATED ALWAYS AS (total_fare - platform_commission - deductions) STORED,
  payout_status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (payout_status IN ('Pending', 'Processing', 'Paid', 'Failed')),
  payment_reference VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_driver_payouts_driver_created
  ON driver_payouts (driver_id, created_at DESC);

-- 6. Extend driver_favourites (Trusted Driver Circle) with trip count, primary & backup roles
ALTER TABLE driver_favourites
  ADD COLUMN IF NOT EXISTS completed_trips_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_backup BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS trusted_status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (trusted_status IN ('active', 'removed')),
  ADD COLUMN IF NOT EXISTS last_trip_at TIMESTAMPTZ;

-- 7. Saved Destinations for One-Tap Senior Citizen Mode Booking
CREATE TABLE IF NOT EXISTS saved_destinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  destination_name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'General',
  address TEXT NOT NULL,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  icon VARCHAR(16) DEFAULT '📍',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_destinations_customer
  ON saved_destinations (customer_id);
