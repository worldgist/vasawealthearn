"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { DollarSign, CheckCircle, XCircle, Eye, Download, Search, Filter, Clock, User, FileText, Image as ImageIcon, Mail, Bell } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function AdminDepositsPage() {
  const supabase = createClient()
  const { toast } = useToast()
  const [deposits, setDeposits] = useState<any[]>([])
  const [filteredDeposits, setFilteredDeposits] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("pending")
  const [selectedDeposit, setSelectedDeposit] = useState<any>(null)
  const [viewReceiptDialogOpen, setViewReceiptDialogOpen] = useState(false)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDeposits()
  }, [])

  useEffect(() => {
    filterDeposits()
  }, [deposits, searchTerm, statusFilter])

  const loadDeposits = async () => {
    try {
      setIsLoading(true)
      const { data: depositsData, error } = await supabase
        .from("deposits")
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
        console.error("Error loading deposits:", error)
        toast({
          title: "Error",
          description: "Failed to load deposits.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Transform data to match expected format
      const transformedDeposits = (depositsData || []).map((deposit: any) => ({
        id: deposit.id,
        userId: deposit.user_id,
        userName: deposit.profiles
          ? `${deposit.profiles.first_name || ""} ${deposit.profiles.last_name || ""}`.trim()
          : "Unknown User",
        userEmail: deposit.profiles?.email || "Unknown",
        amount: `$${Number(deposit.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        amountValue: Number(deposit.amount),
        paymentMethod: deposit.deposit_type || "Wire",
        network: deposit.deposit_type || "Bitcoin",
        referenceId: deposit.reference_number,
        receiptUrl: deposit.check_front_image_url,
        receiptFileName: deposit.check_front_image_url ? "Receipt" : null,
        status: deposit.status === "pending" ? "pending" : deposit.status === "completed" ? "completed" : "failed",
        created: new Date(deposit.created_at).toLocaleString(),
        timestamp: new Date(deposit.created_at).getTime(),
        description: deposit.description,
        depositId: deposit.id,
      }))

      setDeposits(transformedDeposits)
    } catch (error) {
      console.error("Error loading deposits:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterDeposits = () => {
    let filtered = deposits

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((deposit) => deposit.status === statusFilter)
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (deposit) =>
          deposit.referenceId?.toLowerCase().includes(searchLower) ||
          deposit.userName?.toLowerCase().includes(searchLower) ||
          deposit.userEmail?.toLowerCase().includes(searchLower) ||
          deposit.amount?.toLowerCase().includes(searchLower) ||
          deposit.paymentMethod?.toLowerCase().includes(searchLower)
      )
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))

    setFilteredDeposits(filtered)
  }

  const sendPushNotification = (userId: string, title: string, message: string) => {
    // Get existing notifications
    const notifications = JSON.parse(localStorage.getItem("notifications") || "[]")
    
    // Create new notification
    const notification = {
      id: `NOTIF-${Date.now()}`,
      userId: userId,
      type: "transaction",
      title: title,
      message: message,
      timestamp: new Date().toISOString(),
      read: false,
      priority: "high",
      starred: false,
    }

    // Add to notifications
    notifications.unshift(notification)
    localStorage.setItem("notifications", JSON.stringify(notifications))

    // Trigger browser notification if permission granted
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body: message,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: `deposit-${userId}`,
      })
    } else if ("Notification" in window && Notification.permission !== "denied") {
      // Request permission
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, {
            body: message,
            icon: "/favicon.ico",
            badge: "/favicon.ico",
            tag: `deposit-${userId}`,
          })
        }
      })
    }

    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent("notification", { detail: notification }))
  }

  const sendEmailNotification = async (userEmail: string, userName: string, amount: string, referenceId: string, status: "approved" | "rejected", rejectionReason?: string, depositData?: any) => {
    try {
      const emailData: any = {
        to: userEmail,
        subject:
          status === "approved"
            ? `Deposit Approved - ${amount} Credited to Your Account`
            : `Deposit Rejected - Reference: ${referenceId}`,
        template: status === "approved" ? "deposit-approved" : "deposit-rejected",
        data: {
          userName,
          name: userName,
          amount,
          amountValue: depositData?.amountValue || parseFloat(amount.replace(/[^0-9.]/g, "") || "0"),
          referenceId,
          rejectionReason,
          transactionType: depositData?.paymentMethod || "Deposit",
          paymentMethod: depositData?.paymentMethod || "N/A",
        },
      }

      // Include receipt for approved deposits
      if (status === "approved" && depositData) {
        emailData.includeReceipt = true
        emailData.receiptType = "deposit"
        emailData.data.date = new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC"
        emailData.data.status = "Completed"
        emailData.data.transactionId = referenceId
      }

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      })

      if (!response.ok) {
        console.error("Failed to send email")
      }
    } catch (error) {
      console.error("Error sending email:", error)
      // Continue even if email fails
    }
  }

  const handleApproveDeposit = async () => {
    if (!selectedDeposit) return

    setIsProcessing(true)

    try {
      const {
        data: { user: adminUser },
      } = await supabase.auth.getUser()

      const amount = selectedDeposit.amountValue || Number.parseFloat(selectedDeposit.amount?.replace("$", "").replace(/,/g, "") || "0")

      if (amount <= 0) {
        toast({
          title: "Error",
          description: "Invalid deposit amount",
          variant: "destructive",
        })
        setIsProcessing(false)
        return
      }

      // Update deposit status to completed
      const { error: depositError } = await supabase
        .from("deposits")
        .update({
            status: "completed",
          processed_date: new Date().toISOString(),
        })
        .eq("id", selectedDeposit.depositId)

      if (depositError) {
        throw depositError
      }

      // Update transaction status to completed
      const { error: transactionError } = await supabase
        .from("transactions")
        .update({
          status: "completed",
        })
        .eq("reference_id", selectedDeposit.referenceId)
        .eq("user_id", selectedDeposit.userId)

      if (transactionError) {
        console.error("Error updating transaction:", transactionError)
      }

      // Update user balance
      const { data: profile } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", selectedDeposit.userId)
        .single()

      if (profile) {
        const currentBalance = Number(profile.balance) || 0
      const newBalance = currentBalance + amount

        await supabase
          .from("profiles")
          .update({ balance: newBalance })
          .eq("id", selectedDeposit.userId)
      }

      // Send push notification
      sendPushNotification(
        selectedDeposit.userId,
        "Deposit Approved",
        `Your deposit of ${selectedDeposit.amount} has been approved and credited to your account.`
      )

      // Send email notification with receipt
      await sendEmailNotification(
        selectedDeposit.userEmail,
        selectedDeposit.userName,
        selectedDeposit.amount,
        selectedDeposit.referenceId,
        "approved",
        undefined,
        selectedDeposit
      )

      // Reload deposits
      await loadDeposits()

      toast({
        title: "Success",
        description: `Deposit of ${selectedDeposit.amount} has been approved and user has been notified via email.`,
      })

      setApproveDialogOpen(false)
      setSelectedDeposit(null)
    } catch (error) {
      console.error("Error approving deposit:", error)
      toast({
        title: "Error",
        description: "Failed to approve deposit. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectDeposit = async () => {
    if (!selectedDeposit || !rejectReason.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Update deposit status to failed
      const { error: depositError } = await supabase
        .from("deposits")
        .update({
            status: "failed",
        })
        .eq("id", selectedDeposit.depositId)

      if (depositError) {
        throw depositError
      }

      // Update transaction status to failed
      const { error: transactionError } = await supabase
        .from("transactions")
        .update({
          status: "failed",
        })
        .eq("reference_id", selectedDeposit.referenceId)
        .eq("user_id", selectedDeposit.userId)

      if (transactionError) {
        console.error("Error updating transaction:", transactionError)
      }

      // Send push notification
      sendPushNotification(
        selectedDeposit.userId,
        "Deposit Rejected",
        `Your deposit of ${selectedDeposit.amount} has been rejected. Please check your email for details.`
      )

      // Send email notification
      await sendEmailNotification(
        selectedDeposit.userEmail,
        selectedDeposit.userName,
        selectedDeposit.amount,
        selectedDeposit.referenceId,
        "rejected",
        rejectReason
      )

      // Reload deposits
      await loadDeposits()

      toast({
        title: "Success",
        description: `Deposit of ${selectedDeposit.amount} has been rejected and user has been notified via email.`,
      })

      setRejectDialogOpen(false)
      setSelectedDeposit(null)
      setRejectReason("")
    } catch (error) {
      console.error("Error rejecting deposit:", error)
      toast({
        title: "Error",
        description: "Failed to reject deposit. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleViewReceipt = (deposit: any) => {
    setSelectedDeposit(deposit)
    setViewReceiptDialogOpen(true)
  }

  const pendingCount = deposits.filter((d) => d.status === "pending").length
  const completedCount = deposits.filter((d) => d.status === "completed").length
  const totalPendingAmount = deposits
    .filter((d) => d.status === "pending")
    .reduce((sum, d) => {
      const amountStr = d.amount?.replace("$", "").replace(/,/g, "") || "0"
      return sum + Number.parseFloat(amountStr)
    }, 0)

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
                className="flex items-center px-3 py-2 text-sm font-medium text-white bg-[#c4d626] rounded-md mb-1"
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
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                Crypto Management
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
                  <h1 className="text-2xl font-bold text-gray-900">Deposit Management</h1>
                  <p className="text-sm text-gray-500">Review and verify user deposits</p>
                </div>
                <button className="bg-[#c4d626] text-[#0c3a30] px-4 py-2 rounded-md font-medium hover:bg-[#a8b821] transition-colors">
                  <Download className="w-4 h-4 inline mr-2" />
                  Export Deposits
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

            {/* Deposit Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending Verification</p>
                    <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Completed Deposits</p>
                    <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending Amount</p>
                    <p className="text-2xl font-bold text-gray-900">${totalPendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
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
                    placeholder="Search by reference ID, user, amount..."
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
                  <option value="completed">Completed</option>
                  <option value="failed">Rejected</option>
                </select>
              </div>
            </div>

            {/* Deposits Table */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  {statusFilter === "all" ? "All Deposits" : statusFilter === "pending" ? "Pending Deposits" : statusFilter === "completed" ? "Completed Deposits" : "Rejected Deposits"}
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
                        Receipt
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
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
                          Loading deposits...
                        </td>
                      </tr>
                    ) : filteredDeposits.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                          No deposits found
                        </td>
                      </tr>
                    ) : (
                      filteredDeposits.map((deposit) => (
                        <tr key={deposit.id || deposit.referenceId}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono text-gray-900">{deposit.referenceId || deposit.id}</div>
                          </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-[#c4d626] rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-[#0c3a30]" />
                          </div>
                          <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{deposit.userName}</div>
                                <div className="text-sm text-gray-500">{deposit.userEmail}</div>
                          </div>
                        </div>
                      </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{deposit.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                              {deposit.paymentMethod || deposit.network || "Bitcoin"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                            {deposit.receiptUrl || deposit.receiptFileName || deposit.file ? (
                              <button
                                onClick={() => handleViewReceipt(deposit)}
                                className="text-[#c4d626] hover:text-[#a8b821] text-sm flex items-center gap-1"
                              >
                                <Eye className="w-4 h-4" />
                                View Receipt
                              </button>
                            ) : (
                              <span className="text-sm text-gray-400">No receipt</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {deposit.created || new Date(deposit.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                deposit.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : deposit.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {deposit.status || "pending"}
                            </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {deposit.status === "pending" && (
                        <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedDeposit(deposit)
                                    setApproveDialogOpen(true)
                                  }}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedDeposit(deposit)
                                    setRejectDialogOpen(true)
                                  }}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Reject
                                </button>
                        </div>
                            )}
                            {deposit.status === "completed" && (
                              <span className="text-green-600 text-xs">Approved</span>
                            )}
                            {deposit.status === "failed" && (
                              <span className="text-red-600 text-xs">Rejected</span>
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

      {/* View Receipt Dialog */}
      <Dialog open={viewReceiptDialogOpen} onOpenChange={setViewReceiptDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Deposit Receipt
            </DialogTitle>
            <DialogDescription>
              View the payment receipt uploaded by the user
            </DialogDescription>
          </DialogHeader>
          
          {selectedDeposit && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Reference ID:</span>
                  <span className="text-sm font-mono text-gray-900">{selectedDeposit.referenceId || selectedDeposit.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Amount:</span>
                  <span className="text-sm font-bold text-gray-900">{selectedDeposit.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Payment Method:</span>
                  <span className="text-sm text-gray-900">{selectedDeposit.paymentMethod || selectedDeposit.network || "Bitcoin"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">User:</span>
                  <span className="text-sm text-gray-900">{selectedDeposit.userName} ({selectedDeposit.userEmail})</span>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                {selectedDeposit.receiptUrl ? (
                  <div className="space-y-4">
                    {selectedDeposit.receiptUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) || 
                     selectedDeposit.receiptUrl.startsWith('data:image') ? (
                  <div>
                      <img
                        src={selectedDeposit.receiptUrl}
                        alt="Receipt"
                          className="max-w-full h-auto mx-auto rounded-lg border shadow-sm"
                        />
                        <div className="mt-4">
                          <a
                            href={selectedDeposit.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-[#c4d626] text-[#0c3a30] rounded-md hover:bg-[#a8b821]"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Receipt
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <FileText className="h-16 w-16 text-gray-400 mx-auto" />
                        <p className="text-sm text-gray-600">Receipt file: {selectedDeposit.receiptFileName || selectedDeposit.file || "Receipt"}</p>
                        <a
                          href={selectedDeposit.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="inline-flex items-center px-4 py-2 bg-[#c4d626] text-[#0c3a30] rounded-md hover:bg-[#a8b821]"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Receipt
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">No receipt uploaded</p>
                    <p className="text-xs text-gray-500">The user has not uploaded a receipt for this deposit</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                setViewReceiptDialogOpen(false)
                setSelectedDeposit(null)
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Deposit Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Approve Deposit
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this deposit? The amount will be credited to the user's account.
            </DialogDescription>
          </DialogHeader>
          
          {selectedDeposit && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Reference ID:</span>
                  <span className="text-sm font-mono text-gray-900">{selectedDeposit.referenceId || selectedDeposit.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">User:</span>
                  <span className="text-sm text-gray-900">{selectedDeposit.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Amount:</span>
                  <span className="text-sm font-bold text-green-600">{selectedDeposit.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Payment Method:</span>
                  <span className="text-sm text-gray-900">{selectedDeposit.paymentMethod || selectedDeposit.network || "Bitcoin"}</span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs text-green-800 mb-2">
                  <strong>Note:</strong> This will credit {selectedDeposit.amount} to the user's wallet balance immediately.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start">
                  <Bell className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-blue-800 mb-1">Notifications will be sent:</p>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li className="flex items-center">
                        <Bell className="w-3 h-3 mr-1" />
                        Push notification to user's device
                      </li>
                      <li className="flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        Email notification to {selectedDeposit.userEmail || "user@example.com"}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                setApproveDialogOpen(false)
                setSelectedDeposit(null)
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApproveDeposit}
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
                  Approve & Notify
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Deposit Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Reject Deposit
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this deposit.
            </DialogDescription>
          </DialogHeader>
          
          {selectedDeposit && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Reference ID:</span>
                  <span className="text-sm font-mono text-gray-900">{selectedDeposit.referenceId || selectedDeposit.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Amount:</span>
                  <span className="text-sm font-bold text-gray-900">{selectedDeposit.amount}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rejection Reason *
                </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
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
                setSelectedDeposit(null)
                setRejectReason("")
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRejectDeposit}
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
                  Reject Deposit
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
