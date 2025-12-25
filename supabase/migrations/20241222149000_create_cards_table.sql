-- Create cards table
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_type TEXT NOT NULL CHECK (card_type IN ('virtual', 'physical')),
  card_category TEXT,
  card_number TEXT,
  card_name TEXT,
  expiry_date TEXT,
  cvv TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'blocked', 'expired', 'cancelled')),
  application_date DATE DEFAULT CURRENT_DATE,
  approval_date DATE,
  delivery_address TEXT,
  spending_limit DECIMAL(15,2),
  primary_use_case TEXT,
  additional_notes TEXT,
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  terms_accepted BOOLEAN DEFAULT false,
  terms_accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cards
CREATE POLICY "cards_select_own"
  ON public.cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "cards_insert_own"
  ON public.cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cards_update_own"
  ON public.cards FOR UPDATE
  USING (auth.uid() = user_id);

-- Add admin RLS policies for cards (allow all authenticated users to view/update for admin purposes)
CREATE POLICY "cards_select_all"
  ON public.cards FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "cards_update_all"
  ON public.cards FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON public.cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_status ON public.cards(status);
CREATE INDEX IF NOT EXISTS idx_cards_type ON public.cards(card_type);
CREATE INDEX IF NOT EXISTS idx_cards_created_at ON public.cards(created_at DESC);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_cards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_cards_updated_at_trigger ON public.cards;
CREATE TRIGGER update_cards_updated_at_trigger
  BEFORE UPDATE ON public.cards
  FOR EACH ROW
  EXECUTE FUNCTION update_cards_updated_at();




