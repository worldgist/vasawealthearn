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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_deposits_user_id ON public.deposits(user_id);
CREATE INDEX idx_deposits_status ON public.deposits(status);
CREATE INDEX idx_deposits_reference_number ON public.deposits(reference_number);
CREATE INDEX idx_deposits_created_at ON public.deposits(created_at);

-- Enable RLS
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own deposits" ON public.deposits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own deposits" ON public.deposits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deposits" ON public.deposits
    FOR UPDATE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_deposits_updated_at BEFORE UPDATE ON public.deposits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
