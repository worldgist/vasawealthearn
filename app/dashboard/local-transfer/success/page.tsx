"use client"

export const dynamic = 'force-dynamic'

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Download, Share2, ArrowLeft, DollarSign, Calendar, Hash, User, Building } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function TransferSuccessPage() {
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  const transferDetails = {
    amount: "102,364.00",
    beneficiaryName: "Strange William Booth",
    beneficiaryAccount: "4746802665",
    routingNumber: "64007110",
    bankName: "PNCBANK",
    transactionId: "TXN" + Date.now(),
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    status: "Completed",
  }

  const handleDownloadReceipt = async () => {
    setIsDownloading(true)
    try {
      const receiptData = {
        ...transferDetails,
        senderName: "Strange William Booth",
        senderAccount: "9846850999",
        transferType: "Online Banking",
        accountType: "Checking Account",
        description: "recovery funds for strange william booth",
        fee: "0.00",
        total: transferDetails.amount,
        processingTime: "Instant",
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Transfer Receipt - ${receiptData.transactionId}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 20px; 
                background: white;
                color: #333;
              }
              .receipt-container { 
                max-width: 800px; 
                margin: 0 auto; 
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 40px;
              }
              .header { 
                text-align: center; 
                margin-bottom: 40px; 
                border-bottom: 2px solid #c4d626;
                padding-bottom: 20px;
              }
              .logo { 
                font-size: 28px; 
                font-weight: bold; 
                color: #c4d626; 
                margin-bottom: 10px;
              }
              .subtitle { 
                color: #666; 
                font-size: 16px;
              }
              .status-badge {
                background: #dcfce7;
                color: #166534;
                padding: 8px 16px;
                border-radius: 20px;
                display: inline-block;
                font-weight: bold;
                margin: 20px 0;
              }
              .amount-section {
                text-align: center;
                margin: 30px 0;
                padding: 20px;
                background: #f9fafb;
                border-radius: 8px;
              }
              .amount {
                font-size: 48px;
                font-weight: bold;
                color: #111;
                margin: 10px 0;
              }
              .details-grid { 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 30px; 
                margin: 30px 0; 
              }
              .detail-section {
                background: #f9fafb;
                padding: 20px;
                border-radius: 8px;
              }
              .section-title {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 15px;
                color: #111;
              }
              .detail-item { 
                margin-bottom: 15px; 
                padding-bottom: 10px;
                border-bottom: 1px solid #e5e7eb;
              }
              .detail-item:last-child {
                border-bottom: none;
              }
              .label { 
                font-size: 12px; 
                color: #666; 
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 5px;
              }
              .value { 
                font-weight: bold; 
                font-size: 14px;
                color: #111;
              }
              .fee-breakdown {
                background: #f3f4f6;
                padding: 20px;
                border-radius: 8px;
                margin: 30px 0;
              }
              .fee-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
              }
              .fee-total {
                border-top: 2px solid #c4d626;
                padding-top: 10px;
                font-weight: bold;
                font-size: 18px;
              }
              .footer { 
                text-align: center; 
                font-size: 12px; 
                color: #666; 
                margin-top: 40px; 
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
              }
              @media print { 
                body { margin: 0; padding: 10px; } 
                .receipt-container { border: none; box-shadow: none; }
              }
            </style>
          </head>
          <body>
            <div class="receipt-container">
              <div class="header">
                <div class="logo">🏦 Vasawealthearn</div>
                <div class="subtitle">Transfer Receipt - Official Transaction Record</div>
              </div>
              
              <div style="text-align: center;">
                <div class="status-badge">✓ ${receiptData.status}</div>
              </div>

              <div class="amount-section">
                <div style="color: #666; margin-bottom: 10px;">Transfer Amount</div>
                <div class="amount">$${receiptData.amount}</div>
                <div style="color: #666; font-size: 14px;">${receiptData.accountType}</div>
              </div>

              <div class="details-grid">
                <div class="detail-section">
                  <div class="section-title">Transaction Information</div>
                  <div class="detail-item">
                    <div class="label">Transaction ID</div>
                    <div class="value">${receiptData.transactionId}</div>
                  </div>
                  <div class="detail-item">
                    <div class="label">Date & Time</div>
                    <div class="value">${receiptData.date} at ${receiptData.time}</div>
                  </div>
                  <div class="detail-item">
                    <div class="label">Transfer Type</div>
                    <div class="value">${receiptData.transferType}</div>
                  </div>
                  <div class="detail-item">
                    <div class="label">Processing Time</div>
                    <div class="value">${receiptData.processingTime}</div>
                  </div>
                </div>

                <div class="detail-section">
                  <div class="section-title">Account Details</div>
                  <div class="detail-item">
                    <div class="label">From</div>
                    <div class="value">${receiptData.senderName}</div>
                    <div style="font-size: 12px; color: #666;">Account: ${receiptData.senderAccount}</div>
                  </div>
                  <div class="detail-item">
                    <div class="label">To</div>
                    <div class="value">${receiptData.beneficiaryName}</div>
                    <div style="font-size: 12px; color: #666;">Account: ${receiptData.beneficiaryAccount}</div>
                  </div>
                  <div class="detail-item">
                    <div class="label">Bank</div>
                    <div class="value">${receiptData.bankName}</div>
                  </div>
                  <div class="detail-item">
                    <div class="label">Routing Number</div>
                    <div class="value">${receiptData.routingNumber}</div>
                  </div>
                </div>
              </div>

              ${
                receiptData.description
                  ? `
                <div class="detail-section">
                  <div class="section-title">Description</div>
                  <div class="value">${receiptData.description}</div>
                </div>
              `
                  : ""
              }

              <div class="fee-breakdown">
                <div class="section-title">Fee Breakdown</div>
                <div class="fee-row">
                  <span>Transfer Amount</span>
                  <span>$${receiptData.amount}</span>
                </div>
                <div class="fee-row">
                  <span>Processing Fee</span>
                  <span>$${receiptData.fee}</span>
                </div>
                <div class="fee-row fee-total">
                  <span>Total</span>
                  <span>$${receiptData.total}</span>
                </div>
              </div>

              <div class="footer">
                <p>This is an official receipt from Vasawealthearn</p>
                <p>Generated on ${new Date().toLocaleString()}</p>
                <p>For questions about this transaction, contact support at support@vasawealthearn.com</p>
                <p style="margin-top: 20px;">© 2025 Vasawealthearn. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `

      const blob = new Blob([htmlContent], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `transfer-receipt-${receiptData.transactionId}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      window.open(`/dashboard/local-transfer/receipt/${receiptData.transactionId}`, "_blank")
    } catch (error) {
      console.error("Error downloading receipt:", error)
      alert("Error downloading receipt. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  const handleShareReceipt = async () => {
    setIsSharing(true)
    try {
      const shareData = {
        title: `Transfer Receipt - ${transferDetails.transactionId}`,
        text: `Transfer of $${transferDetails.amount} completed successfully to ${transferDetails.beneficiaryName}`,
        url: `${window.location.origin}/dashboard/local-transfer/receipt/${transferDetails.transactionId}`,
      }

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        const shareOptions = [
          {
            name: "Copy Link",
            action: () => {
              navigator.clipboard.writeText(shareData.url)
              alert("Receipt link copied to clipboard!")
            },
          },
          {
            name: "Email",
            action: () => {
              const subject = encodeURIComponent(shareData.title)
              const body = encodeURIComponent(`${shareData.text}\n\nView receipt: ${shareData.url}`)
              window.open(`mailto:?subject=${subject}&body=${body}`)
            },
          },
          {
            name: "SMS",
            action: () => {
              const message = encodeURIComponent(`${shareData.text}\nView receipt: ${shareData.url}`)
              window.open(`sms:?body=${message}`)
            },
          },
        ]

        const choice = prompt(`Choose sharing method:\n1. Copy Link\n2. Email\n3. SMS\n\nEnter number (1-3):`)

        if (choice && shareOptions[Number.parseInt(choice) - 1]) {
          shareOptions[Number.parseInt(choice) - 1].action()
        }
      }
    } catch (error) {
      console.error("Error sharing receipt:", error)
      try {
        await navigator.clipboard.writeText(
          `${window.location.origin}/dashboard/local-transfer/receipt/${transferDetails.transactionId}`,
        )
        alert("Receipt link copied to clipboard!")
      } catch (clipboardError) {
        alert("Unable to share receipt. Please copy the URL manually.")
      }
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
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
              <span>Transfer Complete</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Transfer Successful</h1>
            <p className="text-gray-600">Your money transfer has been completed successfully</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">Transfer Completed!</h2>
              <p className="text-green-700 mb-2">
                Your transfer of <span className="font-bold">{transferDetails.amount}</span> has been processed
                successfully.
              </p>
              <p className="text-green-700 mb-4">
                <span className="font-bold">{transferDetails.beneficiaryName}</span> will receive the payment within{" "}
                <span className="font-bold">3-7 working days</span>.
              </p>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {transferDetails.status}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Transfer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Hash className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Transaction ID</p>
                    <p className="font-semibold text-sm">{transferDetails.transactionId}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Date & Time</p>
                    <p className="font-semibold">
                      {transferDetails.date} at {transferDetails.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Recipient</p>
                    <p className="font-semibold">{transferDetails.beneficiaryName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Bank</p>
                    <p className="font-semibold">{transferDetails.bankName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Hash className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Routing Number</p>
                    <p className="font-semibold">{transferDetails.routingNumber}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Hash className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Account Number</p>
                    <p className="font-semibold">{transferDetails.beneficiaryAccount}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="flex-1 bg-[#c4d626] hover:bg-[#a8c520] text-black font-semibold"
              onClick={handleDownloadReceipt}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  Generating Receipt...
                </div>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download Receipt
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="flex-1 bg-transparent"
              onClick={handleShareReceipt}
              disabled={isSharing}
            >
              {isSharing ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  Sharing...
                </div>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Receipt
                </>
              )}
            </Button>
          </div>

          <div className="flex justify-center">
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
