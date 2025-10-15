-- Make the user with phone number 9985913379 an admin
-- First, get the profile ID for this phone number and insert admin role

DO $$
DECLARE
  admin_profile_id uuid;
BEGIN
  -- Get the profile ID for phone number 9985913379
  SELECT id INTO admin_profile_id
  FROM profiles
  WHERE phone_number = '9985913379'
  LIMIT 1;

  -- If profile exists, insert admin role (if not already exists)
  IF admin_profile_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role)
    VALUES (admin_profile_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Admin role granted to user with phone number 9985913379';
  ELSE
    RAISE NOTICE 'No profile found with phone number 9985913379. User needs to register first.';
  END IF;
END $$;