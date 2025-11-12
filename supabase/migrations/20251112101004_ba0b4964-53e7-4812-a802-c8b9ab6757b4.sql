-- Add INSERT policy for user registration
-- This allows users to insert their own profile during registration
CREATE POLICY "Users can insert their own profile during registration"
ON public.profiles
FOR INSERT
WITH CHECK (
  phone_number IN (
    SELECT phone_number
    FROM public.otp_codes
    WHERE verified = true
    ORDER BY created_at DESC
    LIMIT 1
  )
);