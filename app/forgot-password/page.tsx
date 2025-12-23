"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      setIsSuccess(true)
      toast({
        title: "Email Sent",
        description: "Password reset link has been sent to your email.",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to send reset email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
            <p className="text-sm text-gray-600 text-center mt-2">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">Check Your Email</h3>
                  <p className="text-sm text-gray-600">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                  <p className="text-xs text-gray-500 mt-4">
                    Didn't receive the email? Check your spam folder or try again.
                  </p>
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      setIsSuccess(false)
                      setEmail("")
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Send Another Email
                  </Button>
                  <Button asChild variant="ghost" className="w-full">
                    <Link href="/login">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Login
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-medium text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 border-gray-200 rounded-xl text-base"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full h-12 bg-[#0c3a30] hover:bg-[#0c3a30]/90 text-white rounded-xl text-base font-medium"
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>

                <div className="text-center">
                  <Link href="/login" className="text-sm text-[#0c3a30] hover:underline flex items-center justify-center">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



