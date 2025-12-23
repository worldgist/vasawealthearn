"use client"

import type React from "react"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Bitcoin, Shield, DollarSign, Copy, CheckCircle, ArrowRight, Upload, X, FileText } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { QRCode } from "@/components/qr-code"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"

interface Crypto {
  id: string
  name: string
  symbol: string
  icon: React.ReactNode
  walletAddress: string
  network: string
  color: string
}

const availableCryptos: Crypto[] = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    icon: <Bitcoin className="h-6 w-6" />,
    walletAddress: "bc1qgvhyrxzcf60lkgn0tea85ff3pvpdps750xggfl",
    network: "Bitcoin Network",
    color: "bg-orange-100 text-orange-700",
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    icon: <div className="w-6 h-6 bg-blue-500 rounded-full" />,
    walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    network: "Ethereum Network",
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: "usdt",
    name: "Tether",
    symbol: "USDT",
    icon: <div className="w-6 h-6 bg-green-500 rounded-full" />,
    walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    network: "ERC-20",
    color: "bg-green-100 text-green-700",
  },
  {
    id: "usdc",
    name: "USD Coin",
    symbol: "USDC",
    icon: <div className="w-6 h-6 bg-indigo-500 rounded-full" />,
    walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    network: "ERC-20",
    color: "bg-indigo-100 text-indigo-700",
  },
]

