import QRCode from "qrcode"

export interface ReceiptData {
  receiptId: string
  invoiceNumber: string
  userName: string
  userEmail: string
  transactionType: string
  transactionId?: string
  date: string
  amount: string
  amountValue?: number
  currency?: string
  networkFee?: string
  receivingAddress?: string
  confirmations?: string
  status: string
  additionalData?: Record<string, any>
}

export async function generateReceiptHTML(data: ReceiptData, type: "crypto" | "stock" | "real_estate" | "deposit"): Promise<string> {
  // Generate QR code for blockchain verification
  const qrCodeDataUrl = await generateQRCode(data.transactionId || data.receiptId)

  let transactionDetails = ""
  
  if (type === "crypto") {
    transactionDetails = `
      <tr>
        <td class="detail-label">Transaction Type:</td>
        <td class="detail-value">${data.transactionType}</td>
      </tr>
      <tr>
        <td class="detail-label">Transaction ID (TXID):</td>
        <td class="detail-value" style="font-family: monospace; font-size: 11px;">${data.transactionId || data.receiptId}</td>
      </tr>
      <tr>
        <td class="detail-label">Amount Deposited:</td>
        <td class="detail-value">${data.amount}</td>
      </tr>
      ${data.amountValue ? `
      <tr>
        <td class="detail-label">${data.currency || "USD"} Value:</td>
        <td class="detail-value">$${data.amountValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      </tr>
      ` : ""}
      ${data.networkFee ? `
      <tr>
        <td class="detail-label">Network Fee:</td>
        <td class="detail-value">${data.networkFee}</td>
      </tr>
      ` : ""}
      ${data.receivingAddress ? `
      <tr>
        <td class="detail-label">Receiving Wallet Address:</td>
        <td class="detail-value" style="font-family: monospace; font-size: 11px; word-break: break-all;">${data.receivingAddress}</td>
      </tr>
      ` : ""}
      ${data.confirmations ? `
      <tr>
        <td class="detail-label">Confirmations:</td>
        <td class="detail-value">${data.confirmations}</td>
      </tr>
      ` : ""}
    `
  } else if (type === "stock") {
    transactionDetails = `
      <tr>
        <td class="detail-label">Transaction Type:</td>
        <td class="detail-value">Stock Investment</td>
      </tr>
      <tr>
        <td class="detail-label">Stock Symbol:</td>
        <td class="detail-value">${data.additionalData?.stockSymbol || "N/A"}</td>
      </tr>
      <tr>
        <td class="detail-label">Stock Name:</td>
        <td class="detail-value">${data.additionalData?.stockName || "N/A"}</td>
      </tr>
      <tr>
        <td class="detail-label">Shares Purchased:</td>
        <td class="detail-value">${data.additionalData?.shares || "N/A"}</td>
      </tr>
      <tr>
        <td class="detail-label">Price Per Share:</td>
        <td class="detail-value">$${data.additionalData?.pricePerShare || "0.00"}</td>
      </tr>
      <tr>
        <td class="detail-label">Total Investment:</td>
        <td class="detail-value">${data.amount}</td>
      </tr>
      <tr>
        <td class="detail-label">Exchange:</td>
        <td class="detail-value">${data.additionalData?.exchange || "N/A"}</td>
      </tr>
    `
  } else if (type === "real_estate") {
    transactionDetails = `
      <tr>
        <td class="detail-label">Transaction Type:</td>
        <td class="detail-value">Real Estate Investment</td>
      </tr>
      <tr>
        <td class="detail-label">Property Name:</td>
        <td class="detail-value">${data.additionalData?.propertyName || "N/A"}</td>
      </tr>
      <tr>
        <td class="detail-label">Property Type:</td>
        <td class="detail-value">${data.additionalData?.propertyType || "N/A"}</td>
      </tr>
      <tr>
        <td class="detail-label">Location:</td>
        <td class="detail-value">${data.additionalData?.location || "N/A"}</td>
      </tr>
      <tr>
        <td class="detail-label">Investment Amount:</td>
        <td class="detail-value">${data.amount}</td>
      </tr>
      ${data.additionalData?.investmentPercentage ? `
      <tr>
        <td class="detail-label">Ownership Percentage:</td>
        <td class="detail-value">${data.additionalData.investmentPercentage}%</td>
      </tr>
      ` : ""}
      ${data.additionalData?.expectedReturn ? `
      <tr>
        <td class="detail-label">Expected Return:</td>
        <td class="detail-value">${data.additionalData.expectedReturn}%</td>
      </tr>
      ` : ""}
    `
  } else {
    // Deposit receipt
    transactionDetails = `
      <tr>
        <td class="detail-label">Transaction Type:</td>
        <td class="detail-value">${data.transactionType}</td>
      </tr>
      <tr>
        <td class="detail-label">Amount Deposited:</td>
        <td class="detail-value">${data.amount}</td>
      </tr>
      <tr>
        <td class="detail-label">Payment Method:</td>
        <td class="detail-value">${data.additionalData?.paymentMethod || "N/A"}</td>
      </tr>
    `
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Transaction Receipt - ${data.receiptId}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background-color: #f5f5f5;
          padding: 20px;
          color: #1a1a1a;
        }
        .receipt-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 3px solid #0c3a30;
          padding-bottom: 20px;
        }
        .logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          margin-bottom: 15px;
        }
        .logo-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0c3a30 0%, #c4d626 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 28px;
          font-weight: bold;
        }
        .company-name {
          font-size: 28px;
          font-weight: bold;
          color: #0c3a30;
          letter-spacing: 1px;
        }
        .slogan {
          color: #666;
          font-size: 14px;
          margin-top: 5px;
        }
        .receipt-title {
          font-size: 24px;
          font-weight: bold;
          color: #0c3a30;
          margin-top: 20px;
        }
        .info-section {
          background: #f8f9fa;
          border-radius: 6px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .info-section h3 {
          color: #0c3a30;
          font-size: 16px;
          margin-bottom: 15px;
          border-bottom: 2px solid #c4d626;
          padding-bottom: 8px;
        }
        .info-table {
          width: 100%;
          border-collapse: collapse;
        }
        .info-table tr {
          border-bottom: 1px solid #e0e0e0;
        }
        .info-table tr:last-child {
          border-bottom: none;
        }
        .info-table td {
          padding: 12px 0;
          font-size: 14px;
        }
        .detail-label {
          color: #666;
          font-weight: 500;
          width: 40%;
        }
        .detail-value {
          color: #1a1a1a;
          font-weight: 600;
        }
        .transaction-section {
          background: #f8f9fa;
          border-radius: 6px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .transaction-section h3 {
          color: #0c3a30;
          font-size: 16px;
          margin-bottom: 15px;
          border-bottom: 2px solid #c4d626;
          padding-bottom: 8px;
        }
        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          background: #d1fae5;
          color: #065f46;
        }
        .qr-section {
          text-align: center;
          padding: 30px;
          background: #f8f9fa;
          border-radius: 6px;
          margin: 30px 0;
        }
        .qr-section h3 {
          color: #0c3a30;
          font-size: 16px;
          margin-bottom: 20px;
        }
        .qr-code {
          display: inline-block;
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .qr-code img {
          width: 200px;
          height: 200px;
        }
        .disclaimer {
          margin-top: 30px;
          padding: 15px;
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          border-radius: 4px;
          font-size: 12px;
          color: #856404;
          line-height: 1.6;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e0e0e0;
          color: #666;
          font-size: 12px;
        }
        @media print {
          body {
            background: white;
            padding: 0;
          }
          .receipt-container {
            box-shadow: none;
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="header">
          <div class="logo-container">
            <div class="logo-circle">V</div>
            <div>
              <div class="company-name">Vasawealthearn</div>
              <div class="slogan">Invest. Grow. Prosper.</div>
            </div>
          </div>
          <div class="receipt-title">
            ${type === "crypto" ? "BITCOIN DEPOSIT TRANSACTION RECEIPT" : 
              type === "stock" ? "STOCK INVESTMENT TRANSACTION RECEIPT" :
              type === "real_estate" ? "REAL ESTATE INVESTMENT TRANSACTION RECEIPT" :
              "DEPOSIT TRANSACTION RECEIPT"}
          </div>
        </div>

        <div class="info-section">
          <h3>User & Receipt Information</h3>
          <table class="info-table">
            <tr>
              <td class="detail-label">Receipt ID:</td>
              <td class="detail-value">${data.receiptId}</td>
            </tr>
            <tr>
              <td class="detail-label">Invoice Number:</td>
              <td class="detail-value">${data.invoiceNumber}</td>
            </tr>
            <tr>
              <td class="detail-label">User Name:</td>
              <td class="detail-value">${data.userName}</td>
            </tr>
            <tr>
              <td class="detail-label">User Email:</td>
              <td class="detail-value">${data.userEmail}</td>
            </tr>
          </table>
        </div>

        <div class="transaction-section">
          <h3>Transaction Details</h3>
          <table class="info-table">
            ${transactionDetails}
            <tr>
              <td class="detail-label">Date & Time:</td>
              <td class="detail-value">${data.date}</td>
            </tr>
            <tr>
              <td class="detail-label">Transaction Status:</td>
              <td class="detail-value">
                <span class="status-badge">${data.status}</span>
              </td>
            </tr>
          </table>
        </div>

        <div class="qr-section">
          <h3>Blockchain Verification (QR Code)</h3>
          <div class="qr-code">
            <img src="${qrCodeDataUrl}" alt="Transaction QR Code" />
          </div>
        </div>

        <div class="disclaimer">
          <strong>Important:</strong> Scan the QR code to verify this transaction on the blockchain. This receipt confirms a successful ${type === "crypto" ? "Bitcoin deposit" : type === "stock" ? "stock investment" : type === "real_estate" ? "real estate investment" : "deposit"} into your VasaWealthEarn account. ${type === "crypto" ? "Cryptocurrency transactions are irreversible once confirmed." : "Please keep this receipt for your records."}
        </div>

        <div class="footer">
          <p>This is an official transaction receipt from VasaWealthEarn</p>
          <p>For support, please contact: support@vasawealthearn.com</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `

  return html
}

async function generateQRCode(data: string): Promise<string> {
  try {
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      width: 200,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })
    return qrCodeDataUrl
  } catch (error) {
    console.error("Error generating QR code:", error)
    // Return a placeholder or empty data URL
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3EQR Code%3C/text%3E%3C/svg%3E"
  }
}

export function generateReceiptId(type: "crypto" | "stock" | "real_estate" | "deposit"): string {
  const prefix = type === "crypto" ? "VWE-BTC" : type === "stock" ? "VWE-STK" : type === "real_estate" ? "VWE-RE" : "VWE-DEP"
  const year = new Date().getFullYear()
  const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, "0")
  return `${prefix}-${year}-${randomNum}`
}

export function generateInvoiceNumber(): string {
  const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, "0")
  return `INV-${randomNum}`
}

