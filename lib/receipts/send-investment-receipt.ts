import { generateReceiptId, generateInvoiceNumber, ReceiptData } from "./generate-receipt"

export async function sendInvestmentReceipt(
  type: "crypto" | "stock" | "real_estate",
  userEmail: string,
  userName: string,
  investmentData: any
) {
  try {
    const receiptId = generateReceiptId(type)
    const invoiceNumber = generateInvoiceNumber()

    let receiptData: any = {
      receiptId,
      invoiceNumber,
      userName,
      userEmail,
      date: (() => {
        const now = new Date()
        const year = now.getUTCFullYear()
        const month = String(now.getUTCMonth() + 1).padStart(2, "0")
        const day = String(now.getUTCDate()).padStart(2, "0")
        const hours = String(now.getUTCHours()).padStart(2, "0")
        const minutes = String(now.getUTCMinutes()).padStart(2, "0")
        return `${year}-${month}-${day} ${hours}:${minutes} UTC`
      })(),
      status: "Completed",
    }

    if (type === "crypto") {
      receiptData = {
        ...receiptData,
        transactionType: `${investmentData.cryptocurrencyName || "Bitcoin"} (${investmentData.cryptocurrencySymbol || "BTC"}) Investment`,
        transactionId: investmentData.reference_number || investmentData.id || receiptId,
        amount: `${investmentData.quantity || 0} ${investmentData.cryptocurrencySymbol || "BTC"}`,
        amountValue: Number(investmentData.amount_invested || 0),
        currency: investmentData.currency || "USD",
        networkFee: investmentData.networkFee || "0.0002 BTC",
        receivingAddress: investmentData.walletAddress || investmentData.receivingAddress,
        confirmations: "6+ Confirmations",
        additionalData: {
          cryptocurrencyName: investmentData.cryptocurrencyName,
          cryptocurrencySymbol: investmentData.cryptocurrencySymbol,
          quantity: investmentData.quantity,
          pricePerUnit: investmentData.price_per_unit,
        },
      }
    } else if (type === "stock") {
      receiptData = {
        ...receiptData,
        transactionType: "Stock Investment",
        transactionId: investmentData.reference_number || investmentData.id || receiptId,
        amount: `$${Number(investmentData.amount_invested || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        amountValue: Number(investmentData.amount_invested || 0),
        additionalData: {
          stockSymbol: investmentData.stock_symbol,
          stockName: investmentData.stock_name,
          shares: investmentData.shares,
          pricePerShare: investmentData.price_per_share,
          exchange: investmentData.stock_exchange,
        },
      }
    } else if (type === "real_estate") {
      receiptData = {
        ...receiptData,
        transactionType: "Real Estate Investment",
        transactionId: investmentData.reference_number || investmentData.id || receiptId,
        amount: `$${Number(investmentData.amount_invested || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        amountValue: Number(investmentData.amount_invested || 0),
        additionalData: {
          propertyName: investmentData.property_name,
          propertyType: investmentData.property_type,
          location: investmentData.location,
          city: investmentData.city,
          state: investmentData.state,
          investmentPercentage: investmentData.investment_percentage,
          expectedReturn: investmentData.expected_return,
        },
      }
    }

    // Send email with receipt
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: userEmail,
        subject: `${type === "crypto" ? "Crypto" : type === "stock" ? "Stock" : "Real Estate"} Investment Confirmation - Receipt ${receiptId}`,
        includeReceipt: true,
        receiptType: type,
        data: {
          ...receiptData,
          name: userName,
        },
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #0c3a30;">Investment Confirmation</h2>
            <p>Dear ${userName},</p>
            <p>Your ${type === "crypto" ? "cryptocurrency" : type === "stock" ? "stock" : "real estate"} investment has been successfully processed.</p>
            <p><strong>Receipt ID:</strong> ${receiptId}</p>
            <p><strong>Amount:</strong> ${receiptData.amount}</p>
            <p>Please find your detailed transaction receipt below.</p>
          </div>
        `,
      }),
    })

    if (!response.ok) {
      console.error("Failed to send investment receipt email")
      return false
    }

    return true
  } catch (error) {
    console.error("Error sending investment receipt:", error)
    return false
  }
}

