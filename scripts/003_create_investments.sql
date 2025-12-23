-- Create investments table
CREATE TABLE IF NOT EXISTS public.investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('basic', 'growth', 'premium', 'elite')),
  amount DECIMAL(15,2) NOT NULL,
  expected_return DECIMAL(5,2) NOT NULL, -- percentage
  duration_months INTEGER NOT NULL,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  current_value DECIMAL(15,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for investments
CREATE POLICY "investments_select_own"
  ON public.investments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "investments_insert_own"
  ON public.investments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "investments_update_own"
  ON public.investments FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON public.investments(user_id);
