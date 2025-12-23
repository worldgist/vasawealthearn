"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, Eye, Download, Search, Filter, Clock, User, FileText, Shield, Bell, Mail } from "lucide-react"
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

export default function AdminKYCPage() {
  const supabase = createClient()
  const { toast } = useToast()
  const [kycRequests, setKycRequests] = useState<any[]>([])
  const [filteredKycRequests, setFilteredKycRequests] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("pending")
  const [selectedKyc, setSelectedKyc] = useState<any>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadKycRequests()
  }, [])

  useEffect(() => {
    filterKycRequests()
  }, [kycRequests, searchTerm, statusFilter])

  const loadKycRequests = async () => {
    try {
      setIsLoading(true)
      const { data: submissions, error } = await supabase
        .from("kyc_submissions")
        .select(`
          *,
          profiles:user_id (
            email,
            first_name,
            last_name
          )
        `)
        .order("submitted_at", { ascending: false })

      if (error) {
        console.error("Error loading KYC submissions:", error)
        toast({
          title: "Error",
          description: "Failed to load KYC submissions.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Transform data to match expected format
      const transformedSubmissions = (submissions || []).map((submission: any) => ({
        id: submission.id,
        userId: submission.user_id,
        userName: submission.first_name && submission.last_name
          ? `${submission.first_name} ${submission.last_name}`
          : submission.profiles
          ? `${submission.profiles.first_name || ""} ${submission.profiles.last_name || ""}`.trim()
          : "Unknown User",
        userEmail: submission.profiles?.email || "Unknown",
        firstName: submission.first_name,
        middleName: submission.middle_name,
        lastName: submission.last_name,
        dateOfBirth: submission.date_of_birth,
        ssn: submission.ssn,
        licenseNumber: submission.license_number,
        licenseState: submission.license_state,
        licenseExpiry: submission.license_expiry,
        streetAddress: submission.street_address,
        city: submission.city,
        state: submission.state,
        zipCode: submission.zip_code,
        country: submission.country,
        licenseFrontUrl: submission.license_front_url,
        licenseBackUrl: submission.license_back_url,
        selfieUrl: submission.selfie_url,
        status: submission.status,
        rejectionReason: submission.rejection_reason,
        submittedAt: submission.submitted_at,
        reviewedAt: submission.reviewed_at,
      }))

      setKycRequests(transformedSubmissions)
    } catch (error) {
      console.error("Error loading KYC requests:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterKycRequests = () => {
    let filtered = kycRequests

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((kyc) => kyc.status === statusFilter)
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (kyc) =>
          kyc.id?.toLowerCase().includes(searchLower) ||
          kyc.userName?.toLowerCase().includes(searchLower) ||
          kyc.userEmail?.toLowerCase().includes(searchLower)
      )
    }

    // Sort by submission date (newest first)
    filtered.sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime())

    setFilteredKycRequests(filtered)
  }

  const sendPushNotification = (userId: string, title: string, message: string) => {
    // Get existing notifications
    const notifications = JSON.parse(localStorage.getItem("notifications") || "[]")
    
    // Create new notification
    const notification = {
      id: `NOTIF-${Date.now()}`,
      userId: userId,
      type: "kyc",
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
        tag: `kyc-${userId}`,
      })
    } else if ("Notification" in window && Notification.permission !== "denied") {
      // Request permission
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, {
            body: message,
            icon: "/favicon.ico",
            badge: "/favicon.ico",
            tag: `kyc-${userId}`,
          })
        }
      })
    }

    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent("notification", { detail: notification }))
  }

  const sendEmailNotification = async (userEmail: string, userName: string, status: "approved" | "rejected", rejectionReason?: string) => {
    try {
      // Call API route to send email
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: userEmail,
          subject:
            status === "approved"
              ? "KYC Verification Approved - Your Account is Verified"
              : "KYC Verification Rejected - Action Required",
          template: status === "approved" ? "kyc-approved" : "kyc-rejected",
          data: {
            userName,
            rejectionReason,
          },
        }),
      })

      if (!response.ok) {
        console.error("Failed to send email")
      }
    } catch (error) {
      console.error("Error sending email:", error)
      // Continue even if email fails
    }
  }

  const handleApproveKyc = async () => {
    if (!selectedKyc) return

    setIsProcessing(true)

    try {
      const {
        data: { user: adminUser },
      } = await supabase.auth.getUser()

      // Update KYC submission status
      const { error: updateError } = await supabase
        .from("kyc_submissions")
        .update({
          status: "approved",
          reviewed_by: adminUser?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", selectedKyc.id)

      if (updateError) {
        throw updateError
      }

      // Update user profile KYC status
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          kyc_status: "verified",
          kyc_verified_at: new Date().toISOString(),
        })
        .eq("id", selectedKyc.userId)

      if (profileError) {
        console.error("Error updating profile:", profileError)
      }

      // Send push notification
      sendPushNotification(
        selectedKyc.userId,
        "KYC Verification Approved",
        `Your KYC verification has been approved! Your account is now fully verified.`
      )

      // Send email notification
      await sendEmailNotification(selectedKyc.userEmail, selectedKyc.userName, "approved")

      // Reload KYC requests
      await loadKycRequests()

      toast({
        title: "Success",
        description: "KYC verification approved. User has been notified via email.",
      })

      setApproveDialogOpen(false)
      setSelectedKyc(null)
    } catch (error) {
      console.error("Error approving KYC:", error)
      toast({
        title: "Error",
        description: "Failed to approve KYC verification. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectKyc = async () => {
    if (!selectedKyc || !rejectReason.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      const {
        data: { user: adminUser },
      } = await supabase.auth.getUser()

      // Update KYC submission status
      const { error: updateError } = await supabase
        .from("kyc_submissions")
        .update({
          status: "rejected",
          rejection_reason: rejectReason,
          reviewed_by: adminUser?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", selectedKyc.id)

      if (updateError) {
        throw updateError
      }

      // Update user profile KYC status
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          kyc_status: "rejected",
        })
        .eq("id", selectedKyc.userId)

      if (profileError) {
        console.error("Error updating profile:", profileError)
      }

      // Send push notification
      sendPushNotification(
        selectedKyc.userId,
        "KYC Verification Rejected",
        `Your KYC verification has been rejected. Please check your email for details and resubmit.`
      )

      // Send email notification
      await sendEmailNotification(selectedKyc.userEmail, selectedKyc.userName, "rejected", rejectReason)

      // Reload KYC requests
      await loadKycRequests()

      toast({
        title: "Success",
        description: "KYC verification rejected. User has been notified via email.",
      })

      setRejectDialogOpen(false)
      setSelectedKyc(null)
      setRejectReason("")
    } catch (error) {
      console.error("Error rejecting KYC:", error)
      toast({
        title: "Error",
        description: "Failed to reject KYC verification. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleViewKyc = (kyc: any) => {
    setSelectedKyc(kyc)
    setViewDialogOpen(true)
  }

  const pendingCount = kycRequests.filter((k) => k.status === "pending").length
  const approvedCount = kycRequests.filter((k) => k.status === "approved").length
  const rejectedCount = kycRequests.filter((k) => k.status === "rejected").length

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
              <a
                href="/admin/kyc"
                className="flex items-center px-3 py-2 text-sm font-medium text-white bg-[#c4d626] rounded-md mb-1"
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
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <header className="bg-white shadow-sm border-b">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">KYC Verification</h1>
                  <p className="text-sm text-gray-500">Review and approve user identity verification</p>
                </div>
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

            {/* KYC Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending Review</p>
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
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{kycRequests.length}</p>
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
                    placeholder="Search by KYC ID, user name, email..."
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

            {/* KYC Requests Table */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  {statusFilter === "all" ? "All KYC Requests" : statusFilter === "pending" ? "Pending Reviews" : statusFilter === "approved" ? "Approved" : "Rejected"}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        KYC ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Documents
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
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
                    {filteredKycRequests.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                          No KYC requests found
                        </td>
                      </tr>
                    ) : (
                      filteredKycRequests.map((kyc) => (
                        <tr key={kyc.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono text-gray-900">{kyc.id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-[#c4d626] rounded-full flex items-center justify-center">
                                <span className="text-sm font-bold text-[#0c3a30]">
                                  {kyc.userName?.split(" ").map((n: string) => n[0]).join("").toUpperCase() || "U"}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{kyc.userName}</div>
                                <div className="text-sm text-gray-500">{kyc.userEmail}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-2">
                              {kyc.licenseFrontUrl && (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                  License Front
                                </span>
                              )}
                              {kyc.licenseBackUrl && (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                  License Back
                                </span>
                              )}
                              {kyc.selfieUrl && (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  Selfie
                                </span>
                              )}
                              {!kyc.licenseFrontUrl && !kyc.licenseBackUrl && !kyc.selfieUrl && (
                                <span className="text-xs text-gray-500">No documents</span>
                              )}
                              {kyc.documents?.map((doc: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"
                                >
                                  {doc}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {kyc.submittedAt ? new Date(kyc.submittedAt).toLocaleString() : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                kyc.priority === "high"
                                  ? "bg-red-100 text-red-800"
                                  : kyc.priority === "medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {kyc.priority || "medium"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                kyc.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : kyc.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {kyc.status || "pending"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {kyc.status === "pending" && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleViewKyc(kyc)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Review
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedKyc(kyc)
                                    setApproveDialogOpen(true)
                                  }}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedKyc(kyc)
                                    setRejectDialogOpen(true)
                                  }}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            {kyc.status === "approved" && (
                              <span className="text-green-600 text-xs flex items-center">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approved
                              </span>
                            )}
                            {kyc.status === "rejected" && (
                              <span className="text-red-600 text-xs flex items-center">
                                <XCircle className="w-3 h-3 mr-1" />
                                Rejected
                              </span>
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

      {/* View KYC Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              KYC Verification Details
            </DialogTitle>
            <DialogDescription>
              Review complete information about this KYC verification request
            </DialogDescription>
          </DialogHeader>
          
          {selectedKyc && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">KYC ID</label>
                  <p className="text-sm font-mono text-gray-900">{selectedKyc.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedKyc.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : selectedKyc.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}>
                    {selectedKyc.status}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">User Information</label>
                <p className="text-sm text-gray-900">{selectedKyc.userName}</p>
                <p className="text-sm text-gray-500">{selectedKyc.userEmail}</p>
              </div>

              {/* Personal Information */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Personal Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">First Name</label>
                    <p className="text-sm text-gray-900">{selectedKyc.firstName || "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Last Name</label>
                    <p className="text-sm text-gray-900">{selectedKyc.lastName || "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Date of Birth</label>
                    <p className="text-sm text-gray-900">{selectedKyc.dateOfBirth || "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">SSN</label>
                    <p className="text-sm text-gray-900">{selectedKyc.ssn ? "***-**-" + selectedKyc.ssn.slice(-4) : "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Address Information</h4>
                <div className="space-y-2">
                  <p className="text-sm text-gray-900">{selectedKyc.streetAddress || "N/A"}</p>
                  <p className="text-sm text-gray-900">
                    {selectedKyc.city || ""} {selectedKyc.state || ""} {selectedKyc.zipCode || ""}
                  </p>
                  <p className="text-sm text-gray-900">{selectedKyc.country || "N/A"}</p>
                </div>
              </div>

              {/* License Information */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Driver's License Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">License Number</label>
                    <p className="text-sm text-gray-900">{selectedKyc.licenseNumber || "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">State</label>
                    <p className="text-sm text-gray-900">{selectedKyc.licenseState || "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Expiry Date</label>
                    <p className="text-sm text-gray-900">{selectedKyc.licenseExpiry || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Uploaded Documents</h4>
                <div className="grid grid-cols-1 gap-4">
                  {selectedKyc.licenseFrontUrl && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">License Front</label>
                      <a
                        href={selectedKyc.licenseFrontUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={selectedKyc.licenseFrontUrl}
                          alt="License Front"
                          className="w-full h-48 object-contain border rounded-lg cursor-pointer hover:opacity-80"
                        />
                      </a>
                    </div>
                  )}
                  {selectedKyc.licenseBackUrl && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">License Back</label>
                      <a
                        href={selectedKyc.licenseBackUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={selectedKyc.licenseBackUrl}
                          alt="License Back"
                          className="w-full h-48 object-contain border rounded-lg cursor-pointer hover:opacity-80"
                        />
                      </a>
                    </div>
                  )}
                  {selectedKyc.selfieUrl && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">Selfie</label>
                      <a
                        href={selectedKyc.selfieUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={selectedKyc.selfieUrl}
                          alt="Selfie"
                          className="w-full h-48 object-contain border rounded-lg cursor-pointer hover:opacity-80"
                        />
                      </a>
                    </div>
                  )}
                  {!selectedKyc.licenseFrontUrl && !selectedKyc.licenseBackUrl && !selectedKyc.selfieUrl && (
                    <p className="text-sm text-gray-500">No documents uploaded</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Submitted Date</label>
                <p className="text-sm text-gray-900">
                  {selectedKyc.submittedAt ? new Date(selectedKyc.submittedAt).toLocaleString() : "N/A"}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                setViewDialogOpen(false)
                setSelectedKyc(null)
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            {selectedKyc?.status === "pending" && (
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

      {/* Approve KYC Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Approve KYC Verification
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this KYC verification? The user will be notified immediately.
            </DialogDescription>
          </DialogHeader>
          
          {selectedKyc && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">KYC ID:</span>
                  <span className="text-sm font-mono text-gray-900">{selectedKyc.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">User:</span>
                  <span className="text-sm text-gray-900">{selectedKyc.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Email:</span>
                  <span className="text-sm text-gray-900">{selectedKyc.userEmail}</span>
                </div>
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
                        Email notification to {selectedKyc.userEmail}
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
                setSelectedKyc(null)
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApproveKyc}
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

      {/* Reject KYC Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Reject KYC Verification
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this KYC verification. The user will be notified.
            </DialogDescription>
          </DialogHeader>
          
          {selectedKyc && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">KYC ID:</span>
                  <span className="text-sm font-mono text-gray-900">{selectedKyc.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">User:</span>
                  <span className="text-sm text-gray-900">{selectedKyc.userName}</span>
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
                        Email notification to {selectedKyc.userEmail}
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
                setRejectDialogOpen(false)
                setSelectedKyc(null)
                setRejectReason("")
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRejectKyc}
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
                  Reject & Notify
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
