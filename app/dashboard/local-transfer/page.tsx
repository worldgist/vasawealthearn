"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Shield, DollarSign, CreditCard } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function LocalTransferPage() {
  const [transferAmount, setTransferAmount] = useState("0.00")
  const [selectedAmount, setSelectedAmount] = useState("")
  const [accountType, setAccountType] = useState("")

  const quickAmounts = [
    { label: "$100", value: "100.00" },
    { label: "$500", value: "500.00" },
    { label: "$1000", value: "1000.00" },
    { label: "All", value: "102864.00" },
  ]

  const handleQuickAmount = (amount: string) => {
    setTransferAmount(amount)
    setSelectedAmount(amount)
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
              <Link href="/dashboard" className="hover:text-[#c4d626]">
                Dashboard
              </Link>
              <span>/</span>
              <span>Local Transfer</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Local Bank Transfer</h1>
            <p className="text-sm sm:text-base text-gray-600">Send money to any local bank account securely</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Transfer Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Available Balance */}
            <Card className="bg-gradient-to-r from-[#c4d626] to-[#a8c520] text-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 bg-white/20 rounded-lg flex-shrink-0">
                    <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm opacity-90">Available Balance</p>
                    <p className="text-2xl sm:text-3xl font-bold">$102,864.00</p>
                    <p className="text-xs sm:text-sm opacity-90">Available</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Account Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={accountType === "checking" ? "default" : "outline"}
                    onClick={() => setAccountType("checking")}
                    className={`h-20 flex flex-col items-center justify-center gap-2 ${
                      accountType === "checking" ? "bg-[#c4d626] hover:bg-[#a8c520] text-black" : ""
                    }`}
                  >
                    <CreditCard className="h-6 w-6" />
                    <span className="font-semibold">Checking Account</span>
                    <span className="text-xs opacity-75">Perfect for daily transactions</span>
                  </Button>
                  <Button
                    variant={accountType === "savings" ? "default" : "outline"}
                    onClick={() => setAccountType("savings")}
                    className={`h-20 flex flex-col items-center justify-center gap-2 ${
                      accountType === "savings" ? "bg-[#c4d626] hover:bg-[#a8c520] text-black" : ""
                    }`}
                  >
                    <DollarSign className="h-6 w-6" />
                    <span className="font-semibold">Savings Account</span>
                    <span className="text-xs opacity-75">Earn interest on deposits</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Transfer Amount */}
            <Card>
              <CardHeader>
                <CardTitle>Transfer Amount</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                  <Input
                    type="text"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="pl-8 text-lg h-12 text-center"
                    placeholder="0.00"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {quickAmounts.map((amount) => (
                    <Button
                      key={amount.value}
                      variant={selectedAmount === amount.value ? "default" : "outline"}
                      onClick={() => handleQuickAmount(amount.value)}
                      className={selectedAmount === amount.value ? "bg-[#c4d626] hover:bg-[#a8c520]" : ""}
                    >
                      {amount.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Beneficiary Details */}
            <Card>
              <CardHeader>
                <CardTitle>Beneficiary Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="beneficiary-name">Beneficiary Account Name</Label>
                  <Input id="beneficiary-name" defaultValue="wbooth1945@gmail.com" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="routing-number">Routing Number</Label>
                  <Input
                    id="routing-number"
                    placeholder="Enter 9-digit routing number (e.g., 123456789)"
                    className="mt-1"
                    maxLength={9}
                    pattern="[0-9]{9}"
                  />
                  <p className="text-xs text-gray-500 mt-1">9-digit number that identifies the bank</p>
                </div>
                <div>
                  <Label htmlFor="account-number">Beneficiary Account Number</Label>
                  <Input id="account-number" placeholder="Enter account number" className="mt-1" maxLength={17} />
                  <p className="text-xs text-gray-500 mt-1">The recipient's bank account number</p>
                </div>
                <div>
                  <Label htmlFor="bank-name">Bank Name</Label>
                  <Input id="bank-name" placeholder="Enter bank name" className="mt-1" />
                </div>
              </CardContent>
            </Card>

            {/* Transfer Type */}
            <Card>
              <CardHeader>
                <CardTitle>Transfer Type</CardTitle>
              </CardHeader>
              <CardContent>
                <Select defaultValue="online-banking">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online-banking">Online Banking</SelectItem>
                    <SelectItem value="wire-transfer">Wire Transfer</SelectItem>
                    <SelectItem value="ach-transfer">ACH Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="description">Description/Memo</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter transaction description or purpose of payment"
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Transaction PIN */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction PIN</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Input type="password" placeholder="••••••••••" className="mb-2" />
                  <p className="text-sm text-gray-600">This is your transaction PIN, not your login password</p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1 bg-[#c4d626] hover:bg-[#a8c520] text-black font-semibold"
                disabled={!accountType}
                asChild={accountType ? true : false}
              >
                {accountType ? (
                  <Link href="/dashboard/local-transfer/preview">Preview Transfer</Link>
                ) : (
                  <span>Preview Transfer</span>
                )}
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/dashboard" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>

          {/* Security Information Sidebar */}
          <div className="space-y-6">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800 mb-2">Secure Transaction</h3>
                    <p className="text-sm text-green-700">
                      All transfers are encrypted and processed securely. Your financial information is never stored on
                      our servers.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transfer Limits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Transfer Limits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Daily Limit</span>
                  <span className="font-semibold">$50,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Monthly Limit</span>
                  <span className="font-semibold">$500,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Used Today</span>
                  <span className="font-semibold">$0.00</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Transfers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Transfers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No recent transfers</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
