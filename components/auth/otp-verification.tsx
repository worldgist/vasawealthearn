"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Mail, ArrowLeft } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export function OTPVerification() {
  const [otp, setOtp] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [error, setError] = useState("")
  const [countdown, setCountdown] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    // Get email from URL params, sessionStorage, or auth
    const emailFromUrl = searchParams.get("email")
    let email = emailFromUrl || ""

    if (!email && typeof window !== "undefined") {
      email = sessionStorage.getItem("signup_email") || ""
    }

    if (!email) {
      // Try to get from auth
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user?.email) {
          setUserEmail(user.email)
        }
      })
    } else {
      setUserEmail(email)
    }

    // Start countdown timer
    setCountdown(300) // 5 minutes
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [searchParams])

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit code")
      return
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Code must contain only numbers")
      return
    }

    setIsVerifying(true)
    setError("")

    try {
      // Verify OTP with Supabase
      // Try signup type first, then email type
      let verifyError = null
      let verifyData = null

      // Try signup type
      const { data: signupData, error: signupError } = await supabase.auth.verifyOtp({
        email: userEmail,
        token: otp,
        type: "signup",
      })

      if (signupError) {
        // If signup type fails, try email type
        console.log("Signup OTP failed, trying email type:", signupError.message)
        const { data: emailData, error: emailError } = await supabase.auth.verifyOtp({
          email: userEmail,
          token: otp,
          type: "email",
        })

        if (emailError) {
          verifyError = emailError
        } else {
          verifyData = emailData
        }
      } else {
        verifyData = signupData
      }

      if (verifyError) {
        setError(verifyError.message)
        toast({
          title: "Verification Failed",
          description: verifyError.message,
          variant: "destructive",
        })
        setIsVerifying(false)
        return
      }

      if (verifyData?.user) {

      if (verifyError) {
        setError(verifyError.message)
        toast({
          title: "Verification Failed",
          description: verifyError.message,
          variant: "destructive",
        })
        setIsVerifying(false)
        return
      }

        // Update profile email_verified status
        try {
          await supabase
            .from("profiles")
            .update({ email_verified: true })
            .eq("id", verifyData.user.id)
        } catch (profileError) {
          console.log("Profile update skipped:", profileError)
        }

        toast({
          title: "Email Verified!",
          description: "Your email has been successfully verified.",
        })

        // Clear session storage
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("signup_email")
        }

        // Redirect to dashboard
        router.push("/dashboard")
        router.refresh()
      } else {
        throw new Error("Verification failed. No user data returned.")
      }
    } catch (err: any) {
      console.error("OTP verification error:", err)
      setError(err.message || "Failed to verify code. Please try again.")
      toast({
        title: "Verification Failed",
        description: err.message || "Failed to verify code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendCode = async () => {
    if (!userEmail) {
      toast({
        title: "Error",
        description: "Email address not found. Please try signing up again.",
        variant: "destructive",
      })
      return
    }

    if (countdown > 0) {
      toast({
        title: "Please Wait",
        description: `Please wait ${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, "0")} before requesting a new code.`,
        variant: "destructive",
      })
      return
    }

    setIsResending(true)
    setError("")

    try {
      // Resend OTP code using signInWithOtp (sends 6-digit code)
      const { error: resendError } = await supabase.auth.signInWithOtp({
        email: userEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
          shouldCreateUser: false, // Don't create new user, just send OTP
        },
      })

      if (resendError) {
        setError(resendError.message)
        toast({
          title: "Failed to Resend",
          description: resendError.message,
          variant: "destructive",
        })
      } else {
        setOtp("")
        setCountdown(300) // Reset to 5 minutes
        toast({
          title: "Code Sent",
          description: "A new 6-digit verification code has been sent to your email.",
        })
      }
    } catch (err: any) {
      console.error("Resend OTP error:", err)
      setError(err.message || "Failed to resend code. Please try again.")
      toast({
        title: "Error",
        description: err.message || "Failed to resend code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${String(secs).padStart(2, "0")}`
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
        <h1 className="text-xl font-semibold text-center">Verify Your Email</h1>
        <p className="text-center text-white/80 mt-2">Enter the 6-digit code sent to your email</p>
      </div>

      <Card className="shadow-lg border-0 rounded-t-none">
        <CardContent className="p-6">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-[#c4d626] rounded-full flex items-center justify-center mx-auto">
              <Mail className="h-10 w-10 text-[#0c3a30]" />
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Enter Verification Code</h2>
              <p className="text-gray-600">
                We've sent a 6-digit code to
                {userEmail && (
                  <span className="block mt-1 font-medium text-[#0c3a30]">{userEmail}</span>
                )}
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="text-left">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* OTP Input */}
            <div className="space-y-4">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  disabled={isVerifying}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {countdown > 0 && (
                <p className="text-sm text-gray-500">
                  Resend code in {formatTime(countdown)}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleVerify}
                disabled={isVerifying || otp.length !== 6}
                className="w-full bg-[#0c3a30] hover:bg-[#0c3a30]/90 text-white h-12 rounded-xl"
              >
                {isVerifying ? "Verifying..." : "Verify Email"}
              </Button>

              <Button
                onClick={handleResendCode}
                disabled={isResending || countdown > 0}
                variant="outline"
                className="w-full h-12 rounded-xl bg-transparent"
              >
                {isResending ? "Sending..." : countdown > 0 ? `Resend Code (${formatTime(countdown)})` : "Resend Code"}
              </Button>

              <Link href="/signup">
                <Button variant="ghost" className="w-full h-12 rounded-xl text-gray-600 hover:text-[#0c3a30]">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Change Email Address
                </Button>
              </Link>

              <Link href="/login">
                <Button variant="ghost" className="w-full h-12 rounded-xl text-gray-600 hover:text-[#0c3a30]">
                  Back to Login
                </Button>
              </Link>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl text-left text-sm text-gray-600">
              <p className="font-semibold mb-2">Didn't receive the code?</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Check your spam/junk folder</li>
                <li>Wait a few minutes - codes can take 1-5 minutes to arrive</li>
                <li>Verify the email address is correct</li>
                <li>Click "Resend Code" after the timer expires</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

