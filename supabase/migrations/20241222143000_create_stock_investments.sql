-- Migration: Create stock_investments table
-- Created: 2024-12-22
-- Description: Creates stock_investments table for stock investment transactions with RLS policies, triggers, and auto-calculation functions

-- Create stock_investments table for stock investment transactions
CREATE TABLE IF NOT EXISTS public.stock_investments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    stock_symbol VARCHAR(10) NOT NULL, -- e.g., 'AAPL', 'MSFT', 'GOOGL'
    stock_name VARCHAR(100) NOT NULL, -- e.g., 'Apple Inc.', 'Microsoft Corporation'
    stock_exchange VARCHAR(20), -- e.g., 'NASDAQ', 'NYSE'
    amount_invested DECIMAL(15,2) NOT NULL CHECK (amount_invested > 0),
    price_per_share DECIMAL(15,4) NOT NULL CHECK (price_per_share > 0), -- Stock price per share
    shares DECIMAL(15,4) NOT NULL CHECK (shares > 0), -- Number of shares purchased
    currency VARCHAR(3) DEFAULT 'USD',
    current_price DECIMAL(15,4), -- Current market price per share (can be updated)
    current_value DECIMAL(15,2), -- Current value in USD (shares * current_price)
    profit_loss DECIMAL(15,2), -- Current profit/loss (current_value - amount_invested)
    profit_loss_percentage DECIMAL(5,2), -- Percentage gain/loss
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'sold', 'cancelled')),
    transaction_type VARCHAR(20) DEFAULT 'buy' CHECK (transaction_type IN ('buy', 'sell')),
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    sold_at TIMESTAMP WITH TIME ZONE, -- When the investment was sold
    sold_price DECIMAL(15,4), -- Price per share at which it was sold
    sold_shares DECIMAL(15,4), -- Number of shares sold
    sold_amount DECIMAL(15,2), -- Total amount received when sold
    dividend_yield DECIMAL(5,2), -- Annual dividend yield percentage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stock_investments_user_id ON public.stock_investments(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_investments_status ON public.stock_investments(status);
CREATE INDEX IF NOT EXISTS idx_stock_investments_stock_symbol ON public.stock_investments(stock_symbol);
CREATE INDEX IF NOT EXISTS idx_stock_investments_reference_number ON public.stock_investments(reference_number);
CREATE INDEX IF NOT EXISTS idx_stock_investments_created_at ON public.stock_investments(created_at DESC);

-- Enable RLS
ALTER TABLE public.stock_investments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "stock_investments_select_own"
    ON public.stock_investments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "stock_investments_insert_own"
    ON public.stock_investments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "stock_investments_update_own"
    ON public.stock_investments FOR UPDATE
    USING (auth.uid() = user_id);

-- Admin policies for viewing all stock investments
CREATE POLICY "stock_investments_select_admin"
    ON public.stock_investments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE email = auth.jwt() ->> 'email'
            AND is_active = true
        )
    );

CREATE POLICY "stock_investments_update_admin"
    ON public.stock_investments FOR UPDATE
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
        WHERE tgname = 'update_stock_investments_updated_at'
    ) THEN
        CREATE TRIGGER update_stock_investments_updated_at
            BEFORE UPDATE ON public.stock_investments
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- Create a function to automatically calculate current_value and profit_loss
CREATE OR REPLACE FUNCTION calculate_stock_investment_value()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate current value if current_price is provided
    IF NEW.current_price IS NOT NULL THEN
        NEW.current_value := NEW.shares * NEW.current_price;
        
        -- Calculate profit/loss
        IF NEW.current_value IS NOT NULL AND NEW.amount_invested IS NOT NULL THEN
            NEW.profit_loss := NEW.current_value - NEW.amount_invested;
            
            -- Calculate profit/loss percentage
            IF NEW.amount_invested > 0 THEN
                NEW.profit_loss_percentage := ((NEW.current_value - NEW.amount_invested) / NEW.amount_invested) * 100;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'calculate_stock_investment_trigger'
    ) THEN
        CREATE TRIGGER calculate_stock_investment_trigger
            BEFORE INSERT OR UPDATE ON public.stock_investments
            FOR EACH ROW
            WHEN (NEW.current_price IS NOT NULL)
            EXECUTE FUNCTION calculate_stock_investment_value();
    END IF;
END $$;

