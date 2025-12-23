-- Create support_tickets table for customer support
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    ticket_number VARCHAR(20) UNIQUE NOT NULL,
    subject VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('account', 'transactions', 'cards', 'loans', 'investments', 'kyc', 'technical', 'billing', 'other')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed')),
    description TEXT NOT NULL,
    attachment_urls TEXT[], -- Array of attachment URLs
    assigned_to UUID REFERENCES public.admin_users(id),
    resolution TEXT,
    customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
    customer_feedback TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create support_messages table for ticket conversations
CREATE TABLE IF NOT EXISTS public.support_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('customer', 'admin')),
    message TEXT NOT NULL,
    attachment_urls TEXT[],
    is_internal BOOLEAN DEFAULT FALSE, -- For admin-only notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_ticket_number ON public.support_tickets(ticket_number);
CREATE INDEX idx_support_tickets_created_at ON public.support_tickets(created_at);
CREATE INDEX idx_support_messages_ticket_id ON public.support_messages(ticket_id);
CREATE INDEX idx_support_messages_created_at ON public.support_messages(created_at);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for support_tickets
CREATE POLICY "Users can view their own support tickets" ON public.support_tickets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own support tickets" ON public.support_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own support tickets" ON public.support_tickets
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for support_messages
CREATE POLICY "Users can view messages for their tickets" ON public.support_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.support_tickets 
            WHERE id = ticket_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages for their tickets" ON public.support_messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.support_tickets 
            WHERE id = ticket_id AND user_id = auth.uid()
        )
    );

-- Create triggers for updated_at
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'TKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;
