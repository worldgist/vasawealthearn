import { NextRequest, NextResponse } from "next/server"
import { generateReceiptHTML, generateReceiptId, generateInvoiceNumber, ReceiptData } from "@/lib/receipts/generate-receipt"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    if (!type || !data) {
      return NextResponse.json({ error: "Missing required fields: type and data" }, { status: 400 })
    }

    if (!["crypto", "stock", "real_estate", "deposit"].includes(type)) {
      return NextResponse.json({ error: "Invalid receipt type" }, { status: 400 })
    }

    // Generate receipt ID and invoice number if not provided
    const receiptId = data.receiptId || generateReceiptId(type as "crypto" | "stock" | "real_estate" | "deposit")
    const invoiceNumber = data.invoiceNumber || generateInvoiceNumber()

    const receiptData: ReceiptData = {
      receiptId,
      invoiceNumber,
      userName: data.userName || "User",
      userEmail: data.userEmail || "",
      transactionType: data.transactionType || "",
      transactionId: data.transactionId || receiptId,
      date: data.date || new Date().toISOString(),
      amount: data.amount || "$0.00",
      amountValue: data.amountValue,
      currency: data.currency || "USD",
      networkFee: data.networkFee,
      receivingAddress: data.receivingAddress,
      confirmations: data.confirmations,
      status: data.status || "Completed",
      additionalData: data.additionalData || {},
    }

    const html = await generateReceiptHTML(receiptData, type as "crypto" | "stock" | "real_estate" | "deposit")

    return NextResponse.json({
      success: true,
      receiptId,
      invoiceNumber,
      html,
    })
  } catch (error) {
    console.error("Error generating receipt:", error)
    return NextResponse.json(
      {
        error: "Failed to generate receipt",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}



