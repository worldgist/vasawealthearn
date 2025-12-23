"use client"

import { useState } from "react"

interface QRCodeProps {
  value: string
  size?: number
  level?: "L" | "M" | "Q" | "H"
  bgColor?: string
  fgColor?: string
}

export function QRCode({ value, size = 256, level = "M", bgColor = "FFFFFF", fgColor = "000000" }: QRCodeProps) {
  const [hasError, setHasError] = useState(false)
  
  // Using QR Server API to generate QR codes
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&bgcolor=${bgColor}&color=${fgColor}&qzone=1&margin=1`

  if (hasError) {
    return (
      <div
        className="border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <div className="text-center p-4">
          <p className="text-sm font-medium text-gray-700">QR Code</p>
          <p className="text-xs text-gray-500 mt-1">Unable to load</p>
        </div>
      </div>
    )
  }

  return (
    <img
      src={qrUrl}
      alt="QR Code"
      className="border border-gray-200 rounded-lg w-full h-auto"
      style={{ maxWidth: `${size}px`, maxHeight: `${size}px` }}
      onError={() => setHasError(true)}
    />
  )
}

