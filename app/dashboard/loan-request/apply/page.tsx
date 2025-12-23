"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { ArrowLeft, FileText, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const loanTypes = [
  "Personal Home Loans",
  "Automobile Loans",
  "Business Loans",
  "Joint Mortgage",
  "Secured Overdraft",
  "Health Finance",
]

const employmentStatuses = [
  "Employed",
  "Self-employed",
  "Unemployed",
  "Retired",
  "Student",
]

export default function LoanApplicationPage() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [showTermsDialog, setShowTermsDialog] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)

  const [formData, setFormData] = useState({
    loanType: "",
    amount: "",
    purpose: "",
    durationMonths: "",
    employmentStatus: "",
    annualIncome: "",
    creditScore: "",
  })

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profile) {
          setUserProfile(profile)
        }
      }
    } catch (error) {
      console.error("Error loading user profile:", error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const calculateInterestRate = (loanType: string, amount: number, duration: number) => {
    // Simple interest rate calculation based on loan type and amount
    let baseRate = 5.0

    if (loanType === "Personal Home Loans") baseRate = 3.5
    else if (loanType === "Automobile Loans") baseRate = 4.5
    else if (loanType === "Business Loans") baseRate = 6.0
    else if (loanType === "Joint Mortgage") baseRate = 3.0
    else if (loanType === "Secured Overdraft") baseRate = 7.0
    else if (loanType === "Health Finance") baseRate = 5.5

    // Adjust based on amount
    if (amount > 100000) baseRate += 0.5
    if (amount > 500000) baseRate += 0.5

    // Adjust based on duration
    if (duration > 60) baseRate += 0.5

    return baseRate
  }

  const calculateMonthlyPayment = (amount: number, rate: number, months: number) => {
    const monthlyRate = rate / 100 / 12
    if (monthlyRate === 0) return amount / months
    return (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!termsAccepted) {
      toast({
        title: "Terms and Conditions Required",
        description: "Please read and accept the terms and conditions to proceed.",
        variant: "destructive",
      })
      return
    }

    if (!formData.loanType || !formData.amount || !formData.durationMonths) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Authentication Error",
          description: "Please log in to apply for a loan.",
          variant: "destructive",
        })
        return
      }

      const amount = parseFloat(formData.amount)
      const durationMonths = parseInt(formData.durationMonths)
      const interestRate = calculateInterestRate(formData.loanType, amount, durationMonths)
      const monthlyPayment = calculateMonthlyPayment(amount, interestRate, durationMonths)

      const { data: loan, error } = await supabase
        .from("loans")
        .insert({
          user_id: user.id,
          loan_type: formData.loanType,
          amount: amount,
          purpose: formData.purpose || null,
          duration_months: durationMonths,
          interest_rate: interestRate,
          monthly_payment: monthlyPayment,
          status: "pending",
          employment_status: formData.employmentStatus || null,
          annual_income: formData.annualIncome ? parseFloat(formData.annualIncome) : null,
          credit_score: formData.creditScore ? parseInt(formData.creditScore) : null,
          terms_accepted: true,
          terms_accepted_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error("Error submitting loan:", error)
        toast({
          title: "Error",
          description: "Failed to submit loan application. Please try again.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Application Submitted",
        description: "Your loan application has been submitted for review. We will notify you via email once it's reviewed.",
      })

      // Redirect to loan history or dashboard
      setTimeout(() => {
        router.push("/dashboard/loan-history")
      }, 2000)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const interestRate = formData.loanType && formData.amount && formData.durationMonths
    ? calculateInterestRate(formData.loanType, parseFloat(formData.amount) || 0, parseInt(formData.durationMonths) || 0)
    : 0

  const monthlyPayment = formData.loanType && formData.amount && formData.durationMonths
    ? calculateMonthlyPayment(parseFloat(formData.amount) || 0, interestRate, parseInt(formData.durationMonths) || 0)
    : 0

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/loan-request">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Apply for a Loan</h1>
            <p className="text-gray-600 mt-1">Fill in your loan application details</p>
          </div>
        </div>

        {/* Terms and Conditions Section */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Terms and Conditions
            </CardTitle>
            <CardDescription>
              Please read and accept the terms and conditions before proceeding
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-4 max-h-60 overflow-y-auto border">
              <div className="space-y-3 text-sm text-gray-700">
                <p>
                  <strong>1. Loan Agreement:</strong> By applying for a loan, you agree to the terms and conditions set forth by the bank. The loan approval is subject to credit verification and bank policies.
                </p>
                <p>
                  <strong>2. Interest Rates:</strong> Interest rates are determined based on loan type, amount, duration, and your credit profile. Rates are subject to change and will be finalized upon approval.
                </p>
                <p>
                  <strong>3. Repayment:</strong> You are required to make monthly payments as specified in your loan agreement. Late payments may incur additional fees and affect your credit score.
                </p>
                <p>
                  <strong>4. Credit Check:</strong> By submitting this application, you authorize the bank to perform a credit check and verify the information provided.
                </p>
                <p>
                  <strong>5. Documentation:</strong> Additional documentation may be required for loan approval. You agree to provide all necessary documents when requested.
                </p>
                <p>
                  <strong>6. Approval Process:</strong> Loan approval is not guaranteed and is subject to bank review. The bank reserves the right to approve or reject any application.
                </p>
                <p>
                  <strong>7. Default:</strong> Failure to make payments as agreed may result in default, additional fees, and legal action.
                </p>
                <p>
                  <strong>8. Privacy:</strong> Your personal and financial information will be kept confidential and used only for loan processing purposes.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  I have read and agree to the terms and conditions
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  You must accept the terms and conditions to proceed with your loan application
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loan Application Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Loan Information</CardTitle>
              <CardDescription>Provide details about the loan you're applying for</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loanType">
                    Loan Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.loanType}
                    onValueChange={(value) => handleInputChange("loanType", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select loan type" />
                    </SelectTrigger>
                    <SelectContent>
                      {loanTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">
                    Loan Amount ($) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1000"
                    step="100"
                    value={formData.amount}
                    onChange={(e) => handleInputChange("amount", e.target.value)}
                    placeholder="Enter loan amount"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="durationMonths">
                    Loan Duration (Months) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="durationMonths"
                    type="number"
                    min="6"
                    max="360"
                    step="6"
                    value={formData.durationMonths}
                    onChange={(e) => handleInputChange("durationMonths", e.target.value)}
                    placeholder="Enter duration in months"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employmentStatus">Employment Status</Label>
                  <Select
                    value={formData.employmentStatus}
                    onValueChange={(value) => handleInputChange("employmentStatus", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment status" />
                    </SelectTrigger>
                    <SelectContent>
                      {employmentStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annualIncome">Annual Income ($)</Label>
                  <Input
                    id="annualIncome"
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.annualIncome}
                    onChange={(e) => handleInputChange("annualIncome", e.target.value)}
                    placeholder="Enter annual income"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="creditScore">Credit Score</Label>
                  <Input
                    id="creditScore"
                    type="number"
                    min="300"
                    max="850"
                    value={formData.creditScore}
                    onChange={(e) => handleInputChange("creditScore", e.target.value)}
                    placeholder="Enter credit score (300-850)"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Loan Purpose</Label>
                <Textarea
                  id="purpose"
                  value={formData.purpose}
                  onChange={(e) => handleInputChange("purpose", e.target.value)}
                  placeholder="Describe the purpose of this loan"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Loan Summary */}
          {formData.loanType && formData.amount && formData.durationMonths && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">Loan Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Loan Type:</span>
                  <span className="font-medium">{formData.loanType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Loan Amount:</span>
                  <span className="font-medium">${parseFloat(formData.amount || "0").toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{formData.durationMonths} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Interest Rate:</span>
                  <span className="font-medium">{interestRate.toFixed(2)}% APR</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-gray-600 font-semibold">Estimated Monthly Payment:</span>
                  <span className="font-bold text-green-700">${monthlyPayment.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <Link href="/dashboard/loan-request">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={loading || !termsAccepted}
              className="bg-[#c4d626] hover:bg-[#a8c520] text-[#0c3a30]"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0c3a30] inline-block mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}


