"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Users, DollarSign, Clock, AlertTriangle, TrendingUp, CreditCard, FileText } from "lucide-react"

export default function AdminDashboardPage() {
  const supabase = createClient()
  const [stats, setStats] = useState({
    totalUsers: 0,
    dailyTransactions: 0,
    pendingApprovals: 0,
    flaggedActivities: 0,
  })
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [systemAlerts, setSystemAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Load total users
      const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })

      // Load today's transactions
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { data: todayTransactions } = await supabase
        .from("transactions")
        .select("amount")
        .gte("created_at", today.toISOString())
        .eq("status", "completed")

      const dailyTotal = todayTransactions?.reduce((sum, tx) => sum + parseFloat(tx.amount || "0"), 0) || 0

      // Load pending approvals (deposits, loans, cards, KYC)
      const [depositsResult, loansResult, cardsResult, kycResult] = await Promise.all([
        supabase.from("deposits").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("loans").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("cards").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("kyc_submissions").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ])

      const pendingCount =
        (depositsResult.count || 0) +
        (loansResult.count || 0) +
        (cardsResult.count || 0) +
        (kycResult.count || 0)

      // Load recent transactions for activities
      const { data: recentTransactions } = await supabase
        .from("transactions")
        .select(
          `
          *,
          profiles:user_id (
            first_name,
            last_name
          )
        `
        )
        .order("created_at", { ascending: false })
        .limit(5)

      const activities = (recentTransactions || []).map((tx: any) => ({
        id: tx.id,
        userName: tx.profiles
          ? `${tx.profiles.first_name || ""} ${tx.profiles.last_name || ""}`.trim() || "Unknown User"
          : "Unknown User",
        action: tx.description || `${tx.transaction_type} - $${parseFloat(tx.amount || "0").toLocaleString()}`,
        time: new Date(tx.created_at).toLocaleString(),
        timestamp: new Date(tx.created_at).getTime(),
      }))

      // Load system alerts (high value transactions, pending KYC, etc.)
      const { data: highValueTransactions } = await supabase
        .from("transactions")
        .select("*")
        .gte("amount", 50000)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5)

      const alerts = (highValueTransactions || []).map((tx: any) => ({
        id: tx.id,
        type: "high_value",
        title: "High Value Transfer Alert",
        message: `Transfer of $${parseFloat(tx.amount || "0").toLocaleString()} requires manual review`,
        time: new Date(tx.created_at).toLocaleString(),
        timestamp: new Date(tx.created_at).getTime(),
      }))

      // Add KYC pending alert if any
      if (kycResult.count && kycResult.count > 0) {
        alerts.push({
          id: "kyc-alert",
          type: "kyc",
          title: "KYC Verification Pending",
          message: `${kycResult.count} user(s) awaiting document verification`,
          time: "Recently",
          timestamp: Date.now(),
        })
      }

      setStats({
        totalUsers: userCount || 0,
        dailyTransactions: dailyTotal,
        pendingApprovals: pendingCount,
        flaggedActivities: alerts.length,
      })
      setRecentActivities(activities)
      setSystemAlerts(alerts)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`
    }
    return `$${amount.toLocaleString()}`
  }

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes} min ago`
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`
    return `${days} day${days > 1 ? "s" : ""} ago`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Admin Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#c4d626] rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-[#0c3a30]">AD</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Admin Portal</h3>
                <p className="text-sm text-gray-500">System Administrator</p>
              </div>
            </div>
          </div>

          <nav className="mt-6">
            <div className="px-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">OVERVIEW</p>
              <a
                href="/admin/dashboard"
                className="flex items-center px-3 py-2 text-sm font-medium text-white bg-[#c4d626] rounded-md mb-1"
              >
                <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                Dashboard
              </a>
            </div>

            <div className="px-3 mt-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">USER MANAGEMENT</p>
              <a
                href="/admin/users"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md mb-1"
              >
                <Users className="w-4 h-4 mr-3" />
                All Users
              </a>
              <a
                href="/admin/kyc"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md mb-1"
              >
                <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                KYC Verification
              </a>
            </div>

            <div className="px-3 mt-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">TRANSACTIONS</p>
              <a
                href="/admin/deposits"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md mb-1"
              >
                <DollarSign className="w-4 h-4 mr-3" />
                Deposit Management
              </a>
              <a
                href="/admin/withdrawals"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md mb-1"
              >
                <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Withdrawal Management
              </a>
            </div>

            <div className="px-3 mt-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">SERVICES</p>
              <a
                href="/admin/loans"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md mb-1"
              >
                <FileText className="w-4 h-4 mr-3" />
                Loan Management
              </a>
              <a
                href="/admin/cards"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md mb-1"
              >
                <CreditCard className="w-4 h-4 mr-3" />
                Card Management
              </a>
            </div>

            <div className="px-3 mt-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">SYSTEM</p>
              <a
                href="/admin/settings"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md mb-1"
              >
                <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                </svg>
                System Settings
              </a>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Admin Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-500">System overview and management controls</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-[#0c3a30] rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">AD</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Administrator</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="p-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Users</p>
                    {loading ? (
                      <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Daily Transactions</p>
                    {loading ? (
                      <div className="h-8 w-20 bg-gray-200 animate-pulse rounded mt-1"></div>
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.dailyTransactions)}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
                    {loading ? (
                      <div className="h-8 w-12 bg-gray-200 animate-pulse rounded mt-1"></div>
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">System Alerts</p>
                    {loading ? (
                      <div className="h-8 w-12 bg-gray-200 animate-pulse rounded mt-1"></div>
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">{stats.flaggedActivities}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Recent User Activities</h3>
                </div>
                <div className="p-6">
                  {loading ? (
                  <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-gray-200 animate-pulse rounded"></div>
                      ))}
                    </div>
                  ) : recentActivities.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No recent activities</p>
                  ) : (
                    <div className="space-y-4">
                      {recentActivities.map((activity) => {
                        const initials = activity.userName
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                        return (
                          <div key={activity.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-[#c4d626] rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-[#0c3a30]">{initials}</span>
                        </div>
                        <div>
                                <p className="text-sm font-medium text-gray-900">{activity.userName}</p>
                                <p className="text-xs text-gray-500">{activity.action}</p>
                        </div>
                      </div>
                            <span className="text-xs text-gray-400">{getTimeAgo(activity.timestamp)}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
                </div>
                <div className="p-6">
                  {loading ? (
                  <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="h-20 bg-gray-200 animate-pulse rounded"></div>
                      ))}
                    </div>
                  ) : systemAlerts.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No system alerts</p>
                  ) : (
                    <div className="space-y-4">
                      {systemAlerts.map((alert) => (
                        <div key={alert.id} className="flex items-start space-x-3">
                          <div
                            className={`w-2 h-2 rounded-full mt-2 ${
                              alert.type === "high_value" ? "bg-red-500" : "bg-yellow-500"
                            }`}
                          ></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                            <p className="text-xs text-gray-500">{alert.message}</p>
                            <span className="text-xs text-gray-400">{getTimeAgo(alert.timestamp)}</span>
                          </div>
                      </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
