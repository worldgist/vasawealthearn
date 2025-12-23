-- Create crypto_investments table for cryptocurrency investment transactions
CREATE TABLE IF NOT EXISTS public.crypto_investments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    cryptocurrency_id VARCHAR(50) NOT NULL, -- e.g., 'bitcoin', 'ethereum'
    cryptocurrency_name VARCHAR(100) NOT NULL, -- e.g., 'Bitcoin', 'Ethereum'
    cryptocurrency_symbol VARCHAR(10) NOT NULL, -- e.g., 'BTC', 'ETH'
    amount_invested DECIMAL(15,2) NOT NULL CHECK (amount_invested > 0),
    price_per_unit DECIMAL(20,8) NOT NULL CHECK (price_per_unit > 0), -- Crypto prices can have many decimals
    quantity DECIMAL(20,8) NOT NULL CHECK (quantity > 0), -- Amount of crypto purchased
    currency VARCHAR(3) DEFAULT 'USD',
    current_price DECIMAL(20,8), -- Current market price (can be updated)
    current_value DECIMAL(15,2), -- Current value in USD (quantity * current_price)
    profit_loss DECIMAL(15,2), -- Current profit/loss (current_value - amount_invested)
    profit_loss_percentage DECIMAL(5,2), -- Percentage gain/loss
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'sold', 'cancelled')),
    transaction_type VARCHAR(20) DEFAULT 'buy' CHECK (transaction_type IN ('buy', 'sell')),
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    sold_at TIMESTAMP WITH TIME ZONE, -- When the investment was sold
    sold_price DECIMAL(20,8), -- Price at which it was sold
    sold_amount DECIMAL(15,2), -- Amount received when sold
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_crypto_investments_user_id ON public.crypto_investments(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_investments_status ON public.crypto_investments(status);
CREATE INDEX IF NOT EXISTS idx_crypto_investments_cryptocurrency_id ON public.crypto_investments(cryptocurrency_id);
CREATE INDEX IF NOT EXISTS idx_crypto_investments_reference_number ON public.crypto_investments(reference_number);
CREATE INDEX IF NOT EXISTS idx_crypto_investments_created_at ON public.crypto_investments(created_at DESC);

-- Enable RLS
ALTER TABLE public.crypto_investments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "crypto_investments_select_own"
    ON public.crypto_investments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "crypto_investments_insert_own"
    ON public.crypto_investments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "crypto_investments_update_own"
    ON public.crypto_investments FOR UPDATE
    USING (auth.uid() = user_id);

-- Admin policies for viewing all crypto investments
CREATE POLICY "crypto_investments_select_admin"
    ON public.crypto_investments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE email = auth.jwt() ->> 'email'
            AND is_active = true
        )
    );

CREATE POLICY "crypto_investments_update_admin"
    ON public.crypto_investments FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE email = auth.jwt() ->> 'email'
            AND is_active = true
        )
    );

-- Create trigger for updated_at
CREATE TRIGGER update_crypto_investments_updated_at
    BEFORE UPDATE ON public.crypto_investments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create a function to automatically calculate current_value and profit_loss
CREATE OR REPLACE FUNCTION calculate_crypto_investment_value()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate current value if current_price is provided
    IF NEW.current_price IS NOT NULL THEN
        NEW.current_value := NEW.quantity * NEW.current_price;
        
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
CREATE TRIGGER calculate_crypto_investment_trigger
    BEFORE INSERT OR UPDATE ON public.crypto_investments
    FOR EACH ROW
    WHEN (NEW.current_price IS NOT NULL)
    EXECUTE FUNCTION calculate_crypto_investment_value();


