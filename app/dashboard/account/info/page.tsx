"use client"

export const dynamic = 'force-dynamic'

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
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function AccountInfoPage() {
  const supabase = createClient()
  const { toast } = useToast()
  const [showAccountNumber, setShowAccountNumber] = useState(false)
  const [showBalance, setShowBalance] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [profileData, setProfileData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    country: "",
    account_number: "",
    balance: 0,
    account_type: "",
    kyc_status: "",
    created_at: "",
    email_verified: false,
  })

  useEffect(() => {
    loadProfileData()
  }, [])

  const loadProfileData = async () => {
    try {
      setIsLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setIsLoading(false)
        return
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (error) {
        console.error("Error loading profile:", error)
        setIsLoading(false)
        return
      }

      if (profile) {
        setProfileData({
          first_name: profile.first_name || "",
          middle_name: profile.middle_name || "",
          last_name: profile.last_name || "",
          email: profile.email || user.email || "",
          phone: profile.phone || "",
          date_of_birth: profile.date_of_birth || "",
          address: profile.address || "",
          city: profile.city || "",
          state: profile.state || "",
          zip_code: profile.zip_code || "",
          country: profile.country || "United States",
          account_number: profile.account_number || "",
          balance: Number(profile.balance) || 0,
          account_type: profile.account_type || "checking",
          kyc_status: profile.kyc_status || "pending",
          created_at: profile.created_at || "",
          email_verified: profile.email_verified || false,
        })
      }
    } catch (error) {
      console.error("Error loading profile data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    })
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    } catch {
      return dateString
    }
  }

  const formatDateOfBirth = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    } catch {
      return dateString
    }
  }

  const getFullName = () => {
    const parts = [profileData.first_name, profileData.middle_name, profileData.last_name].filter(Boolean)
    return parts.length > 0 ? parts.join(" ") : "User"
  }

  const getInitials = () => {
    const first = profileData.first_name?.[0] || ""
    const last = profileData.last_name?.[0] || ""
    return (first + last).toUpperCase() || "U"
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
                    <span className="text-2xl font-bold text-[#0c3a30]">{isLoading ? "..." : getInitials()}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{isLoading ? "Loading..." : getFullName()}</h3>
                    <p className="text-gray-600 capitalize">{profileData.account_type || "checking"} Account Holder</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {profileData.email_verified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {profileData.kyc_status === "pending" && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          KYC Pending
                        </Badge>
                      )}
                      {profileData.kyc_status === "approved" && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          KYC Verified
                        </Badge>
                      )}
                      {profileData.kyc_status === "rejected" && (
                        <Badge variant="secondary" className="bg-red-100 text-red-700">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          KYC Rejected
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Account Number</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-lg font-mono">
                          {isLoading 
                            ? "Loading..." 
                            : showAccountNumber 
                            ? profileData.account_number || "N/A"
                            : profileData.account_number 
                            ? `••••••${profileData.account_number.slice(-4)}`
                            : "N/A"}
                        </span>
                        {profileData.account_number && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => setShowAccountNumber(!showAccountNumber)}>
                              {showAccountNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(profileData.account_number)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Account Type</label>
                      <p className="text-lg font-medium capitalize">{profileData.account_type || "Checking"}</p>
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
                          {isLoading 
                            ? "Loading..." 
                            : showBalance 
                            ? `$${profileData.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : "••••••"}
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => setShowBalance(!showBalance)}>
                          {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Account Opened</label>
                      <p className="text-lg font-medium">{formatDate(profileData.created_at)}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Login</label>
                      <p className="text-lg font-medium">{new Date().toLocaleDateString("en-US", { weekday: "long", hour: "2-digit", minute: "2-digit" })}</p>
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
                      <p className="text-lg font-medium">{isLoading ? "Loading..." : getFullName()}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Email Address</label>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <p className="text-lg font-medium">{isLoading ? "Loading..." : profileData.email || "N/A"}</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone Number</label>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <p className="text-lg font-medium">{isLoading ? "Loading..." : profileData.phone || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <p className="text-lg font-medium">{isLoading ? "Loading..." : formatDateOfBirth(profileData.date_of_birth)}</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Address</label>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <p className="text-lg font-medium">
                          {isLoading 
                            ? "Loading..." 
                            : profileData.address 
                            ? `${profileData.address}${profileData.city ? `, ${profileData.city}` : ""}${profileData.state ? `, ${profileData.state}` : ""}${profileData.zip_code ? ` ${profileData.zip_code}` : ""}`
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Country</label>
                      <p className="text-lg font-medium">{isLoading ? "Loading..." : profileData.country || "N/A"}</p>
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
                  <Badge 
                    variant="secondary" 
                    className={profileData.email_verified ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
                  >
                    {profileData.email_verified ? "Verified" : "Not Verified"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Phone Verification</span>
                  <Badge 
                    variant="secondary" 
                    className={profileData.phone ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}
                  >
                    {profileData.phone ? "Verified" : "Not Set"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">KYC Verification</span>
                  <Link href="/dashboard/kyc-verification">
                    <Badge
                      variant="secondary"
                      className={
                        profileData.kyc_status === "approved"
                          ? "bg-green-100 text-green-700 cursor-pointer hover:bg-green-200"
                          : profileData.kyc_status === "rejected"
                          ? "bg-red-100 text-red-700 cursor-pointer hover:bg-red-200"
                          : "bg-orange-100 text-orange-700 cursor-pointer hover:bg-orange-200"
                      }
                    >
                      {profileData.kyc_status === "approved"
                        ? "Verified"
                        : profileData.kyc_status === "rejected"
                        ? "Rejected"
                        : "Pending"}
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
