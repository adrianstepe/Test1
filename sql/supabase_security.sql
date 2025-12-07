-- 1. Enable RLS on all tables
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- Create workflow_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.workflow_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    message TEXT,
    details JSONB
);
ALTER TABLE public.workflow_logs ENABLE ROW LEVEL SECURITY;

-- 2. Create Policies (Drop first to avoid errors)

-- SERVICES
DROP POLICY IF EXISTS "Public services are viewable by everyone" ON public.services;
DROP POLICY IF EXISTS "Admins can insert services" ON public.services;
DROP POLICY IF EXISTS "Admins can update services" ON public.services;

CREATE POLICY "Public services are viewable by everyone" 
ON public.services FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert services" 
ON public.services FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'doctor'))
);

CREATE POLICY "Admins can update services" 
ON public.services FOR UPDATE 
TO authenticated 
USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'doctor'))
);

-- PROFILES
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- BOOKINGS
-- SECURITY FIX: Removed "Anyone can create a booking" policy to prevent spam abuse.
-- Bookings are now ONLY created via the Stripe webhook -> n8n -> Supabase flow.
-- The n8n workflow uses service_role credentials, which bypass RLS.
-- This means no INSERT policy is needed for legitimate bookings to work.

DROP POLICY IF EXISTS "Anyone can create a booking" ON public.bookings;
DROP POLICY IF EXISTS "Admins and Doctors can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins and Doctors can update bookings" ON public.bookings;

-- NOTE: No INSERT policy created. service_role bypasses RLS for n8n inserts.
-- Anonymous clients cannot insert bookings directly - they must go through Stripe payment.

CREATE POLICY "Admins and Doctors can view all bookings" 
ON public.bookings FOR SELECT 
TO authenticated 
USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'doctor', 'receptionist'))
);

CREATE POLICY "Admins and Doctors can update bookings" 
ON public.bookings FOR UPDATE 
TO authenticated 
USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'doctor', 'receptionist'))
);

-- WORKFLOW LOGS
DROP POLICY IF EXISTS "Admins can view logs" ON public.workflow_logs;

CREATE POLICY "Admins can view logs" 
ON public.workflow_logs FOR SELECT 
TO authenticated 
USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 3. FIX LOGIN ISSUE: Auto-confirm all users
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;

-- 4. Ensure your user has a profile
INSERT INTO public.profiles (id, role, full_name)
SELECT id, 'admin', 'System Admin'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 5. Ensure specific admin email has admin role (Run this manually if needed, or uncomment)
-- INSERT INTO public.profiles (id, role, full_name)
-- SELECT id, 'admin', 'System Admin'
-- FROM auth.users
-- WHERE email = 'admin@example.com'
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';
