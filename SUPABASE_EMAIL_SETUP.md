# Supabase Email Setup Guide

## Quick Fix: Enable Email Confirmation

### Step 1: Check Supabase Settings

1. Go to your Supabase Dashboard:
   - https://app.supabase.com/project/fiwryzbywoagqocfjhqg/settings/auth

2. Under **Email Auth** section, ensure:
   - ✅ **Enable email signup** is checked
   - ✅ **Enable email confirmations** is checked (IMPORTANT!)

3. If email confirmations are disabled, users won't receive verification emails and will be auto-confirmed.

### Step 2: Configure Email Templates

1. Go to: https://app.supabase.com/project/fiwryzbywoagqocfjhqg/auth/templates

2. Check the **Confirm signup** template:
   - Should include: `{{ .ConfirmationURL }}`
   - Should have a clear call-to-action button

3. Customize the template if needed (optional)

### Step 3: Add Site URL to Redirect URLs

1. Go to: https://app.supabase.com/project/fiwryzbywoagqocfjhqg/settings/auth

2. Under **URL Configuration**, add:
   - Site URL: `http://localhost:3000` (for development)
   - Redirect URLs: `http://localhost:3000/**` (for development)
   - For production, add your production domain

### Step 4: Check SMTP Settings (Optional but Recommended)

1. Go to: https://app.supabase.com/project/fiwryzbywoagqocfjhqg/settings/auth

2. Under **SMTP Settings**, you can:
   - Use Supabase's default email service (limited on free tier)
   - Configure custom SMTP (SendGrid, Mailgun, AWS SES, etc.) for better deliverability

### Step 5: Check Auth Logs

1. Go to: https://app.supabase.com/project/fiwryzbywoagqocfjhqg/logs/explorer

2. Filter by:
   - Table: `auth_logs`
   - Look for signup events
   - Check for email sending errors

## Common Issues

### Issue 1: Email Confirmation Disabled
**Symptom**: Users are created but no email is sent
**Fix**: Enable "Enable email confirmations" in Auth settings

### Issue 2: Rate Limiting
**Symptom**: First email works, subsequent emails fail
**Fix**: Wait 1 hour between emails, or configure custom SMTP

### Issue 3: Emails in Spam
**Symptom**: Emails sent but not in inbox
**Fix**: Check spam folder, configure custom SMTP with verified domain

### Issue 4: Wrong Redirect URL
**Symptom**: Email link doesn't work
**Fix**: Add your domain to Redirect URLs in Auth settings

## Testing

### Test Email Sending:
1. Sign up with a test email
2. Check Supabase logs for email sending status
3. Check email inbox AND spam folder
4. Wait 1-5 minutes (emails can be delayed)

### Manual Verification (For Testing):
If you need to verify a user manually:
1. Go to: https://app.supabase.com/project/fiwryzbywoagqocfjhqg/auth/users
2. Find the user
3. Click the user → Actions → "Send verification email"
4. Or manually set `email_confirmed_at` in the database

## Development Workaround

If you want to bypass email verification for development:

1. Go to Auth Settings
2. **Disable** "Enable email confirmations"
3. Users will be auto-confirmed (not recommended for production)

## Production Setup

For production, you should:
1. ✅ Enable email confirmations
2. ✅ Configure custom SMTP
3. ✅ Set up SPF/DKIM records
4. ✅ Use a verified domain
5. ✅ Monitor email delivery rates





