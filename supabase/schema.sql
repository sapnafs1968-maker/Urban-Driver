-- ====================================================================
-- URBAN DRIVER - PRODUCTION DATABASE SCHEMA (POSTGRESQL / SUPABASE)
-- Product: Senior-friendly, family-connected driver booking platform
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM TYPES
CREATE TYPE user_role_type AS ENUM ('customer', 'family_guardian', 'driver', 'admin');
CREATE TYPE verification_status_type AS ENUM ('not_submitted', 'pending_review', 'under_verification', 'verified', 'rejected', 'expired');
CREATE TYPE transmission_type AS ENUM ('manual', 'automatic');
CREATE TYPE fuel_type AS ENUM ('petrol', 'diesel', 'electric', 'hybrid', 'cng');
CREATE TYPE vehicle_size_type AS ENUM ('small', 'sedan', 'suv', 'luxury', 'other');
CREATE TYPE booking_status_type AS ENUM (
  'draft',
  'requested',
  'awaiting_assignment',
  'driver_assigned',
  'confirmed',
  'driver_en_route',
  'driver_arrived',
  'trip_started',
  'trip_completed',
  'arrival_confirmation_pending',
  'closed',
  'cancelled',
  'rejected'
);
CREATE TYPE payment_status_type AS ENUM ('pending', 'initiated', 'successful', 'failed', 'refunded', 'partially_refunded');
CREATE TYPE support_ticket_status AS ENUM ('open', 'assigned', 'in_progress', 'resolved', 'closed');

-- 1. PROFILES
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  avatar_url TEXT,
  city VARCHAR(100) DEFAULT 'Bengaluru',
  service_area VARCHAR(100) DEFAULT 'Indiranagar & Koramangala',
  preferred_language VARCHAR(20) DEFAULT 'en', -- 'en', 'hi', 'ta', 'te', 'bn'
  emergency_contact_name VARCHAR(150),
  emergency_contact_phone VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER ROLES
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  role user_role_type NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- 3. CUSTOMERS
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES profiles(user_id) ON DELETE CASCADE,
  senior_mode_enabled BOOLEAN DEFAULT FALSE,
  assistance_notes TEXT,
  default_vehicle_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DRIVERS
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES profiles(user_id) ON DELETE CASCADE,
  experience_years INT DEFAULT 3,
  service_area VARCHAR(100) DEFAULT 'Bengaluru Metro',
  rating NUMERIC(3,2) DEFAULT 4.90,
  total_trips INT DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  verification_status verification_status_type DEFAULT 'pending_review',
  verification_notes TEXT,
  verified_by_admin_id UUID,
  verified_at TIMESTAMPTZ,
  background_check_consented BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. DRIVER DOCUMENTS
CREATE TABLE driver_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- 'driving_license', 'aadhaar', 'police_clearance'
  document_number VARCHAR(100),
  document_url TEXT NOT NULL,
  expiry_date DATE,
  verification_status verification_status_type DEFAULT 'pending_review',
  reviewer_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. DRIVER VEHICLE CAPABILITIES
CREATE TABLE driver_vehicle_capabilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID UNIQUE REFERENCES drivers(id) ON DELETE CASCADE,
  manual_transmission BOOLEAN DEFAULT TRUE,
  automatic_transmission BOOLEAN DEFAULT TRUE,
  petrol_diesel BOOLEAN DEFAULT TRUE,
  ev_certified BOOLEAN DEFAULT FALSE,
  small_cars BOOLEAN DEFAULT TRUE,
  sedans BOOLEAN DEFAULT TRUE,
  suvs BOOLEAN DEFAULT TRUE,
  luxury_cars BOOLEAN DEFAULT FALSE,
  languages_spoken TEXT[] DEFAULT ARRAY['English', 'Hindi'],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. VEHICLES
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  registration_number VARCHAR(30) NOT NULL,
  make VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  year INT NOT NULL,
  category VARCHAR(50) DEFAULT 'Sedan',
  transmission transmission_type NOT NULL DEFAULT 'automatic',
  fuel_type fuel_type NOT NULL DEFAULT 'petrol',
  is_ev BOOLEAN DEFAULT FALSE,
  vehicle_size vehicle_size_type NOT NULL DEFAULT 'sedan',
  special_handling_notes TEXT,
  photo_url TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SAVED ADDRESSES
