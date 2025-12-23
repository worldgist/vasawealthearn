-- Create public profiles and views for safe data access
-- This script creates public-facing views that expose only non-sensitive information

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create public schema for safe data access
CREATE SCHEMA IF NOT EXISTS public_data;

-- Public user profiles (non-sensitive information only)
CREATE OR REPLACE VIEW public_data.user_profiles AS
SELECT 
    id,
    first_name,
    last_name,
    created_at,
    kyc_status,
    account_status,
    -- Exclude sensitive information like SSN, phone, address, etc.
    CASE 
        WHEN kyc_status = 'verified' THEN true 
        ELSE false 
    END as is_verified
FROM user_profiles
WHERE account_status = 'active';

-- Public investment statistics (aggregated, non-personal)
CREATE OR REPLACE VIEW public_data.investment_stats AS
SELECT 
    investment_type,
    COUNT(*) as total_investments,
    AVG(amount) as average_amount,
    SUM(amount) as total_invested,
    DATE_TRUNC('month', created_at) as month
FROM investments
WHERE status = 'active'
GROUP BY investment_type, DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Public loan statistics (aggregated, non-personal)
CREATE OR REPLACE VIEW public_data.loan_stats AS
SELECT 
    loan_type,
    COUNT(*) as total_applications,
    AVG(amount) as average_amount,
    DATE_TRUNC('month', created_at) as month
FROM loans
WHERE status IN ('approved', 'active')
GROUP BY loan_type, DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Public transaction volume (aggregated, no personal data)
CREATE OR REPLACE VIEW public_data.transaction_volume AS
SELECT 
    transaction_type,
    COUNT(*) as transaction_count,
    DATE_TRUNC('day', created_at) as date
FROM transactions
WHERE status = 'completed'
GROUP BY transaction_type, DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Public service status
CREATE OR REPLACE VIEW public_data.service_status AS
SELECT 
    'transfers' as service_name,
    'operational' as status,
    NOW() as last_updated
UNION ALL
SELECT 
    'deposits' as service_name,
    'operational' as status,
    NOW() as last_updated
UNION ALL
SELECT 
    'investments' as service_name,
    'operational' as status,
    NOW() as last_updated;

-- Grant permissions for public access
GRANT USAGE ON SCHEMA public_data TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public_data TO anon, authenticated;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public_data TO anon, authenticated;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public_data GRANT SELECT ON TABLES TO anon, authenticated;
