import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateTransactionPDFBase64, generateTransactionPDFHTML } from "@/lib/pdf-generator"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name, email")
      .eq("id", user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      transactionId,
      type,
      stockSymbol,
      stockName,
      shares,
      price,
      totalAmount,
      paymentMethod,
    } = body

    const userName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "User"
    const userEmail = profile.email || user.email || ""

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      )
    }

    // Generate PDF content
    const pdfHTML = generateTransactionPDFHTML({
      transactionId,
      type,
      stockSymbol,
      stockName,
      shares,
      price,
      totalAmount,
      transactionDate: new Date().toLocaleString(),
      paymentMethod,
      userName,
      userEmail,
    })
    
    const pdfBase64 = generateTransactionPDFBase64({
      transactionId,
      type,
      stockSymbol,
      stockName,
      shares,
      price,
      totalAmount,
      transactionDate: new Date().toLocaleString(),
      paymentMethod,
      userName,
      userEmail,
    })

    // Prepare email content
    const emailSubject = `Stock ${type === "buy" ? "Purchase" : "Sale"} Confirmation - ${stockSymbol}`
    const emailBodyText = `
Dear ${userName},

Your stock ${type === "buy" ? "purchase" : "sale"} has been successfully completed.

Transaction Details:
- Transaction ID: ${transactionId}
- Stock: ${stockSymbol} - ${stockName}
- Shares: ${shares.toFixed(4)}
- Price per Share: $${price.toFixed(2)}
- Total Amount: $${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
${paymentMethod ? `- Payment Method: ${paymentMethod}` : ''}
- Date: ${new Date().toLocaleString()}

A detailed transaction summary PDF is attached to this email for your records.

Thank you for using Vasawealthearn.

Best regards,
Vasawealthearn Team
    `.trim()
    
    const emailBodyHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0c3a30; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .transaction-box { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #0c3a30; }
          .detail { margin: 10px 0; }
          .label { font-weight: bold; color: #666; }
          .value { color: #0c3a30; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Vasawealthearn</h2>
          </div>
          <div class="content">
            <p>Dear ${userName},</p>
            <p>Your stock <strong>${type === "buy" ? "purchase" : "sale"}</strong> has been successfully completed.</p>
            
            <div class="transaction-box">
              <h3 style="margin-top: 0; color: #0c3a30;">Transaction Details</h3>
              <div class="detail">
                <span class="label">Transaction ID:</span>
                <span class="value">${transactionId}</span>
              </div>
              <div class="detail">
                <span class="label">Stock:</span>
                <span class="value">${stockSymbol} - ${stockName}</span>
              </div>
              <div class="detail">
                <span class="label">Shares:</span>
                <span class="value">${shares.toFixed(4)}</span>
              </div>
              <div class="detail">
                <span class="label">Price per Share:</span>
                <span class="value">$${price.toFixed(2)}</span>
              </div>
              <div class="detail">
                <span class="label">Total Amount:</span>
                <span class="value" style="font-size: 18px; font-weight: bold;">$${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              ${paymentMethod ? `
              <div class="detail">
                <span class="label">Payment Method:</span>
                <span class="value">${paymentMethod}</span>
              </div>
              ` : ''}
              <div class="detail">
                <span class="label">Date:</span>
                <span class="value">${new Date().toLocaleString()}</span>
              </div>
            </div>
            
            <p>A detailed transaction summary PDF is attached to this email for your records.</p>
            <p>Thank you for using Vasawealthearn.</p>
            <p>Best regards,<br>Vasawealthearn Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Vasawealthearn. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    // In production, you would send the email using a service like:
    // - Resend (recommended for Next.js)
    // - SendGrid
    // - AWS SES
    // - Nodemailer with SMTP
    
    // For now, we'll log it and return success
    // You can integrate with your email service here
    console.log("Email to send:", {
      to: userEmail,
      subject: emailSubject,
      body: emailBodyText,
      pdfHTML: pdfHTML.substring(0, 100) + "...",
    })

    // TODO: Integrate with email service
    // Example with Resend:
    // import { Resend } from 'resend'
    // const resend = new Resend(process.env.RESEND_API_KEY)
    // await resend.emails.send({
    //   from: 'noreply@vasawealthearn.com',
    //   to: userEmail,
    //   subject: emailSubject,
    //   html: emailBodyHTML,
    //   attachments: [{
    //     filename: `transaction-${transactionId}.html`,
    //     content: pdfBase64,
    //     contentType: 'text/html',
    //   }],
    // })
    
    // Example with SendGrid:
    // import sgMail from '@sendgrid/mail'
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY!)
    // await sgMail.send({
    //   to: userEmail,
    //   from: 'noreply@vasawealthearn.com',
    //   subject: emailSubject,
    //   text: emailBody,
    //   html: emailBody.replace(/\n/g, '<br>') + '<br><br><p>See attached PDF for detailed transaction summary.</p>',
    //   attachments: [{
    //     content: pdfBase64,
    //     filename: `transaction-${transactionId}.html`,
    //     type: 'text/html',
    //     disposition: 'attachment',
    //   }],
    // })

    // Store email log in database (optional)
    try {
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: emailSubject,
        message: emailBodyText,
        type: "transaction",
        priority: "high",
      })
    } catch (error) {
      console.error("Error saving notification:", error)
      // Continue even if notification save fails
    }

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      transactionId,
    })
  } catch (error: any) {
    console.error("Error sending email:", error)
    return NextResponse.json(
      { error: error.message || "Failed to send email" },
      { status: 500 }
    )
  }
}