CREATE TABLE saved_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  label VARCHAR(50) NOT NULL, -- 'Home', 'Hospital', 'Apollo Clinic', 'Temple'
  address_line TEXT NOT NULL,
  landmark VARCHAR(100),
  city VARCHAR(50) DEFAULT 'Bengaluru',
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  is_favorite BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. FAMILY RELATIONSHIPS
CREATE TABLE family_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  guardian_user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  relationship_title VARCHAR(50) NOT NULL, -- 'Son', 'Daughter', 'Caregiver', 'Spouse'
  status VARCHAR(20) DEFAULT 'active', -- 'pending', 'active', 'revoked'
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  UNIQUE(customer_id, guardian_user_id)
);

-- 10. FAMILY PERMISSIONS
CREATE TABLE family_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relationship_id UUID UNIQUE REFERENCES family_relationships(id) ON DELETE CASCADE,
  can_view_trips BOOLEAN DEFAULT TRUE,
  can_book_trips BOOLEAN DEFAULT TRUE,
  can_make_payments BOOLEAN DEFAULT TRUE,
  can_receive_alerts BOOLEAN DEFAULT TRUE,
  can_contact_support BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. DRIVER FAVOURITES (TRUSTED DRIVER CIRCLE)
CREATE TABLE driver_favourites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  personal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, driver_id)
);

-- 12. BOOKINGS
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_code VARCHAR(20) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  booked_by_guardian_id UUID REFERENCES profiles(user_id),
  driver_id UUID REFERENCES drivers(id),
  vehicle_id UUID REFERENCES vehicles(id),
  pickup_address TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  pickup_lat NUMERIC(10, 7),
  pickup_lng NUMERIC(10, 7),
  dest_lat NUMERIC(10, 7),
  dest_lng NUMERIC(10, 7),
  pickup_date DATE NOT NULL,
  pickup_time TIME NOT NULL,
  expected_duration_hours NUMERIC(4, 1) DEFAULT 4.0,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_schedule_id UUID,
  status booking_status_type DEFAULT 'requested',
  preferred_driver_id UUID REFERENCES drivers(id),
  base_fare NUMERIC(10, 2) NOT NULL DEFAULT 400.00,
  duration_fare NUMERIC(10, 2) NOT NULL DEFAULT 200.00,
  platform_fee NUMERIC(10, 2) NOT NULL DEFAULT 60.00,
  tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 35.00,
  total_fare NUMERIC(10, 2) NOT NULL DEFAULT 695.00,
  payment_status payment_status_type DEFAULT 'pending',
  payment_method VARCHAR(30) DEFAULT 'razorpay',
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. RECURRING BOOKINGS
CREATE TABLE recurring_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id),
  preferred_driver_id UUID REFERENCES drivers(id),
  title VARCHAR(100) NOT NULL, -- 'Weekly Dialysis', 'Daily Temple Visit'
  days_of_week INT[] NOT NULL, -- [1, 3, 5] for Mon, Wed, Fri
  start_date DATE NOT NULL,
  end_date DATE,
  pickup_time TIME NOT NULL,
  pickup_address TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'paused', 'cancelled'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. BOOKING STATUS HISTORY
CREATE TABLE booking_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  from_status booking_status_type,
  to_status booking_status_type NOT NULL,
  actor_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. DRIVER AVAILABILITY
CREATE TABLE driver_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL, -- 0-6
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE
);

-- 16. TRIP LOCATIONS (SIMULATED / GEOLOCATION)
CREATE TABLE trip_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  speed NUMERIC(5, 2),
  heading NUMERIC(5, 2),
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. ARRIVAL CONFIRMATIONS & EXCEPTION ALERTS
CREATE TABLE arrival_confirmations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  trip_completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  customer_confirmed_at TIMESTAMPTZ,
  guardian_notified_at TIMESTAMPTZ,
  reminder_count INT DEFAULT 0,
  status VARCHAR(40) DEFAULT 'pending', -- 'pending', 'confirmed_by_customer', 'guardian_escalated', 'support_alert_raised'
  escalation_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. NOTIFICATIONS
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'trip_assigned', 'driver_arrived', 'trip_started', 'arrival_pending', 'delay_alert'
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. PAYMENTS
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  payer_user_id UUID REFERENCES profiles(user_id),
  payer_role user_role_type DEFAULT 'customer',
  amount NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  status payment_status_type DEFAULT 'pending',
  gateway VARCHAR(30) DEFAULT 'razorpay',
  gateway_order_id VARCHAR(100),
  gateway_payment_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. PAYMENT TRANSACTIONS
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  transaction_ref VARCHAR(100) UNIQUE NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  status payment_status_type NOT NULL,
  raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. PRICING RULES
CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_area VARCHAR(100) NOT NULL DEFAULT 'Bengaluru Urban',
  base_hourly_rate NUMERIC(10, 2) NOT NULL DEFAULT 150.00,
  min_hours INT NOT NULL DEFAULT 3,
  platform_service_fee_pct NUMERIC(5, 2) NOT NULL DEFAULT 12.00,
  night_surcharge_pct NUMERIC(5, 2) DEFAULT 20.00,
  cancellation_fee NUMERIC(10, 2) DEFAULT 100.00,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. MOBILITY PLANS (RECURRING SUBSCRIPTION / PACKAGES)
CREATE TABLE mobility_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(100) NOT NULL,
  description TEXT,
  monthly_price NUMERIC(10, 2) NOT NULL,
  included_trips INT NOT NULL,
  discount_pct NUMERIC(5, 2) DEFAULT 15.00,
  dedicated_support BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. CUSTOMER SUPPORT TICKETS
CREATE TABLE customer_support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number VARCHAR(30) UNIQUE NOT NULL,
  raised_by UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  category VARCHAR(50) NOT NULL, -- 'Driver Issue', 'Billing', 'Delay', 'Safety Concern'
  subject VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  status support_ticket_status DEFAULT 'open',
  assigned_admin_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. TICKET MESSAGES
CREATE TABLE ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES customer_support_tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_admin_reply BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 25. INCIDENT REPORTS
CREATE TABLE incident_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  incident_type VARCHAR(100) NOT NULL,
  severity VARCHAR(30) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  description TEXT NOT NULL,
  action_taken TEXT,
  is_resolved BOOLEAN DEFAULT FALSE,
  reported_by UUID REFERENCES profiles(user_id),
  reported_at TIMESTAMPTZ DEFAULT NOW()
);

-- 26. DRIVER RATINGS
CREATE TABLE driver_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  punctuality_rating INT CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
  vehicle_care_rating INT CHECK (vehicle_care_rating >= 1 AND vehicle_care_rating <= 5),
  courtesy_rating INT CHECK (courtesy_rating >= 1 AND courtesy_rating <= 5),
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 27. SERVICE AREAS
CREATE TABLE service_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  city VARCHAR(50) NOT NULL DEFAULT 'Bengaluru',
  state VARCHAR(50) NOT NULL DEFAULT 'Karnataka',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 28. ASSISTED BOOKING REQUESTS (CALL / WHATSAPP DESK)
CREATE TABLE assisted_booking_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caller_name VARCHAR(150) NOT NULL,
  caller_phone VARCHAR(20) NOT NULL,
  preferred_date DATE,
  preferred_time TIME,
  pickup_area VARCHAR(150),
  destination_area VARCHAR(150),
  vehicle_type VARCHAR(50),
  channel VARCHAR(30) DEFAULT 'phone', -- 'phone', 'whatsapp'
  status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'called_back', 'converted', 'closed'
  operator_notes TEXT,
  handled_by_admin_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 29. INSTITUTIONAL LEADS
CREATE TABLE institutional_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_name VARCHAR(150) NOT NULL,
  institution_type VARCHAR(50) NOT NULL, -- 'senior_living', 'hospital', 'rwa', 'corporate'
  contact_person VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  city VARCHAR(100) NOT NULL,
  estimated_monthly_trips INT DEFAULT 50,
  notes TEXT,
  status VARCHAR(30) DEFAULT 'new', -- 'new', 'contacted', 'pilot_in_progress', 'signed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 30. CUSTOMER FEEDBACK (PILOT SURVEYS)
CREATE TABLE customer_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  user_role VARCHAR(30) DEFAULT 'customer',
  nps_score INT CHECK (nps_score >= 0 AND nps_score <= 10),
  ease_of_use_rating INT CHECK (ease_of_use_rating >= 1 AND ease_of_use_rating <= 5),
  comfort_with_driver_rating INT CHECK (comfort_with_driver_rating >= 1 AND comfort_with_driver_rating <= 5),
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 31. AUDIT LOGS
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE arrival_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Sample Policies
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Customers view own vehicles" ON vehicles FOR SELECT USING (
  customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
);

CREATE POLICY "Customers and guardians view authorized bookings" ON bookings FOR SELECT USING (
  customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()) OR
  booked_by_guardian_id = auth.uid() OR
  driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid())
);
