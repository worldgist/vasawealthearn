-- Create settings table for system-wide settings
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type TEXT DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'security', 'email', 'payment', 'notification', 'maintenance')),
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for settings
-- Public settings can be read by anyone
CREATE POLICY "settings_select_public"
  ON public.settings FOR SELECT
  USING (is_public = true);

-- All authenticated users can read all settings (for admin purposes)
CREATE POLICY "settings_select_all"
  ON public.settings FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admins can insert/update settings (for now, allow all authenticated users)
CREATE POLICY "settings_insert_all"
  ON public.settings FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "settings_update_all"
  ON public.settings FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_settings_key ON public.settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON public.settings(category);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_settings_updated_at_trigger ON public.settings;
CREATE TRIGGER update_settings_updated_at_trigger
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();

-- Insert default settings
INSERT INTO public.settings (setting_key, setting_value, setting_type, category, description, is_public) VALUES
  ('site_name', 'Vasawealthearn', 'string', 'general', 'Site name', true),
  ('maintenance_mode', 'false', 'boolean', 'maintenance', 'Enable/disable maintenance mode', false),
  ('max_transfer_amount', '100000', 'number', 'payment', 'Maximum transfer amount per transaction', false),
  ('min_transfer_amount', '10', 'number', 'payment', 'Minimum transfer amount per transaction', false),
  ('transfer_fee_percentage', '0', 'number', 'payment', 'Transfer fee percentage', false),
  ('kyc_required', 'true', 'boolean', 'security', 'Require KYC verification for transactions', false),
  ('email_notifications_enabled', 'true', 'boolean', 'notification', 'Enable email notifications', false),
  ('support_email', 'support@vasawealthearn.com', 'string', 'email', 'Support email address', true),
  ('contact_phone', '+1-800-123-4567', 'string', 'general', 'Contact phone number', true),
  ('currency', 'USD', 'string', 'payment', 'Default currency', true)
ON CONFLICT (setting_key) DO NOTHING;


