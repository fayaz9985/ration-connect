-- Add RLS policies to allow users to access their own data
-- This is critical for the application to work properly after deployment

-- Profiles table: Allow users to view and update their own profile
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (id = (SELECT id FROM profiles WHERE phone_number IN (
  SELECT phone_number FROM otp_codes WHERE verified = true ORDER BY created_at DESC LIMIT 1
)));

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (id = (SELECT id FROM profiles WHERE phone_number IN (
  SELECT phone_number FROM otp_codes WHERE verified = true ORDER BY created_at DESC LIMIT 1
)));

-- Transactions table: Allow users to view and create their own transactions
CREATE POLICY "Users can view own transactions"
ON transactions FOR SELECT
USING (profile_id IN (
  SELECT id FROM profiles WHERE phone_number IN (
    SELECT phone_number FROM otp_codes WHERE verified = true ORDER BY created_at DESC LIMIT 1
  )
));

CREATE POLICY "Users can create own transactions"
ON transactions FOR INSERT
WITH CHECK (profile_id IN (
  SELECT id FROM profiles WHERE phone_number IN (
    SELECT phone_number FROM otp_codes WHERE verified = true ORDER BY created_at DESC LIMIT 1
  )
));

-- Rice claims table: Allow users to view and create their own rice claims
CREATE POLICY "Users can view own rice claims"
ON rice_claims FOR SELECT
USING (profile_id IN (
  SELECT id FROM profiles WHERE phone_number IN (
    SELECT phone_number FROM otp_codes WHERE verified = true ORDER BY created_at DESC LIMIT 1
  )
));

CREATE POLICY "Users can create own rice claims"
ON rice_claims FOR INSERT
WITH CHECK (profile_id IN (
  SELECT id FROM profiles WHERE phone_number IN (
    SELECT phone_number FROM otp_codes WHERE verified = true ORDER BY created_at DESC LIMIT 1
  )
));