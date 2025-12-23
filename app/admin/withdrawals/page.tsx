"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { DollarSign, CheckCircle, XCircle, Eye, Download, Search, Clock, User, ArrowUp } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function AdminWithdrawalsPage() {
  const supabase = createClient()
  const { toast } = useToast()
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [filteredWithdrawals, setFilteredWithdrawals] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("pending")
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadWithdrawals()
  }, [])

  useEffect(() => {
    filterWithdrawals()
  }, [withdrawals, searchTerm, statusFilter])

  const loadWithdrawals = async () => {
    try {
      setIsLoading(true)
      const { data: withdrawalsData, error } = await supabase
        .from("withdrawals")
        .select(`
          *,
          profiles:user_id (
            email,
            first_name,
            last_name
          )
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading withdrawals:", error)
        toast({
          title: "Error",
          description: "Failed to load withdrawals.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Transform data to match expected format
      const transformedWithdrawals = (withdrawalsData || []).map((withdrawal: any) => ({
        ...withdrawal,
        id: withdrawal.id,
        userId: withdrawal.user_id,
        userName: withdrawal.profiles
          ? `${withdrawal.profiles.first_name || ""} ${withdrawal.profiles.last_name || ""}`.trim()
          : "Unknown User",
        userEmail: withdrawal.profiles?.email || "Unknown",
        amount: Number(withdrawal.amount),
        amountFormatted: `$${Number(withdrawal.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        netAmount: Number(withdrawal.net_amount || withdrawal.amount),
        fee: Number(withdrawal.withdrawal_fee || 0),
        withdrawalType: withdrawal.withdrawal_type,
        method: getMethodLabel(withdrawal.withdrawal_type),
        status: withdrawal.status || "pending",
        referenceId: withdrawal.reference_number,
        accountDetails: getAccountDetails(withdrawal),
        created: new Date(withdrawal.created_at).toLocaleString(),
        timestamp: new Date(withdrawal.created_at).getTime(),
      }))

      setWithdrawals(transformedWithdrawals)
    } catch (error) {
      console.error("Error loading withdrawals:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getMethodLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      bank_transfer: "Bank Transfer",
      wire: "Wire Transfer",
      ach: "ACH",
      check: "Check",
      crypto: "Crypto",
    }
    return labels[type] || type
  }

  const getAccountDetails = (withdrawal: any) => {
    if (withdrawal.withdrawal_type === "crypto") {
      return {
        type: "Crypto",
        address: withdrawal.crypto_wallet_address || "N/A",
        network: withdrawal.crypto_network || withdrawal.crypto_type || "N/A",
      }
    } else {
      return {
        type: "Bank",
        account: withdrawal.recipient_account_number
          ? `****${withdrawal.recipient_account_number.slice(-4)}`
          : "N/A",
        bank: withdrawal.recipient_bank_name || "N/A",
        name: withdrawal.recipient_name || "N/A",
      }
    }
  }

  const filterWithdrawals = () => {
    let filtered = withdrawals

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((w) => w.status === statusFilter)
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (w) =>
          w.referenceId?.toLowerCase().includes(searchLower) ||
          w.userName?.toLowerCase().includes(searchLower) ||
          w.userEmail?.toLowerCase().includes(searchLower) ||
          w.amountFormatted?.toLowerCase().includes(searchLower) ||
          w.method?.toLowerCase().includes(searchLower)
      )
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))

    setFilteredWithdrawals(filtered)
  }

  const sendEmail = async (to: string, subject: string, template: string, data: any) => {
    try {
      await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to,
          subject,
          template,
          data,
        }),
      })
    } catch (error) {
      console.error("Error sending email:", error)
    }
  }

  const handleApprove = async () => {
    if (!selectedWithdrawal) return

    setIsProcessing(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to approve withdrawals.",
          variant: "destructive",
        })
        return
      }

      // Update withdrawal status
      const { error: updateError } = await supabase
        .from("withdrawals")
        .update({
          status: "processing",
          reviewed_by: user.id,
          processed_date: new Date().toISOString(),
        })
        .eq("id", selectedWithdrawal.id)

      if (updateError) {
        console.error("Error updating withdrawal:", updateError)
        toast({
          title: "Error",
          description: "Failed to approve withdrawal. Please try again.",
          variant: "destructive",
        })
        return
      }

      // Deduct from user balance
      const { data: profile } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", selectedWithdrawal.userId)
        .single()

      if (profile) {
        const currentBalance = parseFloat(profile.balance || "0")
        const withdrawalAmount = selectedWithdrawal.netAmount || selectedWithdrawal.amount
        const newBalance = Math.max(0, currentBalance - withdrawalAmount).toFixed(2)

        await supabase
          .from("profiles")
          .update({ balance: newBalance })
          .eq("id", selectedWithdrawal.userId)
      }

      // Create transaction record
      await supabase.from("transactions").insert({
        user_id: selectedWithdrawal.userId,
        transaction_type: "withdrawal",
        amount: selectedWithdrawal.netAmount || selectedWithdrawal.amount,
        status: "processing",
        description: `Withdrawal - ${selectedWithdrawal.method}`,
        reference_number: selectedWithdrawal.referenceId,
      })

      // Send email notification
      await sendEmail(
        selectedWithdrawal.userEmail,
        "Withdrawal Request Approved",
        "withdrawal_approved",
        {
          userName: selectedWithdrawal.userName,
          amount: selectedWithdrawal.amount,
          method: selectedWithdrawal.method,
          referenceId: selectedWithdrawal.referenceId,
        }
      )

      setSuccessMessage(`Withdrawal of ${selectedWithdrawal.amountFormatted} has been approved and is being processed`)
      setApproveDialogOpen(false)
      setSelectedWithdrawal(null)

      // Reload withdrawals
      await loadWithdrawals()

      setTimeout(() => {
        setSuccessMessage("")
      }, 5000)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Failed to approve withdrawal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedWithdrawal || !rejectReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to reject withdrawals.",
          variant: "destructive",
        })
        return
      }

      // Update withdrawal status
      const { error: updateError } = await supabase
        .from("withdrawals")
        .update({
          status: "failed",
          rejection_reason: rejectReason,
          reviewed_by: user.id,
          processed_date: new Date().toISOString(),
        })
        .eq("id", selectedWithdrawal.id)

      if (updateError) {
        console.error("Error updating withdrawal:", updateError)
        toast({
          title: "Error",
          description: "Failed to reject withdrawal. Please try again.",
          variant: "destructive",
        })
        return
      }

      // Update transaction status
      await supabase
        .from("transactions")
        .update({
          status: "failed",
        })
        .eq("reference_number", selectedWithdrawal.referenceId)
        .eq("user_id", selectedWithdrawal.userId)

      // Send email notification
      await sendEmail(
        selectedWithdrawal.userEmail,
        "Withdrawal Request Rejected",
        "withdrawal_rejected",
        {
          userName: selectedWithdrawal.userName,
          amount: selectedWithdrawal.amount,
          method: selectedWithdrawal.method,
          referenceId: selectedWithdrawal.referenceId,
          rejectionReason: rejectReason,
        }
      )

      setSuccessMessage(`Withdrawal request has been rejected`)
      setRejectDialogOpen(false)
      setSelectedWithdrawal(null)
      setRejectReason("")

      // Reload withdrawals
      await loadWithdrawals()

      setTimeout(() => {
        setSuccessMessage("")
      }, 5000)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Failed to reject withdrawal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleViewWithdrawal = (withdrawal: any) => {
    setSelectedWithdrawal(withdrawal)
    setViewDialogOpen(true)
  }

  const pendingCount = withdrawals.filter((w) => w.status === "pending").length
  const completedCount = withdrawals.filter((w) => w.status === "completed").length
  const todayTotal = withdrawals
    .filter((w) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return new Date(w.timestamp) >= today && w.status === "completed"
    })
    .reduce((sum, w) => sum + w.amount, 0)

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
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">TRANSACTIONS</p>
              <a
                href="/admin/deposits"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md mb-1"
              >
                <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                Deposit Management
              </a>
              <a
                href="/admin/withdrawals"
                className="flex items-center px-3 py-2 text-sm font-medium text-white bg-[#c4d626] rounded-md mb-1"
              >
                <ArrowUp className="w-4 h-4 mr-3" />
                Withdrawal Management
              </a>
            </div>

            <div className="px-3 mt-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">SERVICES</p>
              <a
                href="/admin/loans"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md mb-1"
              >
                <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path
                    fillRule="evenodd"
                    d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                    clipRule="evenodd"
                  />
                </svg>
                Loan Management
              </a>
              <a
                href="/admin/cards"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md mb-1"
              >
                <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path
                    fillRule="evenodd"
                    d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                    clipRule="evenodd"
                  />
                </svg>
                Card Management
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
                  <h1 className="text-2xl font-bold text-gray-900">Withdrawal Management</h1>
                  <p className="text-sm text-gray-500">Review and process user withdrawal requests</p>
                </div>
                <button className="bg-[#c4d626] text-[#0c3a30] px-4 py-2 rounded-md font-medium hover:bg-[#a8b821] transition-colors">
                  <Download className="w-4 h-4 inline mr-2" />
                  Export Withdrawals
                </button>
              </div>
            </div>
          </header>

          <main className="p-6">
            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <p className="text-sm text-green-800">{successMessage}</p>
                </div>
                <button
                  onClick={() => setSuccessMessage("")}
                  className="text-green-600 hover:text-green-800"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Withdrawal Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending Approval</p>
                    {isLoading ? (
                      <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
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
                    <p className="text-sm font-medium text-gray-500">Today's Withdrawals</p>
                    {isLoading ? (
                      <div className="h-8 w-20 bg-gray-200 animate-pulse rounded mt-1"></div>
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">
                        ${todayTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        {todayTotal >= 1000 ? "K" : ""}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Completed</p>
                    {isLoading ? (
                      <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search by reference ID, user, amount, method..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#c4d626]"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#c4d626]"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Withdrawals Table */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  {statusFilter === "all" ? "All Withdrawals" : statusFilter === "pending" ? "Pending Withdrawals" : statusFilter === "completed" ? "Completed Withdrawals" : "Withdrawals"}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reference ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Account Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Requested
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
                        <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                          Loading withdrawals...
                        </td>
                      </tr>
                    ) : filteredWithdrawals.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                          No withdrawals found
                        </td>
                      </tr>
                    ) : (
                      filteredWithdrawals.map((withdrawal) => (
                        <tr key={withdrawal.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono text-gray-900">{withdrawal.referenceId || withdrawal.id.slice(0, 8)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-[#c4d626] rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-[#0c3a30]" />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{withdrawal.userName}</div>
                                <div className="text-sm text-gray-500">{withdrawal.userEmail}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            {withdrawal.amountFormatted}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {withdrawal.method}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {withdrawal.accountDetails.type === "Crypto" ? (
                              <div>
                                <div className="text-sm text-gray-900">{withdrawal.accountDetails.network}</div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">{withdrawal.accountDetails.address}</div>
                              </div>
                            ) : (
                              <div>
                                <div className="text-sm text-gray-900">{withdrawal.accountDetails.account}</div>
                                <div className="text-sm text-gray-500">{withdrawal.accountDetails.bank}</div>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {withdrawal.created}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                withdrawal.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : withdrawal.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : withdrawal.status === "processing"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-red-100 text-red-800"
                              }`}
                            >
                              {withdrawal.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {withdrawal.status === "pending" && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleViewWithdrawal(withdrawal)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedWithdrawal(withdrawal)
                                    setApproveDialogOpen(true)
                                  }}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedWithdrawal(withdrawal)
                                    setRejectDialogOpen(true)
                                  }}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            {withdrawal.status !== "pending" && (
                              <button
                                onClick={() => handleViewWithdrawal(withdrawal)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View
                              </button>
                            )}
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

      {/* View Withdrawal Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Withdrawal Details
            </DialogTitle>
            <DialogDescription>Complete information about this withdrawal request</DialogDescription>
          </DialogHeader>

          {selectedWithdrawal && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Reference ID</label>
                  <p className="text-sm font-mono text-gray-900">{selectedWithdrawal.referenceId || selectedWithdrawal.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedWithdrawal.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : selectedWithdrawal.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedWithdrawal.status}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">User Information</label>
                <p className="text-sm text-gray-900">{selectedWithdrawal.userName}</p>
                <p className="text-sm text-gray-500">{selectedWithdrawal.userEmail}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Amount</label>
                  <p className="text-lg font-bold text-gray-900">{selectedWithdrawal.amountFormatted}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Method</label>
                  <p className="text-sm text-gray-900">{selectedWithdrawal.method}</p>
                </div>
              </div>

              {selectedWithdrawal.withdrawalType === "crypto" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Crypto Details</label>
                  <p className="text-sm text-gray-900">Type: {selectedWithdrawal.crypto_type || "N/A"}</p>
                  <p className="text-sm text-gray-900">Network: {selectedWithdrawal.crypto_network || "N/A"}</p>
                  <p className="text-sm text-gray-900 break-all">Address: {selectedWithdrawal.crypto_wallet_address || "N/A"}</p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Bank Details</label>
                  <p className="text-sm text-gray-900">Recipient: {selectedWithdrawal.recipient_name || "N/A"}</p>
                  <p className="text-sm text-gray-900">Account: {selectedWithdrawal.recipient_account_number ? `****${selectedWithdrawal.recipient_account_number.slice(-4)}` : "N/A"}</p>
                  <p className="text-sm text-gray-900">Bank: {selectedWithdrawal.recipient_bank_name || "N/A"}</p>
                  {selectedWithdrawal.recipient_routing_number && (
                    <p className="text-sm text-gray-900">Routing: {selectedWithdrawal.recipient_routing_number}</p>
                  )}
                </div>
              )}

              {selectedWithdrawal.fee > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Fee</label>
                  <p className="text-sm text-gray-900">${selectedWithdrawal.fee.toFixed(2)}</p>
                </div>
              )}

              {selectedWithdrawal.rejection_reason && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Rejection Reason</label>
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{selectedWithdrawal.rejection_reason}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Requested Date</label>
                <p className="text-sm text-gray-900">
                  {selectedWithdrawal.created || new Date(selectedWithdrawal.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                setViewDialogOpen(false)
                setSelectedWithdrawal(null)
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            {selectedWithdrawal?.status === "pending" && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setViewDialogOpen(false)
                    setApproveDialogOpen(true)
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewDialogOpen(false)
                    setRejectDialogOpen(true)
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Withdrawal Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Approve Withdrawal
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this withdrawal? The amount will be deducted from the user's account.
            </DialogDescription>
          </DialogHeader>

          {selectedWithdrawal && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Reference ID:</span>
                  <span className="text-sm font-mono text-gray-900">{selectedWithdrawal.referenceId || selectedWithdrawal.id.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">User:</span>
                  <span className="text-sm text-gray-900">{selectedWithdrawal.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Amount:</span>
                  <span className="text-sm font-bold text-green-600">{selectedWithdrawal.amountFormatted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Method:</span>
                  <span className="text-sm text-gray-900">{selectedWithdrawal.method}</span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs text-green-800">
                  <strong>Note:</strong> This will deduct {selectedWithdrawal.amountFormatted} from the user's wallet balance and process the withdrawal.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                setApproveDialogOpen(false)
                setSelectedWithdrawal(null)
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={isProcessing}
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  Approve Withdrawal
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Withdrawal Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Reject Withdrawal
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this withdrawal request.
            </DialogDescription>
          </DialogHeader>

          {selectedWithdrawal && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Reference ID:</span>
                  <span className="text-sm font-mono text-gray-900">{selectedWithdrawal.referenceId || selectedWithdrawal.id.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Amount:</span>
                  <span className="text-sm font-bold text-gray-900">{selectedWithdrawal.amountFormatted}</span>
                </div>
              </div>

              <div>
                <Label htmlFor="rejectReason" className="mb-2">
                  Rejection Reason *
                </Label>
                <Textarea
                  id="rejectReason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  rows={4}
                  className="w-full"
                  required
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                setRejectDialogOpen(false)
                setSelectedWithdrawal(null)
                setRejectReason("")
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReject}
              disabled={isProcessing || !rejectReason.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 inline mr-2" />
                  Reject Withdrawal
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
