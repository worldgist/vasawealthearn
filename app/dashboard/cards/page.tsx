export const dynamic = 'force-dynamic'

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, Shield, Globe, Settings, Zap, Plus } from "lucide-react"
import Link from "next/link"

export default function CardsPage() {
  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
          <span>Dashboard</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">Cards</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Cards</h1>
      </div>

      {/* Sub Navigation */}
      <div className="flex gap-4 sm:gap-6 mb-4 sm:mb-6 border-b border-gray-200 overflow-x-auto">
        <button className="pb-3 px-1 border-b-2 border-[#c4d626] text-[#0c3a30] font-medium text-sm sm:text-base whitespace-nowrap">Virtual Cards</button>
        <Link href="/dashboard/cards/request" className="pb-3 px-1 text-gray-600 hover:text-gray-900 text-sm sm:text-base whitespace-nowrap">
          Apply for Card
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Cards</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <div className="w-12 h-12 bg-[#c4d626] rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-[#0c3a30]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Applications</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Settings className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Card Balance</p>
                <p className="text-3xl font-bold text-gray-900">$0.00</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-lg">$</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Virtual Cards Hero Section */}
      <Card className="mb-8 bg-gradient-to-r from-[#0c3a30] to-[#1a5a4a] text-white">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Virtual Cards Made Easy</h2>
              <p className="text-gray-200 mb-6">
                Create virtual cards for secure online payments, subscription management, and more. Our virtual cards
                offer enhanced security and control over your spending.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-[#c4d626]" />
                  <div>
                    <p className="font-medium">Secure Payments</p>
                    <p className="text-sm text-gray-300">Protect your main account with separate virtual cards</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-[#c4d626]" />
                  <div>
                    <p className="font-medium">Global Acceptance</p>
                    <p className="text-sm text-gray-300">Use anywhere major cards are accepted online</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-[#c4d626]" />
                  <div>
                    <p className="font-medium">Spending Controls</p>
                    <p className="text-sm text-gray-300">Set limits and monitor transactions in real-time</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-[#c4d626]" />
                  <div>
                    <p className="font-medium">Instant Issuance</p>
                    <p className="text-sm text-gray-300">Create and use cards within minutes</p>
                  </div>
                </div>
              </div>

              <Link href="/dashboard/cards/request">
                <Button className="bg-[#c4d626] text-[#0c3a30] hover:bg-[#b8c423] font-semibold">Apply Now</Button>
              </Link>
            </div>

            <div className="flex justify-center">
              <div className="relative">
                {/* Sample Virtual Card */}
                <div className="w-80 h-48 bg-gradient-to-br from-[#c4d626] to-[#a8b01f] rounded-2xl p-6 text-[#0c3a30] shadow-2xl">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <p className="text-sm font-medium opacity-80">Virtual Card</p>
                    </div>
                    <div className="w-8 h-8 bg-[#0c3a30] rounded-full opacity-20"></div>
                  </div>

                  <div className="mb-6">
                    <p className="text-xl font-mono tracking-wider">•••• •••• •••• 1234</p>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs opacity-60">VALID THRU</p>
                      <p className="text-sm font-medium">12/25</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs opacity-60">CARDHOLDER</p>
                      <p className="text-sm font-medium">JOHN WILLIAMS</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Your Cards Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold">Your Cards</CardTitle>
          <Link href="/dashboard/cards/request">
            <Button
              variant="outline"
              className="border-[#c4d626] text-[#0c3a30] hover:bg-[#c4d626] hover:text-[#0c3a30] bg-transparent"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Card
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {/* Empty State */}
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No cards yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You haven't applied for any virtual cards yet. Apply for a new card to get started with secure online
              payments.
            </p>
            <Link href="/dashboard/cards/request">
              <Button className="bg-[#c4d626] text-[#0c3a30] hover:bg-[#b8c423]">Apply for Card</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
