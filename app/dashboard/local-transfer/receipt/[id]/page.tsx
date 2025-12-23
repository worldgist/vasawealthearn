"use client"

export const dynamic = 'force-dynamic'

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Download,
  Share2,
  ArrowLeft,
  CheckCircle,
  DollarSign,
  Calendar,
  Hash,
  User,
  Building,
  CreditCard,
  FileText,
  PrinterIcon as Print,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useRef } from "react"

export default function TransferReceiptPage() {
  const params = useParams()
  const receiptRef = useRef<HTMLDivElement>(null)

  const transferDetails = {
    transactionId: params.id as string,
    amount: "102,364.00",
    fee: "0.00",
    total: "102,364.00",
    senderName: "Strange William Booth",
    senderAccount: "9846850999",
    beneficiaryName: "Strange William Booth",
    beneficiaryAccount: "4746802665",
    routingNumber: "64007110",
    bankName: "PNCBANK",
    transferType: "Online Banking",
    accountType: "Checking Account",
    description: "recovery funds for strange william booth",
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    status: "Completed",
    processingTime: "Instant",
  }

  const handleDownload = () => {
    if (receiptRef.current) {
      const printContent = receiptRef.current.innerHTML
      const originalContent = document.body.innerHTML

      document.body.innerHTML = `
        <html>
          <head>
            <title>Transfer Receipt - ${transferDetails.transactionId}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .receipt-container { max-width: 800px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { font-size: 24px; font-weight: bold; color: #c4d626; }
              .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
              .detail-item { margin-bottom: 10px; }
              .label { font-size: 12px; color: #666; }
              .value { font-weight: bold; }
              .amount { font-size: 32px; font-weight: bold; text-align: center; margin: 20px 0; }
              .status { background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; display: inline-block; }
              .separator { border-top: 1px solid #e5e7eb; margin: 20px 0; }
              .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <div class="receipt-container">
              ${printContent}
            </div>
          </body>
        </html>
      `

      window.print()
      document.body.innerHTML = originalContent
      window.location.reload()
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Transfer Receipt - ${transferDetails.transactionId}`,
        text: `Transfer of $${transferDetails.amount} completed successfully`,
        url: window.location.href,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert("Receipt link copied to clipboard!")
    }
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
              <span>Receipt</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Transfer Receipt</h1>
            <p className="text-gray-600">Transaction ID: {transferDetails.transactionId}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button onClick={handleDownload} className="bg-[#c4d626] hover:bg-[#a8c520] text-black">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardContent className="p-0">
              <div ref={receiptRef} className="p-8">
                {/* Receipt Header */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-[#c4d626] rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-black" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#c4d626]">Vasawealthearn</h2>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Transfer Receipt</h3>
                  <p className="text-gray-600">Official Transaction Record</p>
                </div>

                {/* Status Badge */}
                <div className="text-center mb-6">
                  <Badge className="bg-green-100 text-green-800 px-4 py-2 text-sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {transferDetails.status}
                  </Badge>
                </div>

                {/* Transfer Amount */}
                <div className="text-center mb-8">
                  <p className="text-gray-600 mb-2">Transfer Amount</p>
                  <p className="text-4xl font-bold text-gray-900">${transferDetails.amount}</p>
                  <p className="text-sm text-gray-600 mt-2">{transferDetails.accountType}</p>
                </div>

                <Separator className="my-6" />

                {/* Transaction Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Transaction Information</h4>

                    <div className="flex items-start gap-3">
                      <Hash className="h-4 w-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-xs text-gray-600 uppercase tracking-wide">Transaction ID</p>
                        <p className="font-mono text-sm font-semibold">{transferDetails.transactionId}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="h-4 w-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-xs text-gray-600 uppercase tracking-wide">Date & Time</p>
                        <p className="font-semibold">
                          {transferDetails.date} at {transferDetails.time}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CreditCard className="h-4 w-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-xs text-gray-600 uppercase tracking-wide">Transfer Type</p>
                        <p className="font-semibold">{transferDetails.transferType}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-xs text-gray-600 uppercase tracking-wide">Processing Time</p>
                        <p className="font-semibold">{transferDetails.processingTime}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Account Details</h4>

                    <div className="flex items-start gap-3">
                      <User className="h-4 w-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-xs text-gray-600 uppercase tracking-wide">From</p>
                        <p className="font-semibold">{transferDetails.senderName}</p>
                        <p className="text-sm text-gray-600">Account: {transferDetails.senderAccount}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <User className="h-4 w-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-xs text-gray-600 uppercase tracking-wide">To</p>
                        <p className="font-semibold">{transferDetails.beneficiaryName}</p>
                        <p className="text-sm text-gray-600">Account: {transferDetails.beneficiaryAccount}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Building className="h-4 w-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-xs text-gray-600 uppercase tracking-wide">Bank</p>
                        <p className="font-semibold">{transferDetails.bankName}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Hash className="h-4 w-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-xs text-gray-600 uppercase tracking-wide">Routing Number</p>
                        <p className="font-semibold">{transferDetails.routingNumber}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {transferDetails.description && (
                  <>
                    <Separator className="my-6" />
                    <div className="mb-6">
                      <div className="flex items-start gap-3">
                        <FileText className="h-4 w-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-xs text-gray-600 uppercase tracking-wide">Description</p>
                          <p className="font-semibold">{transferDetails.description}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <Separator className="my-6" />

                {/* Fee Breakdown */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Fee Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transfer Amount</span>
                      <span className="font-semibold">${transferDetails.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Processing Fee</span>
                      <span className="font-semibold">${transferDetails.fee}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>${transferDetails.total}</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center text-sm text-gray-600 border-t pt-6">
                  <p className="mb-2">This is an official receipt from Vasawealthearn</p>
                  <p className="mb-2">Generated on {new Date().toLocaleString()}</p>
                  <p>For questions about this transaction, contact support at support@vasawealthearn.com</p>
                  <p className="mt-4 text-xs">© 2025 Vasawealthearn. All rights reserved.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <Button variant="outline" onClick={handleDownload}>
              <Print className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/transactions" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                View All Transactions
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
