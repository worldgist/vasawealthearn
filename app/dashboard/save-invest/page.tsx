"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { sendInvestmentReceipt } from "@/lib/receipts/send-investment-receipt"
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Coins, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ArrowDown,
  CheckCircle,
  X
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Cryptocurrency {
  id: string
  name: string
  symbol: string
  price: number
  change24h: number
  icon: string
  color: string
  image?: string
}

export default function SaveInvestPage() {
  const supabase = createClient()
  const { toast } = useToast()
  const [walletBalance, setWalletBalance] = useState(0)
  const [totalInvested, setTotalInvested] = useState(0)
  const [totalEarned, setTotalEarned] = useState(0)
  const [buyAmounts, setBuyAmounts] = useState<{ [key: string]: string }>({})
  const [sellAmounts, setSellAmounts] = useState<{ [key: string]: string }>({})
  const [userHoldings, setUserHoldings] = useState<{ [key: string]: number }>({})
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({})
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [cryptocurrencies, setCryptocurrencies] = useState<Cryptocurrency[]>([])
  const [isLoadingPrices, setIsLoadingPrices] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Base cryptocurrency configuration (static data)
  const baseCryptocurrencies: Omit<Cryptocurrency, "price" | "change24h">[] = [
    {
      id: "bitcoin",
      name: "Bitcoin",
      symbol: "BTC",
      icon: "₿",
      color: "bg-orange-100 text-orange-600"
    },
    {
      id: "ethereum",
      name: "Ethereum",
      symbol: "ETH",
      icon: "Ξ",
      color: "bg-blue-100 text-blue-600"
    },
    {
      id: "tron",
      name: "Tron",
      symbol: "TRX",
      icon: "T",
      color: "bg-red-100 text-red-600"
    },
    {
      id: "solana",
      name: "Solana",
      symbol: "SOL",
      icon: "◎",
      color: "bg-purple-100 text-purple-600"
    },
    {
      id: "gala",
      name: "Gala",
      symbol: "GALA",
      icon: "G",
      color: "bg-green-100 text-green-600"
    },
    {
      id: "doge",
      name: "Dogecoin",
      symbol: "DOGE",
      icon: "Ð",
      color: "bg-yellow-100 text-yellow-600"
    },
    {
      id: "ripple",
      name: "Ripple",
      symbol: "XRP",
      icon: "X",
      color: "bg-indigo-100 text-indigo-600"
    },
    {
      id: "usdt",
      name: "Tether",
      symbol: "USDT",
      icon: "₮",
      color: "bg-teal-100 text-teal-600"
    },
    {
      id: "usdc",
      name: "USD Coin",
      symbol: "USDC",
      icon: "C",
      color: "bg-cyan-100 text-cyan-600"
    },
  ]

  // Fetch real-time prices from CoinGecko
  const fetchCryptoPrices = useCallback(async () => {
    // Default prices as fallback (defined inside to avoid dependency issues)
    const getDefaultPrice = (id: string): number => {
      const defaults: { [key: string]: number } = {
        bitcoin: 43250.50,
        ethereum: 2650.75,
        tron: 0.105,
        solana: 98.25,
        gala: 0.042,
        doge: 0.085,
        ripple: 0.625,
        usdt: 1.00,
        usdc: 1.00,
      }
      return defaults[id] || 0
    }
    try {
      setIsLoadingPrices(true)
      const response = await fetch("/api/crypto/prices", {
        cache: "no-store", // Always fetch fresh data
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()

      if (result.success && result.data) {
        // Merge base config with real-time prices
        setCryptocurrencies((prevCryptos) => {
          // Use base cryptocurrencies if prev is empty, otherwise update existing
          const getDefaultPrice = (id: string): number => {
            const defaults: { [key: string]: number } = {
              bitcoin: 43250.50,
              ethereum: 2650.75,
              tron: 0.105,
              solana: 98.25,
              gala: 0.042,
              doge: 0.085,
              ripple: 0.625,
              usdt: 1.00,
              usdc: 1.00,
            }
            return defaults[id] || 0
          }
          
          const base = prevCryptos.length > 0 ? prevCryptos : baseCryptocurrencies.map((b) => ({
            ...b,
            price: getDefaultPrice(b.id),
            change24h: 0,
          }))
          
          return base.map((crypto) => {
            const priceData = result.data[crypto.id]
            return {
              ...crypto,
              price: priceData?.price ?? crypto.price,
              change24h: priceData?.change24h ?? crypto.change24h,
              image: priceData?.image || priceData?.logo || crypto.image,
            }
          })
        })
        setLastUpdate(new Date())
      } else {
        // Fallback to default prices if API fails
        console.error("Failed to fetch prices:", result.error)
        // Keep existing prices, don't reset to defaults
      }
    } catch (error) {
      console.error("Error fetching crypto prices:", error)
      // Keep existing prices on error, don't reset
    } finally {
      setIsLoadingPrices(false)
    }
  }, [baseCryptocurrencies])

  // Initialize with default prices immediately so UI renders
  useEffect(() => {
    const getDefaultPrice = (id: string): number => {
      const defaults: { [key: string]: number } = {
        bitcoin: 43250.50,
        ethereum: 2650.75,
        tron: 0.105,
        solana: 98.25,
        gala: 0.042,
        doge: 0.085,
        ripple: 0.625,
        usdt: 1.00,
        usdc: 1.00,
      }
      return defaults[id] || 0
    }
    
    // Load admin-managed crypto data if available
    const adminCryptoData = localStorage.getItem("adminCryptoData")
    let adminCryptos: any[] = []
    if (adminCryptoData) {
      try {
        const data = JSON.parse(adminCryptoData)
        if (data.cryptocurrencies) {
          adminCryptos = data.cryptocurrencies
        }
      } catch (error) {
        console.error("Error loading admin crypto data:", error)
      }
    }
    
    // Merge admin data with base config, or use defaults
    const defaultCryptos = baseCryptocurrencies.map((base) => {
      const adminCrypto = adminCryptos.find((ac: any) => ac.id === base.id)
      return {
        ...base,
        price: adminCrypto?.price || getDefaultPrice(base.id),
        change24h: adminCrypto?.change24h || 0,
        image: adminCrypto?.image || undefined,
      }
    })
    setCryptocurrencies(defaultCryptos)
    
    // Load admin total earned if available
    if (adminCryptoData) {
      try {
        const data = JSON.parse(adminCryptoData)
        if (data.totalEarned !== undefined) {
          setTotalEarned(data.totalEarned)
        }
      } catch (error) {
        console.error("Error loading total earned:", error)
      }
    }
  }, [baseCryptocurrencies])

  // Fetch real-time prices after initial render
  useEffect(() => {
    // Wait a bit for initial render, then fetch prices
    const timer = setTimeout(() => {
      fetchCryptoPrices()
    }, 500)
    
    // Refresh prices every 60 seconds
    const interval = setInterval(() => {
      fetchCryptoPrices()
    }, 60000)

    // Also listen for admin updates
    const handleStorageChange = () => {
      const adminCryptoData = localStorage.getItem("adminCryptoData")
      if (adminCryptoData) {
        try {
          const data = JSON.parse(adminCryptoData)
          if (data.cryptocurrencies) {
            setCryptocurrencies((prevCryptos) => {
              return prevCryptos.map((crypto) => {
                const adminCrypto = data.cryptocurrencies.find((ac: any) => ac.id === crypto.id)
                if (adminCrypto) {
                  return {
                    ...crypto,
                    price: adminCrypto.price,
                    change24h: adminCrypto.change24h,
                    image: adminCrypto.image || crypto.image,
                  }
                }
                return crypto
              })
            })
          }
          if (data.totalEarned !== undefined) {
            setTotalEarned(data.totalEarned)
          }
        } catch (error) {
          console.error("Error updating from admin data:", error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    // Also check periodically for same-tab updates
    const checkInterval = setInterval(handleStorageChange, 2000)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
      clearInterval(checkInterval)
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [fetchCryptoPrices])

  // Load user data from database
  useEffect(() => {
    loadUserData()

    // Set up real-time subscription for balance updates
    let channel: any = null
    
    const setupSubscription = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        channel = supabase
          .channel('profile-balance-changes')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'profiles',
              filter: `id=eq.${user.id}`,
            },
            (payload) => {
              if (payload.new.balance !== undefined) {
                setWalletBalance(Number(payload.new.balance) || 0)
              }
            }
          )
          .subscribe()
      }
    }

    setupSubscription()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  const loadUserData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Load user balance
      const { data: profile } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", user.id)
        .single()

      if (profile) {
        setWalletBalance(Number(profile.balance) || 0)
      }

      // Load crypto investments from database
      const { data: investments, error } = await supabase
        .from("crypto_investments")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading investments:", error)
        return
      }

      // Calculate holdings from investments
      const holdings: { [key: string]: number } = {}
      let totalInvested = 0
      let totalEarned = 0

      investments?.forEach((inv: any) => {
        const cryptoId = inv.cryptocurrency_id
        holdings[cryptoId] = (holdings[cryptoId] || 0) + Number(inv.quantity)
        totalInvested += Number(inv.amount_invested || 0)
        
        // Calculate profit/loss
        if (inv.current_value && inv.amount_invested) {
          const profit = Number(inv.current_value) - Number(inv.amount_invested)
          if (profit > 0) {
            totalEarned += profit
          }
        }
      })

      setUserHoldings(holdings)
      setTotalInvested(totalInvested)
      setTotalEarned(totalEarned)
      
      // Also save to localStorage for backward compatibility
      localStorage.setItem("cryptoHoldings", JSON.stringify(holdings))
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }

  // Recalculate totals when cryptocurrencies or holdings change
  useEffect(() => {
    if (cryptocurrencies.length === 0) return
    
    // Calculate total invested and earned from database investments
    const calculateTotals = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data: investments } = await supabase
          .from("crypto_investments")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "active")

        if (investments) {
          let invested = 0
          let earned = 0

          investments.forEach((inv: any) => {
            invested += Number(inv.amount_invested || 0)
            if (inv.current_value && inv.amount_invested) {
              const profit = Number(inv.current_value) - Number(inv.amount_invested)
              if (profit > 0) {
                earned += profit
              }
            }
          })

          setTotalInvested(invested)
          setTotalEarned(earned)
        }
      } catch (error) {
        console.error("Error calculating totals:", error)
      }
    }

    calculateTotals()
  }, [cryptocurrencies])

  const handleBuy = async (crypto: Cryptocurrency) => {
    const amount = buyAmounts[crypto.id]
    if (!amount || Number.parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to buy",
        variant: "destructive",
      })
      return
    }

    const buyAmount = Number.parseFloat(amount)
    if (buyAmount > walletBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance to complete this purchase",
        variant: "destructive",
      })
      return
    }

    setIsLoading((prev) => ({ ...prev, [`buy-${crypto.id}`]: true }))

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to make investments.",
          variant: "destructive",
        })
        return
      }

      const cryptoAmount = buyAmount / crypto.price
      
      // Generate reference number
      const referenceNumber = `CRYPTO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

      // Save to database
      const { data: investment, error: investmentError } = await supabase
        .from("crypto_investments")
        .insert({
          user_id: user.id,
          cryptocurrency_id: crypto.id,
          cryptocurrency_name: crypto.name,
          cryptocurrency_symbol: crypto.symbol,
          amount_invested: buyAmount,
          price_per_unit: crypto.price,
          quantity: cryptoAmount,
          current_price: crypto.price,
          currency: "USD",
          status: "active",
          transaction_type: "buy",
          reference_number: referenceNumber,
          description: `Purchased ${cryptoAmount.toFixed(8)} ${crypto.symbol} at $${crypto.price.toLocaleString()}`,
        })
        .select()
        .single()

      if (investmentError) {
        console.error("Error saving investment:", investmentError)
        throw investmentError
      }

      // Create transaction record
      await supabase.from("transactions").insert({
        user_id: user.id,
        transaction_type: "crypto_investment",
        amount: buyAmount,
        currency: "USD",
        description: `Crypto Investment - ${crypto.name} (${crypto.symbol})`,
        status: "completed",
        reference_number: referenceNumber,
        reference_id: investment.id,
      })

      // Update user balance
      const { data: profile } = await supabase
        .from("profiles")
        .select("balance, email, first_name, last_name")
        .eq("id", user.id)
        .single()

      if (profile) {
        const newBalance = (Number(profile.balance) || 0) - buyAmount
        await supabase
          .from("profiles")
          .update({ balance: newBalance })
          .eq("id", user.id)
        
        setWalletBalance(newBalance)
      }

      // Reload user data to reflect new investment
      await loadUserData()

      // Send receipt via email
      if (profile?.email) {
        const userName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "User"
        await sendInvestmentReceipt("crypto", profile.email, userName, {
          ...investment,
          walletAddress: `bc1qm40r2356vv0xveqdkngrlelhmg9twcgkqvd8g8`, // Bitcoin wallet address
        })
      }

      toast({
        title: "Purchase Successful!",
        description: `You bought ${cryptoAmount.toFixed(6)} ${crypto.symbol} for $${buyAmount.toLocaleString()}. Receipt sent to your email.`,
      })

      setBuyAmounts((prev) => ({ ...prev, [crypto.id]: "" }))
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, [`buy-${crypto.id}`]: false }))
    }
  }

  const handleSell = async (crypto: Cryptocurrency) => {
    const amount = sellAmounts[crypto.id]
    if (!amount || Number.parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to sell",
        variant: "destructive",
      })
      return
    }

    const sellAmount = Number.parseFloat(amount)
    const cryptoAmount = sellAmount / crypto.price
    const currentHolding = userHoldings[crypto.id] || 0

    if (cryptoAmount > currentHolding) {
      toast({
        title: "Insufficient Holdings",
        description: `You only have ${currentHolding.toFixed(6)} ${crypto.symbol} available`,
        variant: "destructive",
      })
      return
    }

    setIsLoading((prev) => ({ ...prev, [`sell-${crypto.id}`]: true }))

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to sell crypto.",
          variant: "destructive",
        })
        return
      }

      // Generate reference number
      const referenceNumber = `CRYPTO-SELL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

      // Save sell transaction to database
      const { data: investment, error: investmentError } = await supabase
        .from("crypto_investments")
        .insert({
          user_id: user.id,
          cryptocurrency_id: crypto.id,
          cryptocurrency_name: crypto.name,
          cryptocurrency_symbol: crypto.symbol,
          amount_invested: sellAmount,
          price_per_unit: crypto.price,
          quantity: -cryptoAmount, // Negative for sell
          current_price: crypto.price,
          currency: "USD",
          status: "active",
          transaction_type: "sell",
          reference_number: referenceNumber,
          description: `Sold ${cryptoAmount.toFixed(8)} ${crypto.symbol} at $${crypto.price.toLocaleString()}`,
        })
        .select()
        .single()

      if (investmentError) {
        console.error("Error saving sell transaction:", investmentError)
        throw investmentError
      }

      // Create transaction record
      await supabase.from("transactions").insert({
        user_id: user.id,
        transaction_type: "crypto_investment",
        amount: sellAmount,
        currency: "USD",
        description: `Crypto Sale - ${crypto.name} (${crypto.symbol})`,
        status: "completed",
        reference_number: referenceNumber,
        reference_id: investment.id,
      })

      // Update user balance
      const { data: profile } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", user.id)
        .single()

      if (profile) {
        const newBalance = (Number(profile.balance) || 0) + sellAmount
        await supabase
          .from("profiles")
          .update({ balance: newBalance })
          .eq("id", user.id)
        
        setWalletBalance(newBalance)
      }

      // Reload user data to reflect sale
      await loadUserData()

      toast({
        title: "Sale Successful!",
        description: `You sold ${cryptoAmount.toFixed(6)} ${crypto.symbol} for $${sellAmount.toLocaleString()}`,
      })

      setSellAmounts((prev) => ({ ...prev, [crypto.id]: "" }))
    } catch (error) {
      toast({
        title: "Sale Failed",
        description: "There was an error processing your sale. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, [`sell-${crypto.id}`]: false }))
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Crypto Investment</h1>
          <p className="text-sm sm:text-base text-gray-600">Buy and sell cryptocurrencies to grow your portfolio</p>
        </div>

        {/* Wallet Balance Card */}
        <Card className="bg-gradient-to-r from-[#c4d626] to-[#a8c520] border-0 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-medium text-white/90">Crypto Wallet</h3>
                  <p className="text-xs sm:text-sm text-white/70">
                    Total Portfolio Value
                    {lastUpdate && (
                      <span className="ml-2 text-white/60">
                        • Updated {lastUpdate.toLocaleTimeString()}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              {isLoadingPrices && (
                <div className="flex items-center gap-2 text-white/80 text-xs">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating prices...
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm text-white/80">Wallet Balance</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setWithdrawDialogOpen(true)}
                    className="h-7 px-2 text-white hover:bg-white/20 text-xs"
                  >
                    <ArrowDown className="h-3 w-3 mr-1" />
                    Withdraw
                  </Button>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-white mb-2">${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
                <p className="text-xs sm:text-sm text-white/80 mb-1">Total Invested</p>
                <p className="text-xl sm:text-2xl font-bold text-white">${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
                <p className="text-xs sm:text-sm text-white/80 mb-1">Total Earned</p>
                <p className="text-xl sm:text-2xl font-bold text-green-200">+${totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cryptocurrencies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {cryptocurrencies.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c4d626] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading cryptocurrency prices...</p>
            </div>
          ) : (
            cryptocurrencies.map((crypto) => {
              const holding = userHoldings[crypto.id] || 0
              const holdingValue = holding * crypto.price
              const isPositive = crypto.change24h >= 0

              return (
              <Card key={crypto.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 ${crypto.color} rounded-full flex items-center justify-center overflow-hidden relative`}>
                        {crypto.image ? (
                          <img 
                            src={crypto.image} 
                            alt={crypto.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Hide image on error - icon will show as fallback
                              const target = e.target as HTMLImageElement
                              target.style.display = "none"
                              // Show icon fallback
                              const iconSpan = target.nextElementSibling as HTMLElement
                              if (iconSpan) {
                                iconSpan.style.display = "flex"
                              }
                            }}
                          />
                        ) : null}
                        <span 
                          className="font-bold text-lg sm:text-xl absolute inset-0 flex items-center justify-center"
                          style={{ display: crypto.image ? "none" : "flex" }}
                        >
                          {crypto.icon}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-base sm:text-lg">{crypto.name}</CardTitle>
                        <p className="text-xs sm:text-sm text-gray-500">{crypto.symbol}</p>
                      </div>
                    </div>
                    {isPositive ? (
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Price</p>
                    <p className="text-lg sm:text-xl font-bold">${crypto.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">24h Change</p>
                    <p className={`text-sm font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                      {isPositive ? "+" : ""}{crypto.change24h.toFixed(2)}%
                    </p>
                  </div>
                  
                  {holding > 0 && (
                    <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                      <p className="text-xs text-gray-600 mb-1">Your Holdings</p>
                      <p className="text-sm font-semibold">{holding.toFixed(6)} {crypto.symbol}</p>
                      <p className="text-xs text-gray-500">≈ ${holdingValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {/* Buy Section */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700">Buy Amount ($)</label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        className="text-sm"
                        value={buyAmounts[crypto.id] || ""}
                        onChange={(e) => setBuyAmounts((prev) => ({ ...prev, [crypto.id]: e.target.value }))}
                      />
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm"
                        onClick={() => handleBuy(crypto)}
                        disabled={isLoading[`buy-${crypto.id}`]}
                      >
                        {isLoading[`buy-${crypto.id}`] ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1 sm:mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            Buy {crypto.symbol}
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Sell Section */}
                    <div className="space-y-2 border-t pt-3">
                      <label className="text-xs font-medium text-gray-700">Sell Amount ($)</label>
                      <Input
                        type="number"
                        placeholder={holding > 0 ? `Max: $${(holding * crypto.price).toFixed(2)}` : "No holdings"}
                        className="text-sm"
                        value={sellAmounts[crypto.id] || ""}
                        onChange={(e) => setSellAmounts((prev) => ({ ...prev, [crypto.id]: e.target.value }))}
                        disabled={holding === 0}
                      />
                      <Button
                        variant="outline"
                        className="w-full border-red-300 text-red-600 hover:bg-red-50 text-xs sm:text-sm"
                        onClick={() => handleSell(crypto)}
                        disabled={isLoading[`sell-${crypto.id}`] || holding === 0}
                      >
                        {isLoading[`sell-${crypto.id}`] ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-red-600 mr-1 sm:mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            Sell {crypto.symbol}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              )
            })
          )}
        </div>

        {/* Withdraw Dialog */}
        <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ArrowDown className="h-5 w-5 text-[#c4d626]" />
                Withdraw Funds
              </DialogTitle>
              <DialogDescription>
                Enter the amount you would like to withdraw from your wallet balance.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-[#c4d626]/10 rounded-lg p-3 border border-[#c4d626]/20">
                <p className="text-xs text-gray-600 mb-1">Available Balance</p>
                <p className="text-lg font-bold text-[#0c3a30]">
                  ${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Withdraw Amount ($)
                </label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  min={1}
                  max={walletBalance}
                  step="0.01"
                  className="text-sm"
                />
                {withdrawAmount && Number.parseFloat(withdrawAmount) > walletBalance && (
                  <p className="text-xs text-red-600 mt-1">
                    Amount exceeds available balance
                  </p>
                )}
                {withdrawAmount && Number.parseFloat(withdrawAmount) <= 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    Please enter a valid amount
                  </p>
                )}
              </div>

              {withdrawAmount && Number.parseFloat(withdrawAmount) > 0 && Number.parseFloat(withdrawAmount) <= walletBalance && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Balance After Withdrawal:</p>
                  <p className="text-lg font-bold text-gray-900">
                    ${(walletBalance - Number.parseFloat(withdrawAmount)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setWithdrawDialogOpen(false)
                  setWithdrawAmount("")
                }}
                className="text-sm"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  const amount = Number.parseFloat(withdrawAmount)
                  if (!amount || amount <= 0) {
                    toast({
                      title: "Invalid Amount",
                      description: "Please enter a valid withdrawal amount",
                      variant: "destructive",
                    })
                    return
                  }

                  if (amount > walletBalance) {
                    toast({
                      title: "Insufficient Balance",
                      description: "You don't have enough balance to withdraw this amount",
                      variant: "destructive",
                    })
                    return
                  }

                  setIsWithdrawing(true)
                  try {
                    await new Promise((resolve) => setTimeout(resolve, 1500))

                    setWalletBalance(walletBalance - amount)

                    const txId = `WDR-CRYPTO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

                    const transaction = {
                      id: txId,
                      type: "Withdrawal",
                      amount: `-$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                      status: "completed",
                      referenceId: txId,
                      description: `Withdrawal from Crypto Investment Wallet`,
                      scope: "Withdrawal",
                      created: new Date().toLocaleString(),
                    }

                    const existingTransactions = JSON.parse(localStorage.getItem("transactions") || "[]")
                    existingTransactions.unshift(transaction)
                    localStorage.setItem("transactions", JSON.stringify(existingTransactions))

                    toast({
                      title: "Withdrawal Successful",
                      description: `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} has been withdrawn from your wallet.`,
                    })

                    setWithdrawDialogOpen(false)
                    setWithdrawAmount("")
                  } catch (error) {
                    toast({
                      title: "Withdrawal Failed",
                      description: "There was an error processing your withdrawal. Please try again.",
                      variant: "destructive",
                    })
                  } finally {
                    setIsWithdrawing(false)
                  }
                }}
                disabled={isWithdrawing || !withdrawAmount || Number.parseFloat(withdrawAmount) <= 0 || Number.parseFloat(withdrawAmount) > walletBalance}
                className="bg-[#c4d626] hover:bg-[#a8c520] text-[#0c3a30] text-sm"
              >
                {isWithdrawing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0c3a30] mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Withdrawal
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
