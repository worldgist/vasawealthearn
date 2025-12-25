# Supabase OTP (8-Digit Code) Setup Guide

## Configure Supabase to Send 8-Digit Codes

### Step 1: Enable Email OTP in Supabase

1. Go to your Supabase Dashboard:
   - https://app.supabase.com/project/fiwryzbywoagqocfjhqg/settings/auth

2. Under **Email Auth**, ensure:
   - ✅ **Enable email signup** is checked
   - ✅ **Enable email confirmations** is checked
   - ✅ **Enable email OTP** is checked (if available)

### Step 2: Configure Email Template for OTP

1. Go to: https://app.supabase.com/project/fiwryzbywoagqocfjhqg/auth/templates

2. Edit the **Confirm signup** template:
   - Replace the confirmation link with: `Your verification code is: {{ .Token }}`
   - Or use: `Your 8-digit verification code is: {{ .Token }}`
   - The code will be an 8-digit number

### Step 3: Alternative - Use Magic Link with OTP

If Supabase doesn't support OTP directly in signup, you can:

1. **Option A**: Use `signInWithOtp` instead of `signUp` for email verification
2. **Option B**: Configure Supabase to send OTP codes via email template

### Step 4: Test OTP Flow

1. Sign up with a test email
2. Check your email for an 8-digit code
3. Enter the code on the verification page
4. Code should verify and redirect to dashboard

## How It Works

1. User signs up → Supabase sends email with 8-digit code
2. User enters code on verification page
3. Code is verified using `supabase.auth.verifyOtp()`
4. User is redirected to dashboard upon successful verification

## Troubleshooting

### Issue: Still receiving email links instead of codes
**Solution**: 
- Check Supabase email template configuration
- Ensure OTP is enabled in Auth settings
- May need to use `signInWithOtp` for email verification

### Issue: Code not arriving
**Solution**:
- Check spam folder
- Wait 1-5 minutes
- Check Supabase Auth Logs
- Verify email confirmation is enabled

### Issue: Code expires too quickly
**Solution**:
- OTP codes typically expire in 60 seconds
- Use "Resend Code" button if expired
- Check Supabase OTP expiration settings

## Code Verification

The verification uses:
```typescript
await supabase.auth.verifyOtp({
  email: userEmail,
  token: otpCode, // 8-digit code
  type: "signup",
})
```

## Note

If Supabase doesn't send OTP codes by default with `signUp`, you may need to:
1. Use `signInWithOtp` for email verification flow
2. Or configure custom email templates to include the OTP code
3. Or use a third-party email service that supports OTP





