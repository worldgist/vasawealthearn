/**
 * PDF Generator Utility
 * 
 * This utility generates PDF content for transaction summaries.
 * For production use, consider integrating with:
 * - pdfkit (Node.js)
 * - jspdf (Browser/Node.js)
 * - puppeteer (HTML to PDF)
 * - A PDF generation service
 */

export interface TransactionPDFData {
  transactionId: string
  type: "buy" | "sell"
  stockSymbol: string
  stockName: string
  shares: number
  price: number
  totalAmount: number
  transactionDate: string
  paymentMethod?: string
  userName: string
  userEmail: string
}

/**
 * Generate PDF as HTML (can be converted to PDF using browser print or a service)
 * This is a simple approach that works without additional dependencies
 */
export function generateTransactionPDFHTML(data: TransactionPDFData): string {
  const { transactionId, type, stockSymbol, stockName, shares, price, totalAmount, transactionDate, paymentMethod, userName, userEmail } = data

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Transaction Summary - ${transactionId}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      color: #333;
      line-height: 1.6;
      padding: 40px;
      background: #fff;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: #fff;
    }
    .header {
      border-bottom: 4px solid #0c3a30;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #0c3a30;
      font-size: 28px;
      margin-bottom: 5px;
    }
    .header p {
      color: #666;
      font-size: 14px;
    }
    .section {
      margin-bottom: 30px;
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    .section h2 {
      color: #0c3a30;
      font-size: 18px;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #0c3a30;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .label {
      font-weight: 600;
      color: #666;
      font-size: 14px;
    }
    .value {
      color: #0c3a30;
      font-weight: 700;
      font-size: 14px;
      text-align: right;
    }
    .value.amount {
      font-size: 18px;
      color: #059669;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 20px;
      background: #10b981;
      color: white;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    .footer p {
      margin: 5px 0;
    }
    .transaction-type {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      background: ${type === "buy" ? "#dbeafe" : "#fee2e2"};
      color: ${type === "buy" ? "#1e40af" : "#991b1b"};
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
    }
    @media print {
      body {
        padding: 20px;
      }
      .section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Vasawealthearn</h1>
      <p>Transaction Summary Report</p>
    </div>
    
    <div class="section">
      <h2>Transaction Details</h2>
      <div class="detail-row">
        <span class="label">Transaction ID:</span>
        <span class="value">${transactionId}</span>
      </div>
      <div class="detail-row">
        <span class="label">Transaction Type:</span>
        <span class="value">
          <span class="transaction-type">Stock ${type === "buy" ? "Purchase" : "Sale"}</span>
        </span>
      </div>
      <div class="detail-row">
        <span class="label">Date & Time:</span>
        <span class="value">${transactionDate}</span>
      </div>
      <div class="detail-row">
        <span class="label">Status:</span>
        <span class="value">
          <span class="status-badge">Completed</span>
        </span>
      </div>
    </div>
    
    <div class="section">
      <h2>Stock Information</h2>
      <div class="detail-row">
        <span class="label">Stock Symbol:</span>
        <span class="value">${stockSymbol}</span>
      </div>
      <div class="detail-row">
        <span class="label">Company Name:</span>
        <span class="value">${stockName}</span>
      </div>
      <div class="detail-row">
        <span class="label">Number of Shares:</span>
        <span class="value">${shares.toFixed(4)}</span>
      </div>
      <div class="detail-row">
        <span class="label">Price per Share:</span>
        <span class="value">$${price.toFixed(2)}</span>
      </div>
      <div class="detail-row">
        <span class="label">Total Amount:</span>
        <span class="value amount">$${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
      ${paymentMethod ? `
      <div class="detail-row">
        <span class="label">Payment Method:</span>
        <span class="value">${paymentMethod}</span>
      </div>
      ` : ''}
    </div>
    
    <div class="section">
      <h2>Account Information</h2>
      <div class="detail-row">
        <span class="label">Account Holder:</span>
        <span class="value">${userName}</span>
      </div>
      <div class="detail-row">
        <span class="label">Email Address:</span>
        <span class="value">${userEmail}</span>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>Important:</strong> This is an automated transaction summary. Please keep this document for your records.</p>
      <p>If you have any questions or concerns about this transaction, please contact our support team.</p>
      <p style="margin-top: 15px;">&copy; ${new Date().getFullYear()} Vasawealthearn. All rights reserved.</p>
      <p style="margin-top: 10px; font-size: 10px; color: #999;">This document was generated automatically on ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Generate PDF as base64 string (for email attachments)
 * This creates an HTML document that can be converted to PDF
 */
export function generateTransactionPDFBase64(data: TransactionPDFData): string {
  const html = generateTransactionPDFHTML(data)
  return Buffer.from(html).toString('base64')
}



