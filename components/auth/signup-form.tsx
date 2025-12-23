"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  User,
  Mail,
  Phone,
  Globe,
  Shield,
  Lock,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Check,
  CreditCard,
  PiggyBank,
  Key,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

const steps = [
  { id: 1, name: "Personal Info", icon: User },
  { id: 2, name: "Contact Details", icon: Mail },
  { id: 3, name: "Account Setup", icon: CreditCard },
  { id: 4, name: "Security", icon: Shield },
]

export function SignupForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  // Initialize Supabase client
  const supabase = createClient()
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    country: "",
    accountType: "",
    currency: "",
    pin: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.firstName && formData.lastName && formData.username
      case 2:
        return formData.email && formData.phone && formData.country
      case 3:
        return formData.accountType && formData.currency && formData.pin.length === 4
      case 4:
        return (
          formData.password &&
          formData.confirmPassword &&
          formData.password === formData.confirmPassword &&
          formData.agreeToTerms
        )
      default:
        return false
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(4)) return

    setError("")
    setIsLoading(true)

    try {
      // Validate password strength
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters long")
        toast({
          title: "Password Too Short",
          description: "Password must be at least 8 characters long",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match")
        toast({
          title: "Password Mismatch",
          description: "Passwords do not match",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email.trim())) {
        setError("Please enter a valid email address")
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Check if username is already taken (optional check)
      if (formData.username) {
        try {
          const { data: existingUser, error: checkError } = await supabase
            .from("profiles")
            .select("username")
            .eq("username", formData.username)
            .maybeSingle()

          if (existingUser) {
            setError("Username is already taken. Please choose another one.")
            toast({
              title: "Username Taken",
              description: "This username is already in use. Please choose another one.",
              variant: "destructive",
            })
            setIsLoading(false)
            return
          }
        } catch (checkError) {
          // If check fails, continue anyway (might be a permissions issue)
          console.log("Username check skipped:", checkError)
        }
      }

      // Sign up with Supabase - Real authentication
      console.log("Attempting to sign up with Supabase...", {
        email: formData.email.trim().toLowerCase(),
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Configured" : "Missing",
      })

      // Sign up with Supabase - this creates the user account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            middle_name: formData.middleName,
            last_name: formData.lastName,
            username: formData.username,
            phone: formData.phone,
            country: formData.country,
            account_type: formData.accountType,
            currency: formData.currency,
          },
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      })

      // After signup, send OTP code for email verification
      if (authData.user && !signUpError) {
        console.log("Sending OTP code for email verification...")
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: formData.email.trim().toLowerCase(),
          options: {
            emailRedirectTo: `${window.location.origin}/verify-email`,
            shouldCreateUser: false, // User already exists from signup
          },
        })

        if (otpError) {
          console.warn("OTP send error (user may need to verify via link):", otpError)
          // Continue anyway - user can use resend button
        } else {
          console.log("OTP code sent successfully")
        }
      }

      console.log("Supabase sign up response:", { 
        hasUser: !!authData?.user, 
        hasSession: !!authData?.session,
        hasError: !!signUpError,
        error: signUpError?.message,
        errorCode: signUpError?.status,
        emailConfirmed: authData?.user?.email_confirmed_at,
        confirmationSent: authData?.user?.confirmation_sent_at
      })

      if (signUpError) {
        setError(signUpError.message)
        toast({
          title: "Signup Failed",
          description: signUpError.message,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (authData.user) {
        // Create or update user profile with all information
        // The trigger might have already created a basic profile, so we'll use upsert
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: authData.user.id,
            first_name: formData.firstName,
            middle_name: formData.middleName || null,
            last_name: formData.lastName,
            email: formData.email.trim(),
            username: formData.username || null,
            phone: formData.phone || null,
            country: formData.country || "United States",
            account_type: formData.accountType || "checking",
            currency: formData.currency || "USD",
            kyc_status: "pending",
            account_status: "active",
            email_verified: false,
            login_count: 0,
          }, {
            onConflict: 'id'
          })

        if (profileError) {
          console.error("Profile creation/update error:", profileError)
          // Don't fail signup if profile creation fails - it might be created by trigger
          // But log it for debugging
          if (profileError.code !== '23505' && profileError.code !== 'PGRST116') { 
            // Ignore unique constraint errors and "not found" errors
            console.warn("Profile upsert warning:", profileError.message)
          }
        } else {
          console.log("Profile created/updated successfully for user:", authData.user.id)
        }

        // Verify session was created (if email confirmation is disabled)
        if (authData.session) {
          console.log("Session created successfully")
        }

        // Check if email verification is required
        if (authData.user.email_confirmed_at) {
          // Email already confirmed (if email confirmation is disabled in Supabase)
          console.log("User email already confirmed - email confirmation may be disabled in Supabase")
          toast({
            title: "Account Created!",
            description: "Your account has been created successfully.",
          })
          router.push("/dashboard")
        } else {
          // Email verification required - check if email was actually sent
          // Note: Supabase sends the email automatically, but we should verify
          const emailSent = authData.user.confirmation_sent_at !== null
          
          console.log("User created, email confirmation required:", {
            userId: authData.user.id,
            email: authData.user.email,
            emailConfirmed: authData.user.email_confirmed_at,
            confirmationSent: authData.user.confirmation_sent_at,
            emailSent: emailSent,
            timestamp: new Date().toISOString(),
          })

          // Log warning if email was not sent
          if (!emailSent) {
            console.warn("⚠️ WARNING: Email confirmation was not sent!")
            console.warn("Please check Supabase settings:")
            console.warn("1. Go to: https://app.supabase.com/project/fiwryzbywoagqocfjhqg/settings/auth")
            console.warn("2. Ensure 'Enable email confirmations' is checked")
            console.warn("3. Check Auth Logs for email sending errors")
          }

          // Store email in sessionStorage for the verification page
          if (typeof window !== "undefined") {
            sessionStorage.setItem("signup_email", formData.email.trim())
            sessionStorage.setItem("signup_timestamp", new Date().toISOString())
          }

          if (!emailSent) {
            console.warn("WARNING: Email confirmation code was not sent. Check Supabase email settings.")
            toast({
              title: "Account Created!",
              description: "Please check your email for a 6-digit verification code. If you don't receive it, use the resend button.",
              variant: "default",
            })
          } else {
            toast({
              title: "Account Created!",
              description: "Please check your email (including spam folder) for a 6-digit verification code.",
            })
          }
          
          // Redirect to OTP verification page with email
          router.push(`/verify-email?email=${encodeURIComponent(formData.email.trim())}`)
        }
      } else {
        // User was not created - this shouldn't happen but handle it
        throw new Error("User account was not created. Please try again.")
      }
    } catch (err: any) {
      console.error("Signup error:", err)
      setError(err.message || "An unexpected error occurred")
      toast({
        title: "Signup Failed",
        description: err.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-6">
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.png" alt="Vasawealthearn" className="h-12 w-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#0c3a30]">Create Your Account</h1>
          <p className="text-sm text-gray-600 mt-2">Join Vasawealthearn today</p>
        </div>
        <div className="flex items-center justify-between mb-4">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </Link>
          <span className="text-sm text-gray-500">Step {currentStep} of 4</span>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-1 rounded-full mb-2 ${currentStep >= step.id ? "bg-[#0c3a30]" : "bg-gray-200"}`}
                />
                <span className={`text-xs font-medium ${currentStep >= step.id ? "text-[#0c3a30]" : "text-gray-400"}`}>
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && <div className="w-16 h-px bg-gray-200 mx-4 mt-[-20px]" />}
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="px-8 pb-8">
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Step 1: Personal Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#c4d626] rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-[#0c3a30]" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Personal Information</h2>
              <p className="text-gray-600">Please provide your legal name as it appears on official documents</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                  Legal First Name *
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="John"
                  className="mt-1 h-12 border-gray-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <Label htmlFor="middleName" className="text-sm font-medium text-gray-700">
                  Middle Name
                </Label>
                <Input
                  id="middleName"
                  value={formData.middleName}
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  placeholder="David"
                  className="mt-1 h-12 border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                  Legal Last Name *
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Smith"
                  className="mt-1 h-12 border-gray-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Username *
                </Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="johnsmith123"
                  className="mt-1 h-12 border-gray-200 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={nextStep}
                disabled={!validateStep(1)}
                className="bg-[#0c3a30] hover:bg-[#0c3a30]/90 text-white px-6 disabled:opacity-50"
              >
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Contact Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#c4d626] rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-[#0c3a30]" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Contact Information</h2>
              <p className="text-gray-600">We'll use these details to communicate with you about your account</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address *
                </Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="worldgist72@gmail.com"
                    className="pl-10 h-12 border-gray-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number *
                </Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+18176881062"
                    className="pl-10 h-12 border-gray-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                  Country *
                </Label>
                <div className="relative mt-1">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                  <Select
                    value={formData.country}
                    onValueChange={(value) => setFormData({ ...formData, country: value })}
                    required
                  >
                    <SelectTrigger className="pl-10 h-12 border-gray-200 rounded-xl">
                      <SelectValue placeholder="United States of America" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States of America</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="au">Australia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button onClick={prevStep} variant="outline" className="px-6 bg-transparent">
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <Button
                onClick={nextStep}
                disabled={!validateStep(2)}
                className="bg-[#0c3a30] hover:bg-[#0c3a30]/90 text-white px-6 disabled:opacity-50"
              >
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Account Setup */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Setup</h2>
              <p className="text-gray-600">Choose your account type and set up your transaction PIN</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-4 block">Account Type *</Label>
                <RadioGroup
                  value={formData.accountType}
                  onValueChange={(value) => setFormData({ ...formData, accountType: value })}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl hover:border-[#0c3a30] transition-colors">
                    <RadioGroupItem value="checking" id="checking" className="text-[#0c3a30]" />
                    <div className="w-10 h-10 bg-[#c4d626] rounded-full flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-[#0c3a30]" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="checking" className="font-medium text-gray-900 cursor-pointer">
                        Checking Account
                      </Label>
                      <p className="text-sm text-gray-600">Perfect for daily transactions and bill payments</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl hover:border-[#0c3a30] transition-colors">
                    <RadioGroupItem value="savings" id="savings" className="text-[#0c3a30]" />
                    <div className="w-10 h-10 bg-[#c4d626] rounded-full flex items-center justify-center">
                      <PiggyBank className="h-5 w-5 text-[#0c3a30]" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="savings" className="font-medium text-gray-900 cursor-pointer">
                        Savings Account
                      </Label>
                      <p className="text-sm text-gray-600">Earn interest on your deposits</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="currency" className="text-sm font-medium text-gray-700">
                  Select Currency *
                </Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger className="mt-1 h-12 border-gray-200 rounded-xl">
                    <SelectValue placeholder="$ USD ($)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">$ USD ($)</SelectItem>
                    <SelectItem value="eur">€ EUR (€)</SelectItem>
                    <SelectItem value="gbp">£ GBP (£)</SelectItem>
                    <SelectItem value="cad">$ CAD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="pin" className="text-sm font-medium text-gray-700">
                  Transaction PIN (4 digits) *
                </Label>
                <div className="relative mt-1">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="pin"
                    type={showPin ? "text" : "password"}
                    value={formData.pin}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                    placeholder="••••"
                    maxLength={4}
                    className="pl-10 pr-10 h-12 border-gray-200 rounded-xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Your PIN will be required to authorize transactions</p>
              </div>
            </div>

            <div className="flex justify-between">
              <Button onClick={prevStep} variant="outline" className="px-6 bg-transparent">
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <Button
                onClick={nextStep}
                disabled={!validateStep(3)}
                className="bg-[#0c3a30] hover:bg-[#0c3a30]/90 text-white px-6 disabled:opacity-50"
              >
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Security */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#c4d626] rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-[#0c3a30]" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Secure Your Account</h2>
              <p className="text-gray-600">Create a strong password to protect your account</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password *
                </Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-12 border-gray-200 rounded-xl"
                    required
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

              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password *
                </Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-12 border-gray-200 rounded-xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>

              <div className="flex items-start space-x-2 pt-4">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked as boolean })}
                  className="mt-1"
                />
                <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                  I agree to the{" "}
                  <Link href="/terms" className="text-[#0c3a30] hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-[#0c3a30] hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
            </div>

            <div className="flex justify-between">
              <Button onClick={prevStep} variant="outline" className="px-6 bg-transparent">
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!validateStep(4) || isLoading}
                className="bg-[#0c3a30] hover:bg-[#0c3a30]/90 text-white px-6 disabled:opacity-50"
              >
                <Check className="mr-2 h-4 w-4" />
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
