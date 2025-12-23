"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Download, Calendar, FileText, Printer } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

export default function TransactionsPage() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      setIsLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setIsLoading(false)
        return
      }

      // Load transactions from database
      const { data: dbTransactions, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading transactions:", error)
      }

      // Transform database transactions to match expected format
      const transformedTransactions = (dbTransactions || []).map((tx: any) => {
        const txType = tx.transaction_type
        let displayType = "Transaction"
        let scope = "Outgoing"
        
        if (txType === "deposit" || txType === "loan_disbursement") {
          displayType = txType === "deposit" ? "Deposit" : "Loan Disbursement"
          scope = "Incoming"
        } else if (txType === "withdrawal") {
          displayType = "Withdrawal"
          scope = "Outgoing"
        } else if (txType === "transfer") {
          displayType = "Transfer"
          scope = "Outgoing"
        } else if (txType === "crypto_investment" || txType === "stock_investment" || txType === "real_estate_investment") {
          displayType = txType.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())
          scope = "Outgoing"
        } else {
          displayType = txType.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())
        }

        return {
          id: tx.id,
          amount: `$${Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          amountValue: Number(tx.amount),
          type: displayType,
          status: tx.status || "pending",
          referenceId: tx.reference_number || tx.reference_id || tx.id,
          description: tx.description || `${displayType} transaction`,
          scope: scope,
          created: new Date(tx.created_at).toLocaleString(),
          timestamp: new Date(tx.created_at).getTime(),
          currency: tx.currency || "USD",
          transactionType: txType,
        }
      })

      setTransactions(transformedTransactions.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)))
    } catch (error) {
      console.error("Error loading transactions:", error)
      toast({
        title: "Error",
        description: "Failed to load transactions. Please try again.",
        variant: "destructive",
      })
      setTransactions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrintPDF = (transaction: any) => {
    // Create a printable HTML content
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Transaction Receipt - ${transaction.referenceId}</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 20mm;
              }
            }
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #c4d626;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #0c3a30;
              margin: 0;
              font-size: 28px;
            }
            .header p {
              color: #666;
              margin: 5px 0;
            }
            .transaction-details {
              background: #f9fafb;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .detail-row:last-child {
              border-bottom: none;
            }
            .detail-label {
              font-weight: 600;
              color: #666;
            }
            .detail-value {
              font-weight: 700;
              color: #111;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 600;
            }
            .status-completed {
              background: #d1fae5;
              color: #065f46;
            }
            .status-pending {
              background: #fef3c7;
              color: #92400e;
            }
            .status-failed {
              background: #fee2e2;
              color: #991b1b;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
            .amount {
              font-size: 24px;
              font-weight: 700;
              color: #0c3a30;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Vasawealthearn</h1>
            <p>Transaction Receipt</p>
            <p style="font-size: 12px; color: #999;">Secure Banking Platform</p>
          </div>
          
          <div class="transaction-details">
            <div class="detail-row">
              <span class="detail-label">Transaction ID:</span>
              <span class="detail-value">${transaction.referenceId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Type:</span>
              <span class="detail-value">${transaction.type}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Amount:</span>
              <span class="detail-value amount">${transaction.amount}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span class="status-badge status-${transaction.status}">${transaction.status.toUpperCase()}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Description:</span>
              <span class="detail-value">${transaction.description}</span>
            </div>
            ${transaction.property ? `
            <div class="detail-row">
              <span class="detail-label">Property:</span>
              <span class="detail-value">${transaction.property}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Location:</span>
              <span class="detail-value">${transaction.location || "N/A"}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Expected Return:</span>
              <span class="detail-value">${transaction.expectedReturn || "N/A"}</span>
            </div>
            ` : ""}
            <div class="detail-row">
              <span class="detail-label">Date & Time:</span>
              <span class="detail-value">${transaction.created}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Scope:</span>
              <span class="detail-value">${transaction.scope}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>This is an official transaction receipt from Vasawealthearn</p>
            <p>For support, please contact: support@vasawealthearn.com</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  const handleExportAll = () => {
    if (filteredTransactions.length === 0) {
      toast({
        title: "No Transactions",
        description: "There are no transactions to export",
        variant: "destructive",
      })
      return
    }

    // Create a printable HTML content for all transactions
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const transactionsHtml = filteredTransactions.map((tx) => `
      <div style="page-break-inside: avoid; margin-bottom: 30px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h3 style="color: #0c3a30; margin-top: 0;">${tx.type}</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 15px 0;">
          <div><strong>Transaction ID:</strong> ${tx.referenceId}</div>
          <div><strong>Amount:</strong> <span style="font-size: 18px; color: #0c3a30; font-weight: 700;">${tx.amount}</span></div>
          <div><strong>Status:</strong> <span class="status-${tx.status}">${tx.status.toUpperCase()}</span></div>
          <div><strong>Date:</strong> ${tx.created}</div>
          <div style="grid-column: 1 / -1;"><strong>Description:</strong> ${tx.description}</div>
          ${tx.property ? `<div style="grid-column: 1 / -1;"><strong>Property:</strong> ${tx.property} - ${tx.location || ""}</div>` : ""}
        </div>
      </div>
    `).join("")

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Transaction History - Vasawealthearn</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 15mm;
              }
            }
            body {
              font-family: Arial, sans-serif;
              max-width: 900px;
              margin: 0 auto;
              padding: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #c4d626;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #0c3a30;
              margin: 0;
              font-size: 28px;
            }
            .status-completed { color: #065f46; font-weight: 600; }
            .status-pending { color: #92400e; font-weight: 600; }
            .status-failed { color: #991b1b; font-weight: 600; }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Vasawealthearn</h1>
            <p>Transaction History Report</p>
            <p style="font-size: 12px; color: #999;">Generated on: ${new Date().toLocaleString()}</p>
          </div>
          ${transactionsHtml}
          <div class="footer">
            <p>Total Transactions: ${filteredTransactions.length}</p>
            <p>This is an official transaction report from Vasawealthearn</p>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
    
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      !searchTerm ||
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.referenceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.amount?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.type?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter
    const matchesType = typeFilter === "all" || 
      transaction.type?.toLowerCase() === typeFilter.toLowerCase() ||
      transaction.transactionType?.toLowerCase() === typeFilter.toLowerCase() ||
      (typeFilter === "real estate investment" && transaction.type?.toLowerCase().includes("real estate"))

    return matchesSearch && matchesStatus && matchesType
  })

  const handleViewTransaction = (transactionId: string) => {
    router.push(`/dashboard/transactions/${transactionId}`)
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Transactions</h1>
          <p className="text-sm sm:text-base text-gray-600">View and manage your transaction history</p>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-1 w-full">
              {/* Search */}
              <div className="relative flex-1 w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm sm:text-base"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px] text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[140px] text-sm">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="loan_disbursement">Loan Disbursement</SelectItem>
                  <SelectItem value="crypto_investment">Crypto Investment</SelectItem>
                  <SelectItem value="stock_investment">Stock Investment</SelectItem>
                  <SelectItem value="real_estate_investment">Real Estate Investment</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" className="flex-1 sm:flex-initial text-xs sm:text-sm">
                <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Filter</span>
                <span className="sm:hidden">Filter</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 sm:flex-initial text-xs sm:text-sm"
                onClick={handleExportAll}
              >
                <Printer className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Print All</span>
                <span className="sm:hidden">Print</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Transactions Table - Desktop View */}
        <div className="hidden lg:block bg-white rounded-lg shadow-sm border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Amount</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Reference ID</TableHead>
                <TableHead className="font-semibold">Description</TableHead>
                <TableHead className="font-semibold">Scope</TableHead>
                <TableHead className="font-semibold">Created</TableHead>
                <TableHead className="font-semibold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-medium text-gray-900">No transactions found</h3>
                        <p className="text-gray-500">Try adjusting your search or filter parameters</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.amount}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {transaction.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : transaction.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{transaction.referenceId}</TableCell>
                    <TableCell>
                      <div>
                        <div>{transaction.description}</div>
                        {transaction.property && (
                          <div className="text-xs text-gray-500 mt-1">
                            {transaction.property} {transaction.location && `- ${transaction.location}`}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{transaction.scope}</TableCell>
                    <TableCell>{transaction.created}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewTransaction(transaction.id)}>
                          View
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handlePrintPDF(transaction)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Transactions Cards - Mobile View */}
        <div className="lg:hidden space-y-4">
          {filteredTransactions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-medium text-gray-900">No transactions found</h3>
                  <p className="text-gray-500 text-sm">Try adjusting your search or filter parameters</p>
                </div>
              </div>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-bold text-gray-900">{transaction.amount}</span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          transaction.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : transaction.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">{transaction.description}</div>
                    {transaction.property && (
                      <div className="text-xs text-gray-500 mb-1">
                        {transaction.property} {transaction.location && `- ${transaction.location}`}
                        {transaction.expectedReturn && ` (${transaction.expectedReturn} return)`}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 font-mono">{transaction.referenceId}</div>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">
                    {transaction.type}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="text-xs text-gray-500">
                    <div>{transaction.scope}</div>
                    <div>{transaction.created}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleViewTransaction(transaction.id)}>
                      View
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handlePrintPDF(transaction)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Print
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
