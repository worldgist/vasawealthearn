"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  CreditCard,
  DollarSign,
  Clock,
  Copy,
  Edit,
  Download,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { useState } from "react"

export default function AccountInfoPage() {
  const [showAccountNumber, setShowAccountNumber] = useState(false)
  const [showBalance, setShowBalance] = useState(true)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <DashboardLayout activeItem="Account Info">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Account Information</h1>
            <p className="text-gray-600">View and manage your account details</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Details
            </Button>
            <Link href="/dashboard/account/settings">
              <Button size="sm" className="bg-[#c4d626] hover:bg-[#b8c423] text-black">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Account Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Account Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-[#c4d626] rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#0c3a30]">SB</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">Strange William Booth</h3>
                    <p className="text-gray-600">Premium Account Holder</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        KYC Pending
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Account Number</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-lg font-mono">{showAccountNumber ? "9846850999" : "••••••0999"}</span>
                        <Button variant="ghost" size="sm" onClick={() => setShowAccountNumber(!showAccountNumber)}>
                          {showAccountNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard("9846850999")}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Account Type</label>
                      <p className="text-lg font-medium">Premium Checking</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Account Status</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-lg font-medium text-green-600">Active</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Available Balance</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-2xl font-bold text-gray-900">
                          {showBalance ? "$102,864.00" : "••••••"}
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => setShowBalance(!showBalance)}>
                          {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Account Opened</label>
                      <p className="text-lg font-medium">August 12, 2025</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Login</label>
                      <p className="text-lg font-medium">Today, 10:51 AM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <p className="text-lg font-medium">Strange William Booth</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Email Address</label>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <p className="text-lg font-medium">wbooth1945@gmail.com</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone Number</label>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <p className="text-lg font-medium">+18176881062</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <p className="text-lg font-medium">April 24, 1945</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Address</label>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <p className="text-lg font-medium">4619 Westlake Drive, Fort Worth, TX 76132</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Country</label>
                      <p className="text-lg font-medium">United States</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Limits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Account Limits</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-600">Daily Transfer Limit</div>
                  <div className="text-xl font-bold text-gray-900">$50,000</div>
                  <div className="text-xs text-gray-500">Used: $0 (0%)</div>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-600">Monthly Limit</div>
                  <div className="text-xl font-bold text-gray-900">$500,000</div>
                  <div className="text-xs text-gray-500">Used: $0 (0%)</div>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-600">ATM Withdrawal</div>
                  <div className="text-xl font-bold text-gray-900">$5,000</div>
                  <div className="text-xs text-gray-500">Per day</div>
                </div>
              </CardContent>
            </Card>

            {/* Security Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Two-Factor Authentication</span>
                  <Badge variant="secondary" className="bg-red-100 text-red-700">
                    Disabled
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Verification</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Verified
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Phone Verification</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Verified
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">KYC Verification</span>
                  <Link href="/dashboard/kyc-verification">
                    <Badge
                      variant="secondary"
                      className="bg-orange-100 text-orange-700 cursor-pointer hover:bg-orange-200"
                    >
                      Pending
                    </Badge>
                  </Link>
                </div>

                <Button variant="outline" size="sm" className="w-full mt-4 bg-transparent" asChild>
                  <Link href="/dashboard/kyc-verification">
                    <Shield className="h-4 w-4 mr-2" />
                    Enhance Security
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/dashboard/cards/request">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Request New Card
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Download Statement
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/dashboard/transactions">
                    <Clock className="h-4 w-4 mr-2" />
                    Transaction History
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
