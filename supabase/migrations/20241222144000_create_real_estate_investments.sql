-- Migration: Create real_estate_investments table
-- Created: 2024-12-22
-- Description: Creates real_estate_investments table for real estate investment transactions with RLS policies, triggers, and auto-calculation functions

-- Create real_estate_investments table for real estate investment transactions
CREATE TABLE IF NOT EXISTS public.real_estate_investments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    property_id VARCHAR(50) NOT NULL, -- Unique identifier for the property
    property_name VARCHAR(200) NOT NULL, -- Property name/title
    property_type VARCHAR(50), -- e.g., 'residential', 'commercial', 'land', 'apartment'
    location VARCHAR(200) NOT NULL, -- Property location/address
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'United States',
    amount_invested DECIMAL(15,2) NOT NULL CHECK (amount_invested > 0),
    property_value DECIMAL(15,2) NOT NULL CHECK (property_value > 0), -- Total property value
    investment_percentage DECIMAL(5,2), -- Percentage of property owned (if fractional)
    expected_return DECIMAL(5,2), -- Expected annual return percentage
    currency VARCHAR(3) DEFAULT 'USD',
    current_value DECIMAL(15,2), -- Current estimated property value
    current_investment_value DECIMAL(15,2), -- Current value of user's investment portion
    profit_loss DECIMAL(15,2), -- Current profit/loss (current_investment_value - amount_invested)
    profit_loss_percentage DECIMAL(5,2), -- Percentage gain/loss
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'sold', 'cancelled', 'completed')),
    transaction_type VARCHAR(20) DEFAULT 'buy' CHECK (transaction_type IN ('buy', 'sell')),
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    property_image_url TEXT, -- URL to property image
    bedrooms INTEGER, -- Number of bedrooms (for residential)
    bathrooms DECIMAL(3,1), -- Number of bathrooms
    square_feet DECIMAL(10,2), -- Property size in square feet
    year_built INTEGER, -- Year the property was built
    sold_at TIMESTAMP WITH TIME ZONE, -- When the investment was sold
    sold_price DECIMAL(15,2), -- Price at which it was sold
    sold_amount DECIMAL(15,2), -- Amount received when sold
    rental_income DECIMAL(15,2), -- Monthly/annual rental income (if applicable)
    maintenance_cost DECIMAL(15,2), -- Monthly/annual maintenance cost
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_real_estate_investments_user_id ON public.real_estate_investments(user_id);
CREATE INDEX IF NOT EXISTS idx_real_estate_investments_status ON public.real_estate_investments(status);
CREATE INDEX IF NOT EXISTS idx_real_estate_investments_property_id ON public.real_estate_investments(property_id);
CREATE INDEX IF NOT EXISTS idx_real_estate_investments_reference_number ON public.real_estate_investments(reference_number);
CREATE INDEX IF NOT EXISTS idx_real_estate_investments_created_at ON public.real_estate_investments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_real_estate_investments_location ON public.real_estate_investments(location);

-- Enable RLS
ALTER TABLE public.real_estate_investments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "real_estate_investments_select_own"
    ON public.real_estate_investments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "real_estate_investments_insert_own"
    ON public.real_estate_investments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "real_estate_investments_update_own"
    ON public.real_estate_investments FOR UPDATE
    USING (auth.uid() = user_id);

-- Admin policies for viewing all real estate investments
CREATE POLICY "real_estate_investments_select_admin"
    ON public.real_estate_investments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE email = auth.jwt() ->> 'email'
            AND is_active = true
        )
    );

CREATE POLICY "real_estate_investments_update_admin"
    ON public.real_estate_investments FOR UPDATE
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
        WHERE tgname = 'update_real_estate_investments_updated_at'
    ) THEN
        CREATE TRIGGER update_real_estate_investments_updated_at
            BEFORE UPDATE ON public.real_estate_investments
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- Create a function to automatically calculate current_investment_value and profit_loss
CREATE OR REPLACE FUNCTION calculate_real_estate_investment_value()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate current investment value if current_value is provided
    IF NEW.current_value IS NOT NULL THEN
        -- If investment_percentage is provided, calculate user's portion
        IF NEW.investment_percentage IS NOT NULL AND NEW.investment_percentage > 0 THEN
            NEW.current_investment_value := (NEW.current_value * NEW.investment_percentage / 100);
        ELSE
            -- Otherwise, assume full ownership
            NEW.current_investment_value := NEW.current_value;
        END IF;
        
        -- Calculate profit/loss
        IF NEW.current_investment_value IS NOT NULL AND NEW.amount_invested IS NOT NULL THEN
            NEW.profit_loss := NEW.current_investment_value - NEW.amount_invested;
            
            -- Calculate profit/loss percentage
            IF NEW.amount_invested > 0 THEN
                NEW.profit_loss_percentage := ((NEW.current_investment_value - NEW.amount_invested) / NEW.amount_invested) * 100;
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
        WHERE tgname = 'calculate_real_estate_investment_trigger'
    ) THEN
        CREATE TRIGGER calculate_real_estate_investment_trigger
            BEFORE INSERT OR UPDATE ON public.real_estate_investments
            FOR EACH ROW
            WHEN (NEW.current_value IS NOT NULL)
            EXECUTE FUNCTION calculate_real_estate_investment_value();
    END IF;
END $$;


