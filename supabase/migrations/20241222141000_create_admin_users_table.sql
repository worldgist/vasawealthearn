-- Migration: Create admin users table
-- Created: 2024-12-22
-- Description: Creates admin_users table for managing admin access and permissions

-- Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'moderator')),
  is_active BOOLEAN DEFAULT TRUE,
  permissions JSONB DEFAULT '{"users": true, "transactions": true, "kyc": true, "deposits": true, "loans": true}'::jsonb,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  notes TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON public.admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON public.admin_users(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_users_created_at ON public.admin_users(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "admin_users_select_own" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_select_all" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_insert_admin" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_update_admin" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_delete_admin" ON public.admin_users;

-- RLS Policy: Admins can view all admin users
CREATE POLICY "admin_users_select_all"
  ON public.admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = (auth.jwt() ->> 'email') 
      AND is_active = TRUE
    )
  );

-- RLS Policy: Only super admins can insert new admin users
CREATE POLICY "admin_users_insert_admin"
  ON public.admin_users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = (auth.jwt() ->> 'email') 
      AND is_active = TRUE
      AND role = 'super_admin'
    )
  );

-- RLS Policy: Only super admins can update admin users
CREATE POLICY "admin_users_update_admin"
  ON public.admin_users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = (auth.jwt() ->> 'email') 
      AND is_active = TRUE
      AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = (auth.jwt() ->> 'email') 
      AND is_active = TRUE
      AND role = 'super_admin'
    )
  );

-- RLS Policy: Only super admins can delete admin users
CREATE POLICY "admin_users_delete_admin"
  ON public.admin_users FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = (auth.jwt() ->> 'email') 
      AND is_active = TRUE
      AND role = 'super_admin'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_admin_users_updated_at();

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = user_email 
    AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get admin permissions
CREATE OR REPLACE FUNCTION public.get_admin_permissions(user_email TEXT)
RETURNS JSONB AS $$
DECLARE
  admin_perms JSONB;
BEGIN
  SELECT permissions INTO admin_perms
  FROM public.admin_users 
  WHERE email = user_email 
  AND is_active = TRUE;
  
  RETURN COALESCE(admin_perms, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.is_admin(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_permissions(TEXT) TO authenticated;

-- Add helpful comments
COMMENT ON TABLE public.admin_users IS 'Admin users table for managing administrative access';
COMMENT ON COLUMN public.admin_users.email IS 'Email address of the admin user (must match auth.users email)';
COMMENT ON COLUMN public.admin_users.role IS 'Admin role: admin, super_admin, or moderator';
COMMENT ON COLUMN public.admin_users.permissions IS 'JSON object storing granular permissions for different features';
COMMENT ON COLUMN public.admin_users.is_active IS 'Whether the admin account is active';

-- Insert a default super admin (optional - you can remove this if you don't want a default admin)
-- Replace 'your-admin-email@example.com' with your actual admin email
-- Uncomment and modify the following lines to create your first admin:
/*
INSERT INTO public.admin_users (email, name, role, is_active, permissions)
VALUES (
  'your-admin-email@example.com',
  'Super Admin',
  'super_admin',
  TRUE,
  '{"users": true, "transactions": true, "kyc": true, "deposits": true, "loans": true, "cards": true, "settings": true}'::jsonb
)
ON CONFLICT (email) DO NOTHING;
*/



