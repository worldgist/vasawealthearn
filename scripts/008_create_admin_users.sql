-- Create admin users table for admin dashboard
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  permissions TEXT[] DEFAULT ARRAY['users', 'transactions', 'loans', 'investments', 'kyc'],
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for admin users (only admins can access)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Admin policies (restrict access to admin users only)
CREATE POLICY "admin_users_select_admin_only"
  ON public.admin_users FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE email = auth.jwt() ->> 'email' AND is_active = TRUE));

-- Insert default admin user (password should be hashed in production)
INSERT INTO public.admin_users (email, password_hash, full_name, role)
VALUES ('admin@vasawealthearn.com', '$2a$10$example_hash', 'System Administrator', 'super_admin')
ON CONFLICT (email) DO NOTHING;
