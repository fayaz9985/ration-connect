-- Fix recursion in profiles RLS policies by avoiding self-references
-- 1) Drop problematic policies that reference profiles inside profiles
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- 2) Recreate safe policies using security definer helper (no self-reference)
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (phone_number = public.get_current_verified_phone());

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (phone_number = public.get_current_verified_phone());