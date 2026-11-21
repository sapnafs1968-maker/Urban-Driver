-- ====================================================================
-- MIGRATION: DRIVER ONBOARDING & VERIFICATION EXTENSIONS
-- Product: Urban Driver (Role-Based Auth & Driver Onboarding)
-- ====================================================================

-- 1. Extend verification_status_type enum if not already extended
ALTER TYPE verification_status_type ADD VALUE IF NOT EXISTS 'not_started';
ALTER TYPE verification_status_type ADD VALUE IF NOT EXISTS 'draft';
ALTER TYPE verification_status_type ADD VALUE IF NOT EXISTS 'submitted';
ALTER TYPE verification_status_type ADD VALUE IF NOT EXISTS 'changes_requested';
ALTER TYPE verification_status_type ADD VALUE IF NOT EXISTS 'suspended';

-- 2. New Driver Onboarding Status Type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'driver_onboarding_status_type') THEN
    CREATE TYPE driver_onboarding_status_type AS ENUM (
      'not_started',
      'draft',
      'submitted',
      'completed'
    );
  END IF;
END$$;

-- 3. Extend drivers table with complete onboarding & licence fields
ALTER TABLE drivers
  ADD COLUMN IF NOT EXISTS dob DATE,
  ADD COLUMN IF NOT EXISTS residential_address TEXT,
  ADD COLUMN IF NOT EXISTS residential_city VARCHAR(100) DEFAULT 'Bengaluru',
  ADD COLUMN IF NOT EXISTS state VARCHAR(100) DEFAULT 'Karnataka',
  ADD COLUMN IF NOT EXISTS pincode VARCHAR(20),
  ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(20) DEFAULT 'kn',
  
  -- Driving Licence
  ADD COLUMN IF NOT EXISTS driving_licence_number VARCHAR(100),
  ADD COLUMN IF NOT EXISTS licence_issuing_state VARCHAR(100) DEFAULT 'Karnataka',
  ADD COLUMN IF NOT EXISTS issuing_rto VARCHAR(100),
  ADD COLUMN IF NOT EXISTS licence_issue_date DATE,
  ADD COLUMN IF NOT EXISTS licence_expiry_date DATE,
  ADD COLUMN IF NOT EXISTS licence_vehicle_classes TEXT[] DEFAULT ARRAY['LMV'],
  ADD COLUMN IF NOT EXISTS licence_front_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS licence_back_photo_url TEXT,

  -- Experience
  ADD COLUMN IF NOT EXISTS professional_experience_years INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS previous_experience_description TEXT,
  ADD COLUMN IF NOT EXISTS vehicles_driven_types TEXT[] DEFAULT ARRAY['Sedan', 'Hatchback'],
  ADD COLUMN IF NOT EXISTS preferred_assignments TEXT[] DEFAULT ARRAY['Hospital Visits', 'Local Errands'],
  ADD COLUMN IF NOT EXISTS cities_worked TEXT[] DEFAULT ARRAY['Bengaluru'],

  -- Capabilities & Fuel Types
  ADD COLUMN IF NOT EXISTS supported_transmissions TEXT[] DEFAULT ARRAY['manual', 'automatic'],
  ADD COLUMN IF NOT EXISTS supported_fuel_types TEXT[] DEFAULT ARRAY['petrol', 'diesel'],
  ADD COLUMN IF NOT EXISTS vehicle_categories TEXT[] DEFAULT ARRAY['hatchback', 'sedan'],
  ADD COLUMN IF NOT EXISTS special_capabilities JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS language_proficiencies JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS customer_assistance JSONB DEFAULT '{"assistingSeniors": true, "helpEnterExit": true, "familyAssistedBookings": true}'::jsonb,

  -- Service Area & Availability
  ADD COLUMN IF NOT EXISTS preferred_working_city VARCHAR(100) DEFAULT 'Bengaluru',
  ADD COLUMN IF NOT EXISTS preferred_service_areas TEXT[] DEFAULT ARRAY['Indiranagar', 'Koramangala'],
  ADD COLUMN IF NOT EXISTS service_radius_km INT DEFAULT 15,
  ADD COLUMN IF NOT EXISTS availability_days TEXT[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  ADD COLUMN IF NOT EXISTS working_hours VARCHAR(100) DEFAULT '08:00 AM - 08:00 PM',
  ADD COLUMN IF NOT EXISTS preferred_shifts TEXT[] DEFAULT ARRAY['Morning', 'Afternoon'],

  -- Verification & Audit
  ADD COLUMN IF NOT EXISTS government_id_type VARCHAR(50) DEFAULT 'aadhaar',
  ADD COLUMN IF NOT EXISTS government_id_number VARCHAR(100),
  ADD COLUMN IF NOT EXISTS government_id_document_url TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_status driver_onboarding_status_type DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS onboarding_step INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS changes_requested_notes TEXT,
  ADD COLUMN IF NOT EXISTS declaration_accepted BOOLEAN DEFAULT FALSE;

-- 4. Secure Row-Level Security (RLS) Policies
-- Ensure driving licence number and document URLs are masked for public/customer views
CREATE OR REPLACE VIEW public_driver_profiles AS
  SELECT 
    d.id,
    d.name,
    d.photo_url,
    d.experience_years,
    d.service_area,
    d.rating,
    d.total_trips,
    d.is_available,
    d.verification_status,
    -- Masked driving licence for public safety (never reveal complete DL to customers)
    CONCAT(SUBSTRING(d.driving_licence_number FROM 1 FOR 5), '****', RIGHT(d.driving_licence_number, 4)) AS masked_licence_number,
    d.supported_transmissions,
    d.supported_fuel_types,
    d.vehicle_categories,
    d.special_capabilities,
    d.customer_assistance,
    d.preferred_service_areas
  FROM drivers d
  WHERE d.verification_status = 'verified';

COMMENT ON VIEW public_driver_profiles IS 'Public driver profile view with masked driving licence and verified credentials';
