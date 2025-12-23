"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { sendInvestmentReceipt } from "@/lib/receipts/send-investment-receipt"
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Wallet,
  ArrowRight,
  Percent,
  CheckCircle,
  X,
  Building2,
  CreditCard,
  Check,
  ArrowDown
} from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface Stock {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  changePercent: number
  volume: number
  marketCap: string
  sector: string
  logo?: string
}

export default function StocksPage() {
  const supabase = createClient()
  const { toast } = useToast()
  const [walletBalance, setWalletBalance] = useState(0)
  const [totalInvested, setTotalInvested] = useState(0)
  const [totalEarned, setTotalEarned] = useState(0)
  const [buyAmounts, setBuyAmounts] = useState<{ [key: string]: string }>({})
  const [sellAmounts, setSellAmounts] = useState<{ [key: string]: string }>({})
  const [userHoldings, setUserHoldings] = useState<{ [key: string]: number }>({})
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({})
  const [paymentMethodDialogOpen, setPaymentMethodDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [selectedAmount, setSelectedAmount] = useState(0)
  const [selectedShares, setSelectedShares] = useState(0)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("wallet")
  const [transactionType, setTransactionType] = useState<"buy" | "sell">("buy")
  const [transactionId, setTransactionId] = useState("")

  const stocks: Stock[] = [
    {
      id: "aapl",
      symbol: "AAPL",
      name: "Apple Inc.",
      price: 175.43,
      change24h: 2.15,
      changePercent: 1.24,
      volume: 45234567,
      marketCap: "$2.8T",
      sector: "Technology"
    },
    {
      id: "msft",
      symbol: "MSFT",
      name: "Microsoft Corporation",
      price: 378.85,
      change24h: -1.25,
      changePercent: -0.33,
      volume: 23456789,
      marketCap: "$2.8T",
      sector: "Technology"
    },
    {
      id: "googl",
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      price: 142.56,
      change24h: 3.42,
      changePercent: 2.46,
      volume: 34567890,
      marketCap: "$1.8T",
      sector: "Technology"
    },
    {
      id: "amzn",
      symbol: "AMZN",
      name: "Amazon.com Inc.",
      price: 151.94,
      change24h: 1.89,
      changePercent: 1.26,
      volume: 45678901,
      marketCap: "$1.6T",
      sector: "E-commerce"
    },
    {
      id: "tsla",
      symbol: "TSLA",
      name: "Tesla Inc.",
      price: 248.50,
      change24h: -5.20,
      changePercent: -2.05,
      volume: 56789012,
      marketCap: "$789B",
      sector: "Automotive"
    },
    {
      id: "meta",
      symbol: "META",
      name: "Meta Platforms Inc.",
      price: 485.39,
      change24h: 8.75,
      changePercent: 1.84,
      volume: 23456789,
      marketCap: "$1.2T",
      sector: "Technology"
    },
    {
      id: "nvda",
      symbol: "NVDA",
      name: "NVIDIA Corporation",
      price: 875.28,
      change24h: 15.50,
      changePercent: 1.80,
      volume: 34567890,
      marketCap: "$2.1T",
      sector: "Technology"
    },
    {
      id: "jpm",
      symbol: "JPM",
      name: "JPMorgan Chase & Co.",
      price: 168.42,
      change24h: 0.85,
      changePercent: 0.51,
      volume: 12345678,
      marketCap: "$490B",
      sector: "Financial Services"
    }
  ]

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
          .channel('profile-balance-changes-stocks')
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

      // Load stock investments from database
      const { data: investments, error } = await supabase
        .from("stock_investments")
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
        const stockId = inv.stock_symbol?.toLowerCase() || inv.stock_id
        holdings[stockId] = (holdings[stockId] || 0) + Number(inv.shares || 0)
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
      localStorage.setItem("stockHoldings", JSON.stringify(holdings))
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }

  const handleBuyClick = (stock: Stock) => {
    const amount = buyAmounts[stock.id]
    if (!amount || Number.parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid investment amount",
        variant: "destructive",
      })
      return
    }

    const investAmount = Number.parseFloat(amount)
    const shares = investAmount / stock.price
    const minInvestment = 100 // Minimum $100 investment

    if (investAmount < minInvestment) {
      toast({
        title: "Minimum Investment Required",
        description: `Minimum investment is $${minInvestment}`,
        variant: "destructive",
      })
      return
    }

    if (investAmount > walletBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance to complete this purchase",
        variant: "destructive",
      })
      return
    }

    // Open payment method selection dialog
    setSelectedStock(stock)
    setSelectedAmount(investAmount)
    setSelectedShares(shares)
    setTransactionType("buy")
    setSelectedPaymentMethod("wallet")
    setPaymentMethodDialogOpen(true)
  }

  const handlePaymentMethodSelect = () => {
    if (!selectedPaymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method",
        variant: "destructive",
      })
      return
    }
    
    // Close payment method dialog and open confirmation dialog
    setPaymentMethodDialogOpen(false)
    setConfirmDialogOpen(true)
  }

  const handleSellClick = (stock: Stock) => {
    const sharesToSell = sellAmounts[stock.id]
    if (!sharesToSell || Number.parseFloat(sharesToSell) <= 0) {
      toast({
        title: "Invalid Shares",
        description: "Please enter a valid number of shares to sell",
        variant: "destructive",
      })
      return
    }

    const shares = Number.parseFloat(sharesToSell)
    const currentHoldings = userHoldings[stock.id] || 0

    if (shares > currentHoldings) {
      toast({
        title: "Insufficient Shares",
        description: `You only have ${currentHoldings.toFixed(4)} shares`,
        variant: "destructive",
      })
      return
    }

    const sellAmount = shares * stock.price

    // Open confirmation dialog
    setSelectedStock(stock)
    setSelectedAmount(sellAmount)
    setSelectedShares(shares)
    setTransactionType("sell")
    setConfirmDialogOpen(true)
  }

  const handleConfirmTransaction = async () => {
    if (!selectedStock) return

    setConfirmDialogOpen(false)
    setIsLoading((prev) => ({ ...prev, [selectedStock.id]: true }))

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

      if (transactionType === "buy") {
        // Generate reference number
        const referenceNumber = `STK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        setTransactionId(referenceNumber)

        // Save to database
        const { data: investment, error: investmentError } = await supabase
          .from("stock_investments")
          .insert({
            user_id: user.id,
            stock_symbol: selectedStock.symbol,
            stock_name: selectedStock.name,
            stock_exchange: "NASDAQ", // Default exchange
            amount_invested: selectedAmount,
            price_per_share: selectedStock.price,
            shares: selectedShares,
            current_price: selectedStock.price,
            currency: "USD",
            status: "active",
            transaction_type: "buy",
            reference_number: referenceNumber,
            description: `Purchased ${selectedShares.toFixed(4)} shares of ${selectedStock.symbol} at $${selectedStock.price.toFixed(2)} per share`,
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
          transaction_type: "stock_investment",
          amount: selectedAmount,
          currency: "USD",
          description: `Stock Investment - ${selectedStock.symbol} (${selectedStock.name})`,
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
          const newBalance = (Number(profile.balance) || 0) - selectedAmount
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
          await sendInvestmentReceipt("stock", profile.email, userName, {
            ...investment,
            stock_exchange: "NASDAQ",
          })
        }
      } else {
        // Handle sell transaction
        const referenceNumber = `STOCK-SELL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

        // Save sell transaction to database
        const { data: investment, error: investmentError } = await supabase
          .from("stock_investments")
          .insert({
            user_id: user.id,
            stock_symbol: selectedStock.symbol,
            stock_name: selectedStock.name,
            stock_exchange: "NASDAQ",
            amount_invested: selectedAmount,
            price_per_share: selectedStock.price,
            shares: -selectedShares, // Negative for sell
            current_price: selectedStock.price,
            currency: "USD",
            status: "active",
            transaction_type: "sell",
            reference_number: referenceNumber,
            description: `Sold ${selectedShares.toFixed(4)} shares of ${selectedStock.symbol} at $${selectedStock.price.toFixed(2)} per share`,
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
          transaction_type: "stock_investment",
          amount: selectedAmount,
          currency: "USD",
          description: `Stock Sale - ${selectedStock.symbol} (${selectedStock.name})`,
          status: "completed",
          reference_number: referenceNumber,
          reference_id: investment.id,
        })

        // Update user balance
        if (profile) {
          const newBalance = (Number(profile.balance) || 0) + selectedAmount
          await supabase
            .from("profiles")
            .update({ balance: newBalance })
            .eq("id", user.id)
          
          setWalletBalance(newBalance)
        }
      }

      // Reload user data to reflect transaction
      await loadUserData()

      // Clear inputs
      if (transactionType === "buy") {
        setBuyAmounts((prev) => ({ ...prev, [selectedStock.id]: "" }))
      } else {
        setSellAmounts((prev) => ({ ...prev, [selectedStock.id]: "" }))
      }

      // Send email notification with PDF
      try {
        await fetch("/api/transactions/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transactionId: txId,
            type: transactionType,
            stockSymbol: selectedStock.symbol,
            stockName: selectedStock.name,
            shares: selectedShares,
            price: selectedStock.price,
            totalAmount: selectedAmount,
            paymentMethod: transactionType === "buy" ? "Wallet Balance" : undefined,
          }),
        })
      } catch (emailError) {
        console.error("Error sending email notification:", emailError)
        // Don't block the transaction if email fails
        toast({
          title: "Transaction Completed",
          description: "Transaction successful, but email notification failed to send.",
          variant: "default",
        })
      }

      // Show success dialog
      toast({
        title: transactionType === "buy" ? "Purchase Successful!" : "Sale Successful!",
        description: transactionType === "buy" 
          ? `You bought ${selectedShares.toFixed(4)} shares of ${selectedStock.symbol} for $${selectedAmount.toLocaleString()}. Receipt sent to your email.`
          : `You sold ${selectedShares.toFixed(4)} shares of ${selectedStock.symbol} for $${selectedAmount.toLocaleString()}.`,
      })

      setSuccessDialogOpen(true)
    } catch (error) {
      toast({
        title: transactionType === "buy" ? "Purchase Failed" : "Sale Failed",
        description: "There was an error processing your transaction. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, [selectedStock.id]: false }))
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Stock Investment</h1>
          <p className="text-sm sm:text-base text-gray-600">Trade stocks and build your investment portfolio</p>
        </div>

        {/* Portfolio Summary Card */}
        <Card className="bg-gradient-to-r from-indigo-600 to-indigo-800 border-0 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-medium text-white/90">Stock Portfolio</h3>
                  <p className="text-xs sm:text-sm text-white/70">Investment Summary</p>
                </div>
              </div>
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
                <p className="text-xs sm:text-sm text-white/80 mb-1">Total Gain/Loss</p>
                <p className={`text-xl sm:text-2xl font-bold ${totalEarned >= 0 ? "text-green-200" : "text-red-200"}`}>
                  {totalEarned >= 0 ? "+" : ""}${totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stocks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {stocks.map((stock) => {
            const userShares = userHoldings[stock.id] || 0
            const userValue = userShares * stock.price
            const isPositive = stock.changePercent >= 0

            return (
              <Card key={stock.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold">{stock.symbol}</CardTitle>
                          <p className="text-xs text-gray-500">{stock.name}</p>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{stock.sector}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Current Price</span>
                      <span className="text-lg font-bold">${stock.price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">24h Change</span>
                      <span className={`text-sm font-semibold flex items-center gap-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
                        {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {isPositive ? "+" : ""}{stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Market Cap</span>
                      <span className="text-sm font-medium">{stock.marketCap}</span>
                    </div>
                  </div>

                  {userShares > 0 && (
                    <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                      <p className="text-xs text-gray-600 mb-1">Your Holdings</p>
                      <p className="text-sm font-semibold text-indigo-700">{userShares.toFixed(4)} shares</p>
                      <p className="text-xs text-gray-500">Value: ${userValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                  )}

                  <div className="space-y-2 border-t pt-3">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Buy Amount ($)</label>
                      <Input
                        type="number"
                        placeholder="Min: $100"
                        className="text-sm"
                        value={buyAmounts[stock.id] || ""}
                        onChange={(e) => setBuyAmounts((prev) => ({ ...prev, [stock.id]: e.target.value }))}
                        min={100}
                      />
                    </div>
                    <Button
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm"
                      onClick={() => handleBuyClick(stock)}
                      disabled={isLoading[stock.id]}
                    >
                      {isLoading[stock.id] ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1 sm:mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Buy Stock
                        </>
                      )}
                    </Button>

                    {userShares > 0 && (
                      <>
                        <div className="mt-3">
                          <label className="text-xs text-gray-600 mb-1 block">Sell Shares</label>
                          <Input
                            type="number"
                            placeholder={`Max: ${userShares.toFixed(4)}`}
                            className="text-sm"
                            value={sellAmounts[stock.id] || ""}
                            onChange={(e) => setSellAmounts((prev) => ({ ...prev, [stock.id]: e.target.value }))}
                            max={userShares}
                            step="0.0001"
                          />
                        </div>
                        <Button
                          variant="outline"
                          className="w-full border-red-300 text-red-600 hover:bg-red-50 text-xs sm:text-sm"
                          onClick={() => handleSellClick(stock)}
                          disabled={isLoading[stock.id]}
                        >
                          <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Sell Stock
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Payment Method Selection Dialog */}
        <Dialog open={paymentMethodDialogOpen} onOpenChange={setPaymentMethodDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-indigo-600" />
                Select Payment Method
              </DialogTitle>
              <DialogDescription>
                Choose how you would like to pay for this stock purchase.
              </DialogDescription>
            </DialogHeader>
            {selectedStock && (
              <div className="space-y-4 py-4">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 mb-4">
                  <p className="text-xs text-gray-600 mb-1">Purchase Amount</p>
                  <p className="text-lg font-bold text-gray-900">
                    ${selectedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedShares.toFixed(4)} shares of {selectedStock.symbol} @ ${selectedStock.price.toFixed(2)}
                  </p>
                </div>

                <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value="wallet" id="wallet" className="mt-0" />
                      <Label htmlFor="wallet" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                              <Wallet className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">Wallet Balance</p>
                              <p className="text-xs text-gray-500">Pay from your account balance</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-indigo-600">
                              ${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-gray-500">Available</p>
                          </div>
                        </div>
                      </Label>
                    </div>

                    {selectedPaymentMethod === "wallet" && walletBalance < selectedAmount && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-xs text-red-600">
                          ⚠️ Insufficient balance. You need ${(selectedAmount - walletBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} more.
                        </p>
                      </div>
                    )}
                  </div>
                </RadioGroup>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setPaymentMethodDialogOpen(false)}
                className="text-sm"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handlePaymentMethodSelect}
                disabled={selectedPaymentMethod === "wallet" && walletBalance < selectedAmount}
                className="bg-indigo-600 hover:bg-indigo-700 text-sm"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-indigo-600" />
                Confirm Payment
              </DialogTitle>
              <DialogDescription>
                Please review your transaction details and confirm payment.
              </DialogDescription>
            </DialogHeader>
            {selectedStock && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Stock:</span>
                    <span className="text-sm font-semibold">{selectedStock.symbol} - {selectedStock.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Shares:</span>
                    <span className="text-sm font-semibold">{selectedShares.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Price per Share:</span>
                    <span className="text-sm font-semibold">${selectedStock.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Cost:</span>
                    <span className="text-sm font-bold text-indigo-600">${selectedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Wallet className="h-4 w-4 text-indigo-600" />
                      <span className="text-sm font-medium text-gray-700">Payment Method</span>
                    </div>
                    <span className="text-sm font-semibold text-indigo-600">Wallet Balance</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Current Balance:</span>
                    <span>${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Wallet Balance After Purchase:</p>
                  <p className="text-lg font-bold text-gray-900">
                    ${(walletBalance - selectedAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setConfirmDialogOpen(false)}
                className="text-sm"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleConfirmTransaction}
                className="bg-indigo-600 hover:bg-indigo-700 text-sm w-full sm:w-auto"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm & Pay
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Success Dialog */}
        <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <div className="flex justify-center mb-2">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <DialogTitle className="text-center text-xl">Transaction Successful!</DialogTitle>
              <DialogDescription className="text-center">
                Your stock {transactionType === "buy" ? "purchase" : "sale"} has been completed successfully. 
                {transactionType === "buy" && " Payment has been processed from your wallet balance."}
                <br />
                <br />
                A confirmation email with transaction summary PDF has been sent to your registered email address.
              </DialogDescription>
            </DialogHeader>
            {selectedStock && (
              <div className="space-y-3 py-4">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stock:</span>
                      <span className="font-semibold">{selectedStock.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shares:</span>
                      <span className="font-semibold">{selectedShares.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{transactionType === "buy" ? "Amount Paid" : "Amount Received"}:</span>
                      <span className="font-bold text-green-700">${selectedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-mono text-xs">{transactionId}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Your transaction has been added to your transaction history.
                </p>
              </div>
            )}
            <DialogFooter className="sm:justify-center">
              <Button
                onClick={() => setSuccessDialogOpen(false)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-sm"
              >
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Withdraw Dialog */}
        <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ArrowDown className="h-5 w-5 text-indigo-600" />
                Withdraw Funds
              </DialogTitle>
              <DialogDescription>
                Enter the amount you would like to withdraw from your wallet balance.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                <p className="text-xs text-gray-600 mb-1">Available Balance</p>
                <p className="text-lg font-bold text-indigo-600">
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
                    // Simulate withdrawal processing
                    await new Promise((resolve) => setTimeout(resolve, 1500))

                    // Update wallet balance
                    setWalletBalance(walletBalance - amount)

                    // Generate transaction ID
                    const txId = `WDR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

                    // Save transaction
                    const transaction = {
                      id: txId,
                      type: "Withdrawal",
                      amount: `-$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                      status: "completed",
                      referenceId: txId,
                      description: `Withdrawal from Stock Investment Wallet`,
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
                className="bg-indigo-600 hover:bg-indigo-700 text-sm"
              >
                {isWithdrawing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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

