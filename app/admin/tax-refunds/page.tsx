"use client"

import { useState, useEffect } from "react"
import { DollarSign, CheckCircle, XCircle, Eye, Download, Search, Filter, Clock, User, FileText, Shield, AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function AdminTaxRefundsPage() {
  const [taxRefunds, setTaxRefunds] = useState<any[]>([])
  const [filteredTaxRefunds, setFilteredTaxRefunds] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("submitted")
  const [selectedRefund, setSelectedRefund] = useState<any>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    loadTaxRefunds()
  }, [])

  useEffect(() => {
    filterTaxRefunds()
  }, [taxRefunds, searchTerm, statusFilter])

  const loadTaxRefunds = () => {
    // Load tax refunds from localStorage
    const savedRefunds = JSON.parse(localStorage.getItem("taxRefundRequests") || "[]")
    
    // If no refunds exist, create sample data
    if (savedRefunds.length === 0) {
      const sampleRefunds = [
        {
          id: "TAX-001",
          userId: "user-001",
          userName: "Strange William Booth",
          userEmail: "wbooth1945@gmail.com",
          fullName: "Strange William Booth",
          ssn: "123-45-6789",
          idmeEmail: "wbooth1945@gmail.com",
          country: "United States",
          taxYear: 2023,
          refundAmount: 2500,
          status: "submitted",
          submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "TAX-002",
          userId: "user-002",
          userName: "John Doe",
          userEmail: "john.doe@example.com",
          fullName: "John Doe",
          ssn: "987-65-4321",
          idmeEmail: "john.doe@example.com",
          country: "United States",
          taxYear: 2023,
          refundAmount: 1800,
          status: "submitted",
          submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]
      setTaxRefunds(sampleRefunds)
      localStorage.setItem("taxRefundRequests", JSON.stringify(sampleRefunds))
    } else {
      setTaxRefunds(savedRefunds)
    }
  }

  const filterTaxRefunds = () => {
    let filtered = taxRefunds

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((refund) => refund.status === statusFilter)
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (refund) =>
          refund.id?.toLowerCase().includes(searchLower) ||
          refund.userName?.toLowerCase().includes(searchLower) ||
          refund.userEmail?.toLowerCase().includes(searchLower) ||
          refund.fullName?.toLowerCase().includes(searchLower) ||
          refund.ssn?.toLowerCase().includes(searchLower) ||
          refund.refundAmount?.toString().includes(searchLower)
      )
    }

    // Sort by submission date (newest first)
    filtered.sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime())

    setFilteredTaxRefunds(filtered)
  }

  const handleApproveRefund = async () => {
    if (!selectedRefund) return

    setIsProcessing(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update refund status
      const updatedRefunds = taxRefunds.map((refund) => {
        if (refund.id === selectedRefund.id) {
          return {
            ...refund,
            status: "approved",
            approvedAt: new Date().toISOString(),
            approvedBy: "Admin",
          }
        }
        return refund
      })

      setTaxRefunds(updatedRefunds)
      localStorage.setItem("taxRefundRequests", JSON.stringify(updatedRefunds))

      // Create transaction record
      const transaction = {
        id: `TXN-TAX-${Date.now().toString().slice(-8)}`,
        amount: `$${selectedRefund.refundAmount.toLocaleString()}`,
        type: "Tax Refund",
        status: "completed",
        referenceId: selectedRefund.id,
        description: `IRS Tax Refund - ${selectedRefund.taxYear}`,
        scope: "Incoming",
        created: new Date().toLocaleString(),
        timestamp: Date.now(),
      }

      const existingTransactions = JSON.parse(localStorage.getItem("transactions") || "[]")
      existingTransactions.unshift(transaction)
      localStorage.setItem("transactions", JSON.stringify(existingTransactions))

      // Credit refund amount to user wallet
      const currentBalance = Number.parseFloat(localStorage.getItem("walletBalance") || "102864.00")
      const newBalance = currentBalance + selectedRefund.refundAmount
      localStorage.setItem("walletBalance", newBalance.toString())

      setSuccessMessage(`Tax refund of $${selectedRefund.refundAmount.toLocaleString()} has been approved and credited to user's account`)
      setApproveDialogOpen(false)
      setSelectedRefund(null)

      setTimeout(() => {
        setSuccessMessage("")
      }, 5000)
    } catch (error) {
      alert("Error approving tax refund. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectRefund = async () => {
    if (!selectedRefund || !rejectReason.trim()) {
      alert("Please provide a reason for rejection")
      return
    }

    setIsProcessing(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update refund status
      const updatedRefunds = taxRefunds.map((refund) => {
        if (refund.id === selectedRefund.id) {
          return {
            ...refund,
            status: "rejected",
            rejectedAt: new Date().toISOString(),
            rejectedBy: "Admin",
            rejectReason: rejectReason,
          }
        }
        return refund
      })

      setTaxRefunds(updatedRefunds)
      localStorage.setItem("taxRefundRequests", JSON.stringify(updatedRefunds))

      setSuccessMessage(`Tax refund request has been rejected`)
      setRejectDialogOpen(false)
      setSelectedRefund(null)
      setRejectReason("")

      setTimeout(() => {
        setSuccessMessage("")
      }, 5000)
    } catch (error) {
      alert("Error rejecting tax refund. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleViewRefund = (refund: any) => {
    setSelectedRefund(refund)
    setViewDialogOpen(true)
  }

  const submittedCount = taxRefunds.filter((r) => r.status === "submitted").length
  const approvedCount = taxRefunds.filter((r) => r.status === "approved").length
  const rejectedCount = taxRefunds.filter((r) => r.status === "rejected").length
  const totalSubmittedAmount = taxRefunds
    .filter((r) => r.status === "submitted")
    .reduce((sum, r) => sum + (r.refundAmount || 0), 0)

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
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md mb-1"
              >
                <FileText className="w-4 h-4 mr-3" />
                Loan Management
              </a>
              <a
                href="/admin/tax-refunds"
                className="flex items-center px-3 py-2 text-sm font-medium text-white bg-[#c4d626] rounded-md mb-1"
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
                  <h1 className="text-2xl font-bold text-gray-900">IRS Tax Refund Management</h1>
                  <p className="text-sm text-gray-500">Review and manage tax refund requests</p>
                </div>
                <button className="bg-[#c4d626] text-[#0c3a30] px-4 py-2 rounded-md font-medium hover:bg-[#a8b821] transition-colors">
                  <Download className="w-4 h-4 inline mr-2" />
                  Export Refunds
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

            {/* Tax Refund Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Submitted</p>
                    <p className="text-2xl font-bold text-gray-900">{submittedCount}</p>
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
                    <p className="text-2xl font-bold text-gray-900">${totalSubmittedAmount.toLocaleString()}</p>
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
                    placeholder="Search by refund ID, user, SSN, amount..."
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
                  <option value="submitted">Submitted</option>
                  <option value="processing">Processing</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Tax Refunds Table */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  {statusFilter === "all" ? "All Tax Refund Requests" : statusFilter === "submitted" ? "Submitted Requests" : statusFilter === "approved" ? "Approved Refunds" : statusFilter === "processing" ? "Processing" : "Rejected Refunds"}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Refund ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Full Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SSN
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tax Year
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Refund Amount
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
                    {filteredTaxRefunds.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-8 text-center text-sm text-gray-500">
                          No tax refund requests found
                        </td>
                      </tr>
                    ) : (
                      filteredTaxRefunds.map((refund) => (
                        <tr key={refund.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono text-gray-900">{refund.id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-[#c4d626] rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-[#0c3a30]" />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{refund.userName}</div>
                                <div className="text-sm text-gray-500">{refund.userEmail}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{refund.fullName}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono text-gray-500">***-**-{refund.ssn?.split("-")[2] || "****"}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{refund.taxYear}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            ${refund.refundAmount?.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {refund.submittedAt ? new Date(refund.submittedAt).toLocaleDateString() : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                refund.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : refund.status === "submitted" || refund.status === "processing"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {refund.status || "submitted"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {(refund.status === "submitted" || refund.status === "processing") && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleViewRefund(refund)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedRefund(refund)
                                    setApproveDialogOpen(true)
                                  }}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedRefund(refund)
                                    setRejectDialogOpen(true)
                                  }}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            {refund.status === "approved" && (
                              <span className="text-green-600 text-xs">Approved</span>
                            )}
                            {refund.status === "rejected" && (
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

      {/* View Tax Refund Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Tax Refund Request Details
            </DialogTitle>
            <DialogDescription>
              Complete information about this tax refund request
            </DialogDescription>
          </DialogHeader>
          
          {selectedRefund && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Refund ID</label>
                  <p className="text-sm font-mono text-gray-900">{selectedRefund.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedRefund.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : selectedRefund.status === "submitted" || selectedRefund.status === "processing"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}>
                    {selectedRefund.status}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">User Information</label>
                <p className="text-sm text-gray-900">{selectedRefund.userName}</p>
                <p className="text-sm text-gray-500">{selectedRefund.userEmail}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                  <p className="text-sm text-gray-900">{selectedRefund.fullName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">SSN</label>
                  <p className="text-sm font-mono text-gray-900">{selectedRefund.ssn}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Tax Year</label>
                  <p className="text-sm text-gray-900">{selectedRefund.taxYear}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Refund Amount</label>
                  <p className="text-lg font-bold text-gray-900">${selectedRefund.refundAmount?.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">ID.me Email</label>
                <p className="text-sm text-gray-900">{selectedRefund.idmeEmail}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Country</label>
                <p className="text-sm text-gray-900">{selectedRefund.country}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Submitted Date</label>
                <p className="text-sm text-gray-900">
                  {selectedRefund.submittedAt ? new Date(selectedRefund.submittedAt).toLocaleString() : "N/A"}
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5" />
                  <p className="text-xs text-yellow-800">
                    <strong>Security Note:</strong> SSN and ID.me credentials are sensitive information. Ensure proper verification before processing.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                setViewDialogOpen(false)
                setSelectedRefund(null)
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            {selectedRefund && (selectedRefund.status === "submitted" || selectedRefund.status === "processing") && (
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

      {/* Approve Tax Refund Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Approve Tax Refund
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this tax refund? The amount will be credited to the user's account.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRefund && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Refund ID:</span>
                  <span className="text-sm font-mono text-gray-900">{selectedRefund.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">User:</span>
                  <span className="text-sm text-gray-900">{selectedRefund.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Tax Year:</span>
                  <span className="text-sm text-gray-900">{selectedRefund.taxYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Refund Amount:</span>
                  <span className="text-sm font-bold text-green-600">${selectedRefund.refundAmount?.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs text-green-800">
                  <strong>Note:</strong> This will credit ${selectedRefund.refundAmount?.toLocaleString()} to the user's wallet balance immediately.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                setApproveDialogOpen(false)
                setSelectedRefund(null)
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApproveRefund}
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
                  Approve Refund
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Tax Refund Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Reject Tax Refund
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this tax refund request.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRefund && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Refund ID:</span>
                  <span className="text-sm font-mono text-gray-900">{selectedRefund.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Amount:</span>
                  <span className="text-sm font-bold text-gray-900">${selectedRefund.refundAmount?.toLocaleString()}</span>
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
                setSelectedRefund(null)
                setRejectReason("")
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRejectRefund}
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
                  Reject Refund
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}



