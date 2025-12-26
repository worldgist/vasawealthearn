-- Create storage bucket for receipt uploads
-- This script sets up secure file storage for deposit receipts and other receipts

-- Create storage bucket for deposit receipts (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'deposit-receipts',
  'deposit-receipts',
  false, -- Private bucket
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for general receipts (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'receipts',
  'receipts',
  false, -- Private bucket
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for deposit-receipts bucket
-- Users can upload their own deposit receipts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload their own deposit receipts'
  ) THEN
    CREATE POLICY "Users can upload their own deposit receipts"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'deposit-receipts' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

-- Users can view their own deposit receipts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can view their own deposit receipts'
  ) THEN
    CREATE POLICY "Users can view their own deposit receipts"
    ON storage.objects FOR SELECT
    USING (
      bucket_id = 'deposit-receipts' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

-- Users can update their own deposit receipts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can update their own deposit receipts'
  ) THEN
    CREATE POLICY "Users can update their own deposit receipts"
    ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'deposit-receipts' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

-- Users can delete their own deposit receipts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can delete their own deposit receipts'
  ) THEN
    CREATE POLICY "Users can delete their own deposit receipts"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'deposit-receipts' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

-- RLS Policies for receipts bucket (general receipts)
-- Users can upload their own receipts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload their own receipts'
  ) THEN
    CREATE POLICY "Users can upload their own receipts"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'receipts' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

-- Users can view their own receipts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can view their own receipts'
  ) THEN
    CREATE POLICY "Users can view their own receipts"
    ON storage.objects FOR SELECT
    USING (
      bucket_id = 'receipts' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

-- Users can update their own receipts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can update their own receipts'
  ) THEN
    CREATE POLICY "Users can update their own receipts"
    ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'receipts' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

-- Users can delete their own receipts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can delete their own receipts'
  ) THEN
    CREATE POLICY "Users can delete their own receipts"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'receipts' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

-- Admin policies for deposit-receipts bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Admins can access all deposit receipts'
  ) THEN
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
  END IF;
END $$;

-- Admin policies for receipts bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Admins can access all receipts'
  ) THEN
    CREATE POLICY "Admins can access all receipts"
    ON storage.objects FOR ALL
    USING (
      bucket_id = 'receipts' 
      AND EXISTS (
        SELECT 1 FROM admin_users 
        WHERE email = auth.jwt() ->> 'email' 
        AND is_active = true
      )
    );
  END IF;
END $$;

