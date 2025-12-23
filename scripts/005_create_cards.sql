-- Create cards table
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_type TEXT NOT NULL CHECK (card_type IN ('virtual', 'physical')),
  card_category TEXT NOT NULL,
  card_number TEXT,
  expiry_date TEXT,
  cvv TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'blocked', 'expired')),
  application_date DATE DEFAULT CURRENT_DATE,
  approval_date DATE,
  delivery_address TEXT,
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

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON public.cards(user_id);
