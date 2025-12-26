-- Add ID and Passport document types to KYC documents table
-- This script extends the KYC documents table to support ID cards and passports

-- Update the document_type check constraint to include ID and passport
ALTER TABLE public.kyc_documents 
DROP CONSTRAINT IF EXISTS kyc_documents_document_type_check;

ALTER TABLE public.kyc_documents
ADD CONSTRAINT kyc_documents_document_type_check 
CHECK (document_type IN (
  'drivers_license_front', 
  'drivers_license_back', 
  'selfie', 
  'address_proof',
  'id_card_front',
  'id_card_back',
  'passport_front',
  'passport_back'
));

-- Update KYC submissions table to include ID and passport fields
ALTER TABLE public.kyc_submissions
ADD COLUMN IF NOT EXISTS id_card_front_url TEXT,
ADD COLUMN IF NOT EXISTS id_card_back_url TEXT,
ADD COLUMN IF NOT EXISTS passport_front_url TEXT,
ADD COLUMN IF NOT EXISTS passport_back_url TEXT,
ADD COLUMN IF NOT EXISTS id_card_number TEXT,
ADD COLUMN IF NOT EXISTS id_card_issuing_country TEXT,
ADD COLUMN IF NOT EXISTS id_card_expiry DATE,
ADD COLUMN IF NOT EXISTS passport_number TEXT,
ADD COLUMN IF NOT EXISTS passport_issuing_country TEXT,
ADD COLUMN IF NOT EXISTS passport_expiry DATE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_id_card ON public.kyc_submissions(id_card_number);
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_passport ON public.kyc_submissions(passport_number);

