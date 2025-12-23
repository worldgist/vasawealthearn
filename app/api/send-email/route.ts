import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { Resend } from "resend"
import { generateReceiptHTML, generateReceiptId, generateInvoiceNumber, ReceiptData } from "@/lib/receipts/generate-receipt"

const resend = new Resend(process.env.RESEND_API_KEY || process.env.NEXT_PUBLIC_RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, html, text, template, data, includeReceipt, receiptType } = body

    if (!to || !subject) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Use Resend to send email
    if (!process.env.RESEND_API_KEY && !process.env.NEXT_PUBLIC_RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set")
      return NextResponse.json(
        { error: "Email service not configured. Please set RESEND_API_KEY." },
        { status: 500 }
      )
    }

    let emailContent = html || text || (template ? getEmailTemplate(template, data) : "")
    let receiptHtml = ""

    // Generate receipt if requested
    if (includeReceipt && receiptType && data) {
      try {
        const receiptId = data.receiptId || generateReceiptId(receiptType as "crypto" | "stock" | "real_estate" | "deposit")
        const invoiceNumber = data.invoiceNumber || generateInvoiceNumber()

        const receiptData: ReceiptData = {
          receiptId,
          invoiceNumber,
          userName: data.userName || data.name || "User",
          userEmail: to,
          transactionType: data.transactionType || receiptType === "crypto" ? "Bitcoin (BTC) Deposit" : receiptType === "stock" ? "Stock Investment" : receiptType === "real_estate" ? "Real Estate Investment" : "Deposit",
          transactionId: data.transactionId || data.referenceId || receiptId,
          date: data.date || (() => {
            const now = new Date()
            const year = now.getUTCFullYear()
            const month = String(now.getUTCMonth() + 1).padStart(2, "0")
            const day = String(now.getUTCDate()).padStart(2, "0")
            const hours = String(now.getUTCHours()).padStart(2, "0")
            const minutes = String(now.getUTCMinutes()).padStart(2, "0")
            return `${year}-${month}-${day} ${hours}:${minutes} UTC`
          })(),
          amount: data.amount || "$0.00",
          amountValue: data.amountValue || parseFloat(data.amount?.replace(/[^0-9.]/g, "") || "0"),
          currency: data.currency || "USD",
          networkFee: data.networkFee,
          receivingAddress: data.receivingAddress || data.walletAddress,
          confirmations: data.confirmations || "6+ Confirmations",
          status: data.status || "Completed",
          additionalData: data.additionalData || {},
        }

        receiptHtml = await generateReceiptHTML(receiptData, receiptType as "crypto" | "stock" | "real_estate" | "deposit")
        
        // Append receipt to email content
        emailContent = `
          ${emailContent}
          <div style="margin-top: 40px; padding-top: 40px; border-top: 2px solid #e0e0e0;">
            <h2 style="color: #0c3a30; margin-bottom: 20px;">Transaction Receipt</h2>
            ${receiptHtml}
          </div>
        `
      } catch (receiptError) {
        console.error("Error generating receipt:", receiptError)
        // Continue without receipt if generation fails
      }
    }

    const { data: emailData, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: Array.isArray(to) ? to : [to],
      subject: subject,
      html: emailContent,
      text: text || undefined,
    })

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json({ error: "Failed to send email", details: error }, { status: 500 })
    }

    console.log("Email sent successfully:", emailData)

    return NextResponse.json({ success: true, message: "Email sent successfully", data: emailData })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json(
      { error: "Failed to send email", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

function getEmailTemplate(template: string, data: any): string {
  // Basic template function - you can expand this
  switch (template) {
    case "kyc_approved":
      return `
        <h1>KYC Verification Approved</h1>
        <p>Dear ${data.name || "User"},</p>
        <p>Your KYC verification has been approved. You now have full access to all banking features.</p>
      `
    case "kyc_rejected":
      return `
        <h1>KYC Verification Rejected</h1>
        <p>Dear ${data.name || "User"},</p>
        <p>Your KYC verification was rejected. Reason: ${data.reason || "Please contact support for more information."}</p>
      `
    case "deposit_approved":
      return `
        <h1>Deposit Approved</h1>
        <p>Dear ${data.name || "User"},</p>
        <p>Your deposit of $${data.amount || "0.00"} has been approved and added to your account.</p>
      `
    default:
      return data?.html || data?.message || "<p>No template content available.</p>"
  }
}


