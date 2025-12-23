-- Create transfers table for local and international transfers
CREATE TABLE IF NOT EXISTS public.transfers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    transfer_type VARCHAR(20) NOT NULL CHECK (transfer_type IN ('local', 'international')),
    from_account_type VARCHAR(20) NOT NULL CHECK (from_account_type IN ('checking', 'savings')),
    recipient_name VARCHAR(255) NOT NULL,
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(20),
    recipient_account_number VARCHAR(50) NOT NULL,
    recipient_routing_number VARCHAR(20),
    recipient_bank_name VARCHAR(255),
    recipient_bank_address TEXT,
    recipient_swift_code VARCHAR(20),
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'USD',
    transfer_fee DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    purpose VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    scheduled_date TIMESTAMP WITH TIME ZONE,
    processed_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_transfers_user_id ON public.transfers(user_id);
CREATE INDEX idx_transfers_status ON public.transfers(status);
CREATE INDEX idx_transfers_reference_number ON public.transfers(reference_number);
CREATE INDEX idx_transfers_created_at ON public.transfers(created_at);

-- Enable RLS
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own transfers" ON public.transfers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transfers" ON public.transfers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transfers" ON public.transfers
    FOR UPDATE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transfers_updated_at BEFORE UPDATE ON public.transfers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
