"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { BarChart3, Search, Download, TrendingUp, TrendingDown, DollarSign, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminStocksPage() {
  const supabase = createClient()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [investments, setInvestments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalInvested: 0,
    totalUsers: 0,
    activeInvestments: 0,
    totalValue: 0,
    totalProfit: 0,
  })

  useEffect(() => {
    loadInvestments()
  }, [])

  const loadInvestments = async () => {
    try {
      setIsLoading(true)
      const { data: investmentsData, error } = await supabase
        .from("stock_investments")
        .select(`
          *,
          profiles:user_id (
            id,
            first_name,
            last_name,
            email,
            account_number
          )
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading stock investments:", error)
        toast({
          title: "Error",
          description: "Failed to load stock investments.",
          variant: "destructive",
        })
        return
      }

      const transformedInvestments = (investmentsData || []).map((inv: any) => ({
        id: inv.id,
        referenceId: inv.reference_number,
        stockSymbol: inv.stock_symbol,
        stockName: inv.stock_name,
        stockExchange: inv.stock_exchange,
        amountInvested: Number(inv.amount_invested),
        pricePerShare: Number(inv.price_per_share),
        shares: Number(inv.shares),
        currentPrice: inv.current_price ? Number(inv.current_price) : null,
        currentValue: inv.current_value ? Number(inv.current_value) : null,
        profitLoss: inv.profit_loss ? Number(inv.profit_loss) : null,
        profitLossPercentage: inv.profit_loss_percentage ? Number(inv.profit_loss_percentage) : null,
        status: inv.status,
        transactionType: inv.transaction_type,
        description: inv.description,
        dividendYield: inv.dividend_yield ? Number(inv.dividend_yield) : null,
        soldAt: inv.sold_at,
        soldPrice: inv.sold_price ? Number(inv.sold_price) : null,
        soldAmount: inv.sold_amount ? Number(inv.sold_amount) : null,
        created: new Date(inv.created_at).toLocaleString(),
        user: inv.profiles ? {
          name: `${inv.profiles.first_name || ""} ${inv.profiles.last_name || ""}`.trim() || "Unknown",
          email: inv.profiles.email,
          accountNumber: inv.profiles.account_number,
        } : null,
      }))

      setInvestments(transformedInvestments)

      // Calculate stats
      const totalInvested = transformedInvestments.reduce((sum: number, inv: any) => sum + (inv.amountInvested || 0), 0)
      const uniqueUsers = new Set(transformedInvestments.map((inv: any) => inv.user?.email || "unknown")).size
      const activeInvestments = transformedInvestments.filter((inv: any) => inv.status === "active").length
      const totalValue = transformedInvestments
        .filter((inv: any) => inv.status === "active")
        .reduce((sum: number, inv: any) => sum + (inv.currentValue || inv.amountInvested || 0), 0)
      const totalProfit = transformedInvestments
        .filter((inv: any) => inv.profitLoss && inv.profitLoss > 0)
        .reduce((sum: number, inv: any) => sum + (inv.profitLoss || 0), 0)

      setStats({
        totalInvested,
        totalUsers: uniqueUsers,
        activeInvestments,
        totalValue,
        totalProfit,
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredInvestments = investments.filter((investment) => {
    const matchesSearch =
      !searchTerm ||
      investment.stockName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investment.stockSymbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investment.stockExchange?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investment.referenceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investment.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investment.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || investment.status === statusFilter

    return matchesSearch && matchesStatus
  })

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
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md mb-1"
              >
                <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                Dashboard
              </a>
            </div>

            <div className="px-3 mt-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">INVESTMENTS</p>
              <a
                href="/admin/real-estate"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md mb-1"
              >
                <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Real Estate Management
              </a>
              <a
                href="/admin/crypto"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md mb-1"
              >
                <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
                Crypto Management
              </a>
              <a
                href="/admin/stocks"
                className="flex items-center px-3 py-2 text-sm font-medium text-white bg-[#c4d626] rounded-md mb-1"
              >
                <BarChart3 className="w-4 h-4 mr-3" />
                Stock Management
              </a>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <header className="bg-white shadow-sm border-b">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
                  <p className="text-sm text-gray-500">Monitor stock investments and trading activities</p>
                </div>
                <Button className="bg-[#c4d626] text-[#0c3a30] hover:bg-[#a8b821]">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
          </header>

          <main className="p-6">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Invested</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${(stats.totalInvested / 1000).toFixed(0)}K
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Investors</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Investments</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeInvestments}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${(stats.totalValue / 1000).toFixed(0)}K
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Profit</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${(stats.totalProfit / 1000).toFixed(0)}K
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow mb-6 p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search stocks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Investments Table */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Stock Investments</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Exchange
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Investor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Shares
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount Invested
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Profit/Loss
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-8 text-center text-sm text-gray-500">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#c4d626]"></div>
                            <span className="ml-2">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredInvestments.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-8 text-center text-sm text-gray-500">
                          No investments found
                        </td>
                      </tr>
                    ) : (
                      filteredInvestments.map((investment) => (
                        <tr key={investment.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{investment.stockName}</div>
                            <div className="text-xs text-gray-500">{investment.stockSymbol}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{investment.stockExchange || "N/A"}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {investment.user ? (
                              <div>
                                <div className="text-sm font-medium text-gray-900">{investment.user.name}</div>
                                <div className="text-xs text-gray-500">{investment.user.email}</div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">Unknown</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900">
                              {investment.shares.toFixed(4)} shares
                            </div>
                            <div className="text-xs text-gray-500">
                              @ ${investment.pricePerShare.toFixed(2)}/share
                            </div>
                            {investment.currentPrice && (
                              <div className="text-xs text-gray-400">
                                Current: ${investment.currentPrice.toFixed(2)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900">
                              ${investment.amountInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {investment.currentValue ? (
                              <div className="text-sm font-bold text-gray-900">
                                ${investment.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {investment.profitLoss !== null && investment.profitLoss !== undefined ? (
                              <div className={`text-sm font-semibold ${investment.profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {investment.profitLoss >= 0 ? "+" : ""}${investment.profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                {investment.profitLossPercentage !== null && investment.profitLossPercentage !== undefined && (
                                  <div className="text-xs">
                                    ({investment.profitLossPercentage >= 0 ? "+" : ""}{investment.profitLossPercentage.toFixed(2)}%)
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">N/A</span>
                            )}
                            {investment.dividendYield && (
                              <div className="text-xs text-blue-600 mt-1">
                                Div: {investment.dividendYield.toFixed(2)}%
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                investment.status === "active" || investment.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : investment.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {investment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {investment.created}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
