"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Key, Shield, CheckCircle } from "lucide-react"
import { useState } from "react"

export default function TransactionPinPage() {
  const [currentPin, setCurrentPin] = useState("")
  const [newPin, setNewPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Key className="h-5 w-5 text-gray-600" />
            <h1 className="text-2xl font-bold text-gray-900">Transaction PIN</h1>
          </div>
          <p className="text-gray-600">Manage your transaction PIN for secure payments and transfers</p>
        </div>

        <div className="space-y-6">
          {/* Current PIN Status */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <h4 className="font-semibold text-green-900">PIN Status: Active</h4>
                  <p className="text-sm text-green-800">Your transaction PIN is currently active and secure.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change PIN */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>Change Transaction PIN</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPin">Current PIN</Label>
                <Input
                  id="currentPin"
                  type="password"
                  placeholder="••••"
                  maxLength={4}
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className="text-center text-lg tracking-widest"
                />
              </div>
              <div>
                <Label htmlFor="newPin">New PIN</Label>
                <Input
                  id="newPin"
                  type="password"
                  placeholder="••••"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className="text-center text-lg tracking-widest"
                />
              </div>
              <div>
                <Label htmlFor="confirmPin">Confirm New PIN</Label>
                <Input
                  id="confirmPin"
                  type="password"
                  placeholder="••••"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className="text-center text-lg tracking-widest"
                />
              </div>
              <Button
                className="bg-[#c4d626] hover:bg-[#c4d626]/90 text-[#0c3a30]"
                disabled={!currentPin || !newPin || !confirmPin || newPin !== confirmPin}
              >
                Update PIN
              </Button>
            </CardContent>
          </Card>

          {/* PIN Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>PIN Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Must be exactly 4 digits</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Cannot be sequential numbers (1234, 4321)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Cannot be repeated numbers (1111, 2222)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Should not match your birth year or account number</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Security Notice</h4>
                  <p className="text-sm text-blue-800">
                    Your transaction PIN is used to authorize transfers, payments, and other financial transactions.
                    Keep it secure and never share it with anyone.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
