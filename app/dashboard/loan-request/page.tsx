"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import {
  Clock,
  TrendingDown,
  FileText,
  Shield,
  Home,
  Car,
  Building2,
  Users,
  CreditCard,
  Heart,
  ArrowRight,
  Plus,
  Minus,
} from "lucide-react"
import { useState } from "react"

export default function LoanRequestPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const benefits = [
    {
      icon: Clock,
      title: "Quick Approval",
      description: "Get a decision within hours and funds within days",
    },
    {
      icon: TrendingDown,
      title: "Competitive Rates",
      description: "Low interest rates tailored to your credit profile",
    },
    {
      icon: FileText,
      title: "Simple Process",
      description: "Straightforward application with minimal paperwork",
    },
    {
      icon: Shield,
      title: "Secure & Confidential",
      description: "Your information is protected with bank-level security",
    },
  ]

  const loanTypes = [
    {
      icon: Home,
      title: "Personal Home Loans",
      description: "Finance your dream home with competitive rates",
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: Car,
      title: "Automobile Loans",
      description: "Get on the road with flexible auto financing",
      color: "bg-green-50 text-green-600",
    },
    {
      icon: Building2,
      title: "Business Loans",
      description: "Grow your business with tailored financing solutions",
      color: "bg-purple-50 text-purple-600",
    },
    {
      icon: Users,
      title: "Joint Mortgage",
      description: "Share responsibility with a co-borrower",
      color: "bg-orange-50 text-orange-600",
    },
    {
      icon: CreditCard,
      title: "Secured Overdraft",
      description: "Access funds when needed with asset backing",
      color: "bg-red-50 text-red-600",
    },
    {
      icon: Heart,
      title: "Health Finance",
      description: "Cover medical expenses with flexible payment options",
      color: "bg-pink-50 text-pink-600",
    },
  ]

  const steps = [
    {
      number: "1",
      title: "Apply Online",
      description: "Complete our simple online application form with your details and loan requirements",
    },
    {
      number: "2",
      title: "Quick Review",
      description: "Our team reviews your application and may contact you for additional information",
    },
    {
      number: "3",
      title: "Approval & Disbursement",
      description: "Once approved, the loan amount will be transferred to your account",
    },
  ]

  const faqs = [
    {
      question: "What documents do I need to apply?",
      answer:
        "You'll need identification, proof of income, and address verification. Additional documents may be requested based on loan type.",
    },
    {
      question: "How long does approval take?",
      answer:
        "Standard applications are typically processed within 1-3 business days, depending on verification requirements.",
    },
    {
      question: "What are the interest rates?",
      answer:
        "Interest rates vary based on loan type, amount, and your credit profile. We offer competitive rates starting from 3.5% APR.",
    },
    {
      question: "Can I prepay my loan?",
      answer:
        "Yes, you can prepay your loan at any time without penalty fees. This can help you save on interest costs.",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <span>Dashboard</span>
            <ArrowRight className="h-4 w-4 mx-2" />
            <span>Loan Services</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Loan Services</h1>
            <p className="text-gray-600 mt-2">Financial solutions to help you achieve your goals</p>
          </div>
        </div>

        {/* Why Choose Our Loan Services */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Why Choose Our Loan Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-[#c4d626] rounded-full flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Available Loan Types */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Available Loan Types</h2>
            <Button
              variant="outline"
              className="text-[#c4d626] border-[#c4d626] hover:bg-[#c4d626] hover:text-white bg-transparent"
            >
              View all loan options
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loanTypes.map((loan, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${loan.color}`}>
                    <loan.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{loan.title}</CardTitle>
                  <CardDescription>{loan.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-[#c4d626] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">{step.number}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Frequently Asked Questions</h2>
            <Button
              variant="outline"
              className="text-[#c4d626] border-[#c4d626] hover:bg-[#c4d626] hover:text-white bg-transparent"
            >
              View all FAQs
            </Button>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                    {expandedFaq === index ? (
                      <Minus className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Plus className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
                {expandedFaq === index && (
                  <CardContent>
                    <p className="text-gray-600">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-[#c4d626] to-[#a8c520] text-white">
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-lg mb-6 opacity-90">Apply now and get a decision on your loan application quickly</p>
            <Link href="/dashboard/loan-request/apply">
              <Button size="lg" className="bg-white text-[#c4d626] hover:bg-gray-100">
                Apply for a Loan
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
