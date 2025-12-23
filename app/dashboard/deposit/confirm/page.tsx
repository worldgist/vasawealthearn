"use client"

import type React from "react"
import { useRouter } from "next/navigation"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Bitcoin, Upload, Copy, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { uploadDepositReceipt } from "@/lib/supabase/storage"
import { useToast } from "@/hooks/use-toast"

export default function DepositConfirmPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [amount, setAmount] = useState("500")
  const [paymentMethod, setPaymentMethod] = useState("Bitcoin")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const bitcoinAddress = "bc1qgvhyrxzcf60lkgn0tea85ff3pvpdps750xggfl"

  useEffect(() => {
    const urlAmount = searchParams.get("amount")
    const urlMethod = searchParams.get("method")
    if (urlAmount) setAmount(urlAmount)
    if (urlMethod) setPaymentMethod(urlMethod)
  }, [searchParams])

  const handleFileUpload = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB")
      return
    }

    const allowedTypes = ["image/png", "image/jpeg", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      alert("Only PNG, JPG, and PDF files are allowed")
      return
    }

    setUploadedFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileUpload(file)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(bitcoinAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleSubmitPayment = async () => {
    if (!uploadedFile) {
      toast({
        title: "File Required",
        description: "Please upload a payment receipt.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        toast({
          title: "Error",
          description: "You must be logged in to submit a deposit.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, email")
        .eq("id", user.id)
        .single()

      const userName = profile
        ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
        : user.email?.split("@")[0] || "User"
      const userEmail = profile?.email || user.email || ""

      // Generate reference ID
      const referenceId = `DEP-${Date.now().toString().slice(-8)}`
      const depositAmount = Number.parseFloat(amount)

      // Upload receipt to storage
      let receiptUrl = ""
      try {
        const uploadResult = await uploadDepositReceipt(uploadedFile, user.id, referenceId)
        receiptUrl = uploadResult.url
      } catch (uploadError) {
        console.error("Error uploading receipt:", uploadError)
        toast({
          title: "Upload Error",
          description: "Failed to upload receipt. Please try again.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Save deposit to database
      const { data: deposit, error: depositError } = await supabase
        .from("deposits")
        .insert({
          user_id: user.id,
          deposit_type: paymentMethod.toLowerCase().includes("bitcoin") ? "wire" : "wire",
          to_account_type: "checking",
          amount: depositAmount,
          currency: "USD",
          deposit_fee: 0,
          net_amount: depositAmount,
          description: `${paymentMethod} Deposit - Receipt uploaded`,
          check_front_image_url: receiptUrl,
          status: "pending",
          reference_number: referenceId,
        })
        .select()
        .single()

      if (depositError) {
        console.error("Error saving deposit:", depositError)
        toast({
          title: "Error",
          description: "Failed to save deposit. Please try again.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Create transaction record
      const { error: transactionError } = await supabase.from("transactions").insert({
        user_id: user.id,
        transaction_type: "deposit",
        amount: depositAmount,
        currency: "USD",
        status: "pending",
        description: `${paymentMethod} Deposit`,
        reference_number: referenceId,
        created_at: new Date().toISOString(),
      })

      if (transactionError) {
        console.error("Error creating transaction:", transactionError)
        // Continue even if transaction creation fails
      }

      // Navigate to success page
      router.push(`/dashboard/deposit/success?amount=${amount}&method=${paymentMethod}&ref=${referenceId}`)
    } catch (error) {
      console.error("Error submitting deposit:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
              <span>Dashboard</span>
              <span>/</span>
              <span>Deposits</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Make Deposit</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Make Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Bitcoin className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Payment Method: {paymentMethod}</p>
                      <p className="text-2xl font-bold text-[#c4d626]">Amount: ${amount}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  You are to make payment of <span className="font-semibold">${amount}</span> using your selected
                  payment method. Screenshot and upload the proof of payment.
                </p>
              </CardContent>
            </Card>

            {/* QR Code Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Scan QR Code</CardTitle>
                <p className="text-sm text-gray-600">Payment QR Code</p>
                <p className="text-sm text-gray-500">Scan the QR code with your payment app</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* QR Code Placeholder */}
                <div className="flex justify-center">
                  <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Bitcoin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">QR Code</p>
                    </div>
                  </div>
                </div>

                {/* Bitcoin Address */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bitcoin Address:</label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 p-3 bg-gray-50 rounded-lg font-mono text-sm break-all">
                        {bitcoinAddress}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyToClipboard}
                        className="flex items-center space-x-1 bg-transparent"
                      >
                        {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        <span>{copied ? "Copied" : "Copy"}</span>
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount:</label>
                    <div className="p-3 bg-gray-50 rounded-lg font-semibold text-lg">${amount}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Network Type:</label>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      Bitcoin
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upload Payment Proof */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upload Payment Proof</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragOver ? "border-[#c4d626] bg-[#c4d626]/5" : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragOver(true)
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500 mb-4">PNG, JPG or PDF (max. 5MB)</p>

                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    Choose File
                  </label>

                  {uploadedFile && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        <CheckCircle className="h-4 w-4 inline mr-1" />
                        File uploaded: {uploadedFile.name}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1 bg-[#c4d626] hover:bg-[#b8c423] text-black font-semibold h-12"
                disabled={!uploadedFile || isSubmitting}
                onClick={handleSubmitPayment}
              >
                {isSubmitting ? "Submitting..." : "Submit Payment"}
              </Button>
              <Button variant="outline" className="flex-1 h-12 bg-transparent" asChild>
                <Link href="/dashboard/deposit">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Deposit
                </Link>
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Method:</span>
                  <span className="text-sm font-semibold">{paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className="text-sm font-semibold">${amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Network:</span>
                  <span className="text-sm font-semibold">Bitcoin</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between">
                  <span className="text-sm font-semibold">Total:</span>
                  <span className="text-lg font-bold text-[#c4d626]">${amount}</span>
                </div>
              </CardContent>
            </Card>

            {/* Important Notice */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-orange-600">Important Notice</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Send the exact amount to the provided address</li>
                  <li>• Upload clear proof of payment</li>
                  <li>• Processing may take 1-3 network confirmations</li>
                  <li>• Contact support if you need assistance</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
