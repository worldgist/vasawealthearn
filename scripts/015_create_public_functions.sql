-- Create public functions for safe operations
-- This script creates utility functions that can be called publicly without exposing sensitive data

-- Function to get service availability
CREATE OR REPLACE FUNCTION public_data.get_service_status()
RETURNS TABLE (
    service_name TEXT,
    status TEXT,
    last_updated TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.service_name,
        s.status,
        s.last_updated
    FROM public_data.service_status s;
END;
$$;

-- Function to get investment plan details
CREATE OR REPLACE FUNCTION public_data.get_investment_plans()
RETURNS TABLE (
    plan_name TEXT,
    min_amount INTEGER,
    max_amount INTEGER,
    return_rate TEXT,
    duration TEXT,
    description TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.plan_name,
        p.min_amount,
        p.max_amount,
        p.return_rate,
        p.duration,
        p.description
    FROM public_data.investment_plans p;
END;
$$;

-- Function to get loan requirements
CREATE OR REPLACE FUNCTION public_data.get_loan_requirements()
RETURNS TABLE (
    loan_type TEXT,
    min_amount INTEGER,
    max_amount INTEGER,
    interest_rate TEXT,
    term_range TEXT,
    purpose TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.loan_type,
        l.min_amount,
        l.max_amount,
        l.interest_rate,
        l.term_range,
        l.purpose
    FROM public_data.loan_types l;
END;
$$;

-- Function to get FAQ by category
CREATE OR REPLACE FUNCTION public_data.get_faq(category_filter TEXT DEFAULT NULL)
RETURNS TABLE (
    question TEXT,
    answer TEXT,
    category TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.question,
        f.answer,
        f.category
    FROM public_data.faq f
    WHERE (category_filter IS NULL OR f.category = category_filter);
END;
$$;

-- Function to get aggregated statistics (no personal data)
CREATE OR REPLACE FUNCTION public_data.get_platform_stats()
RETURNS TABLE (
    total_users BIGINT,
    total_transactions BIGINT,
    total_investments BIGINT,
    total_loans BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM user_profiles WHERE account_status = 'active'),
        (SELECT COUNT(*) FROM transactions WHERE status = 'completed'),
        (SELECT COUNT(*) FROM investments WHERE status = 'active'),
        (SELECT COUNT(*) FROM loans WHERE status IN ('approved', 'active'));
END;
$$;

-- Function to validate transfer limits (public utility)
CREATE OR REPLACE FUNCTION public_data.get_transfer_limits()
RETURNS TABLE (
    transfer_type TEXT,
    daily_limit DECIMAL,
    monthly_limit DECIMAL,
    processing_time TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'Local Transfer'::TEXT,
        50000.00::DECIMAL,
        500000.00::DECIMAL,
        '1-3 business days'::TEXT
    UNION ALL
    SELECT 
        'International Transfer'::TEXT,
        25000.00::DECIMAL,
        250000.00::DECIMAL,
        '3-7 business days'::TEXT;
END;
$$;

-- Function to get card delivery estimates
CREATE OR REPLACE FUNCTION public_data.get_card_delivery_info()
RETURNS TABLE (
    card_type TEXT,
    description TEXT,
    delivery_time TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.card_type,
        c.description,
        c.delivery_time
    FROM public_data.card_types c;
END;
$$;

-- Grant execute permissions on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public_data TO anon, authenticated;

-- Set default privileges for future functions
ALTER DEFAULT PRIVILEGES IN SCHEMA public_data GRANT EXECUTE ON FUNCTIONS TO anon, authenticated;

-- Create indexes for better performance on public views
CREATE INDEX IF NOT EXISTS idx_public_user_profiles_status ON user_profiles(account_status, kyc_status);
CREATE INDEX IF NOT EXISTS idx_public_transactions_type_status ON transactions(transaction_type, status, created_at);
CREATE INDEX IF NOT EXISTS idx_public_investments_type_status ON investments(investment_type, status, created_at);
CREATE INDEX IF NOT EXISTS idx_public_loans_type_status ON loans(loan_type, status, created_at);
