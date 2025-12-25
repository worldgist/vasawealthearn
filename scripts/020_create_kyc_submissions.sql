-- Create KYC submissions table
CREATE TABLE IF NOT EXISTS public.kyc_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Personal Information
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  ssn TEXT,
  
  -- Driver License Information
  license_number TEXT,
  license_state TEXT,
  license_expiry DATE,
  
  -- Address Information
  street_address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'United States',
  
  -- Document URLs (stored in storage)
  license_front_url TEXT,
  license_back_url TEXT,
  selfie_url TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for KYC submissions
CREATE POLICY "kyc_submissions_select_own"
  ON public.kyc_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "kyc_submissions_insert_own"
  ON public.kyc_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin can view all KYC submissions
CREATE POLICY "kyc_submissions_select_admin"
  ON public.kyc_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_active = true
    )
  );

-- Admin can update KYC submissions
CREATE POLICY "kyc_submissions_update_admin"
  ON public.kyc_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_active = true
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_user_id ON public.kyc_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_status ON public.kyc_submissions(status);
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_submitted_at ON public.kyc_submissions(submitted_at DESC);




