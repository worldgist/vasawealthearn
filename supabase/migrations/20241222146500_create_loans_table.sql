-- Create loans table
CREATE TABLE IF NOT EXISTS public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  loan_type TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  purpose TEXT,
  duration_months INTEGER NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  monthly_payment DECIMAL(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'completed')),
  application_date DATE DEFAULT CURRENT_DATE,
  approval_date DATE,
  disbursement_date DATE,
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  employment_status TEXT,
  annual_income DECIMAL(15,2),
  credit_score INTEGER,
  terms_accepted BOOLEAN DEFAULT false,
  terms_accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for loans
CREATE POLICY "loans_select_own"
  ON public.loans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "loans_insert_own"
  ON public.loans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "loans_update_own"
  ON public.loans FOR UPDATE
  USING (auth.uid() = user_id);

-- Add admin RLS policies for loans (allow all authenticated users to view/update for admin purposes)
-- In production, you should add proper admin role checking
CREATE POLICY "loans_select_all"
  ON public.loans FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "loans_update_all"
  ON public.loans FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_loans_user_id ON public.loans(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON public.loans(status);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_loans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_loans_updated_at_trigger ON public.loans;
CREATE TRIGGER update_loans_updated_at_trigger
  BEFORE UPDATE ON public.loans
  FOR EACH ROW
  EXECUTE FUNCTION update_loans_updated_at();

