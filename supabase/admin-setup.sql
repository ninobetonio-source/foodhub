-- ============================================
-- Admin User Setup Script for FoodHub
-- ============================================
-- This script creates an admin user with email: admin@foodhub.local
-- Password: Admin@123 (must be set via Supabase Auth UI or /register page)

-- Step 1: First, sign up via the /register page with the above credentials
-- This creates the auth.users row automatically

-- Step 2: Run the following SQL to set the role to 'admin'
UPDATE public.users AS u
SET role = 'admin', updated_at = now()
FROM auth.users AS au
WHERE u.id = au.id
  AND au.email = 'admin@foodhub.local';

-- Verify it worked
SELECT u.id, au.email, u.full_name, u.role, u.created_at
FROM public.users AS u
JOIN auth.users AS au ON au.id = u.id
WHERE au.email = 'admin@foodhub.local';
