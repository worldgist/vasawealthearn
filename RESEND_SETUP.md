# Resend API Key Setup Guide

This guide explains how to add the Resend API key to your Supabase project for email functionality.

## Resend API Key
Your Resend API Key: `re_dqbk7mxC_8kNMyndMuWfLR8GTj6yM9TQz`

## Option 1: Add to Supabase Edge Function (Recommended)

### Step 1: Set the Secret in Supabase

Run the following command in your terminal to add the Resend API key as a secret to your Supabase project:

```bash
supabase secrets set RESEND_API_KEY=re_dqbk7mxC_8kNMyndMuWfLR8GTj6yM9TQz
```

### Step 2: Deploy the Edge Function

If you haven't already, deploy the edge function:

```bash
supabase functions deploy send-email
```

### Step 3: Verify the Secret is Set

You can verify the secret is set by running:

```bash
supabase secrets list
```

## Option 2: Add to Environment Variables (For Next.js API Routes)

### For Local Development

Create or update your `.env.local` file in the root of your project:

```env
RESEND_API_KEY=re_dqbk7mxC_8kNMyndMuWfLR8GTj6yM9TQz
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### For Production (Vercel/Netlify/etc.)

1. Go to your hosting platform's dashboard
2. Navigate to Environment Variables settings
3. Add the following variables:
   - `RESEND_API_KEY` = `re_dqbk7mxC_8kNMyndMuWfLR8GTj6yM9TQz`
   - `RESEND_FROM_EMAIL` = `noreply@yourdomain.com` (your verified domain email)

## Using the Email Service

### From Next.js API Route

The email API route at `/api/send-email` is already configured to use Resend. You can call it like this:

```typescript
const response = await fetch("/api/send-email", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    to: "user@example.com",
    subject: "Welcome!",
    html: "<h1>Welcome to our platform!</h1>",
    // or use a template:
    // template: "kyc_approved",
    // data: { name: "John Doe" }
  }),
})
```

### From Supabase Edge Function

You can call the edge function from your application:

```typescript
const { data, error } = await supabase.functions.invoke("send-email", {
  body: {
    to: "user@example.com",
    subject: "Welcome!",
    html: "<h1>Welcome!</h1>",
  },
})
```

## Available Email Templates

The following templates are available:
- `kyc_approved` - KYC verification approved
- `kyc_rejected` - KYC verification rejected
- `deposit_approved` - Deposit approved
- `deposit_rejected` - Deposit rejected
- `withdrawal_approved` - Withdrawal approved
- `withdrawal_rejected` - Withdrawal rejected
- `loan_approved` - Loan approved
- `loan_rejected` - Loan rejected

## Important Notes

1. **Domain Verification**: Make sure you've verified your domain in Resend before using custom "from" addresses
2. **Rate Limits**: Resend has rate limits based on your plan
3. **Security**: Never commit the API key to version control. Always use environment variables or Supabase secrets
4. **Testing**: You can test emails using Resend's test mode or by sending to your own email first

## Troubleshooting

If emails are not sending:

1. Check that the API key is correctly set: `supabase secrets list`
2. Verify the Resend API key is valid in your Resend dashboard
3. Check the edge function logs: `supabase functions logs send-email`
4. Ensure your domain is verified in Resend (for custom from addresses)
5. Check that the recipient email is valid

## Next Steps

1. Install the Resend package: `npm install resend`
2. Set up the secret in Supabase: `supabase secrets set RESEND_API_KEY=re_dqbk7mxC_8kNMyndMuWfLR8GTj6yM9TQz`
3. Deploy the edge function: `supabase functions deploy send-email`
4. Update your `.env.local` file with the key for local development
5. Test the email functionality

