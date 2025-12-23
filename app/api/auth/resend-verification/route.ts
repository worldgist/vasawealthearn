import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get the site URL for redirect
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                    process.env.NEXT_PUBLIC_VERCEL_URL || 
                    request.headers.get("origin") ||
                    "http://localhost:3000"
    
    const redirectUrl = `${siteUrl}/dashboard`

    console.log("Attempting to resend verification email to:", email)
    console.log("Redirect URL:", redirectUrl)

    // Resend OTP code (6-digit) using signInWithOtp
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: redirectUrl,
        shouldCreateUser: false, // Don't create new user, just send OTP
      },
    })

    if (error) {
      console.error("Resend OTP error:", error)
      return NextResponse.json(
        { 
          error: error.message || "Failed to resend verification code. Please check your Supabase email settings.",
          details: "Make sure email confirmation is enabled in Supabase Authentication settings."
        },
        { status: 400 }
      )
    }

    console.log("Verification email sent successfully to:", email)

    return NextResponse.json({
      success: true,
      message: "Verification email has been sent",
    })
  } catch (error: any) {
    console.error("Resend verification API error:", error)
    return NextResponse.json(
      { 
        error: error.message || "Internal server error",
        details: "An unexpected error occurred while trying to resend the verification email."
      },
      { status: 500 }
    )
  }
}

