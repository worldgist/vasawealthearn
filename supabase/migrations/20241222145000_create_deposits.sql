-- Migration: Create deposits table
-- Created: 2024-12-22
-- Description: Creates deposits table for deposit transactions with RLS policies, triggers, and admin access

-- Create deposits table for deposit transactions
CREATE TABLE IF NOT EXISTS public.deposits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    deposit_type VARCHAR(30) NOT NULL CHECK (deposit_type IN ('check', 'cash', 'wire', 'ach', 'mobile_check')),
    to_account_type VARCHAR(20) NOT NULL CHECK (to_account_type IN ('checking', 'savings')),
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'USD',
    deposit_fee DECIMAL(10,2) DEFAULT 0,
    net_amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    check_number VARCHAR(50),
    check_front_image_url TEXT,
    check_back_image_url TEXT,
    depositor_name VARCHAR(255),
    depositor_account VARCHAR(50),
    depositor_routing VARCHAR(20),
    depositor_bank VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'on_hold')),
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    hold_until TIMESTAMP WITH TIME ZONE,
    processed_date TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES auth.users(id), -- Admin who reviewed/approved the deposit
    rejection_reason TEXT, -- Reason for rejection if status is 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON public.deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON public.deposits(status);
CREATE INDEX IF NOT EXISTS idx_deposits_reference_number ON public.deposits(reference_number);
CREATE INDEX IF NOT EXISTS idx_deposits_created_at ON public.deposits(created_at DESC);

-- Enable RLS
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users
CREATE POLICY "deposits_select_own"
    ON public.deposits FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "deposits_insert_own"
    ON public.deposits FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "deposits_update_own"
    ON public.deposits FOR UPDATE
    USING (auth.uid() = user_id);

-- Admin policies for viewing and updating all deposits
CREATE POLICY "deposits_select_admin"
    ON public.deposits FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE email = auth.jwt() ->> 'email'
            AND is_active = true
        )
    );

CREATE POLICY "deposits_update_admin"
    ON public.deposits FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE email = auth.jwt() ->> 'email'
            AND is_active = true
        )
    );

-- Create function to update updated_at timestamp (idempotent)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_deposits_updated_at'
    ) THEN
        CREATE TRIGGER update_deposits_updated_at
            BEFORE UPDATE ON public.deposits
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;




