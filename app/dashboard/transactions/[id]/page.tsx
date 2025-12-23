"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Copy, Check, CreditCard, FileText, Clock } from "lucide-react"

export default function TransactionDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [transaction, setTransaction] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const savedTransactions = JSON.parse(localStorage.getItem("transactions") || "[]")
    const foundTransaction = savedTransactions.find((t: any) => t.id === params.id)
    setTransaction(foundTransaction)
  }, [params.id])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!transaction) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Transaction not found</h2>
            <p className="text-gray-600 mb-4">The transaction you're looking for doesn't exist.</p>
            <Button onClick={() => router.push("/dashboard/transactions")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Transactions
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push("/dashboard/transactions")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Transactions
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Transaction Details</h1>
              <p className="text-gray-600">View complete information about this transaction</p>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Transaction Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transaction Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Transaction Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Amount</label>
                    <p className="text-2xl font-bold text-gray-900">{transaction.amount}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">
                      <Badge
                        variant={
                          transaction.status === "completed"
                            ? "default"
                            : transaction.status === "pending"
                              ? "secondary"
                              : "destructive"
                        }
                        className={
                          transaction.status === "completed"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : transaction.status === "pending"
                              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                              : "bg-red-100 text-red-800 hover:bg-red-100"
                        }
                      >
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Type</label>
                    <p className="text-lg font-medium text-gray-900 capitalize">{transaction.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date & Time</label>
                    <p className="text-lg font-medium text-gray-900">{transaction.created}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Transaction Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-gray-900">{transaction.description}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Reference ID</label>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{transaction.referenceId}</code>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(transaction.referenceId)}>
                        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Scope</label>
                    <p className="text-gray-900">{transaction.scope}</p>
                  </div>
                  {transaction.paymentMethod && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Payment Method</label>
                      <p className="text-gray-900">{transaction.paymentMethod}</p>
                    </div>
                  )}
                  {transaction.network && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Network</label>
                      <p className="text-gray-900">{transaction.network}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Proof */}
            {transaction.paymentProof && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Proof</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{transaction.paymentProof.name}</p>
                        <p className="text-sm text-gray-500">
                          {(transaction.paymentProof.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="ml-auto bg-transparent">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-transparent" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Receipt
                </Button>
                <Button className="w-full bg-transparent" variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Reference ID
                </Button>
                {transaction.status === "pending" && (
                  <Button className="w-full bg-transparent" variant="outline">
                    <Clock className="h-4 w-4 mr-2" />
                    Check Status
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Transaction Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-900">Transaction Initiated</p>
                      <p className="text-sm text-gray-500">{transaction.created}</p>
                    </div>
                  </div>
                  {transaction.status === "completed" && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-gray-900">Payment Confirmed</p>
                        <p className="text-sm text-gray-500">{transaction.created}</p>
                      </div>
                    </div>
                  )}
                  {transaction.status === "pending" && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-gray-900">Awaiting Confirmation</p>
                        <p className="text-sm text-gray-500">Processing...</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  If you have questions about this transaction, our support team is here to help.
                </p>
                <Button variant="outline" className="w-full bg-transparent">
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
