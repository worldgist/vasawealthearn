"use client"

import type React from "react"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { CreditCard, Shield, Globe, Zap, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function RequestCardPage() {
  const [selectedCardType, setSelectedCardType] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Redirect to success page or show success message
    setIsSubmitting(false)
    alert("Card application submitted successfully! You will receive a confirmation email shortly.")
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link href="/dashboard" className="hover:text-gray-900">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/dashboard/cards" className="hover:text-gray-900">
            Cards
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Request New Card</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/cards">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Cards
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Request New Card</h1>
            <p className="text-gray-600">Apply for a new virtual or physical card</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Card Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Select Card Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedCardType} onValueChange={setSelectedCardType} className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="virtual" id="virtual" />
                    <div className="flex-1">
                      <Label htmlFor="virtual" className="font-medium cursor-pointer">
                        Virtual Card
                      </Label>
                      <p className="text-sm text-gray-600">Instant digital card for online purchases</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          Instant issuance
                        </span>
                        <span className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Enhanced security
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="physical" id="physical" />
                    <div className="flex-1">
                      <Label htmlFor="physical" className="font-medium cursor-pointer">
                        Physical Card
                      </Label>
                      <p className="text-sm text-gray-600">Traditional plastic card for in-store and online use</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          Global acceptance
                        </span>
                        <span>5-7 business days delivery</span>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" defaultValue="John" required />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" defaultValue="Williams" required />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input id="email" type="email" defaultValue="worldgist72@gmail.com" required />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" type="tel" defaultValue="+18176881062" required />
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Textarea id="address" placeholder="Enter your full address" required />
                </div>
              </CardContent>
            </Card>

            {/* Card Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Card Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cardName">Card Name</Label>
                  <Input id="cardName" placeholder="Name to appear on card" defaultValue="JOHN WILLIAMS" />
                </div>

                <div>
                  <Label htmlFor="spendingLimit">Monthly Spending Limit</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select spending limit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1000">$1,000</SelectItem>
                      <SelectItem value="2500">$2,500</SelectItem>
                      <SelectItem value="5000">$5,000</SelectItem>
                      <SelectItem value="10000">$10,000</SelectItem>
                      <SelectItem value="unlimited">No limit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="purpose">Primary Use Case</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select primary use" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online Shopping</SelectItem>
                      <SelectItem value="subscriptions">Subscription Management</SelectItem>
                      <SelectItem value="business">Business Expenses</SelectItem>
                      <SelectItem value="travel">Travel & Entertainment</SelectItem>
                      <SelectItem value="general">General Use</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea id="notes" placeholder="Any special requirements or notes" />
                </div>
              </CardContent>
            </Card>

            {/* Terms and Conditions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox id="terms" required />
                    <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                      I agree to the{" "}
                      <Link href="#" className="text-[#0c3a30] hover:underline">
                        Terms and Conditions
                      </Link>{" "}
                      and
                      <Link href="#" className="text-[#0c3a30] hover:underline ml-1">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox id="notifications" />
                    <Label htmlFor="notifications" className="text-sm leading-relaxed cursor-pointer">
                      I want to receive notifications about my card application status and account updates
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="submit"
                className="bg-[#c4d626] text-[#0c3a30] hover:bg-[#b8c423] flex-1"
                disabled={isSubmitting || !selectedCardType}
              >
                {isSubmitting ? "Submitting Application..." : "Submit Application"}
              </Button>
              <Link href="/dashboard/cards">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Application Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Application Process</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#c4d626] rounded-full flex items-center justify-center">
                    <span className="text-[#0c3a30] font-bold text-sm">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Submit Application</p>
                    <p className="text-sm text-gray-600">Fill out the form with your details</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Review & Verification</p>
                    <p className="text-sm text-gray-600">We'll review your application</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Card Issuance</p>
                    <p className="text-sm text-gray-600">Receive your new card</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-[#c4d626] mt-0.5" />
                <div>
                  <h4 className="font-medium mb-2">Secure Application</h4>
                  <p className="text-sm text-gray-600">
                    Your information is encrypted and protected with bank-level security. We never share your personal
                    data with third parties.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Processing Time */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium mb-2">Processing Time</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Virtual cards: Instant approval</li>
                    <li>• Physical cards: 5-7 business days</li>
                    <li>• Express delivery available</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium mb-2">Need Help?</h4>
                  <p className="text-sm text-gray-600 mb-3">Our support team is here to help with your application.</p>
                  <Link href="/dashboard/account/support/contact">
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      Contact Support
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
