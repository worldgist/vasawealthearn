-- Migration: Create withdrawals table
-- Created: 2024-12-22
-- Description: Creates withdrawals table for withdrawal transactions with RLS policies, triggers, and admin access

-- Create withdrawals table for withdrawal transactions
CREATE TABLE IF NOT EXISTS public.withdrawals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    withdrawal_type VARCHAR(30) NOT NULL CHECK (withdrawal_type IN ('bank_transfer', 'wire', 'ach', 'check', 'crypto')),
    from_account_type VARCHAR(20) NOT NULL CHECK (from_account_type IN ('checking', 'savings')),
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'USD',
    withdrawal_fee DECIMAL(10,2) DEFAULT 0,
    net_amount DECIMAL(15,2) NOT NULL, -- Amount after fees
    total_amount DECIMAL(15,2) NOT NULL, -- Total amount including fees
    description TEXT,
    
    -- Bank account details (where to send the money)
    recipient_name VARCHAR(255) NOT NULL,
    recipient_account_number VARCHAR(50) NOT NULL,
    recipient_routing_number VARCHAR(20),
    recipient_bank_name VARCHAR(255) NOT NULL,
    recipient_bank_address TEXT,
    recipient_swift_code VARCHAR(20), -- For international transfers
    recipient_iban VARCHAR(50), -- For international transfers
    
    -- Crypto withdrawal details (if withdrawal_type is 'crypto')
    crypto_type VARCHAR(20), -- e.g., 'bitcoin', 'ethereum'
    crypto_wallet_address VARCHAR(255),
    crypto_network VARCHAR(50),
    
    -- Status and tracking
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'on_hold')),
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    hold_until TIMESTAMP WITH TIME ZONE,
    processed_date TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES auth.users(id), -- Admin who reviewed/approved the withdrawal
    rejection_reason TEXT, -- Reason for rejection if status is 'failed'
    
    -- Additional tracking
    estimated_arrival_date TIMESTAMP WITH TIME ZONE, -- When funds are expected to arrive
    transaction_id VARCHAR(100), -- External transaction ID from bank/payment processor
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON public.withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_reference_number ON public.withdrawals(reference_number);
CREATE INDEX IF NOT EXISTS idx_withdrawals_created_at ON public.withdrawals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdrawals_withdrawal_type ON public.withdrawals(withdrawal_type);

-- Enable RLS
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users
CREATE POLICY "withdrawals_select_own"
    ON public.withdrawals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "withdrawals_insert_own"
    ON public.withdrawals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "withdrawals_update_own"
    ON public.withdrawals FOR UPDATE
    USING (auth.uid() = user_id);

-- Admin policies for viewing and updating all withdrawals
CREATE POLICY "withdrawals_select_admin"
    ON public.withdrawals FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE email = auth.jwt() ->> 'email'
            AND is_active = true
        )
    );

CREATE POLICY "withdrawals_update_admin"
    ON public.withdrawals FOR UPDATE
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
        WHERE tgname = 'update_withdrawals_updated_at'
    ) THEN
        CREATE TRIGGER update_withdrawals_updated_at
            BEFORE UPDATE ON public.withdrawals
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;




