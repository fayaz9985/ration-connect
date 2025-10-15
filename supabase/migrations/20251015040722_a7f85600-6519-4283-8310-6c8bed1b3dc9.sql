-- Drop the existing restrictive policy and create a more permissive one
-- This allows the client to check user roles
-- Since roles are not sensitive data (just 'admin', 'user', etc.), this is acceptable

DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;

-- Allow anyone to view all user roles
-- This is needed because we use custom phone/OTP auth, not Supabase Auth
-- So auth.uid() is always null and we can't restrict based on it
CREATE POLICY "Anyone can view user roles"
ON user_roles FOR SELECT
TO anon, authenticated
USING (true);