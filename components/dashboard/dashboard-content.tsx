"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  TrendingUp,
  CreditCard,
  Plus,
  History,
  Info,
  ArrowRight,
  HelpCircle,
  Eye,
  EyeOff,
  BarChart3,
  Clock,
  DollarSign,
  Shield,
  Wallet,
  Coins,
  Home,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function DashboardContent() {
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [userName, setUserName] = useState("User")
  const [accountNumber, setAccountNumber] = useState("")
  const [balance, setBalance] = useState(0.00)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error("Error getting user:", userError)
        setIsLoading(false)
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("first_name, last_name, account_number, balance, account_balance")
        .eq("id", user.id)
        .single()

      if (profileError) {
        console.error("Error loading profile:", profileError)
        // Fallback to user email
        setUserName(user.email?.split("@")[0] || "User")
        setIsLoading(false)
        return
      }

      if (profile) {
        const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
        setUserName(fullName || user.email?.split("@")[0] || "User")
        setAccountNumber(profile.account_number || "")
        setBalance(profile.balance || profile.account_balance || 0.00)
      } else {
        // Fallback to user email
        setUserName(user.email?.split("@")[0] || "User")
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Hero Card with Background */}
      <Card className="relative overflow-hidden bg-gradient-to-r from-[#0c3a30] to-[#1a5a4a] text-white border-0">
        <CardContent className="relative p-4 sm:p-6 lg:p-8">
          {/* User Greeting Section */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm sm:text-base">
                  {userName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </span>
              </div>
              <div>
                <h2 className="text-sm sm:text-lg font-medium">Good Morning</h2>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">{userName}</h1>
              </div>
            </div>
            {/* Eye Icon Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setBalanceVisible(!balanceVisible)}
              className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8"
            >
              {balanceVisible ? (
                <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>
          </div>

          {/* Available Balance Section */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-sm sm:text-lg font-medium mb-2">Available Balance</h3>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              {balanceVisible ? `$${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "••••••"}
            </div>
          </div>


          {/* Action Buttons */}
          <div className="flex space-x-2 w-full sm:w-auto">
            <Link href="/dashboard/transactions" prefetch={true} className="flex-1 sm:flex-initial">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 w-full sm:w-auto text-xs sm:text-sm"
              >
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Transactions</span>
                <span className="sm:hidden">Txns</span>
              </Button>
            </Link>
            <Link href="/dashboard/deposit" prefetch={true} className="flex-1 sm:flex-initial">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 w-full sm:w-auto text-xs sm:text-sm"
              >
                <Wallet className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Top up
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Investment Options */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">What would you like to do today?</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">Choose from our investment options below</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <Link href="/dashboard/save-invest" prefetch={true}>
                <Button
                  variant="outline"
                  className="h-24 sm:h-28 flex-col space-y-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200 w-full"
                >
                  <Coins className="h-6 w-6 sm:h-8 sm:w-8" />
                  <span className="text-sm sm:text-base font-medium">Crypto Investment</span>
                </Button>
              </Link>
              <Link href="/dashboard/real-estate" prefetch={true}>
                <Button
                  variant="outline"
                  className="h-24 sm:h-28 flex-col space-y-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200 w-full"
                >
                  <Home className="h-6 w-6 sm:h-8 sm:w-8" />
                  <span className="text-sm sm:text-base font-medium">Real Estate Investment</span>
                </Button>
              </Link>
              <Link href="/dashboard/stocks" prefetch={true}>
                <Button
                  variant="outline"
                  className="h-24 sm:h-28 flex-col space-y-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 w-full"
                >
                  <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8" />
                  <span className="text-sm sm:text-base font-medium">Stock Investment</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Cards Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Your Cards</span>
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-blue-600">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">No cards yet</h3>
                <p className="text-sm text-gray-600">You haven't applied for any virtual cards yet</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Support Section */}
          <Card className="bg-[#c4d626]">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="h-6 w-6 text-gray-700" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
