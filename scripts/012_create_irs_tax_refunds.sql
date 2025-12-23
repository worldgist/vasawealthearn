-- Create irs_tax_refunds table for IRS tax refund requests
CREATE TABLE IF NOT EXISTS public.irs_tax_refunds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tax_year INTEGER NOT NULL CHECK (tax_year >= 2020 AND tax_year <= EXTRACT(YEAR FROM NOW())),
    filing_status VARCHAR(30) NOT NULL CHECK (filing_status IN ('single', 'married_filing_jointly', 'married_filing_separately', 'head_of_household', 'qualifying_widow')),
    ssn VARCHAR(11) NOT NULL, -- Format: XXX-XX-XXXX
    spouse_ssn VARCHAR(11), -- For married filing jointly
    refund_amount DECIMAL(12,2) NOT NULL CHECK (refund_amount > 0),
    expected_refund_date DATE,
    routing_number VARCHAR(20) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('checking', 'savings')),
    bank_name VARCHAR(255) NOT NULL,
    
    -- Tax information
    adjusted_gross_income DECIMAL(12,2),
    total_tax DECIMAL(12,2),
    federal_tax_withheld DECIMAL(12,2),
    estimated_tax_payments DECIMAL(12,2),
    earned_income_credit DECIMAL(12,2),
    additional_child_tax_credit DECIMAL(12,2),
    
    -- Status tracking
    status VARCHAR(30) DEFAULT 'submitted' CHECK (status IN ('submitted', 'processing', 'approved', 'rejected', 'completed', 'cancelled')),
    irs_reference_number VARCHAR(50),
    rejection_reason TEXT,
    
    -- Documents
    tax_return_url TEXT,
    w2_forms_urls TEXT[], -- Array of W-2 document URLs
    additional_documents_urls TEXT[],
    
    -- Timestamps
    submitted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create irs_refund_status_history table for tracking status changes
CREATE TABLE IF NOT EXISTS public.irs_refund_status_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    refund_id UUID REFERENCES public.irs_tax_refunds(id) ON DELETE CASCADE NOT NULL,
    old_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    changed_by UUID REFERENCES auth.users(id),
    change_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_irs_tax_refunds_user_id ON public.irs_tax_refunds(user_id);
CREATE INDEX idx_irs_tax_refunds_status ON public.irs_tax_refunds(status);
CREATE INDEX idx_irs_tax_refunds_tax_year ON public.irs_tax_refunds(tax_year);
CREATE INDEX idx_irs_tax_refunds_created_at ON public.irs_tax_refunds(created_at);
CREATE INDEX idx_irs_refund_status_history_refund_id ON public.irs_refund_status_history(refund_id);

-- Enable RLS
ALTER TABLE public.irs_tax_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irs_refund_status_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for irs_tax_refunds
CREATE POLICY "Users can view their own tax refunds" ON public.irs_tax_refunds
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tax refunds" ON public.irs_tax_refunds
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tax refunds" ON public.irs_tax_refunds
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for irs_refund_status_history
CREATE POLICY "Users can view status history for their refunds" ON public.irs_refund_status_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.irs_tax_refunds 
            WHERE id = refund_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert status history for their refunds" ON public.irs_refund_status_history
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.irs_tax_refunds 
            WHERE id = refund_id AND user_id = auth.uid()
        )
    );

-- Create triggers for updated_at
CREATE TRIGGER update_irs_tax_refunds_updated_at BEFORE UPDATE ON public.irs_tax_refunds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create status history when status changes
CREATE OR REPLACE FUNCTION create_refund_status_history()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.irs_refund_status_history (
            refund_id, old_status, new_status, changed_by, change_reason
        ) VALUES (
            NEW.id, OLD.status, NEW.status, auth.uid(), 'Status updated'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER irs_refund_status_change_trigger
    AFTER UPDATE ON public.irs_tax_refunds
    FOR EACH ROW EXECUTE FUNCTION create_refund_status_history();
