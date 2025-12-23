-- Create additional public views for safe data access
-- This script creates more specific public views for different use cases

-- Public card types and features (no personal card data)
CREATE OR REPLACE VIEW public_data.card_types AS
SELECT DISTINCT
    card_type,
    CASE 
        WHEN card_type = 'virtual' THEN 'Instant digital card for online purchases'
        WHEN card_type = 'physical' THEN 'Physical card delivered to your address'
        ELSE 'Standard banking card'
    END as description,
    CASE 
        WHEN card_type = 'virtual' THEN '0-1 business days'
        WHEN card_type = 'physical' THEN '7-10 business days'
        ELSE '5-7 business days'
    END as delivery_time
FROM cards;

-- Public investment plans (available investment options)
CREATE OR REPLACE VIEW public_data.investment_plans AS
SELECT 
    'Basic Savings' as plan_name,
    1000 as min_amount,
    50000 as max_amount,
    '2.5% - 4.2%' as return_rate,
    '6 months' as duration,
    'Low risk, steady returns' as description
UNION ALL
SELECT 
    'Growth Investment' as plan_name,
    5000 as min_amount,
    100000 as max_amount,
    '4.5% - 7.8%' as return_rate,
    '12 months' as duration,
    'Medium risk, higher potential returns' as description
UNION ALL
SELECT 
    'Premium Portfolio' as plan_name,
    25000 as min_amount,
    500000 as max_amount,
    '6.2% - 12.5%' as return_rate,
    '18 months' as duration,
    'Higher risk, premium returns' as description
UNION ALL
SELECT 
    'Elite Investment' as plan_name,
    100000 as min_amount,
    1000000 as max_amount,
    '8.5% - 18.2%' as return_rate,
    '24 months' as duration,
    'High risk, maximum potential returns' as description;

-- Public loan types and requirements
CREATE OR REPLACE VIEW public_data.loan_types AS
SELECT 
    'Personal Loan' as loan_type,
    1000 as min_amount,
    50000 as max_amount,
    '5.99% - 15.99%' as interest_rate,
    '12 - 60 months' as term_range,
    'For personal expenses, debt consolidation' as purpose
UNION ALL
SELECT 
    'Business Loan' as loan_type,
    5000 as min_amount,
    500000 as max_amount,
    '4.99% - 12.99%' as interest_rate,
    '12 - 84 months' as term_range,
    'For business expansion, equipment purchase' as purpose
UNION ALL
SELECT 
    'Auto Loan' as loan_type,
    5000 as min_amount,
    100000 as max_amount,
    '3.99% - 8.99%' as interest_rate,
    '24 - 72 months' as term_range,
    'For vehicle purchase, refinancing' as purpose;

-- Public support categories
CREATE OR REPLACE VIEW public_data.support_categories AS
SELECT 
    'Account Issues' as category,
    'Problems with account access, verification' as description,
    '24-48 hours' as response_time
UNION ALL
SELECT 
    'Transaction Support' as category,
    'Questions about transfers, deposits, payments' as description,
    '4-8 hours' as response_time
UNION ALL
SELECT 
    'Technical Support' as category,
    'App issues, login problems, technical errors' as description,
    '2-4 hours' as response_time
UNION ALL
SELECT 
    'General Inquiry' as category,
    'General questions about services and features' as description,
    '8-24 hours' as response_time;

-- Public FAQ data
CREATE OR REPLACE VIEW public_data.faq AS
SELECT 
    'How long do transfers take?' as question,
    'Local transfers typically complete within 1-3 business days. International transfers may take 3-7 business days.' as answer,
    'transfers' as category
UNION ALL
SELECT 
    'What are the investment minimums?' as question,
    'Investment minimums vary by plan: Basic ($1,000), Growth ($5,000), Premium ($25,000), Elite ($100,000).' as answer,
    'investments' as category
UNION ALL
SELECT 
    'How do I verify my account?' as question,
    'Complete KYC verification by uploading your driver license (front and back) and taking a selfie in the app.' as answer,
    'verification' as category
UNION ALL
SELECT 
    'Are there any fees for transfers?' as question,
    'Local transfers are free. International transfers may have fees depending on the destination country.' as answer,
    'transfers' as category;

-- Grant permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public_data TO anon, authenticated;
