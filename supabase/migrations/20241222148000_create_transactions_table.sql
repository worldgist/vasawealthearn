-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'transfer', 
    'deposit', 
    'withdrawal', 
    'investment', 
    'loan_payment',
    'loan_disbursement',
    'crypto_investment',
    'stock_investment',
    'real_estate_investment'
  )),
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  recipient_name TEXT,
  recipient_account TEXT,
  recipient_routing TEXT,
  recipient_bank TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  reference_number TEXT,
  reference_id TEXT,
  fee DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transactions
CREATE POLICY "transactions_select_own"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "transactions_insert_own"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transactions_update_own"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id);

-- Add admin RLS policies for transactions (allow all authenticated users to view/update for admin purposes)
CREATE POLICY "transactions_select_all"
  ON public.transactions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "transactions_update_all"
  ON public.transactions FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_reference_number ON public.transactions(reference_number);
CREATE INDEX IF NOT EXISTS idx_transactions_reference_id ON public.transactions(reference_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_transactions_updated_at_trigger ON public.transactions;
CREATE TRIGGER update_transactions_updated_at_trigger
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_transactions_updated_at();




