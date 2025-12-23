"use client"

import { useState, useEffect } from "react"
import { DollarSign, CheckCircle, XCircle, Eye, Download, Search, Filter, Clock, User, FileText, Home, Car, Building2, Users, CreditCard, Heart } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const loanTypeIcons: { [key: string]: any } = {
  "Personal Home Loans": Home,
  "Automobile Loans": Car,
  "Business Loans": Building2,
  "Joint Mortgage": Users,
  "Secured Overdraft": CreditCard,
  "Health Finance": Heart,
}

export default function AdminLoansPage() {
  const supabase = createClient()
  const [loans, setLoans] = useState<any[]>([])
  const [filteredLoans, setFilteredLoans] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("pending")
  const [selectedLoan, setSelectedLoan] = useState<any>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLoans()
  }, [])

  useEffect(() => {
    filterLoans()
  }, [loans, searchTerm, statusFilter])

  const loadLoans = async () => {
    try {
      setLoading(true)
      const { data: loansData, error } = await supabase
        .from("loans")
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading loans:", error)
        return
      }

      // Transform data to include user info
      const loansWithUserInfo = loansData?.map((loan: any) => ({
        ...loan,
        id: loan.id,
        userId: loan.user_id,
        userName: loan.profiles
          ? `${loan.profiles.first_name || ""} ${loan.profiles.last_name || ""}`.trim() || "Unknown User"
          : "Unknown User",
        userEmail: loan.profiles?.email || "Unknown Email",
        loanType: loan.loan_type,
        amount: parseFloat(loan.amount),
        purpose: loan.purpose,
        status: loan.status,
        submittedAt: loan.created_at,
        employmentStatus: loan.employment_status,
        annualIncome: loan.annual_income ? parseFloat(loan.annual_income) : null,
        creditScore: loan.credit_score,
        rejectionReason: loan.rejection_reason,
        reviewedBy: loan.reviewed_by,
        reviewedAt: loan.reviewed_at,
      })) || []

      setLoans(loansWithUserInfo)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterLoans = () => {
    let filtered = loans

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((loan) => loan.status === statusFilter)
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (loan) =>
          loan.id?.toLowerCase().includes(searchLower) ||
          loan.userName?.toLowerCase().includes(searchLower) ||
          loan.userEmail?.toLowerCase().includes(searchLower) ||
          loan.loanType?.toLowerCase().includes(searchLower) ||
          loan.amount?.toString().includes(searchLower)
      )
    }

    // Sort by submission date (newest first)
    filtered.sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime())

    setFilteredLoans(filtered)
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

  const handleApproveLoan = async () => {
    if (!selectedLoan) return

    setIsProcessing(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert("You must be logged in to approve loans")
        return
      }

      // Update loan status in database
      const { error: updateError } = await supabase
        .from("loans")
        .update({
          status: "approved",
          approval_date: new Date().toISOString().split("T")[0],
          disbursement_date: new Date().toISOString().split("T")[0],
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", selectedLoan.id)

      if (updateError) {
        console.error("Error updating loan:", updateError)
        alert("Error approving loan. Please try again.")
        return
      }

      // Update user balance
      const { data: profile } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", selectedLoan.userId)
        .single()

      if (profile) {
        const newBalance = (parseFloat(profile.balance || "0") + selectedLoan.amount).toFixed(2)
        await supabase
          .from("profiles")
          .update({ balance: newBalance })
          .eq("id", selectedLoan.userId)
      }

      // Create transaction record
      await supabase.from("transactions").insert({
        user_id: selectedLoan.userId,
        transaction_type: "loan_disbursement",
        amount: selectedLoan.amount,
        status: "completed",
        description: `${selectedLoan.loanType} - Loan Approved and Disbursed`,
        reference_number: `LOAN-${selectedLoan.id.slice(0, 8)}`,
      })

      // Send email notification
      await sendEmail(
        selectedLoan.userEmail,
        "Loan Application Approved",
        "loan_approved",
        {
          userName: selectedLoan.userName,
          loanType: selectedLoan.loanType,
          amount: selectedLoan.amount,
          loanId: selectedLoan.id,
        }
      )

      setSuccessMessage(`Loan of $${selectedLoan.amount.toLocaleString()} has been approved and disbursed to user's account`)
      setApproveDialogOpen(false)
      setSelectedLoan(null)

      // Reload loans
      await loadLoans()

      setTimeout(() => {
        setSuccessMessage("")
      }, 5000)
    } catch (error) {
      console.error("Error:", error)
      alert("Error approving loan. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectLoan = async () => {
    if (!selectedLoan || !rejectReason.trim()) {
      alert("Please provide a reason for rejection")
      return
    }

    setIsProcessing(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert("You must be logged in to reject loans")
        return
      }

      // Update loan status in database
      const { error: updateError } = await supabase
        .from("loans")
        .update({
          status: "rejected",
          rejection_reason: rejectReason,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", selectedLoan.id)

      if (updateError) {
        console.error("Error updating loan:", updateError)
        alert("Error rejecting loan. Please try again.")
        return
      }

      // Send email notification
      await sendEmail(
        selectedLoan.userEmail,
        "Loan Application Rejected",
        "loan_rejected",
        {
          userName: selectedLoan.userName,
          loanType: selectedLoan.loanType,
          amount: selectedLoan.amount,
          loanId: selectedLoan.id,
          rejectionReason: rejectReason,
        }
      )

      setSuccessMessage(`Loan request has been rejected`)
      setRejectDialogOpen(false)
      setSelectedLoan(null)
      setRejectReason("")

      // Reload loans
      await loadLoans()

      setTimeout(() => {
        setSuccessMessage("")
      }, 5000)
    } catch (error) {
      console.error("Error:", error)
      alert("Error rejecting loan. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleViewLoan = (loan: any) => {
    setSelectedLoan(loan)
    setViewDialogOpen(true)
  }

  const pendingCount = loans.filter((l) => l.status === "pending").length
  const approvedCount = loans.filter((l) => l.status === "approved").length
  const rejectedCount = loans.filter((l) => l.status === "rejected").length
  const totalPendingAmount = loans
    .filter((l) => l.status === "pending")
    .reduce((sum, l) => sum + (l.amount || 0), 0)

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
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">SERVICES</p>
              <a
                href="/admin/loans"
                className="flex items-center px-3 py-2 text-sm font-medium text-white bg-[#c4d626] rounded-md mb-1"
              >
                <FileText className="w-4 h-4 mr-3" />
                Loan Management
              </a>
              <a
                href="/admin/tax-refunds"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md mb-1"
              >
                <FileText className="w-4 h-4 mr-3" />
                Tax Refund Management
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
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <header className="bg-white shadow-sm border-b">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Loan Request Management</h1>
                  <p className="text-sm text-gray-500">Review and manage loan applications</p>
                </div>
                <button className="bg-[#c4d626] text-[#0c3a30] px-4 py-2 rounded-md font-medium hover:bg-[#a8b821] transition-colors">
                  <Download className="w-4 h-4 inline mr-2" />
                  Export Loans
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

            {/* Loan Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending Requests</p>
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
                    <p className="text-sm font-medium text-gray-500">Approved</p>
                    <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Rejected</p>
                    <p className="text-2xl font-bold text-gray-900">{rejectedCount}</p>
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
                    <p className="text-2xl font-bold text-gray-900">${totalPendingAmount.toLocaleString()}</p>
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
                    placeholder="Search by loan ID, user, loan type, amount..."
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
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Loans Table */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  {statusFilter === "all" ? "All Loan Requests" : statusFilter === "pending" ? "Pending Requests" : statusFilter === "approved" ? "Approved Loans" : "Rejected Loans"}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Loan ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Loan Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Purpose
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
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                          Loading loans...
                        </td>
                      </tr>
                    ) : filteredLoans.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                          No loan requests found
                        </td>
                      </tr>
                    ) : (
                      filteredLoans.map((loan) => {
                        const LoanIcon = loanTypeIcons[loan.loanType] || FileText
                        return (
                          <tr key={loan.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-mono text-gray-900">LOAN-{loan.id.slice(0, 8)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-[#c4d626] rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-[#0c3a30]" />
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">{loan.userName}</div>
                                  <div className="text-sm text-gray-500">{loan.userEmail}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <LoanIcon className="w-4 h-4 mr-2 text-gray-500" />
                                <span className="text-sm text-gray-900">{loan.loanType}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                              ${loan.amount?.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loan.purpose || "N/A"}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {loan.submittedAt ? new Date(loan.submittedAt).toLocaleDateString() : "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  loan.status === "approved"
                                    ? "bg-green-100 text-green-800"
                                    : loan.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {loan.status || "pending"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {loan.status === "pending" && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleViewLoan(loan)}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    View
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedLoan(loan)
                                      setApproveDialogOpen(true)
                                    }}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedLoan(loan)
                                      setRejectDialogOpen(true)
                                    }}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                              {loan.status === "approved" && (
                                <span className="text-green-600 text-xs">Approved</span>
                              )}
                              {loan.status === "rejected" && (
                                <span className="text-red-600 text-xs">Rejected</span>
                              )}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* View Loan Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Loan Request Details
            </DialogTitle>
            <DialogDescription>
              Complete information about this loan request
            </DialogDescription>
          </DialogHeader>
          
          {selectedLoan && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Loan ID</label>
                  <p className="text-sm font-mono text-gray-900">LOAN-{selectedLoan.id?.slice(0, 8)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedLoan.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : selectedLoan.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}>
                    {selectedLoan.status}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">User Information</label>
                <p className="text-sm text-gray-900">{selectedLoan.userName}</p>
                <p className="text-sm text-gray-500">{selectedLoan.userEmail}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Loan Type</label>
                  <p className="text-sm text-gray-900">{selectedLoan.loanType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Loan Amount</label>
                  <p className="text-lg font-bold text-gray-900">${selectedLoan.amount?.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Purpose</label>
                <p className="text-sm text-gray-900">{selectedLoan.purpose || "N/A"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Employment Status</label>
                  <p className="text-sm text-gray-900">{selectedLoan.employmentStatus || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Annual Income</label>
                  <p className="text-sm text-gray-900">${selectedLoan.annualIncome?.toLocaleString() || "N/A"}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Credit Score</label>
                <p className="text-sm text-gray-900">{selectedLoan.creditScore || "N/A"}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Submitted Date</label>
                <p className="text-sm text-gray-900">
                  {selectedLoan.submittedAt ? new Date(selectedLoan.submittedAt).toLocaleString() : "N/A"}
                </p>
              </div>
              {selectedLoan.rejectionReason && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Rejection Reason</label>
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{selectedLoan.rejectionReason}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                setViewDialogOpen(false)
                setSelectedLoan(null)
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            {selectedLoan?.status === "pending" && (
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

      {/* Approve Loan Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Approve Loan
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this loan? The amount will be disbursed to the user's account.
            </DialogDescription>
          </DialogHeader>
          
          {selectedLoan && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Loan ID:</span>
                  <span className="text-sm font-mono text-gray-900">LOAN-{selectedLoan.id?.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">User:</span>
                  <span className="text-sm text-gray-900">{selectedLoan.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Loan Type:</span>
                  <span className="text-sm text-gray-900">{selectedLoan.loanType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Amount:</span>
                  <span className="text-sm font-bold text-green-600">${selectedLoan.amount?.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs text-green-800">
                  <strong>Note:</strong> This will disburse ${selectedLoan.amount?.toLocaleString()} to the user's wallet balance immediately.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                setApproveDialogOpen(false)
                setSelectedLoan(null)
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApproveLoan}
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
                  Approve Loan
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Loan Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Reject Loan
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this loan request.
            </DialogDescription>
          </DialogHeader>
          
          {selectedLoan && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Loan ID:</span>
                  <span className="text-sm font-mono text-gray-900">LOAN-{selectedLoan.id?.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Amount:</span>
                  <span className="text-sm font-bold text-gray-900">${selectedLoan.amount?.toLocaleString()}</span>
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
                setSelectedLoan(null)
                setRejectReason("")
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRejectLoan}
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
                  Reject Loan
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
