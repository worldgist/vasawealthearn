"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowLeft, Download, Share2, TrendingUp } from "lucide-react"

export default function InvestmentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [investmentDetails, setInvestmentDetails] = useState<any>(null)

  useEffect(() => {
    const plan = searchParams.get("plan")
    const amount = searchParams.get("amount")
    const duration = searchParams.get("duration")
    const expectedReturn = searchParams.get("return")

    if (plan && amount && duration && expectedReturn) {
      setInvestmentDetails({
        plan,
        amount: Number.parseFloat(amount),
        duration,
        expectedReturn,
        investmentDate: new Date().toLocaleDateString(),
        referenceId: `INV${Date.now()}`,
        status: "Active",
      })
    }
  }, [searchParams])

  const handleDownloadReceipt = () => {
    // Create and download receipt
    const receiptContent = `
      CRYPTO INVESTMENT RECEIPT
      ==========================
      
      Investment Plan: ${investmentDetails.plan}
      Amount Invested: $${investmentDetails.amount.toLocaleString()}
      Expected Return: ${investmentDetails.expectedReturn}
      Duration: ${investmentDetails.duration}
      Investment Date: ${investmentDetails.investmentDate}
      Reference ID: ${investmentDetails.referenceId}
      Status: ${investmentDetails.status}
      
      Thank you for your crypto investment with Vasawealthearn!
    `

    const blob = new Blob([receiptContent], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `investment-receipt-${investmentDetails.referenceId}.txt`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Crypto Investment Confirmation",
          text: `I just invested $${investmentDetails.amount.toLocaleString()} in ${investmentDetails.plan} crypto investment with Vasawealthearn!`,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(
        `I just invested $${investmentDetails.amount.toLocaleString()} in ${investmentDetails.plan} crypto investment with Vasawealthearn!`,
      )
    }
  }

  if (!investmentDetails) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c4d626]"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Crypto Investment Successful!</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Your crypto investment has been processed successfully. You will start earning returns according to your selected
            plan.
          </p>
        </div>

        {/* Investment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Investment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Investment Plan</p>
                <p className="font-semibold">{investmentDetails.plan}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Amount Invested</p>
                <p className="font-semibold text-2xl text-[#c4d626]">${investmentDetails.amount.toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Expected Return</p>
                <p className="font-semibold text-green-600">{investmentDetails.expectedReturn}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-semibold">{investmentDetails.duration}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Investment Date</p>
                <p className="font-semibold">{investmentDetails.investmentDate}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Reference ID</p>
                <p className="font-semibold">{investmentDetails.referenceId}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={handleDownloadReceipt} className="flex-1 bg-[#c4d626] hover:bg-[#b8c423] text-gray-900">
            <Download className="h-4 w-4 mr-2" />
            Download Receipt
          </Button>
          <Button onClick={handleShare} variant="outline" className="flex-1 bg-transparent">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex justify-center">
            <Button
            onClick={() => router.push("/dashboard/save-invest")}
            variant="ghost"
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Crypto Investments
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
