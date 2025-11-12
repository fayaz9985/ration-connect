-- Drop the problematic INSERT policy
DROP POLICY IF EXISTS "Users can insert their own profile during registration" ON public.profiles;

-- Create a security definer function to get the current verified phone number
CREATE OR REPLACE FUNCTION public.get_current_verified_phone()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT phone_number
  FROM public.otp_codes
  WHERE verified = true
  ORDER BY created_at DESC
  LIMIT 1
$$;

-- Create the INSERT policy using the security definer function
CREATE POLICY "Users can insert their own profile during registration"
ON public.profiles
FOR INSERT
WITH CHECK (phone_number = get_current_verified_phone());