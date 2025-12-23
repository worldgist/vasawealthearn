# Email Verification Troubleshooting Guide

If users are not receiving email verification emails after signup, follow these steps:

## 1. Check Supabase Project Settings

### Enable Email Confirmation
1. Go to your Supabase Dashboard: https://app.supabase.com
2. Navigate to **Authentication** → **Settings**
3. Under **Email Auth**, ensure:
   - ✅ **Enable email confirmations** is checked
   - ✅ **Enable email signup** is checked

### Configure Email Templates
1. Go to **Authentication** → **Email Templates**
2. Check that the **Confirm signup** template is configured
3. The template should include a confirmation link

## 2. Check SMTP Configuration

### Default Supabase Email Service
- Supabase uses their own email service by default
- Free tier has rate limits (3 emails per hour per user)
- Emails may be delayed during high traffic

### Custom SMTP (Recommended for Production)
1. Go to **Project Settings** → **Auth** → **SMTP Settings**
2. Configure your SMTP provider (SendGrid, Mailgun, AWS SES, etc.)
3. This improves deliverability and removes rate limits

## 3. Common Issues and Solutions

### Issue: Emails going to spam
**Solution:**
- Configure SPF, DKIM, and DMARC records for your domain
- Use a custom SMTP with a verified domain
- Add your "from" email to the user's contacts

### Issue: Rate limiting
**Solution:**
- Wait a few minutes between resend attempts
- Upgrade to a paid Supabase plan for higher limits
- Use custom SMTP to bypass rate limits

### Issue: Email confirmation disabled
**Solution:**
- Enable email confirmation in Supabase settings
- Users will be auto-confirmed if disabled (not recommended for security)

### Issue: Wrong redirect URL
**Solution:**
- Ensure `emailRedirectTo` matches your domain
- Check that the URL is whitelisted in Supabase settings
- Add your domain to **Authentication** → **URL Configuration**

## 4. Testing Email Verification

### Test the signup flow:
1. Sign up with a test email
2. Check inbox and spam folder
3. Check Supabase logs: **Logs** → **Auth Logs**
4. Look for email sending errors

### Check Supabase Logs:
1. Go to **Logs** → **Auth Logs**
2. Filter for "signup" events
3. Check for any errors in email sending

## 5. Manual Verification (Development Only)

For development/testing, you can manually verify users:
1. Go to **Authentication** → **Users**
2. Find the user
3. Click **Actions** → **Send verification email**
4. Or manually set `email_confirmed_at` in the database

## 6. Code Configuration

Ensure your signup code includes:
```typescript
const { data, error } = await supabase.auth.signUp({
  email: userEmail,
  password: userPassword,
  options: {
    emailRedirectTo: `${window.location.origin}/dashboard`,
  },
})
```

## 7. Environment Variables

Ensure these are set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Optional:
- `NEXT_PUBLIC_SITE_URL` (for email redirects)

## 8. Contact Support

If issues persist:
1. Check Supabase status: https://status.supabase.com
2. Review Supabase documentation: https://supabase.com/docs/guides/auth
3. Contact Supabase support or check community forums

## Quick Fixes

1. **Resend email**: Use the "Resend Verification Email" button on the verification page
2. **Check spam folder**: Always remind users to check spam
3. **Wait a few minutes**: Emails can take 1-5 minutes to arrive
4. **Verify email address**: Ensure the email address is correct and doesn't have typos



