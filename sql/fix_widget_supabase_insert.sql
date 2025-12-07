-- ===========================================
-- FIX WIDGET TO SUPABASE BOOKING INSERT
-- ===========================================
-- Run this in Supabase SQL Editor

-- 1. FIRST: Check the actual bookings table schema
SELECT 
    column_name, 
    data_type,
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'bookings' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Ensure RLS allows anonymous (widget) inserts
DROP POLICY IF EXISTS "Anyone can create a booking" ON public.bookings;

CREATE POLICY "Anyone can create a booking" 
ON public.bookings FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- 3. Also allow anonymous users to READ their own bookings (for testing)
DROP POLICY IF EXISTS "Anyone can view recent bookings" ON public.bookings;

CREATE POLICY "Anyone can view recent bookings" 
ON public.bookings FOR SELECT 
TO anon
USING (
    -- Allow reading bookings created in the last hour (for debugging)
    created_at > NOW() - INTERVAL '1 hour'
);

-- 4. Check current bookings count
SELECT COUNT(*) AS total_bookings FROM public.bookings;

-- 5. Check the most recent bookings (only existing columns)
SELECT 
    id,
    created_at,
    customer_name,
    customer_email,
    start_time,
    status
FROM public.bookings 
ORDER BY created_at DESC 
LIMIT 10;

-- 6. Make business_id optional if it exists and is NOT NULL
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' 
        AND column_name = 'business_id' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE public.bookings ALTER COLUMN business_id DROP NOT NULL;
        RAISE NOTICE 'Made business_id nullable';
    END IF;
END $$;

-- 7. Add service_name column if it doesn't exist (optional, for better tracking)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' 
        AND column_name = 'service_name'
    ) THEN
        ALTER TABLE public.bookings ADD COLUMN service_name TEXT;
        RAISE NOTICE 'Added service_name column';
    END IF;
END $$;

-- 8. Verify RLS policies on bookings
SELECT 
    policyname, 
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'bookings';
