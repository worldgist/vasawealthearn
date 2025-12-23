"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  DollarSign,
  CreditCard,
  Building,
  User,
  Calendar,
  Hash,
  FileText,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useSearchParams } from "next/navigation"

export default function TransferPreviewPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const searchParams = useSearchParams()

  const amount = searchParams.get("amount")
  const accountType = searchParams.get("accountType")
  const beneficiaryName = searchParams.get("beneficiaryName")
  const beneficiaryAccount = searchParams.get("beneficiaryAccount")
  const routingNumber = searchParams.get("routingNumber")
  const bankName = searchParams.get("bankName")
  const transferType = searchParams.get("transferType")
  const description = searchParams.get("description")

  const transferDetails = {
    amount: amount || "102,364.00",
    accountType: accountType || "Checking Account",
    beneficiaryName: beneficiaryName || "Strange William Booth",
    beneficiaryAccount: beneficiaryAccount || "4746802665",
    routingNumber: routingNumber || "64007110",
    bankName: bankName || "PNCBANK",
    transferType: transferType || "Online Banking",
    description: description || "recovery funds for strange william booth",
    transactionId: "TXN" + Date.now(),
    processingTime: "Instant",
    fee: "0.00",
  }

  const handleConfirmTransfer = () => {
    setIsProcessing(true)
    localStorage.setItem("transferDetails", JSON.stringify(transferDetails))
    // Simulate processing
    setTimeout(() => {
      // Redirect to success page
      window.location.href = "/dashboard/local-transfer/success"
    }, 3000)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Link href="/dashboard" className="hover:text-[#c4d626]">
                Dashboard
              </Link>
              <span>/</span>
              <Link href="/dashboard/local-transfer" className="hover:text-[#c4d626]">
                Local Transfer
              </Link>
              <span>/</span>
              <span>Preview Transfer</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Review Transfer Details</h1>
            <p className="text-gray-600">Please review all details before confirming your transfer</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Preview Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transfer Summary */}
            <Card className="border-2 border-[#c4d626]">
              <CardHeader className="bg-gradient-to-r from-[#c4d626] to-[#a8c520] text-white">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-6 w-6" />
                  Transfer Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-1">Amount to Send</p>
                    <p className="text-5xl font-bold text-[#c4d626] mb-2">${transferDetails.amount}</p>
                    <p className="text-sm text-gray-700">from your {transferDetails.accountType}</p>
                  </div>
                  <Badge variant="secondary" className="bg-[#c4d626] text-black">
                    {transferDetails.transferType}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Processing Time</p>
                    <p className="font-semibold">{transferDetails.processingTime}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Transfer Fee</p>
                    <p className="font-semibold text-green-600">${transferDetails.fee}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Beneficiary Name</p>
                        <p className="font-semibold">{transferDetails.beneficiaryName}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Hash className="h-5 w-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Account Number</p>
                        <p className="font-semibold">{transferDetails.beneficiaryAccount}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Hash className="h-5 w-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Routing Number</p>
                        <p className="font-semibold">{transferDetails.routingNumber}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Building className="h-5 w-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Bank Name</p>
                        <p className="font-semibold">{transferDetails.bankName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CreditCard className="h-5 w-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Transfer Type</p>
                        <p className="font-semibold">{transferDetails.transferType}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Transaction Date</p>
                        <p className="font-semibold">{new Date().toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Hash className="h-5 w-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Transaction ID</p>
                        <p className="font-semibold text-xs">{transferDetails.transactionId}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {transferDetails.description && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Description/Memo</p>
                      <p className="font-semibold">{transferDetails.description}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Account Balance After Transfer */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Account Balance After Transfer</p>
                    <p className="text-2xl font-bold text-blue-800">
                      $
                      {(102864.0 - Number.parseFloat(transferDetails.amount.replace(",", ""))).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1 bg-[#c4d626] hover:bg-[#a8c520] text-black font-semibold"
                onClick={handleConfirmTransfer}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                    Processing Transfer...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Confirm Transfer
                  </div>
                )}
              </Button>
              <Button variant="outline" size="lg" asChild disabled={isProcessing}>
                <Link href="/dashboard/local-transfer" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Edit Details
                </Link>
              </Button>
            </div>
          </div>

          {/* Security & Information Sidebar */}
          <div className="space-y-6">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800 mb-2">Secure Transfer</h3>
                    <p className="text-sm text-green-700">
                      Your transfer is protected by bank-level encryption and fraud monitoring systems.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-800 mb-2">Important Notice</h3>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li>• Transfers cannot be cancelled once confirmed</li>
                      <li>• Verify all recipient details carefully</li>
                      <li>• Processing time may vary by bank</li>
                      <li>• Keep your transaction ID for records</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Contact our support team if you have questions about this transfer.
                </p>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
