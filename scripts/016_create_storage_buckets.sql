-- Create storage buckets for deposit receipts and other file uploads
-- This script sets up secure file storage with proper RLS policies

-- Create storage bucket for deposit receipts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'deposit-receipts',
  'deposit-receipts',
  false, -- Private bucket
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
);

-- Create storage bucket for KYC documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kyc-documents',
  'kyc-documents',
  false, -- Private bucket
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
);

-- Create storage bucket for support ticket attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'support-attachments',
  'support-attachments',
  false, -- Private bucket
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain']
);

-- RLS Policies for deposit-receipts bucket
CREATE POLICY "Users can upload their own deposit receipts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'deposit-receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own deposit receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'deposit-receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own deposit receipts"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'deposit-receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own deposit receipts"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'deposit-receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policies for kyc-documents bucket
CREATE POLICY "Users can upload their own KYC documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'kyc-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own KYC documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'kyc-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policies for support-attachments bucket
CREATE POLICY "Users can upload their own support attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'support-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own support attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'support-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admin policies for all buckets (admins can access all files)
CREATE POLICY "Admins can access all deposit receipts"
ON storage.objects FOR ALL
USING (
  bucket_id = 'deposit-receipts' 
  AND EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = auth.jwt() ->> 'email' 
    AND is_active = true
  )
);

CREATE POLICY "Admins can access all KYC documents"
ON storage.objects FOR ALL
USING (
  bucket_id = 'kyc-documents' 
  AND EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = auth.jwt() ->> 'email' 
    AND is_active = true
  )
);

CREATE POLICY "Admins can access all support attachments"
ON storage.objects FOR ALL
USING (
  bucket_id = 'support-attachments' 
  AND EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = auth.jwt() ->> 'email' 
    AND is_active = true
  )
);
