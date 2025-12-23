"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { Coins, TrendingUp, TrendingDown, DollarSign, Users, Search, Download, Edit, Image as ImageIcon, Save, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Cryptocurrency {
  id: string
  name: string
  symbol: string
  price: number
  change24h: number
  volume: number
  image?: string
  icon?: string
  color?: string
}

export default function AdminCryptoPage() {
  const supabase = createClient()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [cryptoTransactions, setCryptoTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cryptoStats, setCryptoStats] = useState({
    totalVolume: 0,
    totalUsers: 0,
    activeTrades: 0,
    totalHoldings: 0,
    totalEarned: 0,
  })
  const [cryptocurrencies, setCryptocurrencies] = useState<Cryptocurrency[]>([
    { id: "bitcoin", name: "Bitcoin", symbol: "BTC", price: 43250.50, change24h: 2.45, volume: 1250000, icon: "₿", color: "bg-orange-500" },
    { id: "ethereum", name: "Ethereum", symbol: "ETH", price: 2650.75, change24h: 1.85, volume: 850000, icon: "Ξ", color: "bg-blue-500" },
    { id: "tron", name: "Tron", symbol: "TRX", price: 0.105, change24h: -0.65, volume: 320000, icon: "T", color: "bg-red-500" },
    { id: "solana", name: "Solana", symbol: "SOL", price: 98.25, change24h: 3.20, volume: 680000, icon: "◎", color: "bg-purple-500" },
    { id: "gala", name: "Gala", symbol: "GALA", price: 0.042, change24h: 5.15, volume: 150000, icon: "G", color: "bg-green-500" },
    { id: "doge", name: "Dogecoin", symbol: "DOGE", price: 0.085, change24h: -1.25, volume: 280000, icon: "Ð", color: "bg-yellow-500" },
    { id: "ripple", name: "Ripple", symbol: "XRP", price: 0.625, change24h: 0.95, volume: 420000, icon: "✕", color: "bg-gray-500" },
    { id: "usdt", name: "Tether", symbol: "USDT", price: 1.00, change24h: 0.01, volume: 2100000, icon: "$", color: "bg-green-600" },
    { id: "usdc", name: "USD Coin", symbol: "USDC", price: 1.00, change24h: 0.01, volume: 1800000, icon: "$", color: "bg-blue-600" },
  ])
  const [editingCrypto, setEditingCrypto] = useState<Cryptocurrency | null>(null)
  const [editPrice, setEditPrice] = useState("")
  const [editLogo, setEditLogo] = useState("")
  const [editChange24h, setEditChange24h] = useState("")
  const [totalEarned, setTotalEarned] = useState("")

  useEffect(() => {
    loadCryptoData()
  }, [])

  const loadCryptoData = async () => {
    try {
      setIsLoading(true)
      
      // Load crypto investments from database
      const { data: investments, error: investmentsError } = await supabase
        .from("crypto_investments")
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

      if (investmentsError) {
        console.error("Error loading crypto investments:", investmentsError)
        toast({
          title: "Error",
          description: "Failed to load crypto investments.",
          variant: "destructive",
        })
      } else {
        // Transform investments to transaction format
        const transformedTransactions = (investments || []).map((inv: any) => ({
          id: inv.id,
          referenceId: inv.reference_number,
          type: inv.transaction_type === "buy" ? "Buy" : "Sell",
          cryptocurrency: inv.cryptocurrency_name,
          symbol: inv.cryptocurrency_symbol,
          amount: `$${Number(inv.amount_invested).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          amountValue: Number(inv.amount_invested),
          quantity: Number(inv.quantity),
          price: Number(inv.price_per_unit),
          currentPrice: inv.current_price ? Number(inv.current_price) : null,
          currentValue: inv.current_value ? Number(inv.current_value) : null,
          profitLoss: inv.profit_loss ? Number(inv.profit_loss) : null,
          profitLossPercentage: inv.profit_loss_percentage ? Number(inv.profit_loss_percentage) : null,
          status: inv.status,
          created: new Date(inv.created_at).toLocaleString(),
          user: inv.profiles ? {
            name: `${inv.profiles.first_name || ""} ${inv.profiles.last_name || ""}`.trim() || "Unknown",
            email: inv.profiles.email,
            accountNumber: inv.profiles.account_number,
          } : null,
        }))

        setCryptoTransactions(transformedTransactions)

        // Calculate stats from real data
        const totalVolume = transformedTransactions.reduce((sum: number, tx: any) => sum + (tx.amountValue || 0), 0)
        const uniqueUsers = new Set(transformedTransactions.map((tx: any) => tx.user?.email || "unknown")).size
        const activeTrades = transformedTransactions.filter((tx: any) => tx.status === "active").length
        const totalHoldings = transformedTransactions
          .filter((tx: any) => tx.status === "active")
          .reduce((sum: number, tx: any) => sum + (tx.currentValue || tx.amountValue || 0), 0)
        const totalEarned = transformedTransactions
          .filter((tx: any) => tx.profitLoss && tx.profitLoss > 0)
          .reduce((sum: number, tx: any) => sum + (tx.profitLoss || 0), 0)

        setCryptoStats({
          totalVolume,
          totalUsers: uniqueUsers,
          activeTrades,
          totalHoldings,
          totalEarned,
        })
        setTotalEarned(totalEarned.toString())
      }

      // Load saved crypto price data from localStorage (for display purposes)
    const savedCryptoData = localStorage.getItem("adminCryptoData")
    if (savedCryptoData) {
      try {
        const data = JSON.parse(savedCryptoData)
        if (data.cryptocurrencies) {
          setCryptocurrencies(data.cryptocurrencies)
        }
      } catch (error) {
        console.error("Error loading saved crypto data:", error)
      }
    }
    } catch (error) {
      console.error("Error loading crypto data:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditCrypto = (crypto: Cryptocurrency) => {
    setEditingCrypto(crypto)
    setEditPrice(crypto.price.toString())
    setEditLogo(crypto.image || "")
    setEditChange24h(crypto.change24h.toString())
  }

  const handleSaveCrypto = () => {
    if (!editingCrypto) return

    const updatedCryptos = cryptocurrencies.map((crypto) => {
      if (crypto.id === editingCrypto.id) {
        return {
          ...crypto,
          price: parseFloat(editPrice) || crypto.price,
          change24h: parseFloat(editChange24h) || crypto.change24h,
          image: editLogo || crypto.image,
        }
      }
      return crypto
    })

    setCryptocurrencies(updatedCryptos)
    
    // Save to localStorage
    const savedData = localStorage.getItem("adminCryptoData")
    const data = savedData ? JSON.parse(savedData) : {}
    data.cryptocurrencies = updatedCryptos
    localStorage.setItem("adminCryptoData", JSON.stringify(data))

    setEditingCrypto(null)
    setEditPrice("")
    setEditLogo("")
    setEditChange24h("")
  }

  const handleSaveTotalEarned = () => {
    const earned = parseFloat(totalEarned) || 0
    setCryptoStats(prev => ({ ...prev, totalEarned: earned }))
    
    // Save to localStorage
    const savedData = localStorage.getItem("adminCryptoData")
    const data = savedData ? JSON.parse(savedData) : {}
    data.totalEarned = earned
    localStorage.setItem("adminCryptoData", JSON.stringify(data))
  }

  // Update totalEarned when cryptoStats changes
  useEffect(() => {
    if (cryptoStats.totalEarned > 0 && totalEarned === "") {
      setTotalEarned(cryptoStats.totalEarned.toString())
    }
  }, [cryptoStats.totalEarned])

  const filteredTransactions = cryptoTransactions.filter((transaction) => {
    const matchesSearch =
      !searchTerm ||
      transaction.cryptocurrency?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.referenceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.amount?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter

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
                className="flex items-center px-3 py-2 text-sm font-medium text-white bg-[#c4d626] rounded-md mb-1"
              >
                <Coins className="w-4 h-4 mr-3" />
                Crypto Management
              </a>
            </div>

            <div className="px-3 mt-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">USER MANAGEMENT</p>
              <a
                href="/admin/users"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md mb-1"
              >
                <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                All Users
              </a>
            </div>

            <div className="px-3 mt-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">TRANSACTIONS</p>
              <a
                href="/admin/transactions"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md mb-1"
              >
                <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                All Transactions
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
          <header className="bg-white shadow-sm border-b">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Crypto Management</h1>
                  <p className="text-sm text-gray-500">Monitor cryptocurrency investments and trading activities</p>
                </div>
                <button className="bg-[#c4d626] text-[#0c3a30] px-4 py-2 rounded-md font-medium hover:bg-[#a8b821] transition-colors">
                  <Download className="w-4 h-4 inline mr-2" />
                  Export Report
                </button>
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
                    <p className="text-sm font-medium text-gray-500">Total Trading Volume</p>
                    <p className="text-2xl font-bold text-gray-900">${(cryptoStats.totalVolume / 1000).toFixed(0)}K</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Traders</p>
                    <p className="text-2xl font-bold text-gray-900">{cryptoStats.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Coins className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Trades</p>
                    <p className="text-2xl font-bold text-gray-900">{cryptoStats.activeTrades}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Holdings</p>
                    <p className="text-2xl font-bold text-gray-900">{cryptoStats.totalHoldings.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Earned</p>
                      <p className="text-2xl font-bold text-gray-900">${cryptoStats.totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const newValue = prompt("Enter total earned amount:", cryptoStats.totalEarned.toString())
                      if (newValue !== null && newValue !== "") {
                        setTotalEarned(newValue)
                        const earned = parseFloat(newValue) || 0
                        setCryptoStats(prev => ({ ...prev, totalEarned: earned }))
                        const savedData = localStorage.getItem("adminCryptoData")
                        const data = savedData ? JSON.parse(savedData) : {}
                        data.totalEarned = earned
                        localStorage.setItem("adminCryptoData", JSON.stringify(data))
                      }
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Edit Total Earned"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Cryptocurrencies List */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Supported Cryptocurrencies</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Logo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cryptocurrency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Symbol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        24h Change
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trading Volume
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cryptocurrencies.map((crypto) => {
                      const isPositive = crypto.change24h >= 0
                      return (
                        <tr key={crypto.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`w-10 h-10 ${crypto.color || "bg-gray-500"} rounded-full flex items-center justify-center overflow-hidden`}>
                              {crypto.image ? (
                                <img 
                                  src={crypto.image} 
                                  alt={crypto.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.style.display = "none"
                                    const parent = target.parentElement
                                    if (parent && crypto.icon) {
                                      const iconSpan = document.createElement("span")
                                      iconSpan.className = "font-bold text-white text-lg"
                                      iconSpan.textContent = crypto.icon
                                      parent.appendChild(iconSpan)
                                    }
                                  }}
                                />
                              ) : (
                                <span className="font-bold text-white text-lg">{crypto.icon || crypto.symbol[0]}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{crypto.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {crypto.symbol}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            ${crypto.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {isPositive ? (
                                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                              ) : (
                                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                              )}
                              <span className={`text-sm font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                                {isPositive ? "+" : ""}{crypto.change24h.toFixed(2)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${(crypto.volume / 1000).toFixed(0)}K
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              onClick={() => handleEditCrypto(crypto)}
                              className="text-[#c4d626] hover:text-[#a8b821] flex items-center gap-1"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Trading Activities */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Trading Activities</h3>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Search trades..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#c4d626]"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#c4d626]"
                    >
                      <option value="all">All Status</option>
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cryptocurrency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#c4d626]"></div>
                            <span className="ml-2">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                          No trading activities found
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono text-gray-900">{transaction.referenceId || transaction.id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              transaction.type === "Buy" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}>
                              {transaction.type || "Crypto Trade"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.cryptocurrency || transaction.symbol || "Crypto"}
                            </div>
                            {transaction.quantity && (
                              <div className="text-xs text-gray-500">
                                {transaction.quantity.toFixed(8)} {transaction.symbol}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900">{transaction.amount}</div>
                            {transaction.currentValue && (
                              <div className="text-xs text-gray-500">
                                Current: ${transaction.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.created}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                transaction.status === "active" || transaction.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : transaction.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {transaction.status}
                            </span>
                            {transaction.profitLoss !== null && transaction.profitLoss !== undefined && (
                              <div className={`text-xs mt-1 ${transaction.profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {transaction.profitLoss >= 0 ? "+" : ""}${transaction.profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                {transaction.profitLossPercentage !== null && transaction.profitLossPercentage !== undefined && (
                                  <span> ({transaction.profitLossPercentage >= 0 ? "+" : ""}{transaction.profitLossPercentage.toFixed(2)}%)</span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {transaction.user && (
                              <div className="text-xs text-gray-500 mb-1">
                                {transaction.user.name}
                              </div>
                            )}
                            <button className="text-blue-600 hover:text-blue-900">View Details</button>
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

      {/* Edit Crypto Dialog */}
      <Dialog open={!!editingCrypto} onOpenChange={(open) => !open && setEditingCrypto(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit {editingCrypto?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                type="number"
                step="0.00000001"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                placeholder="Enter price"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="change24h">24h Change (%)</Label>
              <Input
                id="change24h"
                type="number"
                step="0.01"
                value={editChange24h}
                onChange={(e) => setEditChange24h(e.target.value)}
                placeholder="Enter 24h change percentage"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL</Label>
              <Input
                id="logo"
                type="url"
                value={editLogo}
                onChange={(e) => setEditLogo(e.target.value)}
                placeholder="Enter logo image URL"
              />
              {editLogo && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-2">Preview:</p>
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
                    <img 
                      src={editLogo} 
                      alt="Logo preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = "none"
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCrypto(null)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSaveCrypto} className="bg-[#c4d626] text-[#0c3a30] hover:bg-[#a8b821]">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

