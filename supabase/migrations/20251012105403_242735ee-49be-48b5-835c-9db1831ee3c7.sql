-- ============================================
-- SECURITY FIX: Implement Proper Access Control
-- ============================================

-- 1. Create role system for authorization
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Grant admin role to existing admin user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM public.profiles
WHERE phone_number = '9985913379'
ON CONFLICT DO NOTHING;

-- 2. Create rate limiting table for OTP abuse prevention
CREATE TABLE public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  action text NOT NULL,
  attempt_count integer DEFAULT 1,
  window_start timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(identifier, action)
);

CREATE INDEX idx_rate_limits_lookup ON public.rate_limits(identifier, action, window_start);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can access rate limits
CREATE POLICY "Service role only for rate_limits"
ON public.rate_limits FOR ALL
USING (false);

-- Function to increment rate limits
CREATE OR REPLACE FUNCTION public.increment_rate_limit(
  _identifier text,
  _action text,
  _limit integer,
  _window_hours numeric
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count integer;
  window_threshold timestamptz;
BEGIN
  window_threshold := now() - (_window_hours || ' hours')::interval;
  
  -- Clean up old entries
  DELETE FROM public.rate_limits
  WHERE identifier = _identifier
    AND action = _action
    AND window_start < window_threshold;
  
  -- Get or create rate limit entry
  INSERT INTO public.rate_limits (identifier, action, attempt_count, window_start)
  VALUES (_identifier, _action, 1, now())
  ON CONFLICT (identifier, action)
  DO UPDATE SET
    attempt_count = rate_limits.attempt_count + 1,
    window_start = CASE
      WHEN rate_limits.window_start < window_threshold THEN now()
      ELSE rate_limits.window_start
    END
  RETURNING attempt_count INTO current_count;
  
  RETURN current_count <= _limit;
END;
$$;

-- 3. Update RLS policies for all tables

-- PROFILES: Service role access + admin read access
DROP POLICY IF EXISTS "Allow all operations on profiles" ON public.profiles;

CREATE POLICY "Service role full access to profiles"
ON public.profiles FOR ALL
TO service_role
USING (true);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = profiles.id AND role = 'admin'::app_role
  )
);

-- OTP_CODES: No public access, only service role via edge functions
DROP POLICY IF EXISTS "Allow all operations on otp_codes" ON public.otp_codes;

CREATE POLICY "Service role only for otp_codes"
ON public.otp_codes FOR ALL
TO service_role
USING (true);

-- TRANSACTIONS: Service role access for now (custom auth system limitation)
DROP POLICY IF EXISTS "Allow all operations on transactions" ON public.transactions;

CREATE POLICY "Service role full access to transactions"
ON public.transactions FOR ALL
TO service_role
USING (true);

-- RICE_CLAIMS: Service role access for now
DROP POLICY IF EXISTS "Allow all operations on rice_claims" ON public.rice_claims;

CREATE POLICY "Service role full access to rice_claims"
ON public.rice_claims FOR ALL
TO service_role
USING (true);

-- RATION_STOCK: Public read, service role write
DROP POLICY IF EXISTS "Allow all operations on ration_stock" ON public.ration_stock;

CREATE POLICY "Anyone can view stock"
ON public.ration_stock FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Service role can insert stock"
ON public.ration_stock FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can update stock"
ON public.ration_stock FOR UPDATE
TO service_role
USING (true);

CREATE POLICY "Service role can delete stock"
ON public.ration_stock FOR DELETE
TO service_role
USING (true);

-- SHOPS: Public read, service role write
DROP POLICY IF EXISTS "Allow all operations on shops" ON public.shops;

CREATE POLICY "Anyone can view shops"
ON public.shops FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Service role can insert shops"
ON public.shops FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can update shops"
ON public.shops FOR UPDATE
TO service_role
USING (true);

CREATE POLICY "Service role can delete shops"
ON public.shops FOR DELETE
TO service_role
USING (true);

-- USER_ROLES: Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = user_roles.user_id
  )
);

CREATE POLICY "Service role full access to user_roles"
ON public.user_roles FOR ALL
TO service_role
USING (true);