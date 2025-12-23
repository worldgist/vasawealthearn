"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, CheckCircle, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export function EmailVerification() {
  const [showSuccess, setShowSuccess] = useState(true)
  const [isResending, setIsResending] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    // Get current user email from multiple sources
    const getUserEmail = async () => {
      let email = ""
      
      // First try to get from sessionStorage (set during signup)
      if (typeof window !== "undefined") {
        const signupEmail = sessionStorage.getItem("signup_email")
        if (signupEmail) {
          email = signupEmail
          // Don't clear it yet - keep it for resend functionality
        }
      }

      // Also try to get from Supabase auth
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user?.email) {
          email = user.email
        }
      } catch (error) {
        console.log("Could not get user from auth:", error)
      }

      if (email) {
        setUserEmail(email)
      }
    }
    getUserEmail()
  }, [])

  const handleResendEmail = async () => {
    if (!userEmail) {
      toast({
        title: "Error",
        description: "Email address not found. Please try signing up again.",
        variant: "destructive",
      })
      return
    }

    setIsResending(true)
    let success = false
    let errorMessage = ""

    try {
      // Method 1: Try using the API route first (more reliable)
      try {
        console.log("Attempting to resend verification email via API route to:", userEmail)
        const response = await fetch("/api/auth/resend-verification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: userEmail }),
        })

        const data = await response.json()

        if (response.ok && data.success) {
          success = true
          toast({
            title: "Email Sent",
            description: "Verification email has been resent. Please check your inbox (including spam folder).",
          })
          setShowSuccess(true)
        } else {
          errorMessage = data.error || "Failed to resend email"
          throw new Error(errorMessage)
        }
      } catch (apiError: any) {
        console.log("API route failed, trying client-side method:", apiError)
        
        // Method 2: Try client-side resend
        try {
          // Check if user is authenticated
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (user) {
            // User is authenticated, try resend
            const { error: resendError } = await supabase.auth.resend({
              type: "signup",
              email: userEmail,
              options: {
                emailRedirectTo: `${window.location.origin}/dashboard`,
              },
            })

            if (resendError) {
              throw resendError
            }

            success = true
            toast({
              title: "Email Sent",
              description: "Verification email has been resent. Please check your inbox (including spam folder).",
            })
            setShowSuccess(true)
          } else {
            // User not authenticated, try email type instead
            console.log("User not authenticated, trying email type...")
            const { error: emailError } = await supabase.auth.resend({
              type: "email",
              email: userEmail,
              options: {
                emailRedirectTo: `${window.location.origin}/dashboard`,
              },
            })

            if (emailError) {
              throw new Error(emailError.message || "User session not found. Please try signing up again.")
            }

            success = true
            toast({
              title: "Email Sent",
              description: "Verification email has been resent. Please check your inbox (including spam folder).",
            })
            setShowSuccess(true)
          }
        } catch (clientError: any) {
          console.error("Client-side resend failed:", clientError)
          errorMessage = clientError.message || apiError.message || "Failed to resend email"
          
          // Final fallback: Show helpful error message
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (user) {
            toast({
              title: "Unable to Resend Email",
              description: `${errorMessage}. Please check your Supabase project settings (Authentication → Settings) to ensure email confirmation is enabled. You can also try signing up again with the same email.`,
              variant: "destructive",
            })
          } else {
            toast({
              title: "Error",
              description: `${errorMessage}. Please try signing up again.`,
              variant: "destructive",
            })
          }
        }
      }
    } catch (err: any) {
      console.error("Resend email error:", err)
      if (!success) {
        toast({
          title: "Error",
          description: err.message || errorMessage || "Failed to resend email. Please try again or contact support.",
          variant: "destructive",
        })
      }
    } finally {
      setIsResending(false)
    }
  }

  const handleChangeEmail = () => {
    // Navigate back to signup step 2 (contact details)
    router.push("/signup")
  }

  const handleBackToLogin = () => {
    router.push("/login")
  }

  return (
    <div className="space-y-6">
      {/* Mobile-style header */}
      <div className="bg-[#0c3a30] text-white p-6 rounded-t-2xl">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Mail className="h-6 w-6 text-white" />
          </div>
        </div>
        <h1 className="text-xl font-semibold text-center">Verify Your Email Address</h1>
        <p className="text-center text-white/80 mt-2">Please check your inbox for the verification link</p>
      </div>

      <Card className="shadow-lg border-0 rounded-t-none">
        <CardContent className="p-6">
          {showSuccess && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="flex justify-between items-start">
                  <div>
                    <strong>Success</strong>
                    <br />
                    Your registration is successful. A verification link has been sent to your email address, please
                    click on the link to verify your email address.
                  </div>
                  <button onClick={() => setShowSuccess(false)} className="text-green-600 hover:text-green-800 ml-4">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-[#c4d626] rounded-full flex items-center justify-center mx-auto">
              <div className="relative">
                <Mail className="h-10 w-10 text-[#0c3a30]" />
                <CheckCircle className="h-5 w-5 text-green-600 absolute -bottom-1 -right-1 bg-white rounded-full" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Check your inbox</h2>
              <p className="text-gray-600">
                We've sent you an email with a link to confirm your account
                {userEmail && (
                  <span className="block mt-1 font-medium text-[#0c3a30]">{userEmail}</span>
                )}
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl text-left">
              <h3 className="font-semibold text-gray-900 mb-3">Didn't get the email?</h3>
              <ol className="space-y-2 text-sm text-gray-600">
                <li>1. Check your spam/junk folder - verification emails sometimes end up there</li>
                <li>2. Wait a few minutes - emails can take 1-5 minutes to arrive</li>
                <li>3. Verify the email address is correct: <strong className="text-gray-900">{userEmail || "your email"}</strong></li>
                <li>4. Check if your email provider is blocking our emails</li>
                <li>5. Try clicking the "Resend Verification Email" button below</li>
              </ol>
              {userEmail && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-800 mb-2">
                    <strong>Note:</strong> If you still don't receive the email after several attempts, 
                    please check your Supabase project settings.
                  </p>
                  <div className="text-xs text-blue-700 space-y-1">
                    <p>1. Go to: <a href="https://app.supabase.com/project/fiwryzbywoagqocfjhqg/settings/auth" target="_blank" rel="noopener noreferrer" className="underline">Supabase Auth Settings</a></p>
                    <p>2. Ensure <strong>"Enable email confirmations"</strong> is checked</p>
                    <p>3. Check your spam/junk folder</p>
                    <p>4. Wait 1-5 minutes (emails can be delayed)</p>
                    <p>5. Check Auth Logs for email sending errors</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full bg-[#0c3a30] hover:bg-[#0c3a30]/90 text-white h-12 rounded-xl"
              >
                {isResending ? "Sending..." : "Resend Verification Email"}
              </Button>
              <Button onClick={handleChangeEmail} variant="outline" className="w-full h-12 rounded-xl bg-transparent">
                Change Email Address
              </Button>
              <Button
                onClick={handleBackToLogin}
                variant="ghost"
                className="w-full h-12 rounded-xl text-gray-600 hover:text-[#0c3a30]"
              >
                Back to Login
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
