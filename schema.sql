-- ==============================================================================
-- KM PALACE KALYANA MANDAPAM - SUPABASE / POSTGRESQL DATABASE SCHEMA
-- ==============================================================================

-- 1. Create sequence for fallback counters
CREATE SEQUENCE IF NOT EXISTS booking_seq START WITH 1 INCREMENT BY 1;

-- 2. Create 'bookings' Table
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(100) PRIMARY KEY,
    booking_id VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(255) NOT NULL,
    customer_address TEXT,
    bride_name VARCHAR(255),
    groom_name VARCHAR(255),
    marriage_date DATE NOT NULL,
    booking_date DATE,
    slot_type VARCHAR(50) DEFAULT '24hr',
    muhurtham_time VARCHAR(20) NOT NULL,
    from_time VARCHAR(20) DEFAULT '06:00',
    end_time VARCHAR(20) DEFAULT '22:00',
    function_type VARCHAR(100) DEFAULT 'Wedding',
    guest_count INT DEFAULT 500,
    requirements TEXT[],
    blocked_previous_day BOOLEAN DEFAULT FALSE,
    blocked_dates TEXT[],
    total_amount NUMERIC(12, 2) DEFAULT 364500.00,
    estimated_amount NUMERIC(12, 2) DEFAULT 364500.00,
    advance_paid_amount NUMERIC(12, 2) DEFAULT 0.00,
    payment_status VARCHAR(50) DEFAULT 'Pending',
    payment_method VARCHAR(50) DEFAULT 'UPI',
    payment_gateway VARCHAR(50) DEFAULT 'Manual',
    currency VARCHAR(10) DEFAULT 'INR',
    customer_region VARCHAR(50) DEFAULT 'India',
    pg_transaction_id VARCHAR(100),
    pg_rooms_selected JSONB,
    booking_status VARCHAR(50) DEFAULT 'Confirmed',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Ensure all optional & extension columns exist on existing database tables
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='name') THEN
        ALTER TABLE bookings ADD COLUMN name VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='booking_date') THEN
        ALTER TABLE bookings ADD COLUMN booking_date DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='slot_type') THEN
        ALTER TABLE bookings ADD COLUMN slot_type VARCHAR(50) DEFAULT '24hr';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='from_time') THEN
        ALTER TABLE bookings ADD COLUMN from_time VARCHAR(20) DEFAULT '06:00';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='end_time') THEN
        ALTER TABLE bookings ADD COLUMN end_time VARCHAR(20) DEFAULT '22:00';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='total_amount') THEN
        ALTER TABLE bookings ADD COLUMN total_amount NUMERIC(12, 2) DEFAULT 364500.00;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='customer_address') THEN
        ALTER TABLE bookings ADD COLUMN customer_address TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='payment_gateway') THEN
        ALTER TABLE bookings ADD COLUMN payment_gateway VARCHAR(50) DEFAULT 'Manual';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='currency') THEN
        ALTER TABLE bookings ADD COLUMN currency VARCHAR(10) DEFAULT 'INR';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='customer_region') THEN
        ALTER TABLE bookings ADD COLUMN customer_region VARCHAR(50) DEFAULT 'India';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='pg_transaction_id') THEN
        ALTER TABLE bookings ADD COLUMN pg_transaction_id VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='pg_rooms_selected') THEN
        ALTER TABLE bookings ADD COLUMN pg_rooms_selected JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='advance_paid_amount') THEN
        ALTER TABLE bookings ADD COLUMN advance_paid_amount NUMERIC(12, 2) DEFAULT 0.00;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='estimated_amount') THEN
        ALTER TABLE bookings ADD COLUMN estimated_amount NUMERIC(12, 2) DEFAULT 364500.00;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='blocked_dates') THEN
        ALTER TABLE bookings ADD COLUMN blocked_dates TEXT[];
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='requirements') THEN
        ALTER TABLE bookings ADD COLUMN requirements TEXT[];
    END IF;
END $$;

-- 3. Create 'admin_blocks' Table
CREATE TABLE IF NOT EXISTS admin_blocks (
    id VARCHAR(100) PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_bookings_marriage_date ON bookings(marriage_date);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_id ON bookings(booking_id);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(phone);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email);
CREATE INDEX IF NOT EXISTS idx_admin_blocks_date ON admin_blocks(date);

-- 5. Trigger Function for Atomic Unique Daily Booking Reference IDs
CREATE OR REPLACE FUNCTION generate_km_booking_id() 
RETURNS TRIGGER AS $$
DECLARE
    seq_num INT;
    date_prefix VARCHAR(10);
BEGIN
    date_prefix := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
    SELECT COALESCE(MAX(CAST(SUBSTRING(booking_id FROM 'KM-[0-9]{8}-([0-9]{3})') AS INT)), 0) + 1
    INTO seq_num
    FROM bookings
    WHERE booking_id LIKE 'KM-' || date_prefix || '-%';
    
    NEW.booking_id := 'KM-' || date_prefix || '-' || LPAD(seq_num::TEXT, 3, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create Trigger to set booking_id automatically if missing
DROP TRIGGER IF EXISTS trg_set_booking_id ON bookings;
CREATE TRIGGER trg_set_booking_id
BEFORE INSERT ON bookings
FOR EACH ROW
WHEN (NEW.booking_id IS NULL OR NEW.booking_id = '')
EXECUTE FUNCTION generate_km_booking_id();

-- 6. Disable RLS and Grant Full API Access for Supabase / PostgREST Sync
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_blocks DISABLE ROW LEVEL SECURITY;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

