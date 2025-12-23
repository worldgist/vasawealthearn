-- Enhanced User Profile Table
-- This table stores comprehensive user profile information

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Personal Information
  first_name TEXT,
  middle_name TEXT,
  last_name TEXT,
  full_name TEXT GENERATED ALWAYS AS (
    COALESCE(
      TRIM(
        CONCAT_WS(' ', 
          NULLIF(first_name, ''), 
          NULLIF(middle_name, ''), 
          NULLIF(last_name, '')
        )
      ),
      email
    )
  ) STORED,
  email TEXT NOT NULL,
  phone TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  
  -- Address Information
  address TEXT,
  address_line_2 TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'United States',
  
  -- Account Information
  account_number TEXT UNIQUE,
  account_type TEXT DEFAULT 'checking' CHECK (account_type IN ('checking', 'savings', 'premium', 'business')),
  balance DECIMAL(15,2) DEFAULT 0.00,
  currency TEXT DEFAULT 'USD',
  
  -- KYC & Verification
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected', 'under_review')),
  kyc_verified_at TIMESTAMP WITH TIME ZONE,
  kyc_rejection_reason TEXT,
  identity_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  
  -- Security
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  last_password_change TIMESTAMP WITH TIME ZONE,
  security_questions_set BOOLEAN DEFAULT FALSE,
  
  -- Account Status
  account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'closed', 'frozen')),
  account_status_reason TEXT,
  account_suspended_at TIMESTAMP WITH TIME ZONE,
  account_closed_at TIMESTAMP WITH TIME ZONE,
  
  -- Preferences
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  notification_preferences JSONB DEFAULT '{"email": true, "sms": true, "push": true}'::jsonb,
  
  -- Banking Details
  routing_number TEXT,
  swift_code TEXT,
  iban TEXT,
  
  -- Profile Image
  avatar_url TEXT,
  
  -- Metadata
  last_login TIMESTAMP WITH TIME ZONE,
  last_active TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_account_number ON public.user_profiles(account_number);
CREATE INDEX IF NOT EXISTS idx_user_profiles_kyc_status ON public.user_profiles(kyc_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_account_status ON public.user_profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON public.user_profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone ON public.user_profiles(phone) WHERE phone IS NOT NULL;

-- Enable RLS (Row Level Security)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
-- Users can view their own profile
CREATE POLICY "user_profiles_select_own"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "user_profiles_insert_own"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile (except sensitive fields)
CREATE POLICY "user_profiles_update_own"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can delete their own profile (soft delete)
CREATE POLICY "user_profiles_delete_own"
  ON public.user_profiles FOR DELETE
  USING (auth.uid() = id);

-- Admin can view all profiles (if admin_users table exists)
CREATE POLICY "user_profiles_select_admin"
  ON public.user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = (auth.jwt() ->> 'email') 
      AND is_active = TRUE
    )
  );

-- Admin can update all profiles
CREATE POLICY "user_profiles_update_admin"
  ON public.user_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = (auth.jwt() ->> 'email') 
      AND is_active = TRUE
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_profiles_updated_at();

-- Create function to auto-generate account number
CREATE OR REPLACE FUNCTION public.generate_account_number()
RETURNS TEXT AS $$
DECLARE
  new_account_number TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate 10-digit account number
    new_account_number := LPAD(FLOOR(RANDOM() * 10000000000)::TEXT, 10, '0');
    
    -- Check if it already exists
    SELECT EXISTS(SELECT 1 FROM public.user_profiles WHERE account_number = new_account_number) INTO exists_check;
    
    -- Exit loop if unique
    EXIT WHEN NOT exists_check;
  END LOOP;
  
  RETURN new_account_number;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id, 
    first_name, 
    last_name, 
    email,
    account_number,
    email_verified
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', NULL),
    NEW.email,
    public.generate_account_number(),
    COALESCE((NEW.raw_user_meta_data ->> 'email_verified')::boolean, NEW.email_confirmed_at IS NOT NULL, FALSE)
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_profile();

-- Create function to get user full profile
CREATE OR REPLACE FUNCTION public.get_user_profile(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  account_number TEXT,
  balance DECIMAL,
  kyc_status TEXT,
  account_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.id,
    up.full_name,
    up.email,
    up.phone,
    up.account_number,
    up.balance,
    up.kyc_status,
    up.account_status,
    up.created_at
  FROM public.user_profiles up
  WHERE up.id = user_uuid
    AND up.deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON TABLE public.user_profiles IS 'Comprehensive user profile information for banking application';
COMMENT ON COLUMN public.user_profiles.id IS 'References auth.users(id) - Primary key';
COMMENT ON COLUMN public.user_profiles.account_number IS 'Unique 10-digit account number';
COMMENT ON COLUMN public.user_profiles.balance IS 'Current account balance in account currency';
COMMENT ON COLUMN public.user_profiles.kyc_status IS 'KYC verification status';
COMMENT ON COLUMN public.user_profiles.account_status IS 'Account status (active, suspended, closed, frozen)';
COMMENT ON COLUMN public.user_profiles.notification_preferences IS 'JSON object storing user notification preferences';