export default function DepositPage() {
  const [selectedCrypto, setSelectedCrypto] = useState<Crypto | null>(null)
  const [copied, setCopied] = useState(false)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [amount, setAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [thankYouDialogOpen, setThankYouDialogOpen] = useState(false)
  const [depositReferenceId, setDepositReferenceId] = useState("")
  const { toast } = useToast()
  const supabase = createClient()

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Wallet address copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
      toast({
        title: "Error",
        description: "Failed to copy address",
        variant: "destructive",
      })
    }
  }

  const handleReceiptUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
      const maxSize = 10 * 1024 * 1024 // 10MB

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPEG, PNG, WebP, or PDF file.",
          variant: "destructive",
        })
        return
      }

      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB.",
          variant: "destructive",
        })
        return
      }

      setReceiptFile(file)
    }
  }

  const removeReceiptFile = () => {
    setReceiptFile(null)
  }

  const handleSubmitDeposit = async () => {
    if (!receiptFile) {
      toast({
        title: "Receipt Required",
        description: "Please upload your Bitcoin payment receipt",
        variant: "destructive",
      })
      return
    }

    if (!amount || Number.parseFloat(amount) <= 0) {
      toast({
        title: "Amount Required",
        description: "Please enter the deposit amount",
        variant: "destructive",
      })
      return
    }

    const depositAmount = Number.parseFloat(amount)
    if (depositAmount < 10) {
      toast({
        title: "Minimum Amount",
        description: "Minimum deposit amount is $10.00",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      let userId = "user-001"
      let userName = "User"
      let userEmail = "user@example.com"

      if (user) {
        userId = user.id
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, last_name, email")
          .eq("id", user.id)
          .single()

        if (profile) {
          userName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "User"
          userEmail = profile.email || user.email || "user@example.com"
        }
      }

      // Convert file to base64 for storage
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64String = reader.result as string
        const transactionId = `TXN-${Date.now().toString().slice(-8)}`
        const referenceId = `DEP-${Date.now().toString().slice(-6)}`

        // Create transaction record
        const transaction = {
          id: transactionId,
          amount: `$${depositAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          type: "Deposit",
          status: "pending",
          referenceId: referenceId,
          description: `${selectedCrypto?.name || "Crypto"} Deposit`,
          scope: "Incoming",
          created: new Date().toLocaleString(),
          timestamp: Date.now(),
          paymentMethod: selectedCrypto?.name || "Bitcoin",
          network: selectedCrypto?.network || "Bitcoin Network",
          file: receiptFile.name,
          userId: userId,
          userName: userName,
          userEmail: userEmail,
          cryptoType: selectedCrypto?.symbol || "BTC",
          walletAddress: selectedCrypto?.walletAddress || "",
        }

        // Save transaction to localStorage
        const existingTransactions = JSON.parse(localStorage.getItem("transactions") || "[]")
        existingTransactions.unshift(transaction)
        localStorage.setItem("transactions", JSON.stringify(existingTransactions))

        // Save receipt file data
        const depositReceipts = JSON.parse(localStorage.getItem("depositReceipts") || "{}")
        depositReceipts[transactionId] = {
          url: base64String,
          fileName: receiptFile.name,
          fileType: receiptFile.type,
          fileSize: receiptFile.size,
          uploadedAt: new Date().toISOString(),
        }
        depositReceipts[referenceId] = depositReceipts[transactionId]
        localStorage.setItem("depositReceipts", JSON.stringify(depositReceipts))

        setDepositReferenceId(referenceId)
        setThankYouDialogOpen(true)
        setIsSubmitting(false)

        // Reset form
        setReceiptFile(null)
        setAmount("")
      }
      reader.onerror = () => {
        toast({
          title: "Error",
          description: "Error reading file. Please try again.",
          variant: "destructive",
        })
        setIsSubmitting(false)
      }
      reader.readAsDataURL(receiptFile)
    } catch (error) {
      console.error("Error submitting deposit:", error)
      toast({
        title: "Error",
        description: "Failed to submit deposit. Please try again.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  if (selectedCrypto) {
    return (
      <DashboardLayout>
        <div className="space-y-6 pb-20 lg:pb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                <span>Dashboard</span>
                <span>/</span>
                <span>Deposit</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Deposit {selectedCrypto.name}</h1>
              <p className="text-gray-600 mt-1">Send {selectedCrypto.symbol} to the address below</p>
            </div>
            <Button variant="outline" onClick={() => setSelectedCrypto(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${selectedCrypto.color}`}>{selectedCrypto.icon}</div>
                    <span>{selectedCrypto.name} Wallet Address</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* QR Code */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
                      <QRCode value={selectedCrypto.walletAddress} size={256} />
                    </div>
                    <p className="text-sm text-gray-600 text-center">
                      Scan this QR code with your {selectedCrypto.name} wallet to send funds
                    </p>
                  </div>

                  {/* Wallet Address */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Wallet Address</label>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={selectedCrypto.walletAddress}
                        readOnly
                        className="font-mono text-sm bg-gray-50"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(selectedCrypto.walletAddress)}
                        className="flex-shrink-0"
                      >
                        {copied ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">Network: {selectedCrypto.network}</p>
                  </div>

                  {/* Important Notice */}
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Shield className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="space-y-2">
                          <h4 className="font-semibold text-yellow-900">Important Instructions</h4>
                          <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                            <li>Only send {selectedCrypto.symbol} to this address</li>
                            <li>Do not send other cryptocurrencies to this address</li>
                            <li>Double-check the address before sending</li>
                            <li>Deposits typically take 1-3 network confirmations</li>
                            <li>Minimum deposit: $10 USD equivalent</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Deposit Amount */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Deposit Amount (USD) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                        <span className="text-gray-500 text-lg">$</span>
                      </div>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="10"
                        step="0.01"
                        className="pl-8 text-lg h-12 w-full"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Enter the amount you sent in USD equivalent</p>
                  </div>

                  {/* Upload Receipt */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Upload Payment Receipt <span className="text-red-500">*</span>
                    </label>
                    {!receiptFile ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#c4d626] transition-colors relative">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-500">JPEG, PNG, WebP, or PDF (max 10MB)</p>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          onChange={handleReceiptUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">{receiptFile.name}</p>
                            <p className="text-xs text-gray-500">{(receiptFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={removeReceiptFile} className="text-red-500 hover:text-red-700">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">Upload a screenshot or receipt of your Bitcoin payment transaction</p>
                  </div>

                  {/* Submit Button */}
                  <Button
                    className="w-full bg-[#c4d626] hover:bg-[#b8c423] text-black font-semibold h-12"
                    onClick={handleSubmitDeposit}
                    disabled={isSubmitting || !receiptFile || !amount || Number.parseFloat(amount) < 10}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Submit Deposit Request
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-green-600" />
                    Secure Deposit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    All deposits are processed through secure blockchain networks. Your funds are safe and will be
                    credited after network confirmation.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Deposit Limits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Minimum:</span>
                    <span className="text-sm font-semibold">$10.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Maximum:</span>
                    <span className="text-sm font-semibold">$50,000.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Daily Limit:</span>
                    <span className="text-sm font-semibold">$100,000.00</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Processing Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{selectedCrypto.name}:</span>
                      <Badge variant="secondary">1-3 confirmations</Badge>
                    </div>
                    <p className="text-xs text-gray-500">Deposits are credited after network confirmation</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Thank You Dialog */}
        <Dialog open={thankYouDialogOpen} onOpenChange={setThankYouDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <DialogTitle className="text-center text-2xl">Thank You for Your Payment!</DialogTitle>
              <DialogDescription className="text-center text-base">
                Your deposit request has been submitted successfully.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reference ID:</span>
                    <span className="font-mono font-semibold">{depositReferenceId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold">{amount ? `$${Number.parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-semibold">{selectedCrypto?.name || "Bitcoin"}</span>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-1">Please Wait for Approval</h4>
                    <p className="text-sm text-yellow-800">
                      Your deposit is currently pending review. Our admin team will review your payment receipt and approve or reject your deposit. You will receive an email notification once the review is complete.
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-center text-sm text-gray-600">
                <p>You can track the status of your deposit in your transaction history.</p>
              </div>
            </div>
            <DialogFooter className="sm:justify-center">
              <Button
                onClick={() => {
                  setThankYouDialogOpen(false)
                  setSelectedCrypto(null)
                }}
                className="w-full bg-[#c4d626] hover:bg-[#b8c423] text-black"
              >
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-20 lg:pb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
              <span>Dashboard</span>
              <span>/</span>
              <span>Deposit</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Deposit Funds</h1>
            <p className="text-gray-600 mt-1">Select a cryptocurrency to deposit</p>
            <p className="text-sm text-gray-500">Choose your preferred cryptocurrency and get the wallet address</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Cryptocurrency</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Choose a cryptocurrency to deposit funds</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableCryptos.map((crypto) => (
                    <div
                      key={crypto.id}
                      className="p-6 border-2 border-gray-200 rounded-lg cursor-pointer transition-all hover:border-[#c4d626] hover:shadow-md group"
                      onClick={() => setSelectedCrypto(crypto)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-lg ${crypto.color}`}>{crypto.icon}</div>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-[#c4d626] transition-colors" />
                      </div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">{crypto.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">{crypto.symbol}</p>
                      <Badge variant="secondary" className="text-xs">
                        {crypto.network}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-600" />
                  Secure Deposit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  All deposits are processed through secure blockchain networks. Your financial information is never
                  stored on our servers.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Deposit Limits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Minimum:</span>
                  <span className="text-sm font-semibold">$10.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Maximum:</span>
                  <span className="text-sm font-semibold">$50,000.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Daily Limit:</span>
                  <span className="text-sm font-semibold">$100,000.00</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
