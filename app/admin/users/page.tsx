"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Users, Search, Eye, Edit, Ban, CheckCircle, XCircle, Clock } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function AdminUsersPage() {
  const supabase = createClient()
  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [kycFilter, setKycFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, statusFilter, kycFilter])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const { data: profilesData, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading users:", error)
        return
      }

      // Combine profile data with email (email is already in profiles table)
      const usersWithEmail = (profilesData || []).map((profile) => ({
        ...profile,
        email: profile.email || "No email",
        fullName: `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Unknown User",
        initials: `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase() || "U",
      }))

      setUsers(usersWithEmail)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          user.fullName?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.account_number?.toLowerCase().includes(searchLower)
      )
    }

    // Filter by KYC status
    if (kycFilter !== "all") {
      filtered = filtered.filter((user) => {
        if (kycFilter === "verified") return user.kyc_status === "approved" || user.kyc_status === "verified"
        if (kycFilter === "pending") return user.kyc_status === "pending"
        if (kycFilter === "rejected") return user.kyc_status === "rejected"
        return true
      })
    }

    // Filter by status (for now, all users are considered active)
    // You can add an is_active or status field to profiles table later
    if (statusFilter !== "all") {
      // Placeholder for future status filtering
    }

    setFilteredUsers(filtered)
  }

  const handleViewUser = (user: any) => {
    setSelectedUser(user)
    setViewDialogOpen(true)
  }

  const getKycStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
      case "verified":
        return (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            Verified
          </span>
        )
      case "pending":
        return (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
            Pending
          </span>
        )
      case "rejected":
        return (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
            Rejected
          </span>
        )
      default:
        return (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
            Not Started
          </span>
        )
    }
  }

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
                className="flex items-center px-3 py-2 text-sm font-medium text-white bg-[#c4d626] rounded-md mb-1"
              >
                <Users className="w-4 h-4 mr-3" />
                All Users
              </a>
              <a
                href="/admin/kyc"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md mb-1"
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
                  <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                  <p className="text-sm text-gray-500">Manage all user accounts and permissions</p>
                </div>
                <button
                  onClick={loadUsers}
                  className="bg-[#c4d626] text-[#0c3a30] px-4 py-2 rounded-md font-medium hover:bg-[#a8b821] transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
          </header>

          <main className="p-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow mb-6 p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search users by name, email, or account number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#c4d626] focus:border-transparent"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#c4d626] focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
                <select
                  value={kycFilter}
                  onChange={(e) => setKycFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#c4d626] focus:border-transparent"
                >
                  <option value="all">All KYC Status</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  All Users ({filteredUsers.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Account
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        KYC Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                          Loading users...
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-[#c4d626] rounded-full flex items-center justify-center">
                                <span className="text-sm font-bold text-[#0c3a30]">{user.initials}</span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.account_number ? `#${user.account_number}` : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${parseFloat(user.balance || "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{getKycStatusBadge(user.kyc_status)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewUser(user)}
                                className="text-[#c4d626] hover:text-[#a8b821]"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
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

      {/* View User Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Complete information about this user</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                  <p className="text-sm text-gray-900">{selectedUser.fullName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  <p className="text-sm text-gray-900">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Account Number</label>
                  <p className="text-sm text-gray-900">{selectedUser.account_number ? `#${selectedUser.account_number}` : "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Balance</label>
                  <p className="text-sm font-bold text-gray-900">
                    ${parseFloat(selectedUser.balance || "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                  <p className="text-sm text-gray-900">{selectedUser.phone || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">KYC Status</label>
                  <div>{getKycStatusBadge(selectedUser.kyc_status)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Country</label>
                  <p className="text-sm text-gray-900">{selectedUser.country || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Joined Date</label>
                  <p className="text-sm text-gray-900">
                    {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString() : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setViewDialogOpen(false)
                setSelectedUser(null)
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
