"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Filter,
  Shield,
  Ban,
  Unlock,
  Plus,
  Download,
} from "lucide-react"

interface Card {
  id: string
  user_id: string
  card_type: "virtual" | "physical"
  card_category: string
  card_number?: string
  expiry_date?: string
  cvv?: string
  status: "pending" | "approved" | "rejected" | "active" | "blocked" | "expired"
  application_date?: string
  approval_date?: string
  delivery_address?: string
  created_at?: string
  updated_at?: string
  user?: {
    email?: string
    full_name?: string
  }
}

export default function AdminCardsPage() {
  const [cards, setCards] = useState<Card[]>([])
  const [filteredCards, setFilteredCards] = useState<Card[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [blockDialogOpen, setBlockDialogOpen] = useState(false)
  const [issueDialogOpen, setIssueDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [blockReason, setBlockReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadCards()
  }, [])

  useEffect(() => {
    filterCards()
  }, [cards, searchTerm, statusFilter, typeFilter])

  const loadCards = async () => {
    try {
      setLoading(true)
      // First get all cards
      const { data: cardsData, error: cardsError } = await supabase
        .from("cards")
        .select("*")
        .order("created_at", { ascending: false })

      if (cardsError) {
        console.error("Error loading cards:", cardsError)
        setCards([])
        return
      }

      if (!cardsData || cardsData.length === 0) {
        setCards([])
        return
      }

      // Get unique user IDs
      const userIds = [...new Set(cardsData.map((card) => card.user_id))]

      // Fetch user profiles
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name")
        .in("id", userIds)

      // Create a map of user_id to profile
      const profilesMap = new Map(
        (profilesData || []).map((profile) => [
          profile.id,
          {
            email: profile.email || "Unknown",
            full_name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Unknown User",
          },
        ])
      )

      // Transform cards with user information
      const transformedCards = cardsData.map((card) => ({
        ...card,
        user: profilesMap.get(card.user_id) || { email: "Unknown", full_name: "Unknown User" },
      }))

      setCards(transformedCards)
    } catch (error) {
      console.error("Error loading cards:", error)
      setCards([])
    } finally {
      setLoading(false)
    }
  }

  const filterCards = () => {
    let filtered = cards

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((card) => card.status === statusFilter)
    }

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter((card) => card.card_type === typeFilter)
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (card) =>
          card.user?.email?.toLowerCase().includes(searchLower) ||
          card.user?.full_name?.toLowerCase().includes(searchLower) ||
          card.card_number?.includes(searchTerm) ||
          card.card_category?.toLowerCase().includes(searchLower) ||
          card.id.toLowerCase().includes(searchLower)
      )
    }

    setFilteredCards(filtered)
  }

  const handleApprove = async () => {
    if (!selectedCard) return

    setIsProcessing(true)
    try {
      const { error } = await supabase
        .from("cards")
        .update({
          status: "approved",
          approval_date: new Date().toISOString().split("T")[0],
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedCard.id)

      if (error) throw error

      setSuccessMessage("Card approved successfully!")
      setApproveDialogOpen(false)
      setSelectedCard(null)
      await loadCards()
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Error approving card:", error)
      alert("Failed to approve card. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedCard || !rejectReason.trim()) {
      alert("Please provide a reason for rejection")
      return
    }

    setIsProcessing(true)
    try {
      const { error } = await supabase
        .from("cards")
        .update({
          status: "rejected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedCard.id)

      if (error) throw error

      setSuccessMessage("Card rejected successfully!")
      setRejectDialogOpen(false)
      setRejectReason("")
      setSelectedCard(null)
      await loadCards()
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Error rejecting card:", error)
      alert("Failed to reject card. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBlock = async () => {
    if (!selectedCard) return

    setIsProcessing(true)
    try {
      const { error } = await supabase
        .from("cards")
        .update({
          status: "blocked",
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedCard.id)

      if (error) throw error

      setSuccessMessage("Card blocked successfully!")
      setBlockDialogOpen(false)
      setBlockReason("")
      setSelectedCard(null)
      await loadCards()
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Error blocking card:", error)
      alert("Failed to block card. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUnblock = async (card: Card) => {
    setIsProcessing(true)
    try {
      const { error } = await supabase
        .from("cards")
        .update({
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", card.id)

      if (error) throw error

      setSuccessMessage("Card unblocked successfully!")
      await loadCards()
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Error unblocking card:", error)
      alert("Failed to unblock card. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { bg: string; text: string } } = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-800" },
      approved: { bg: "bg-blue-100", text: "text-blue-800" },
      rejected: { bg: "bg-red-100", text: "text-red-800" },
      active: { bg: "bg-green-100", text: "text-green-800" },
      blocked: { bg: "bg-red-100", text: "text-red-800" },
      expired: { bg: "bg-gray-100", text: "text-gray-800" },
    }

    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const stats = {
    active: cards.filter((c) => c.status === "active").length,
    pending: cards.filter((c) => c.status === "pending").length,
    blocked: cards.filter((c) => c.status === "blocked").length,
    total: cards.length,
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
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md mb-1"
              >
                <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
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
              <a
                href="/admin/transfers"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md mb-1"
              >
                <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                    clipRule="evenodd"
                  />
                </svg>
                Transfer Monitoring
              </a>
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
                href="/admin/tax-refunds"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md mb-1"
              >
                <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clipRule="evenodd"
                  />
                </svg>
                Tax Refund Management
              </a>
              <a
                href="/admin/investments"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md mb-1"
              >
                <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                    clipRule="evenodd"
                  />
                </svg>
                Investment Oversight
              </a>
              <a
                href="/admin/cards"
                className="flex items-center px-3 py-2 text-sm font-medium text-white bg-[#c4d626] rounded-md mb-1"
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
              <a
                href="/admin/reports"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md mb-1"
              >
                <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                Reports & Analytics
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
                  <h1 className="text-2xl font-bold text-gray-900">Card Management</h1>
                  <p className="text-sm text-gray-500">Manage card applications and issued cards</p>
                </div>
                <button
                  onClick={() => setIssueDialogOpen(true)}
                  className="bg-[#c4d626] text-[#0c3a30] px-4 py-2 rounded-md font-medium hover:bg-[#a8b821] transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Issue New Card
                </button>
              </div>
            </div>
          </header>

          <main className="p-6">
            {successMessage && (
              <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
                {successMessage}
              </div>
            )}

            {/* Card Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Cards</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Filter className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending Applications</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Ban className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Blocked Cards</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.blocked}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Cards</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow mb-6 p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search by name, email, card number, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#c4d626] focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                  <option value="rejected">Rejected</option>
                  <option value="expired">Expired</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#c4d626] focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="virtual">Virtual</option>
                  <option value="physical">Physical</option>
                </select>
              </div>
            </div>

            {/* Cards Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  All Cards ({filteredCards.length})
                </h3>
                <button className="text-sm text-[#c4d626] hover:text-[#a8b821] flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
              {loading ? (
                <div className="p-12 text-center">
                  <p className="text-gray-500">Loading cards...</p>
                </div>
              ) : filteredCards.length === 0 ? (
                <div className="p-12 text-center">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No cards found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Applicant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Card Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Card Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Applied
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
                      {filteredCards.map((card) => (
                        <tr key={card.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-[#c4d626] rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-[#0c3a30]">
                                  {card.user?.full_name?.charAt(0) || "U"}
                                </span>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {card.user?.full_name || "Unknown User"}
                                </div>
                                <div className="text-sm text-gray-500">{card.user?.email || "No email"}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                card.card_type === "virtual"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {card.card_type.charAt(0).toUpperCase() + card.card_type.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {card.card_category || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {card.card_number ? `****${card.card_number.slice(-4)}` : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {card.application_date
                              ? new Date(card.application_date).toLocaleDateString()
                              : card.created_at
                              ? new Date(card.created_at).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(card.status)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedCard(card)
                                  setViewDialogOpen(true)
                                }}
                                className="text-[#c4d626] hover:text-[#a8b821] flex items-center gap-1"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </button>
                              {card.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => {
                                      setSelectedCard(card)
                                      setApproveDialogOpen(true)
                                    }}
                                    className="text-green-600 hover:text-green-900 flex items-center gap-1"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedCard(card)
                                      setRejectDialogOpen(true)
                                    }}
                                    className="text-red-600 hover:text-red-900 flex items-center gap-1"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    Reject
                                  </button>
                                </>
                              )}
                              {card.status === "active" && (
                                <button
                                  onClick={() => {
                                    setSelectedCard(card)
                                    setBlockDialogOpen(true)
                                  }}
                                  className="text-red-600 hover:text-red-900 flex items-center gap-1"
                                >
                                  <Ban className="w-4 h-4" />
                                  Block
                                </button>
                              )}
                              {card.status === "blocked" && (
                                <button
                                  onClick={() => handleUnblock(card)}
                                  disabled={isProcessing}
                                  className="text-green-600 hover:text-green-900 flex items-center gap-1 disabled:opacity-50"
                                >
                                  <Unlock className="w-4 h-4" />
                                  Unblock
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* View Card Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Card Details</DialogTitle>
            <DialogDescription>View complete card information</DialogDescription>
          </DialogHeader>
          {selectedCard && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Card ID</label>
                  <p className="text-sm text-gray-900">{selectedCard.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedCard.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Card Type</label>
                  <p className="text-sm text-gray-900 capitalize">{selectedCard.card_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <p className="text-sm text-gray-900">{selectedCard.card_category || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Card Number</label>
                  <p className="text-sm text-gray-900 font-mono">
                    {selectedCard.card_number || "Not assigned"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Expiry Date</label>
                  <p className="text-sm text-gray-900">{selectedCard.expiry_date || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Application Date</label>
                  <p className="text-sm text-gray-900">
                    {selectedCard.application_date
                      ? new Date(selectedCard.application_date).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Approval Date</label>
                  <p className="text-sm text-gray-900">
                    {selectedCard.approval_date
                      ? new Date(selectedCard.approval_date).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">User Information</label>
                  <p className="text-sm text-gray-900">
                    {selectedCard.user?.full_name || "Unknown"} ({selectedCard.user?.email || "No email"})
                  </p>
                </div>
                {selectedCard.delivery_address && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">Delivery Address</label>
                    <p className="text-sm text-gray-900">{selectedCard.delivery_address}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Card Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this card application? The card will be activated for the user.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? "Processing..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Card Application</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this card application.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleReject} disabled={isProcessing} className="bg-red-600 hover:bg-red-700">
              {isProcessing ? "Processing..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block Dialog */}
      <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block Card</DialogTitle>
            <DialogDescription>Please provide a reason for blocking this card.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter blocking reason..."
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleBlock} disabled={isProcessing} className="bg-red-600 hover:bg-red-700">
              {isProcessing ? "Processing..." : "Block Card"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Issue New Card Dialog */}
      <Dialog open={issueDialogOpen} onOpenChange={setIssueDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue New Card</DialogTitle>
            <DialogDescription>Create a new card for a user</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Card issuance functionality will be implemented here. This would typically include:
            </p>
            <ul className="text-sm text-gray-500 list-disc list-inside space-y-1">
              <li>User selection</li>
              <li>Card type selection (Virtual/Physical)</li>
              <li>Card category selection</li>
              <li>Card number generation</li>
              <li>Delivery address (for physical cards)</li>
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIssueDialogOpen(false)}>
              Close
            </Button>
            <Button disabled className="bg-[#c4d626] text-[#0c3a30] hover:bg-[#a8b821]">
              Coming Soon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
