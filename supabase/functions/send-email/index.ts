import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "https://esm.sh/resend@2.0.0"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || ""

interface EmailRequest {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  template?: string
  data?: any
}

serve(async (req) => {
  try {
    // Handle CORS
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        },
      })
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY is not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    const body: EmailRequest = await req.json()
    const { to, subject, html, text, template, data } = body

    if (!to || !subject) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to and subject" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    const resend = new Resend(RESEND_API_KEY)

    const emailContent = html || text || (template ? getEmailTemplate(template, data) : "")

    const { data: emailData, error } = await resend.emails.send({
      from: Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev",
      to: Array.isArray(to) ? to : [to],
      subject: subject,
      html: emailContent,
      text: text || undefined,
    })

    if (error) {
      console.error("Resend error:", error)
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: error }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully", data: emailData }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    )
  } catch (error) {
    console.error("Error:", error)
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
})

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
    case "deposit_rejected":
      return `
        <h1>Deposit Rejected</h1>
        <p>Dear ${data.name || "User"},</p>
        <p>Your deposit of $${data.amount || "0.00"} was rejected. Reason: ${data.reason || "Please contact support for more information."}</p>
      `
    case "withdrawal_approved":
      return `
        <h1>Withdrawal Approved</h1>
        <p>Dear ${data.name || "User"},</p>
        <p>Your withdrawal of $${data.amount || "0.00"} has been approved and will be processed shortly.</p>
      `
    case "withdrawal_rejected":
      return `
        <h1>Withdrawal Rejected</h1>
        <p>Dear ${data.name || "User"},</p>
        <p>Your withdrawal of $${data.amount || "0.00"} was rejected. Reason: ${data.reason || "Please contact support for more information."}</p>
      `
    case "loan_approved":
      return `
        <h1>Loan Approved</h1>
        <p>Dear ${data.name || "User"},</p>
        <p>Your loan application for $${data.amount || "0.00"} has been approved.</p>
      `
    case "loan_rejected":
      return `
        <h1>Loan Rejected</h1>
        <p>Dear ${data.name || "User"},</p>
        <p>Your loan application was rejected. Reason: ${data.reason || "Please contact support for more information."}</p>
      `
    default:
      return data?.html || data?.message || "<p>No template content available.</p>"
  }
}

