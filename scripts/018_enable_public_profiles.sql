-- Enable Public Profile Access
-- This script adds a username field and enables public read access to profiles

-- Add username field to profiles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'username'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN username TEXT UNIQUE;
    CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
  END IF;
END $$;

-- Add account_status field if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'account_status'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'closed', 'frozen'));
  END IF;
END $$;

-- Add public_read policy for profiles (non-sensitive information only)
DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;

CREATE POLICY "profiles_public_read"
  ON public.profiles FOR SELECT
  USING (
    (account_status IS NULL OR account_status = 'active')
    AND (kyc_status IS NULL OR kyc_status = 'verified')
  );

-- Create a function to get public profile data
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_username TEXT DEFAULT NULL, profile_id UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  kyc_status TEXT,
  account_status TEXT,
  is_verified BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.first_name,
    p.last_name,
    p.created_at,
    p.kyc_status,
    p.account_status,
    CASE WHEN p.kyc_status = 'verified' THEN true ELSE false END as is_verified
  FROM public.profiles p
  WHERE 
    (p.account_status IS NULL OR p.account_status = 'active')
    AND (
      (profile_username IS NOT NULL AND p.username = profile_username)
      OR (profile_id IS NOT NULL AND p.id = profile_id)
    )
  LIMIT 1;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_public_profile(TEXT, UUID) TO anon, authenticated;

