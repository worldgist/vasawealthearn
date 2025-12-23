# Email Notification Setup Guide

This guide explains how to set up email notifications with PDF attachments for stock transactions.

## Current Implementation

The system is currently set up to:
1. Generate transaction summary PDFs (as HTML)
2. Prepare email content with transaction details
3. Log email data (for development)

## Production Setup

To enable actual email sending, you need to integrate with an email service. Here are recommended options:

### Option 1: Resend (Recommended for Next.js)

1. **Install Resend:**
   ```bash
   npm install resend
   ```

2. **Get API Key:**
   - Sign up at [resend.com](https://resend.com)
   - Get your API key from the dashboard

3. **Add to `.env.local`:**
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```

4. **Update `app/api/transactions/send-email/route.ts`:**
   ```typescript
   import { Resend } from 'resend'
   
   const resend = new Resend(process.env.RESEND_API_KEY)
   
   await resend.emails.send({
     from: 'noreply@yourdomain.com', // Must be verified domain
     to: userEmail,
     subject: emailSubject,
     html: emailBodyHTML,
     attachments: [{
       filename: `transaction-${transactionId}.html`,
       content: pdfBase64,
       contentType: 'text/html',
     }],
   })
   ```

### Option 2: SendGrid

1. **Install SendGrid:**
   ```bash
   npm install @sendgrid/mail
   ```

2. **Get API Key:**
   - Sign up at [sendgrid.com](https://sendgrid.com)
   - Create an API key

3. **Add to `.env.local`:**
   ```
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
   ```

4. **Update the route:**
   ```typescript
   import sgMail from '@sendgrid/mail'
   
   sgMail.setApiKey(process.env.SENDGRID_API_KEY!)
   
   await sgMail.send({
     to: userEmail,
     from: 'noreply@yourdomain.com',
     subject: emailSubject,
     html: emailBodyHTML,
     attachments: [{
       content: pdfBase64,
       filename: `transaction-${transactionId}.html`,
       type: 'text/html',
       disposition: 'attachment',
     }],
   })
   ```

### Option 3: AWS SES

1. **Install AWS SDK:**
   ```bash
   npm install @aws-sdk/client-ses
   ```

2. **Configure AWS credentials**

3. **Update the route to use SES**

### Option 4: Nodemailer (SMTP)

1. **Install Nodemailer:**
   ```bash
   npm install nodemailer
   ```

2. **Configure SMTP settings in `.env.local`**

## PDF Generation

Currently, the PDF is generated as HTML. For true PDF generation, consider:

1. **Puppeteer** (HTML to PDF):
   ```bash
   npm install puppeteer
   ```

2. **PDFKit** (Node.js):
   ```bash
   npm install pdfkit
   ```

3. **jsPDF** (Browser/Node.js):
   ```bash
   npm install jspdf
   ```

## Testing

To test email functionality:

1. Make a stock purchase/sale transaction
2. Check the console logs for email data
3. In production, emails will be sent automatically

## Email Template Customization

Edit the email HTML in `app/api/transactions/send-email/route.ts` to customize:
- Colors
- Layout
- Branding
- Additional information

## PDF Template Customization

Edit `lib/pdf-generator.ts` to customize:
- PDF layout
- Styling
- Additional sections
- Branding

## Notes

- Email sending is non-blocking (won't fail the transaction if email fails)
- PDFs are currently HTML format (can be converted to true PDF with libraries)
- All email data is logged for debugging
- Notifications are saved to the database



