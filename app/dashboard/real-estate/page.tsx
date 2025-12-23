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
  Home,
  MapPin,
  Bed,
  Bath,
  Square,
  Wallet,
  ArrowRight,
  Calendar,
  Percent,
  CheckCircle,
  X,
  ArrowDown
} from "lucide-react"

interface Property {
  id: string
  name: string
  location: string
  price: number
  expectedReturn: number
  bedrooms: number
  bathrooms: number
  squareFeet: number
  image: string
  type: string
  status: "available" | "invested"
}

export default function RealEstatePage() {
  const supabase = createClient()
  const { toast } = useToast()
  const [walletBalance, setWalletBalance] = useState(0)
  const [totalInvested, setTotalInvested] = useState(0)
  const [totalEarned, setTotalEarned] = useState(0)
  const [investmentAmounts, setInvestmentAmounts] = useState<{ [key: string]: string }>({})
  const [userInvestments, setUserInvestments] = useState<{ [key: string]: number }>({})
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({})
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [selectedAmount, setSelectedAmount] = useState(0)
  const [transactionId, setTransactionId] = useState("")

  const properties: Property[] = [
    {
      id: "property-1",
      name: "Luxury Downtown Apartment",
      location: "New York, NY",
      price: 450000,
      expectedReturn: 8.5,
      bedrooms: 2,
      bathrooms: 2,
      squareFeet: 1200,
      image: "/hus1.png",
      type: "Apartment",
      status: "available"
    },
    {
      id: "property-2",
      name: "Modern Family Home",
      location: "Los Angeles, CA",
      price: 750000,
      expectedReturn: 7.2,
      bedrooms: 4,
      bathrooms: 3,
      squareFeet: 2500,
      image: "/hus2.png",
      type: "House",
      status: "available"
    },
    {
      id: "property-3",
      name: "Beachfront Condo",
      location: "Miami, FL",
      price: 620000,
      expectedReturn: 9.1,
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1800,
      image: "/hus3.png",
      type: "Condo",
      status: "available"
    },
    {
      id: "property-4",
      name: "Commercial Office Space",
      location: "Chicago, IL",
      price: 1200000,
      expectedReturn: 6.8,
      bedrooms: 0,
      bathrooms: 4,
      squareFeet: 5000,
      image: "/placeholder.jpg",
      type: "Commercial",
      status: "available"
    },
    {
      id: "property-5",
      name: "Suburban Townhouse",
      location: "Austin, TX",
      price: 380000,
      expectedReturn: 7.5,
      bedrooms: 3,
      bathrooms: 2.5,
      squareFeet: 1600,
      image: "/placeholder.jpg",
      type: "Townhouse",
      status: "available"
    },
    {
      id: "property-6",
      name: "Luxury Penthouse",
      location: "San Francisco, CA",
      price: 2500000,
      expectedReturn: 10.2,
      bedrooms: 3,
      bathrooms: 3,
      squareFeet: 3200,
      image: "/placeholder.jpg",
      type: "Penthouse",
      status: "available"
    },
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
          .channel('profile-balance-changes-real-estate')
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

      // Load real estate investments from database
      const { data: investments, error } = await supabase
        .from("real_estate_investments")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading investments:", error)
        return
      }

      // Calculate investments by property
      const investmentsByProperty: { [key: string]: number } = {}
      let totalInvested = 0
      let totalEarned = 0

      investments?.forEach((inv: any) => {
        const propertyId = inv.property_id || inv.property_name?.toLowerCase().replace(/\s+/g, "-")
        investmentsByProperty[propertyId] = (investmentsByProperty[propertyId] || 0) + Number(inv.investment_amount || 0)
        totalInvested += Number(inv.investment_amount || 0)
        
        // Calculate profit/loss
        if (inv.current_value && inv.investment_amount) {
          const profit = Number(inv.current_value) - Number(inv.investment_amount)
          if (profit > 0) {
            totalEarned += profit
          }
        } else if (inv.expected_return && inv.investment_amount) {
          // Calculate based on expected return
          totalEarned += Number(inv.investment_amount) * (Number(inv.expected_return) / 100)
        }
      })

      setUserInvestments(investmentsByProperty)
      setTotalInvested(totalInvested)
      setTotalEarned(totalEarned)
      
      // Also save to localStorage for backward compatibility
      localStorage.setItem("realEstateInvestments", JSON.stringify(investmentsByProperty))
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }

  const handleInvestClick = (property: Property) => {
    const amount = investmentAmounts[property.id]
    if (!amount || Number.parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid investment amount",
        variant: "destructive",
      })
      return
    }

    const investAmount = Number.parseFloat(amount)
    const minInvestment = property.price * 0.1 // 10% minimum

    if (investAmount < minInvestment) {
      toast({
        title: "Minimum Investment Required",
        description: `Minimum investment is $${minInvestment.toLocaleString()} (10% of property value)`,
        variant: "destructive",
      })
      return
    }

    if (investAmount > property.price) {
      toast({
        title: "Exceeds Property Value",
        description: `Maximum investment is $${property.price.toLocaleString()}`,
        variant: "destructive",
      })
      return
    }

    if (investAmount > walletBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance to complete this investment",
        variant: "destructive",
      })
      return
    }

    // Open confirmation dialog
    setSelectedProperty(property)
    setSelectedAmount(investAmount)
    setConfirmDialogOpen(true)
  }

  const handleConfirmInvest = async () => {
    if (!selectedProperty) return

    setConfirmDialogOpen(false)
    setIsLoading((prev) => ({ ...prev, [selectedProperty.id]: true }))

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

      // Generate reference number
      const referenceNumber = `RE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      setTransactionId(referenceNumber)

      // Calculate investment percentage
      const investmentPercentage = (selectedAmount / selectedProperty.price) * 100

      // Save to database
      const { data: investment, error: investmentError } = await supabase
        .from("real_estate_investments")
        .insert({
          user_id: user.id,
          property_id: selectedProperty.id,
          property_name: selectedProperty.name,
          property_type: selectedProperty.type,
          location: selectedProperty.location,
          city: selectedProperty.location.split(",")[0]?.trim() || "",
          state: selectedProperty.location.split(",")[1]?.trim() || "",
          country: "United States",
          amount_invested: selectedAmount,
          property_value: selectedProperty.price,
          investment_percentage: investmentPercentage,
          expected_return: selectedProperty.expectedReturn,
          currency: "USD",
          status: "active",
          transaction_type: "buy",
          reference_number: referenceNumber,
          description: `Real Estate Investment - ${selectedProperty.name}`,
          bedrooms: selectedProperty.bedrooms,
          bathrooms: selectedProperty.bathrooms,
          square_feet: selectedProperty.squareFeet,
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
        transaction_type: "real_estate_investment",
        amount: selectedAmount,
        currency: "USD",
        description: `Real Estate Investment - ${selectedProperty.name}`,
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
        await sendInvestmentReceipt("real_estate", profile.email, userName, {
          ...investment,
          location: selectedProperty.location,
        })
      }

      // Clear input
      setInvestmentAmounts((prev) => ({ ...prev, [selectedProperty.id]: "" }))

      // Show success dialog
      setSuccessDialogOpen(true)
    } catch (error) {
      toast({
        title: "Investment Successful!",
        description: `Your investment of $${selectedAmount.toLocaleString()} in ${selectedProperty.name} has been processed. Receipt sent to your email.`,
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, [selectedProperty.id]: false }))
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Real Estate Investment</h1>
          <p className="text-sm sm:text-base text-gray-600">Invest in premium real estate properties and earn passive income</p>
        </div>

        {/* Wallet Balance Card */}
        <Card className="bg-gradient-to-r from-blue-600 to-blue-800 border-0 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Home className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-medium text-white/90">Real Estate Portfolio</h3>
                  <p className="text-xs sm:text-sm text-white/70">Total Investment Value</p>
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
                <p className="text-xs sm:text-sm text-white/80 mb-1">Total Earned</p>
                <p className="text-xl sm:text-2xl font-bold text-green-200">+${totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {properties.map((property) => {
            const userInvestment = userInvestments[property.id] || 0
            const minInvestment = property.price * 0.1
            const ownershipPercentage = userInvestment > 0 ? (userInvestment / property.price) * 100 : 0

            return (
              <Card key={property.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                  <img
                    src={property.image}
                    alt={property.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      const target = e.target as HTMLImageElement
                      target.style.display = "none"
                      const parent = target.parentElement
                      if (parent) {
                        parent.innerHTML = `
                          <div class="absolute inset-0 flex items-center justify-center">
                            <svg class="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                            </svg>
                          </div>
                        `
                      }
                    }}
                  />
                  {userInvestment > 0 && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold z-10">
                      Invested
                    </div>
                  )}
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base sm:text-lg mb-1">{property.name}</CardTitle>
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{property.location}</span>
                      </div>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{property.type}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-1">
                      <Bed className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                      <span className="text-gray-600">{property.bedrooms}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                      <span className="text-gray-600">{property.bathrooms}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Square className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                      <span className="text-gray-600">{property.squareFeet.toLocaleString()} sqft</span>
                    </div>
                  </div>

                  <div className="border-t pt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">Property Value</span>
                      <span className="text-sm sm:text-base font-bold">${property.price.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">Expected Return</span>
                      <span className="text-sm sm:text-base font-semibold text-green-600 flex items-center gap-1">
                        <Percent className="h-3 w-3 sm:h-4 sm:w-4" />
                        {property.expectedReturn}% p.a.
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">Min. Investment</span>
                      <span className="text-xs sm:text-sm font-medium">${minInvestment.toLocaleString()}</span>
                    </div>
                  </div>

                  {userInvestment > 0 && (
                    <div className="bg-green-50 rounded-lg p-2 sm:p-3 border border-green-200">
                      <p className="text-xs text-gray-600 mb-1">Your Investment</p>
                      <p className="text-sm font-semibold text-green-700">${userInvestment.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Ownership: {ownershipPercentage.toFixed(2)}%</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Input
                      type="number"
                      placeholder={`Min: $${minInvestment.toLocaleString()}`}
                      className="text-sm"
                      value={investmentAmounts[property.id] || ""}
                      onChange={(e) => setInvestmentAmounts((prev) => ({ ...prev, [property.id]: e.target.value }))}
                      min={minInvestment}
                      max={property.price}
                    />
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm"
                      onClick={() => handleInvestClick(property)}
                      disabled={isLoading[property.id]}
                    >
                      {isLoading[property.id] ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1 sm:mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Invest Now
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-blue-600" />
                Confirm Real Estate Investment
              </DialogTitle>
              <DialogDescription>
                Please review your investment details before confirming.
              </DialogDescription>
            </DialogHeader>
            {selectedProperty && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Property:</span>
                    <span className="text-sm font-semibold">{selectedProperty.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Location:</span>
                    <span className="text-sm font-semibold">{selectedProperty.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Investment Amount:</span>
                    <span className="text-sm font-bold text-blue-600">${selectedAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Expected Return:</span>
                    <span className="text-sm font-semibold text-green-600">{selectedProperty.expectedReturn}% p.a.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Ownership:</span>
                    <span className="text-sm font-semibold">{((selectedAmount / selectedProperty.price) * 100).toFixed(2)}%</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Wallet Balance After Investment:</p>
                  <p className="text-lg font-bold text-gray-900">${(walletBalance - selectedAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
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
                onClick={handleConfirmInvest}
                className="bg-blue-600 hover:bg-blue-700 text-sm"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Investment
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
              <DialogTitle className="text-center text-xl">Investment Successful!</DialogTitle>
              <DialogDescription className="text-center">
                Your real estate investment has been processed successfully.
              </DialogDescription>
            </DialogHeader>
            {selectedProperty && (
              <div className="space-y-3 py-4">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Property:</span>
                      <span className="font-semibold">{selectedProperty.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount Invested:</span>
                      <span className="font-bold text-green-700">${selectedAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-mono text-xs">{transactionId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expected Return:</span>
                      <span className="font-semibold text-green-600">{selectedProperty.expectedReturn}% p.a.</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Your investment has been added to your transactions. You can view and print it from the Transactions page.
                </p>
              </div>
            )}
            <DialogFooter className="sm:justify-center">
              <Button
                onClick={() => setSuccessDialogOpen(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-sm"
              >
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

