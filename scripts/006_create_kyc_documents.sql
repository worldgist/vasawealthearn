-- Create KYC documents table
CREATE TABLE IF NOT EXISTS public.kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('drivers_license_front', 'drivers_license_back', 'selfie', 'address_proof')),
  file_url TEXT,
  file_name TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  rejection_reason TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for KYC documents
CREATE POLICY "kyc_documents_select_own"
  ON public.kyc_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "kyc_documents_insert_own"
  ON public.kyc_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "kyc_documents_update_own"
  ON public.kyc_documents FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_kyc_documents_user_id ON public.kyc_documents(user_id);
