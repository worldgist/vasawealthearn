-- Complete User Profile Table Creation Script
-- This script creates a comprehensive profiles table with all necessary fields
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/_/sql/new

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Personal Information
  first_name TEXT,
  middle_name TEXT,
  last_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  
  -- Address Information
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'United States',
  
  -- Account Information
  account_number TEXT UNIQUE,
  username TEXT UNIQUE,
  balance DECIMAL(15,2) DEFAULT 0.00,
  account_type TEXT DEFAULT 'checking' CHECK (account_type IN ('checking', 'savings', 'premium', 'business')),
  currency TEXT DEFAULT 'USD',
  
  -- KYC & Verification
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected', 'under_review')),
  kyc_verified_at TIMESTAMP WITH TIME ZONE,
  kyc_rejection_reason TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  
  -- Account Status
  account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'closed', 'frozen')),
  account_status_reason TEXT,
  
  -- Security & Activity
  last_login TIMESTAMP WITH TIME ZONE,
  last_active TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  
  -- Profile Image
  avatar_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_account_number ON public.profiles(account_number);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username) WHERE username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_kyc_status ON public.profiles(kyc_status);
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON public.profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone) WHERE phone IS NOT NULL;

-- Enable RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;

-- RLS Policies: Users can view their own profile
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- RLS Policies: Users can insert their own profile
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies: Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies: Users can delete their own profile
CREATE POLICY "profiles_delete_own"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- Public read policy for verified, active profiles (for public profile pages)
CREATE POLICY "profiles_public_read"
  ON public.profiles FOR SELECT
  USING (
    (account_status IS NULL OR account_status = 'active')
    AND (kyc_status IS NULL OR kyc_status = 'verified')
  );

-- Admin can view all profiles (if admin_users table exists)
CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = (auth.jwt() ->> 'email') 
      AND is_active = TRUE
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profiles_updated_at();

-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    first_name, 
    last_name, 
    email,
    username,
    account_number
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'username', NULL),
    -- Generate a unique account number
    'ACC' || LPAD(FLOOR(RANDOM() * 1000000000)::TEXT, 9, '0')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to get public profile data
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

-- Add helpful comment
COMMENT ON TABLE public.profiles IS 'User profiles table that extends auth.users with additional user information';



