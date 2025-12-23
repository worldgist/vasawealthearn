"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [staySignedIn, setStaySignedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  // Initialize Supabase client
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Validate inputs
      if (!email.trim()) {
        setError("Email is required")
        setIsLoading(false)
        return
      }

      if (!password) {
        setError("Password is required")
        setIsLoading(false)
        return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        setError("Please enter a valid email address")
        setIsLoading(false)
        return
      }

      // Sign in with Supabase - Real authentication
      console.log("Attempting to sign in with Supabase...", {
        email: email.trim().toLowerCase(),
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Configured" : "Missing",
      })

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      })

      console.log("Supabase sign in response:", { 
        hasUser: !!data?.user, 
        hasSession: !!data?.session,
        hasError: !!signInError,
        error: signInError?.message,
        errorCode: signInError?.status
      })

      if (signInError) {
        setError(signInError.message)
        toast({
          title: "Login Failed",
          description: signInError.message,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (data.user) {
        console.log("User authenticated successfully:", data.user.id)

        // Update user profile last_login and login_count (if profile exists)
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("login_count")
            .eq("id", data.user.id)
            .single()

          const loginCount = profile?.login_count || 0

          const { error: updateError } = await supabase
            .from("profiles")
            .update({
              last_login: new Date().toISOString(),
              last_active: new Date().toISOString(),
              login_count: loginCount + 1,
            })
            .eq("id", data.user.id)

          if (updateError) {
            console.log("Profile update skipped:", updateError)
          } else {
            console.log("Profile updated successfully")
          }
        } catch (profileError) {
          // Profile might not exist yet, continue anyway
          console.log("Profile update skipped:", profileError)
        }

        // Verify session was created
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          console.log("Session created successfully")
        }

        toast({
          title: "Welcome Back!",
          description: "You have successfully signed in.",
        })

        // Redirect to dashboard
        router.push("/dashboard")
        router.refresh()
      } else {
        throw new Error("Authentication failed. No user data returned.")
      }
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "An unexpected error occurred")
      toast({
        title: "Login Failed",
        description: err.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="shadow-lg border-0">
      <CardContent className="p-8">
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.png" alt="Vasawealthearn" className="h-12 w-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#0c3a30]">Welcome to Vasawealthearn</h1>
          <p className="text-sm text-gray-600 mt-2">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
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

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-base font-medium text-gray-700">
                Password
              </Label>
              <Link href="/forgot-password" className="text-sm text-gray-600 hover:text-[#0c3a30]">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-12 border-gray-200 rounded-xl text-base"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="stay-signed-in"
              checked={staySignedIn}
              onCheckedChange={setStaySignedIn}
              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            <Label htmlFor="stay-signed-in" className="text-sm text-gray-600">
              Stay signed in for 30 days
            </Label>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[#0c3a30] hover:bg-[#0c3a30]/90 text-white rounded-xl text-base font-medium"
          >
            <LogIn className="mr-2 h-5 w-5" />
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>

          <div className="text-center">
            <Link href="/signup" className="block">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-2 border-gray-200 hover:border-[#0c3a30] text-gray-700 hover:text-[#0c3a30] rounded-xl text-base font-medium bg-white hover:bg-gray-50"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Not enrolled? Create Account
              </Button>
            </Link>
          </div>

          <div className="text-center text-xs text-gray-500 leading-relaxed">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-[#0c3a30] hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-[#0c3a30] hover:underline">
              Privacy Policy
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
